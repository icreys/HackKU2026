// ─── Economy ──────────────────────────────────────────────────────────────────

/** 每 5 回合一次的经济周期 */
export type EconomyPhase =
  | 'recovery'   // 复苏
  | 'boom'       // 繁荣
  | 'recession'  // 衰退
  | 'freeze';    // 冰冻

export interface EconomyState {
  phase: EconomyPhase;
  /** 当前周期内的回合偏移 (0-4) */
  phaseIndex: number;
  /** 利率乘数，影响债务和储蓄收益 */
  interestRateMultiplier: number;
  /** 薪资增长率乘数 */
  salaryGrowthMultiplier: number;
  /** 通胀率 (0-1) */
  inflationRate: number;
}

// ─── Debt ─────────────────────────────────────────────────────────────────────

export interface Debts {
  /** 学生贷款 — 5.5% APR 季度复利 */
  studentLoan: number;
  /** 应急信用额度 — 约 12% APR */
  creditLine: number;
  /** 信用卡债务 — 22% APR 季度复利 */
  creditCard: number;
}

// ─── Reputation ───────────────────────────────────────────────────────────────

export type ReputationLevel = 'poor' | 'medium' | 'good';

// ─── Lifestyle ────────────────────────────────────────────────────────────────

export type LifestyleTier = 1 | 2 | 3 | 4;

export interface LifestyleSelections {
  housing: LifestyleTier;
  food: LifestyleTier;
  clothing: LifestyleTier;
  transportation: LifestyleTier;
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export type AssetClass =
  | 'savings'
  | 'bonds'
  | 'stocks'
  | 'options'
  | 'crypto'
  | 'gold'
  | 'retirement'
  | 'property'
  | 'vehicle';

export interface AssetHolding {
  assetClass: AssetClass;
  amount: number;
  purchasedAtRound: number;
  /** 购入时的价格基准（用于计算收益） */
  costBasis: number;
}

// ─── Core GameState ───────────────────────────────────────────────────────────

export interface GameState {
  // ── Progress ────────────────────────────────────────────────────────────────
  /** 当前回合，1–30 */
  currentRound: number;
  /** 游戏内年份偏移 (0–43)，由 advanceRound 计算 */
  gameYearOffset: number;
  /** 游戏起始历史年份 (1920–2026) */
  startYear: number;

  // ── Vitals ──────────────────────────────────────────────────────────────────
  /** 体力值，初始 360，每回合消耗行动 */
  stamina: number;
  /** 隐藏健康值 0–100，影响事件概率 */
  healthScore: number;
  /** 隐藏幸福值 0–100，影响结局 */
  happinessScore: number;

  // ── Finances ────────────────────────────────────────────────────────────────
  cash: number;
  /** 年薪 */
  salary: number;
  debts: Debts;
  assets: AssetHolding[];
  /** 月度固定支出（住房+食物+衣物+交通+保险） */
  monthlyExpenses: number;

  // ── Reputation ──────────────────────────────────────────────────────────────
  /** 显示给玩家的声望等级 */
  reputation: ReputationLevel;
  /** 隐藏声望分数 0–100 */
  reputationScore: number;

  // ── Lifestyle ───────────────────────────────────────────────────────────────
  lifestyle: LifestyleSelections;

  // ── Economy ─────────────────────────────────────────────────────────────────
  economy: EconomyState;

  // ── Meta ────────────────────────────────────────────────────────────────────
  /** 本回合可用行动数 */
  actionsRemaining: number;
  /** 已解锁的资产类型 */
  unlockedAssets: AssetClass[];
  /** 是否已完成游戏 */
  isGameOver: boolean;
}

// ─── Expense payment result ───────────────────────────────────────────────────

export interface PaymentResult {
  success: boolean;
  cashPaid: number;
  creditLinePaid: number;
  creditCardCharged: number;
  /** 超出所有来源后仍未支付的金额（理论上应为 0，信用卡无上限） */
  unpaid: number;
}
