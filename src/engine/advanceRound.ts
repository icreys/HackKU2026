import type { GameState, ReputationLevel, TimeCapsule } from '../types/game';
import { getEconomyState } from './EconomyEngine';
import { accrueDebtInterest, applyExpense } from './DebtWaterfall';
import { triggerRandomEvent, canAdvanceRound } from './EventEngine';

// ─── 时间步长常量 ──────────────────────────────────────────────────────────────

export const TOTAL_YEARS  = 43;
export const TOTAL_ROUNDS = 30;

/**
 * 每回合对应的年数。
 * Round 1 → offset = 0，Round 30 → offset ≈ 43
 */
export const YEARS_PER_ROUND = TOTAL_YEARS / (TOTAL_ROUNDS - 1);

/** 年度基础生活费（真实经济模型基准，随通胀上涨） */
export const ANNUAL_LIVING_BASE = 40_000;

/** 急诊事件扣除金额 */
export const ER_CASH_PENALTY = 15_000;

/** 急诊事件永久扣除体力上限 */
export const ER_STAMINA_PENALTY = 50;

/** 急诊后恢复的健康值 */
export const ER_HEALTH_RESTORE = 20;

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

export function roundToYearOffset(round: number): number {
  return (round - 1) * YEARS_PER_ROUND;
}

export function gameYearToCalendar(startYear: number, yearOffset: number): number {
  return startYear + Math.floor(yearOffset);
}

function scoreToReputationLevel(score: number): ReputationLevel {
  if (score >= 67) return 'good';
  if (score >= 34) return 'medium';
  return 'poor';
}

function applyCareerGrowth(salary: number, salaryGrowthMultiplier: number): number {
  const annualRate = salaryGrowthMultiplier - 1;
  const stepGrowth = Math.pow(1 + annualRate, YEARS_PER_ROUND) - 1;
  return salary * (1 + stepGrowth);
}

function applyInflation(value: number, inflationRate: number): number {
  const stepInflation = Math.pow(1 + inflationRate, YEARS_PER_ROUND) - 1;
  return value * (1 + stepInflation);
}

// ─── 时间胶囊自动定投 ─────────────────────────────────────────────────────────

const TIME_CAPSULE_APY = 0.04;

export function applyTimeCapsuleContribution(
  cash: number,
  salary: number,
  capsule: TimeCapsule,
): { cash: number; timeCapsule: TimeCapsule } {
  const intended   = salary * (capsule.contributionPct / 100);
  const actual     = Math.min(intended, Math.max(0, cash));
  const stepGrowth = Math.pow(1 + TIME_CAPSULE_APY, YEARS_PER_ROUND) - 1;
  const newBalance = capsule.balance * (1 + stepGrowth) + actual;
  return {
    cash:        cash - actual,
    timeCapsule: { ...capsule, balance: newBalance },
  };
}

// ─── 急诊惩罚（零血触发，纯函数） ────────────────────────────────────────────

/**
 * 触发急诊事件：
 * - 扣 $15,000（经 DebtWaterfall）
 * - 永久减少 maxStamina -50
 * - 恢复 health 至 20
 */
export function applyEmergencyRoom(state: {
  cash: number;
  debts: GameState['debts'];
  reputation: ReputationLevel;
  maxStamina: number;
}): {
  cash: number;
  debts: GameState['debts'];
  maxStamina: number;
  healthScore: number;
} {
  const { cash, debts } = applyExpense(
    ER_CASH_PENALTY,
    state.cash,
    state.debts,
    state.reputation,
  );
  return {
    cash,
    debts,
    maxStamina:  Math.max(10, state.maxStamina - ER_STAMINA_PENALTY),
    healthScore: ER_HEALTH_RESTORE,
  };
}

// ─── 主函数 ───────────────────────────────────────────────────────────────────

/**
 * advanceRound 执行顺序：
 * 0. 阻塞门卫（有待确认事件则不推进）
 * 1. currentRound + 1，计算整数 currentYear / playerAge
 * 2. 更新经济状态
 * 3. 债务利息滚动
 * 4. 薪资自然增长（失业跳过）
 * 5. annualLivingExpense 通胀调整
 * 6. 自动扣除生活费（= annualLivingExpense × YEARS_PER_ROUND，经 DebtWaterfall）
 * 7. 时间胶囊自动定投（失业跳过）
 * 8. 失业计数
 * 9. 声望等级同步
 * 10. 体力完全重置为 maxStamina
 * 11. 重置 thisRoundMedical
 * 12. 零血急诊检查
 * 13. 触发 2–4 个随机事件
 */
