import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameState, Debts, AssetClass, WorkMode, SocialMode, MedicalAction } from '../types/game';
import { getEconomyState } from '../engine/EconomyEngine';
import { applyExpense, repayDebt, totalDebt } from '../engine/DebtWaterfall';
import { advanceRound } from '../engine/advanceRound';
import { calcWork, calcSocial, calcMedical } from '../engine/ActivityEngine';

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

    stamina:           360,
    healthScore:        70,
    happinessScore:     60,
    moodScore:          60,
    careerScore:        30,
    diseaseResistance:   0,

    cash:            startingCash,
    salary,
    debts: {
      studentLoan:      studentLoanBalance,
      primeLoanBalance: 0,
      creditCard:       0,
    },
    assets:          [],
    monthlyExpenses: 1_200,

    reputation:      'medium',
    reputationScore: 50,

    lifestyle: {
      housing:        2,
      food:           2,
      clothing:       2,
      transportation: 2,
    },

    timeCapsule: {
      balance:         0,
      contributionPct: 5,  // 默认每回合薪资的 5% 自动定投
    },

    economy:          getEconomyState(1),
    actionsRemaining: 8,
    unlockedAssets:   ['savings', 'bonds'],
    isGameOver:       false,
  };
}

// ─── Store 动作类型 ────────────────────────────────────────────────────────────

interface GameActions {
  initGame: (
    startYear: number,
    salary: number,
    startingCash: number,
    studentLoan: number,
  ) => void;

  nextRound: () => void;

  /** 支付开销：Cash → Prime Loan → Credit Card */
  payExpense: (amount: number) => void;

  makeDebtPayment: (amount: number) => void;

  addCash: (amount: number) => void;

  adjustReputation: (delta: number) => void;

  adjustHealth: (delta: number) => void;

  adjustHappiness: (delta: number) => void;

  /**
   * 打卡上班。
   * slack: −2 Health | normal: −5 Health | overtime: −15 Health
   * 体力不足时自动降级为 slack；Health 归零时标记 forcedStop。
   */
  performWork: (mode: WorkMode) => void;

  /**
   * 社交行动。
   * forced: −10 Mood, +15 Career | active: +20 Mood, 0 Career
   */
  performSocial: (mode: SocialMode) => void;

  /**
   * 医疗行动。
   * gym: −40 SP, −$50, +10 Health | checkup: −20 SP, −$300, +10 diseaseResistance
   * 体力或现金不足时静默失败（返回但不修改状态）。
   */
  performMedical: (action: MedicalAction) => void;

  /** 修改时间胶囊定投比例 (0–100) */
  setContributionPct: (pct: number) => void;

  /** 提前赎回时间胶囊（全额转回现金，无惩罚） */
  redeemTimeCapsule: () => void;

  unlockAsset: (asset: AssetClass) => void;

  consumeStamina: (cost: number) => void;

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
          state.reputation,
        );
        state.cash  = cash;
        state.debts = debts;
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
      set((state) => { state.cash += amount; });
    },

    adjustReputation: (delta) => {
      set((state) => {
        state.reputationScore = Math.max(0, Math.min(100, state.reputationScore + delta));
        if (state.reputationScore >= 67)      state.reputation = 'good';
        else if (state.reputationScore >= 34) state.reputation = 'medium';
        else                                  state.reputation = 'poor';
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

    performWork: (mode) => {
      set((state) => {
        const res = calcWork(mode, state.salary, state.healthScore, state.stamina);
        state.cash         += res.income;
        state.healthScore   = Math.max(0, Math.min(100, state.healthScore + res.healthDelta));
        state.stamina       = Math.max(0, state.stamina - res.staminaCost);
        state.actionsRemaining = Math.max(0, state.actionsRemaining - 1);
        // 健康归零时心情和幸福感额外受损
        if (res.forcedStop) {
          state.moodScore      = Math.max(0, state.moodScore - 20);
          state.happinessScore = Math.max(0, state.happinessScore - 10);
        }
      });
    },

    performSocial: (mode) => {
      set((state) => {
        const res = calcSocial(mode, state.stamina);
        state.moodScore      = Math.max(0, Math.min(100, state.moodScore + res.moodDelta));
        state.careerScore    = Math.max(0, Math.min(100, state.careerScore + res.careerDelta));
        state.happinessScore = Math.max(0, Math.min(100, state.happinessScore + res.happinessDelta));
        state.stamina        = Math.max(0, state.stamina - res.staminaCost);
        state.actionsRemaining = Math.max(0, state.actionsRemaining - 1);
      });
    },

    performMedical: (action) => {
      set((state) => {
        const res = calcMedical(action, state.stamina, state.cash);
        if (!res.success) return;
        state.stamina          = Math.max(0, state.stamina - res.staminaCost);
        state.cash             -= res.cashCost;
        state.healthScore      = Math.max(0, Math.min(100, state.healthScore + res.healthDelta));
        state.diseaseResistance = Math.min(100, state.diseaseResistance + res.diseaseResistanceDelta);
        state.actionsRemaining  = Math.max(0, state.actionsRemaining - 1);
      });
    },

    setContributionPct: (pct) => {
      set((state) => {
        state.timeCapsule.contributionPct = Math.max(0, Math.min(100, pct));
      });
    },

    redeemTimeCapsule: () => {
      set((state) => {
        state.cash                    += state.timeCapsule.balance;
        state.timeCapsule.balance      = 0;
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

// ─── 派生选择器 ────────────────────────────────────────────────────────────────

export const selectNetWorth = (state: GameState): number => {
  const assetTotal = state.assets.reduce((sum, h) => sum + h.amount, 0);
  return state.cash + assetTotal + state.timeCapsule.balance - totalDebt(state.debts);
};

export const selectCalendarYear = (state: GameState): number =>
  state.startYear + Math.floor(state.gameYearOffset);
