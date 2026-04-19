import type { GameState, ReputationLevel, TimeCapsule } from '../types/game';
import { getEconomyState } from './EconomyEngine';
import { accrueDebtInterest } from './DebtWaterfall';
import { triggerRandomEvent, canAdvanceRound } from './EventEngine';

// ─── 时间步长常量 ──────────────────────────────────────────────────────────────

/** 游戏总年数跨度 */
export const TOTAL_YEARS = 43;

/** 总回合数 */
export const TOTAL_ROUNDS = 30;

/**
 * 每回合对应的年数（精确步长）。
 * Round 1 → gameYearOffset = 0
 * Round 30 → gameYearOffset ≈ 43
 */
export const YEARS_PER_ROUND = TOTAL_YEARS / (TOTAL_ROUNDS - 1);

// ─── 衍生计算 ─────────────────────────────────────────────────────────────────

/**
 * 将回合号映射为游戏内年份偏移（0–43）。
 * Round 1 = 起始年，Round 30 = 起始年 + 43 年。
 */
export function roundToYearOffset(round: number): number {
  return (round - 1) * YEARS_PER_ROUND;
}

/**
 * 将游戏内年份偏移换算为实际历史年份
 */
export function gameYearToCalendar(startYear: number, yearOffset: number): number {
  return startYear + Math.floor(yearOffset);
}

// ─── 声望等级换算 ──────────────────────────────────────────────────────────────

function scoreToReputationLevel(score: number): ReputationLevel {
  if (score >= 67) return 'good';
  if (score >= 34) return 'medium';
  return 'poor';
}

// ─── 薪资增长（每回合） ───────────────────────────────────────────────────────

/**
 * 按经济周期薪资乘数和自然晋升计算新薪资。
 * 每回合的增长 = 经济乘数的年化值压缩到步长内。
 */
function applyCareerGrowth(
  salary: number,
  salaryGrowthMultiplier: number,
): number {
  // 年化增长率转换为单步增长
  const annualRate = salaryGrowthMultiplier - 1;           // e.g. 0.05
  const stepGrowth = Math.pow(1 + annualRate, YEARS_PER_ROUND) - 1;
  return salary * (1 + stepGrowth);
}

// ─── 月支出通胀调整 ───────────────────────────────────────────────────────────

function applyInflation(monthlyExpenses: number, inflationRate: number): number {
  const stepInflation = Math.pow(1 + inflationRate, YEARS_PER_ROUND) - 1;
  return monthlyExpenses * (1 + stepInflation);
}

// ─── 时间胶囊自动定投 ─────────────────────────────────────────────────────────

/**
 * 每回合从现金中扣除 salary * (contributionPct / 100) 存入时间胶囊。
 * 时间胶囊余额按固定保守收益率（4% APY）复利增长。
 *
 * 若现金不足，仅投入实际可用现金（不触发负债）。
 */
const TIME_CAPSULE_APY = 0.04;

export function applyTimeCapsuleContribution(
  cash: number,
  salary: number,
  capsule: TimeCapsule,
): { cash: number; timeCapsule: TimeCapsule } {
  const intended    = salary * (capsule.contributionPct / 100);
  const actual      = Math.min(intended, Math.max(0, cash));
  const stepGrowth  = Math.pow(1 + TIME_CAPSULE_APY, YEARS_PER_ROUND) - 1;

  // 已有余额复利增长 + 本期新增投入
  const newBalance  = capsule.balance * (1 + stepGrowth) + actual;

  return {
    cash:        cash - actual,
    timeCapsule: { ...capsule, balance: newBalance },
  };
}

// ─── 主函数 ───────────────────────────────────────────────────────────────────

/**
 * advanceRound：推进一个回合，返回更新后的 GameState。
 *
 * 执行顺序：
 * 0. 阻塞门卫：有未处理事件时直接返回（不推进）
 * 1. currentRound + 1
 * 2. 计算 gameYearOffset → currentYear / playerAge（整数）
 * 3. 更新经济状态
 * 4. 债务利息滚动
 * 5. 薪资自然增长（失业时跳过）
 * 6. 月支出通胀
 * 7. 时间胶囊自动定投（失业时跳过）
 * 8. 体力恢复 & 行动配额重置
 * 9. 触发 2–4 个随机事件，推入 pendingEvents
 * 10. 检查游戏是否结束
 */
