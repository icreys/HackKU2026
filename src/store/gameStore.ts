import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameState, Debts, AssetClass } from '../types/game';
import { getEconomyState } from '../engine/EconomyEngine';
import { applyExpense, repayDebt } from '../engine/DebtWaterfall';
import { advanceRound } from '../engine/advanceRound';

// ─── 初始状态工厂 ──────────────────────────────────────────────────────────────

function createInitialState(
  startYear: number,
  salary: number,
  startingCash: number,
  studentLoanBalance: number,
): GameState {
  return {
    currentRound:    1,
    gameYearOffset:  0,
    startYear,

    stamina:         360,
    healthScore:     70,
    happinessScore:  60,

    cash:            startingCash,
    salary,
    debts: {
      studentLoan: studentLoanBalance,
      creditLine:  0,
      creditCard:  0,
    },
    assets:          [],
    monthlyExpenses: 1_200, // 默认 Tier 2 生活水平基线

    reputation:      'medium',
    reputationScore: 50,

    lifestyle: {
      housing:        2,
      food:           2,
      clothing:       2,
      transportation: 2,
    },

    economy:          getEconomyState(1),
    actionsRemaining: 8,
    unlockedAssets:   ['savings', 'bonds'],
    isGameOver:       false,
  };
}

// ─── Store 动作类型 ────────────────────────────────────────────────────────────

interface GameActions {
  /** 用存档数据初始化新游戏 */
  initGame: (
    startYear: number,
    salary: number,
    startingCash: number,
    studentLoan: number,
  ) => void;

  /** 推进到下一回合（自动处理利息、通胀、薪资） */
  nextRound: () => void;

  /** 支付开销——自动触发 DebtWaterfall */
  payExpense: (amount: number) => void;

  /** 主动还款 */
  makeDebtPayment: (amount: number) => void;

  /** 更新现金（工资收入等） */
  addCash: (amount: number) => void;

  /** 更新声望分（+/- delta） */
  adjustReputation: (delta: number) => void;

  /** 更新健康分（+/- delta） */
  adjustHealth: (delta: number) => void;

  /** 更新幸福分（+/- delta） */
  adjustHappiness: (delta: number) => void;

  /** 解锁新资产类型 */
  unlockAsset: (asset: AssetClass) => void;

  /** 消耗体力行动 */
  consumeStamina: (cost: number) => void;

  /** 重置游戏 */
  resetGame: () => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

const DEFAULT_START: GameState = createInitialState(2024, 55_000, 3_000, 28_000);

export const useGameStore = create<GameState & GameActions>()(
  immer((set) => ({
    ...DEFAULT_START,

    initGame: (startYear, salary, startingCash, studentLoan) => {
      set(() => createInitialState(startYear, salary, startingCash, studentLoan));
    },

    nextRound: () => {
      set((state) => {
        const next = advanceRound(state as GameState);
        Object.assign(state, next);
      });
    },

    payExpense: (amount) => {
      set((state) => {
        const { cash, debts, result } = applyExpense(
          amount,
          state.cash,
          state.debts as Debts,
        );
        state.cash  = cash;
        state.debts = debts;
        // 使用信用卡紧急兜底时扣幸福值
        if (result.creditCardCharged > 0) {
          state.happinessScore = Math.max(0, state.happinessScore - 5);
        }
      });
    },

    makeDebtPayment: (amount) => {
      set((state) => {
        const { cash, debts } = repayDebt(amount, state.cash, state.debts as Debts);
        state.cash  = cash;
        state.debts = debts;
      });
    },

    addCash: (amount) => {
      set((state) => {
        state.cash += amount;
      });
    },

    adjustReputation: (delta) => {
      set((state) => {
        state.reputationScore = Math.max(0, Math.min(100, state.reputationScore + delta));
        if (state.reputationScore >= 67) state.reputation = 'good';
        else if (state.reputationScore >= 34) state.reputation = 'medium';
        else state.reputation = 'poor';
      });
    },

    adjustHealth: (delta) => {
      set((state) => {
        state.healthScore = Math.max(0, Math.min(100, state.healthScore + delta));
      });
    },

    adjustHappiness: (delta) => {
      set((state) => {
        state.happinessScore = Math.max(0, Math.min(100, state.happinessScore + delta));
      });
    },

    unlockAsset: (asset) => {
      set((state) => {
        if (!state.unlockedAssets.includes(asset)) {
          state.unlockedAssets.push(asset);
        }
      });
    },

    consumeStamina: (cost) => {
      set((state) => {
        state.stamina          = Math.max(0, state.stamina - cost);
        state.actionsRemaining = Math.max(0, state.actionsRemaining - 1);
      });
    },

    resetGame: () => {
      set(() => ({ ...DEFAULT_START }));
    },
  })),
);

// ─── 派生选择器（供 UI 组件直接使用） ─────────────────────────────────────────

export const selectNetWorth = (state: GameState): number => {
  const assetTotal = state.assets.reduce((sum, h) => sum + h.amount, 0);
  const debtTotal  = state.debts.studentLoan + state.debts.creditLine + state.debts.creditCard;
  return state.cash + assetTotal - debtTotal;
};

export const selectCalendarYear = (state: GameState): number =>
  state.startYear + Math.floor(state.gameYearOffset);
