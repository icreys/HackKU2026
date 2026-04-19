import type { GameState, ReputationLevel } from '../types/game';
import { getEconomyState } from './EconomyEngine';
import { accrueDebtInterest } from './DebtWaterfall';

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

// ─── 主函数 ───────────────────────────────────────────────────────────────────

/**
 * advanceRound：推进一个回合，返回更新后的 GameState。
 *
 * 执行顺序：
 * 1. currentRound + 1
 * 2. 计算新的 gameYearOffset
 * 3. 更新经济状态
 * 4. 债务利息滚动
 * 5. 薪资自然增长
 * 6. 月支出通胀
 * 7. 重置体力行动配额
 * 8. 检查游戏是否结束
 */
export function advanceRound(state: GameState): GameState {
  const nextRound = state.currentRound + 1;

  if (nextRound > TOTAL_ROUNDS) {
    return { ...state, isGameOver: true };
  }

  const nextYearOffset = roundToYearOffset(nextRound);
  const nextEconomy = getEconomyState(nextRound);

  // ── 债务利息滚动 ───────────────────────────────────────────────────────────
  const accruedDebts = accrueDebtInterest(state.debts);

  // ── 薪资成长 ──────────────────────────────────────────────────────────────
  const nextSalary = applyCareerGrowth(
    state.salary,
    nextEconomy.salaryGrowthMultiplier,
  );

  // ── 月支出通胀 ────────────────────────────────────────────────────────────
  const nextMonthlyExpenses = applyInflation(
    state.monthlyExpenses,
    nextEconomy.inflationRate,
  );

  // ── 声望等级同步 ──────────────────────────────────────────────────────────
  const nextReputation = scoreToReputationLevel(state.reputationScore);

  // ── 体力重置（每回合固定 360 / TOTAL_ROUNDS 点可用，保持 PRD 约定） ────────
  const nextStamina = Math.min(state.stamina + staminaRegenPerRound(), 360);

  return {
    ...state,
    currentRound:     nextRound,
    gameYearOffset:   nextYearOffset,
    economy:          nextEconomy,
    debts:            accruedDebts,
    salary:           nextSalary,
    monthlyExpenses:  nextMonthlyExpenses,
    reputation:       nextReputation,
    stamina:          nextStamina,
    actionsRemaining: actionsPerRound(),
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