export function advanceRound(state: GameState): GameState {
  // ── 0. 阻塞门卫 ────────────────────────────────────────────────────────────
  if (!canAdvanceRound(state.pendingEvents)) {
    return state; // 有待确认事件，不推进
  }

  const nextRound = state.currentRound + 1;
  if (nextRound > TOTAL_ROUNDS) {
    return { ...state, isGameOver: true };
  }

  // ── 1-2. 时间步长 & 整数年份/年龄 ──────────────────────────────────────────
  const nextYearOffset = roundToYearOffset(nextRound);
  const nextCurrentYear = Math.floor(state.startYear + nextYearOffset);
  const nextPlayerAge   = Math.floor(22 + nextYearOffset);

  const nextEconomy = getEconomyState(nextRound);

  // ── 3. 债务利息滚动 ───────────────────────────────────────────────────────
  const accruedDebts = accrueDebtInterest(state.debts);

  // ── 4. 薪资成长（失业时维持原薪不增长，恢复就业后再涨） ─────────────────────
  const nextSalary = state.isUnemployed
    ? state.salary
    : applyCareerGrowth(state.salary, nextEconomy.salaryGrowthMultiplier);

  // ── 5. 月支出通胀 ─────────────────────────────────────────────────────────
  const nextMonthlyExpenses = applyInflation(
    state.monthlyExpenses,
    nextEconomy.inflationRate,
  );

  // ── 6. 时间胶囊自动定投（失业期间暂停投入） ──────────────────────────────────
  const { cash: cashAfterContribution, timeCapsule: nextTimeCapsule } =
    state.isUnemployed
      ? { cash: state.cash, timeCapsule: state.timeCapsule }
      : applyTimeCapsuleContribution(state.cash, nextSalary, state.timeCapsule);

  // ── 7. 失业计数 ──────────────────────────────────────────────────────────
  const nextUnemployedRounds = state.isUnemployed
    ? state.unemployedRounds + 1
    : 0;

  // ── 8. 声望等级同步 ──────────────────────────────────────────────────────
  const nextReputation = scoreToReputationLevel(state.reputationScore);

  // ── 9. 体力恢复 ──────────────────────────────────────────────────────────
  const nextStamina = Math.min(state.stamina + staminaRegenPerRound(), 360);

  // ── 10. 触发随机事件 ──────────────────────────────────────────────────────
  const newEvents = triggerRandomEvent({
    economy:      nextEconomy,
    isUnemployed: state.isUnemployed,
  });

  return {
    ...state,
    currentRound:     nextRound,
    gameYearOffset:   nextYearOffset,
    currentYear:      nextCurrentYear,
    playerAge:        nextPlayerAge,
    economy:          nextEconomy,
    debts:            accruedDebts,
    salary:           nextSalary,
    monthlyExpenses:  nextMonthlyExpenses,
    cash:             cashAfterContribution,
    timeCapsule:      nextTimeCapsule,
    reputation:       nextReputation,
    stamina:          nextStamina,
    actionsRemaining: actionsPerRound(),
    unemployedRounds: nextUnemployedRounds,
    pendingEvents:    newEvents,
    isGameOver:       false,
  };
}

// ─── 辅助：每回合可用行动数（体力系统） ───────────────────────────────────────

/**
 * 每回合分配的行动数。
 * PRD 约定：每年 6 个行动槽；换算为每回合（步长 ~1.43 年）≈ 8–9 个行动。
 * 此处取整为 8，Lovable UI 层可覆盖此值。
 */
export function actionsPerRound(): number {
  return Math.round(6 * YEARS_PER_ROUND);
}

/**
 * 每回合体力自然恢复量。
 * 初始体力 360，30 回合内体力代表累积可用资源。
 * 若体力被行动消耗，此处按比例恢复。
 */
export function staminaRegenPerRound(): number {
  return Math.ceil(360 / TOTAL_ROUNDS);
}
