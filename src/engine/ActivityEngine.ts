import type { WorkMode, SocialMode, MedicalAction } from '../types/game';
import { YEARS_PER_ROUND } from './advanceRound';

// ─── 工作行动参数 ─────────────────────────────────────────────────────────────

interface WorkConfig {
  healthDelta:    number;   // 扣除的健康点数（负数）
  staminaCost:    number;   // 体力消耗
  incomeMultiplier: number; // 相对于标准工资收入的倍率
}

export const WORK_CONFIGS: Record<WorkMode, WorkConfig> = {
  slack: {
    healthDelta:     -2,
    staminaCost:      5,
    incomeMultiplier: 0.6,  // 摸鱼：60% 产出
  },
  normal: {
    healthDelta:     -5,
    staminaCost:     10,
    incomeMultiplier: 1.0,  // 正常：全额产出
  },
  overtime: {
    healthDelta:    -15,
    staminaCost:     20,
    incomeMultiplier: 1.5,  // 疯狂加班：150% 产出
  },
};

/**
 * 计算单次工作行动的收入。
 * 基准 = 年薪 × 每回合年数 ÷ PRD 约定的每年行动数(6)
 */
export function workIncome(salary: number, mode: WorkMode): number {
  const basePerAction = (salary * YEARS_PER_ROUND) / 6;
  return basePerAction * WORK_CONFIGS[mode].incomeMultiplier;
}

// ─── 社交行动参数 ─────────────────────────────────────────────────────────────

interface SocialConfig {
  moodDelta:        number;   // 心情变化量
  careerDelta:      number;   // 职业属性变化量
  staminaCost:      number;   // 体力消耗
  happinessDelta:   number;   // 长期幸福感变化（影响结局）
}

export const SOCIAL_CONFIGS: Record<SocialMode, SocialConfig> = {
  forced: {
    moodDelta:      -10,  // 被迫社交：耗费心情
    careerDelta:    +15,  // 但显著提升职业/社交资本
    staminaCost:     8,
    happinessDelta:  -3,  // 被迫社交对长期幸福感有轻微负面影响
  },
  active: {
    moodDelta:      +20,  // 积极社交：大幅提振心情
    careerDelta:      0,  // 不带来职业属性提升
    staminaCost:     6,
    happinessDelta:  +5,  // 长期幸福感正向
  },
};

// ─── 医疗行动参数 ─────────────────────────────────────────────────────────────

interface MedicalConfig {
  staminaCost:          number;
  cashCost:             number;
  healthDelta:          number;
  diseaseResistanceDelta: number;
}

export const MEDICAL_CONFIGS: Record<MedicalAction, MedicalConfig> = {
  gym: {
    staminaCost:           40,
    cashCost:              50,
    healthDelta:           +10,
    diseaseResistanceDelta:  0,
  },
  checkup: {
    staminaCost:           20,
    cashCost:             300,
    healthDelta:            0,
    diseaseResistanceDelta:+10,
  },
};

// ─── 结果类型 ─────────────────────────────────────────────────────────────────

export interface WorkResult {
  income:        number;
  healthDelta:   number;
  staminaCost:   number;
  /** 健康归零时的强制停工标志 */
  forcedStop:    boolean;
}

export interface SocialResult {
  moodDelta:      number;
  careerDelta:    number;
  happinessDelta: number;
  staminaCost:    number;
}

export interface MedicalResult {
  /** false = 体力或现金不足，行动取消 */
  success:               boolean;
  staminaCost:           number;
  cashCost:              number;
  healthDelta:           number;
  diseaseResistanceDelta: number;
}

// ─── 纯计算函数 ───────────────────────────────────────────────────────────────

export function calcWork(
  mode: WorkMode,
  salary: number,
  currentHealth: number,
  currentStamina: number,
): WorkResult {
  const cfg = WORK_CONFIGS[mode];

  // 体力不足时降级为摸鱼
  const effectiveMode: WorkMode =
    currentStamina < cfg.staminaCost ? 'slack' : mode;
  const effectiveCfg = WORK_CONFIGS[effectiveMode];

  const newHealth   = currentHealth + effectiveCfg.healthDelta;
  const forcedStop  = newHealth <= 0;

  return {
    income:      workIncome(salary, effectiveMode),
    healthDelta: effectiveCfg.healthDelta,
    staminaCost: effectiveCfg.staminaCost,
    forcedStop,
  };
}

export function calcSocial(
  mode: SocialMode,
  currentStamina: number,
): SocialResult {
  const cfg = SOCIAL_CONFIGS[mode];
  const canAfford = currentStamina >= cfg.staminaCost;

  return {
    moodDelta:      canAfford ? cfg.moodDelta      : 0,
    careerDelta:    canAfford ? cfg.careerDelta     : 0,
    happinessDelta: canAfford ? cfg.happinessDelta  : 0,
    staminaCost:    canAfford ? cfg.staminaCost     : 0,
  };
}

export function calcMedical(
  action: MedicalAction,
  currentStamina: number,
  currentCash: number,
): MedicalResult {
  const cfg = MEDICAL_CONFIGS[action];
  const success = currentStamina >= cfg.staminaCost && currentCash >= cfg.cashCost;

  if (!success) {
    return {
      success:                false,
      staminaCost:            0,
      cashCost:               0,
      healthDelta:            0,
      diseaseResistanceDelta: 0,
    };
  }

  return {
    success:               true,
    staminaCost:           cfg.staminaCost,
    cashCost:              cfg.cashCost,
    healthDelta:           cfg.healthDelta,
    diseaseResistanceDelta:cfg.diseaseResistanceDelta,
  };
}

// ─── 生病概率（供事件引擎调用） ───────────────────────────────────────────────

/**
 * 基于健康值和疾病抵抗力计算本回合生病概率 (0–1)。
 * 公式：base = (100 - healthScore) / 200；resistance 每点降低 0.3%。
 */
export function illnessProbability(
  healthScore: number,
  diseaseResistance: number,
): number {
  const base       = (100 - healthScore) / 200;
  const reduction  = diseaseResistance * 0.003;
  return Math.max(0, base - reduction);
}
