import type { EconomyPhase, EconomyState } from '../types/game';

// ─── Phase sequence (每 5 回合一次完整循环) ────────────────────────────────────
// 索引 0→复苏  1→繁荣  2→繁荣  3→衰退  4→冰冻
const PHASE_SEQUENCE: EconomyPhase[] = [
  'recovery',
  'boom',
  'boom',
  'recession',
  'freeze',
];

// ─── Phase multipliers ────────────────────────────────────────────────────────

interface PhaseConfig {
  interestRateMultiplier: number;
  salaryGrowthMultiplier: number;
  inflationRate: number;
}

const PHASE_CONFIGS: Record<EconomyPhase, PhaseConfig> = {
  recovery: {
    interestRateMultiplier: 0.8,  // 宽松货币政策
    salaryGrowthMultiplier: 1.02, // 温和薪资增长
    inflationRate: 0.02,
  },
  boom: {
    interestRateMultiplier: 1.0,
    salaryGrowthMultiplier: 1.05, // 强劲薪资增长
    inflationRate: 0.035,
  },
  recession: {
    interestRateMultiplier: 1.3,  // 信贷收紧
    salaryGrowthMultiplier: 0.98, // 薪资下压风险
    inflationRate: 0.015,
  },
  freeze: {
    interestRateMultiplier: 1.5,  // 信贷冻结
    salaryGrowthMultiplier: 0.95, // 裁员/薪资削减风险
    inflationRate: 0.005,
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * 根据回合号计算当前经济状态。
 * 周期公式：phaseIndex = (currentRound - 1) % 5
 */
export function getEconomyState(currentRound: number): EconomyState {
  const phaseIndex = (currentRound - 1) % PHASE_SEQUENCE.length;
  const phase = PHASE_SEQUENCE[phaseIndex];
  const config = PHASE_CONFIGS[phase];

  return {
    phase,
    phaseIndex,
    ...config,
  };
}

/**
 * 返回当前阶段的中文名称（用于 UI 展示）
 */
export function getPhaseLabel(phase: EconomyPhase): string {
  const labels: Record<EconomyPhase, string> = {
    recovery: '复苏',
    boom:     '繁荣',
    recession:'衰退',
    freeze:   '冰冻',
  };
  return labels[phase];
}

/**
 * 预测未来 N 回合的经济阶段序列（用于投资决策提示）
 */
export function forecastPhases(
  currentRound: number,
  lookahead: number,
): EconomyPhase[] {
  return Array.from({ length: lookahead }, (_, i) => {
    const idx = (currentRound - 1 + i) % PHASE_SEQUENCE.length;
    return PHASE_SEQUENCE[idx];
  });
}

/**
 * 根据经济阶段调整资产年化收益率。
 * baseReturn 为历史平均年化收益（小数，如 0.10 = 10%）。
 */
export function adjustReturnForPhase(
  baseReturn: number,
  phase: EconomyPhase,
): number {
  const adjustments: Record<EconomyPhase, number> = {
    recovery:  0.03,   // +3pp
    boom:      0.05,   // +5pp
    recession: -0.08,  // -8pp
    freeze:    -0.12,  // -12pp
  };
  return baseReturn + adjustments[phase];
}
