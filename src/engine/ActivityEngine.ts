import type { WorkMode, SocialMode, MedicalAction, StudyAction } from '../types/game';
import { YEARS_PER_ROUND } from './advanceRound';

// ─── 工作行动参数 ─────────────────────────────────────────────────────────────

interface WorkConfig {
  healthDelta:      number;
  staminaCost:      number;
  incomeMultiplier: number;
}

export const WORK_CONFIGS: Record<WorkMode, WorkConfig> = {
  slack:    { healthDelta:  -2, staminaCost:  5, incomeMultiplier: 0.6 },
  normal:   { healthDelta:  -5, staminaCost: 10, incomeMultiplier: 1.0 },
  overtime: { healthDelta: -15, staminaCost: 20, incomeMultiplier: 1.5 },
};

/** 单次工作行动的基准收入 = 年薪 × 每回合年数 ÷ PRD 约定行动数(6) */
export function workIncome(salary: number, mode: WorkMode): number {
  return (salary * YEARS_PER_ROUND / 6) * WORK_CONFIGS[mode].incomeMultiplier;
}

// ─── 社交行动参数 ─────────────────────────────────────────────────────────────

interface SocialConfig {
  moodDelta:      number;
  careerDelta:    number;
  staminaCost:    number;
  happinessDelta: number;
  cashCost:       number;
}

export const SOCIAL_CONFIGS: Record<SocialMode, SocialConfig> = {
  forced: {
    moodDelta:      -10,
    careerDelta:    +15,
    staminaCost:      8,
    happinessDelta:  -3,
    cashCost:     2_000,  // 年度职业社交活动
  },
  active: {
    moodDelta:      +20,
    careerDelta:      0,
    staminaCost:      6,
    happinessDelta:  +5,
    cashCost:       500,  // 普通聚会消费
  },
};

// ─── 医疗行动参数（每回合各限 1 次） ─────────────────────────────────────────

interface MedicalConfig {
  staminaCost:            number;
  cashCost:               number;
  healthDelta:            number;
  diseaseResistanceDelta: number;
}

export const MEDICAL_CONFIGS: Record<MedicalAction, MedicalConfig> = {
  gym: {
    staminaCost:            40,
    cashCost:               50,
    healthDelta:           +10,
    diseaseResistanceDelta:  0,
  },
  checkup: {
    staminaCost:            20,
    cashCost:            1_000,  // 全面体检（真实费用）
    healthDelta:             0,
    diseaseResistanceDelta: +10,
  },
};

// ─── 学习/考证行动参数 ────────────────────────────────────────────────────────

interface StudyConfig {
  staminaCost:    number;
  cashCost:       number;
  careerDelta:    number;
  happinessDelta: number;
}

export const STUDY_CONFIGS: Record<StudyAction, StudyConfig> = {
  certification: {
    staminaCost:    30,
    cashCost:    5_000,  // 职业考证费用
    careerDelta:   +20,
    happinessDelta: +5,
  },
};

// ─── 结果类型 ─────────────────────────────────────────────────────────────────

export interface WorkResult {
  income:      number;
  healthDelta: number;
  staminaCost: number;
  forcedStop:  boolean;
}

export interface SocialResult {
  success:        boolean;  // false = 现金不足
  moodDelta:      number;
  careerDelta:    number;
  happinessDelta: number;
  staminaCost:    number;
  cashCost:       number;
}

export interface MedicalResult {
  success:               boolean;  // false = 体力/现金不足 or 本回合已使用
  staminaCost:           number;
  cashCost:              number;
  healthDelta:           number;
  diseaseResistanceDelta: number;
}

export interface StudyResult {
  success:        boolean;  // false = 体力或现金不足
  staminaCost:    number;
  cashCost:       number;
  careerDelta:    number;
  happinessDelta: number;
}

// ─── 纯计算函数 ───────────────────────────────────────────────────────────────

export function calcWork(
  mode: WorkMode,
  salary: number,
  currentHealth: number,
  currentStamina: number,
): WorkResult {
  // 体力不足时降级为 slack
  const cfg           = WORK_CONFIGS[mode];
  const effectiveMode = currentStamina < cfg.staminaCost ? 'slack' : mode;
  const eCfg          = WORK_CONFIGS[effectiveMode];

  return {
    income:      workIncome(salary, effectiveMode),
    healthDelta: eCfg.healthDelta,
    staminaCost: eCfg.staminaCost,
    forcedStop:  currentHealth + eCfg.healthDelta <= 0,
  };
}

export function calcSocial(
  mode: SocialMode,
  currentStamina: number,
  currentCash: number,
): SocialResult {
  const cfg          = SOCIAL_CONFIGS[mode];
  const canAfford    = currentStamina >= cfg.staminaCost && currentCash >= cfg.cashCost;

  if (!canAfford) return { success: false, moodDelta: 0, careerDelta: 0, happinessDelta: 0, staminaCost: 0, cashCost: 0 };

  return {
    success:        true,
    moodDelta:      cfg.moodDelta,
    careerDelta:    cfg.careerDelta,
    happinessDelta: cfg.happinessDelta,
    staminaCost:    cfg.staminaCost,
    cashCost:       cfg.cashCost,
  };
}

/**
 * @param alreadyUsed 本回合该医疗行动是否已使用过（每回合各限 1 次）
 */
export function calcMedical(
  action: MedicalAction,
  currentStamina: number,
  currentCash: number,
  alreadyUsed: boolean,
): MedicalResult {
  const empty: MedicalResult = { success: false, staminaCost: 0, cashCost: 0, healthDelta: 0, diseaseResistanceDelta: 0 };

  if (alreadyUsed) return empty;

  const cfg     = MEDICAL_CONFIGS[action];
  const success = currentStamina >= cfg.staminaCost && currentCash >= cfg.cashCost;
  if (!success) return empty;

  return {
    success:               true,
    staminaCost:           cfg.staminaCost,
    cashCost:              cfg.cashCost,
    healthDelta:           cfg.healthDelta,
    diseaseResistanceDelta:cfg.diseaseResistanceDelta,
  };
}

export function calcStudy(
  action: StudyAction,
  currentStamina: number,
  currentCash: number,
): StudyResult {
  const cfg     = STUDY_CONFIGS[action];
  const success = currentStamina >= cfg.staminaCost && currentCash >= cfg.cashCost;

  if (!success) return { success: false, staminaCost: 0, cashCost: 0, careerDelta: 0, happinessDelta: 0 };

  return {
    success:        true,
    staminaCost:    cfg.staminaCost,
    cashCost:       cfg.cashCost,
    careerDelta:    cfg.careerDelta,
    happinessDelta: cfg.happinessDelta,
  };
}

// ─── 生病概率（供 EventEngine 调用） ──────────────────────────────────────────

export function illnessProbability(healthScore: number, diseaseResistance: number): number {
  const base      = (100 - healthScore) / 200;
  const reduction = diseaseResistance * 0.003;
  return Math.max(0, base - reduction);
}
