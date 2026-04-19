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
  /** 优惠利率贷款余额 — ~6% APR，额度基于声望等级 */
  primeLoanBalance: number;
  /** 信用卡债务 — 22% APR 季度复利（紧急兜底） */
  creditCard: number;
}

// ─── Reputation ───────────────────────────────────────────────────────────────

export type ReputationLevel = 'poor' | 'medium' | 'good';

// ─── Activity modes ───────────────────────────────────────────────────────────

/** 三种工作强度 */
export type WorkMode =
  | 'slack'     // 摸鱼：低产出，少扣 Health
  | 'normal'    // 正常上班：标准产出
  | 'overtime'; // 疯狂加班：高产出，大扣 Health

/** 两种社交方式 */
export type SocialMode =
  | 'forced'    // 被迫社交：扣 Mood，涨 Career
  | 'active';   // 积极社交：大涨 Mood，不加 Career

/** 两种医疗行动 */
export type MedicalAction =
  | 'gym'       // 健身房：扣 SP + 现金，涨 Health
  | 'checkup';  // 全面体检：扣 SP + 现金，涨 diseaseResistance

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

// ─── Time Capsule ─────────────────────────────────────────────────────────────

/** 时间胶囊定投账户 */
export interface TimeCapsule {
  /** 累计余额（含复利） */
  balance: number;
  /** 每回合从年薪中自动投入的比例 (0–100) */
  contributionPct: number;
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
  /** 健康值 0–100，影响生病概率；低健康触发负面事件 */
  healthScore: number;
  /** 隐藏幸福值 0–100，影响最终结局（不对玩家显示） */
  happinessScore: number;
  /** 当前心情 0–100，社交/工作行动直接改变，影响短期决策收益 */
  moodScore: number;
  /** 职业/社交属性 0–100，影响求职质量和薪资谈判 */
  careerScore: number;
  /** 疾病抵抗力 0–100，每次体检 +10；越高则生病概率越低 */
  diseaseResistance: number;

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

  // ── Time Capsule ────────────────────────────────────────────────────────────
  timeCapsule: TimeCapsule;

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
  primeLoanDrawn: number;
  creditCardCharged: number;
  /** 超出所有来源后仍未支付的金额（理论上应为 0，信用卡无上限） */
  unpaid: number;
}