export function advanceRound(state: GameState): GameState {
  // ── 0. 阻塞门卫 ──────────────────────────────────────────────────────────
  if (!canAdvanceRound(state.pendingEvents)) return state;

  const nextRound = state.currentRound + 1;
  if (nextRound > TOTAL_ROUNDS) return { ...state, isGameOver: true };

  // ── 1. 时间步长 ───────────────────────────────────────────────────────────
  const nextYearOffset  = roundToYearOffset(nextRound);
  const nextCurrentYear = Math.floor(state.startYear + nextYearOffset);
  const nextPlayerAge   = Math.floor(22 + nextYearOffset);
  const nextEconomy     = getEconomyState(nextRound);

  // ── 2. 债务利息 ───────────────────────────────────────────────────────────
  const accruedDebts = accrueDebtInterest(state.debts);

  // ── 3. 薪资增长 ───────────────────────────────────────────────────────────
  const nextSalary = state.isUnemployed
    ? state.salary
    : applyCareerGrowth(state.salary, nextEconomy.salaryGrowthMultiplier);

  // ── 4. 年度生活费通胀 ──────────────────────────────────────────────────────
  const nextAnnualLiving = applyInflation(state.annualLivingExpense, nextEconomy.inflationRate);
  const nextMonthlyExp   = applyInflation(state.monthlyExpenses, nextEconomy.inflationRate);

  // ── 5. 扣除生活费（经 DebtWaterfall；现金不足则触发贷款/信用卡） ──────────────
  const livingCostPerRound = Math.round(nextAnnualLiving * YEARS_PER_ROUND);
  const { cash: cashAfterLiving, debts: debtsAfterLiving } = applyExpense(
    livingCostPerRound,
    state.cash,
    accruedDebts,
    state.reputation,
  );

  // ── 6. 时间胶囊定投（失业时跳过） ────────────────────────────────────────────
  const { cash: cashAfterContrib, timeCapsule: nextTimeCapsule } =
    state.isUnemployed
      ? { cash: cashAfterLiving, timeCapsule: state.timeCapsule }
      : applyTimeCapsuleContribution(cashAfterLiving, nextSalary, state.timeCapsule);

  // ── 7. 失业计数 ──────────────────────────────────────────────────────────
  const nextUnemployedRounds = state.isUnemployed ? state.unemployedRounds + 1 : 0;

  // ── 8. 声望等级 ──────────────────────────────────────────────────────────
  const nextReputation = scoreToReputationLevel(state.reputationScore);

  // ── 9. 体力完全重置（绝对赋值，不累加） ──────────────────────────────────────
  const nextStamina = state.maxStamina;

  // ── 10. 重置本回合医疗限额 ────────────────────────────────────────────────
  const nextThisRoundMedical = { gym: false, checkup: false };

  // ── 11. 零血急诊检查（回合结算安全网） ───────────────────────────────────────
  let finalCash       = cashAfterContrib;
  let finalDebts      = debtsAfterLiving;
  let finalHealth     = state.healthScore;
  let finalMaxStamina = state.maxStamina;

  if (state.healthScore <= 0) {
    const er = applyEmergencyRoom({
      cash:       finalCash,
      debts:      finalDebts,
      reputation: nextReputation,
      maxStamina: finalMaxStamina,
    });
    finalCash       = er.cash;
    finalDebts      = er.debts;
    finalHealth     = er.healthScore;
    finalMaxStamina = er.maxStamina;
  }

  // ── 12. 触发随机事件 ──────────────────────────────────────────────────────
  const newEvents = triggerRandomEvent({
    economy:      nextEconomy,
    isUnemployed: state.isUnemployed,
  });

  return {
    ...state,
    currentRound:       nextRound,
    gameYearOffset:     nextYearOffset,
    currentYear:        nextCurrentYear,
    playerAge:          nextPlayerAge,
    economy:            nextEconomy,
    debts:              finalDebts,
    salary:             nextSalary,
    monthlyExpenses:    nextMonthlyExp,
    annualLivingExpense:nextAnnualLiving,
    cash:               finalCash,
    timeCapsule:        nextTimeCapsule,
    reputation:         nextReputation,
    stamina:            nextStamina,
    maxStamina:         finalMaxStamina,
    healthScore:        finalHealth,
    actionsRemaining:   actionsPerRound(),
    unemployedRounds:   nextUnemployedRounds,
    thisRoundMedical:          nextThisRoundMedical,
    lastLivingExpenseDeducted: livingCostPerRound,
    pendingEvents:             newEvents,
    isGameOver:                false,
  };
}

// ─── 辅助 ─────────────────────────────────────────────────────────────────────

export function actionsPerRound(): number {
  return Math.round(6 * YEARS_PER_ROUND);
}
