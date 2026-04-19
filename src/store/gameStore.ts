import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  GameState, Debts, AssetClass,
  WorkMode, SocialMode, MedicalAction, StudyAction,
} from '../types/game';
import { getEconomyState } from '../engine/EconomyEngine';
import { applyExpense, repayDebt, totalDebt } from '../engine/DebtWaterfall';
import { advanceRound, applyEmergencyRoom, actionsPerRound } from '../engine/advanceRound';
import { calcWork, calcSocial, calcMedical, calcStudy } from '../engine/ActivityEngine';
import { applyEventEffect } from '../engine/EventEngine';

// ─── 初始状态工厂 ──────────────────────────────────────────────────────────────

function createInitialState(
  startYear: number,
  salary: number,
  startingCash: number,
  studentLoanBalance: number,
): GameState {
  return {
    // ── Progress ──────────────────────────────────────────────────────────────
    currentRound:    1,
    gameYearOffset:  0,
    startYear,
    currentYear:     startYear,
    playerAge:       22,

    // ── Vitals ────────────────────────────────────────────────────────────────
    stamina:           360,
    maxStamina:        360,
    healthScore:        70,
    happinessScore:     60,
    moodScore:          60,
    careerScore:        30,
    diseaseResistance:   0,

    // ── Employment ────────────────────────────────────────────────────────────
    isUnemployed:      false,
    unemployedRounds:  0,

    // ── Finances ──────────────────────────────────────────────────────────────
    cash:    startingCash,
    salary,
    debts: {
      studentLoan:   studentLoanBalance,
      primeLoanDebt: 0,
      creditCardDebt:0,
    },
    assets:              [],
    monthlyExpenses:  3_333,   // ~$40k / 12 — 仅用于 HUD 月度显示
    annualLivingExpense: 40_000,

    // ── Reputation ────────────────────────────────────────────────────────────
    reputation:      'medium',
    reputationScore: 50,

    // ── Lifestyle ─────────────────────────────────────────────────────────────
    lifestyle: { housing: 2, food: 2, clothing: 2, transportation: 2 },

    // ── Time Capsule ──────────────────────────────────────────────────────────
    timeCapsule: { balance: 0, contributionPct: 5 },

    // ── Economy ───────────────────────────────────────────────────────────────
    economy: getEconomyState(1),

    // ── Per-round ─────────────────────────────────────────────────────────────
    actionsRemaining:          actionsPerRound(),
    thisRoundMedical:          { gym: false, checkup: false },
    lastLivingExpenseDeducted: 0,

    // ── Meta ──────────────────────────────────────────────────────────────────
    unlockedAssets: ['savings', 'bonds'],
    pendingEvents:  [],
    isGameOver:     false,
  };
}

// ─── Actions 类型声明 ──────────────────────────────────────────────────────────

interface GameActions {
  initGame: (startYear: number, salary: number, cash: number, studentLoan: number) => void;

  /** 推进到下一回合（含生活费扣除、利息、事件触发） */
  nextRound: () => void;

  /** 支付任意开销，走 DebtWaterfall */
  payExpense: (amount: number) => void;

  makeDebtPayment: (amount: number) => void;
  addCash: (amount: number) => void;
  adjustReputation: (delta: number) => void;
  adjustHealth: (delta: number) => void;
  adjustHappiness: (delta: number) => void;

  /**
   * 打卡上班：slack −2 HP | normal −5 HP | overtime −15 HP
   * 体力不足自动降级；Health ≤ 0 触发急诊（-$15k，永久 -50 maxStamina）
   */
  performWork: (mode: WorkMode) => void;

  /**
   * 社交行动：
   * forced −$2,000 −10 Mood +15 Career | active −$500 +20 Mood
   * 现金或体力不足时静默失败
   */
  performSocial: (mode: SocialMode) => void;

  /**
   * 医疗行动（每回合各限 1 次）：
   * gym −40 SP −$50 +10 HP | checkup −20 SP −$1,000 +10 diseaseResistance
   */
  performMedical: (action: MedicalAction) => void;

  /**
   * 学习/考证：−30 SP −$5,000 +20 Career
   */
  performStudy: (action: StudyAction) => void;

  /** 确认并应用一个 pending 事件，从队列移除 */
  resolveEvent: (eventId: string) => void;

  setUnemployed: (value: boolean) => void;
  setContributionPct: (pct: number) => void;
  redeemTimeCapsule: () => void;
  unlockAsset: (asset: AssetClass) => void;
  consumeStamina: (cost: number) => void;
  resetGame: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const DEFAULT_START: GameState = createInitialState(2024, 60_000, 10_000, 30_000);

export const useGameStore = create<GameState & GameActions>()(
  immer((set) => ({
    ...DEFAULT_START,

    // ── Game lifecycle ────────────────────────────────────────────────────────
    initGame: (startYear, salary, cash, studentLoan) => {
      set(() => createInitialState(startYear, salary, cash, studentLoan));
    },

    nextRound: () => {
      set((state) => {
        const next = advanceRound(state as GameState);
        Object.assign(state, next);
      });
    },

    resetGame: () => {
      set(() => ({ ...DEFAULT_START }));
    },

    // ── Finance ───────────────────────────────────────────────────────────────
    payExpense: (amount) => {
      set((state) => {
        const { cash, debts, result } = applyExpense(
          amount, state.cash, state.debts as Debts, state.reputation,
        );
        state.cash  = cash;
        state.debts = debts;
        if (result.creditCardCharged > 0)
          state.happinessScore = Math.max(0, state.happinessScore - 5);
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

    // ── Reputation / Health / Happiness ──────────────────────────────────────
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

    // ── Work ─────────────────────────────────────────────────────────────────
    performWork: (mode) => {
      set((state) => {
        const effectiveSalary = state.isUnemployed ? 0 : state.salary;
        const res = calcWork(mode, effectiveSalary, state.healthScore, state.stamina);

        state.cash             += res.income;
        state.healthScore       = Math.max(0, Math.min(100, state.healthScore + res.healthDelta));
        state.stamina           = Math.max(0, state.stamina - res.staminaCost);
        state.actionsRemaining  = Math.max(0, state.actionsRemaining - 1);

        if (res.forcedStop) {
          state.moodScore      = Math.max(0, state.moodScore - 20);
          state.happinessScore = Math.max(0, state.happinessScore - 10);
        }

        // ── 零血急诊：-$15,000 + 永久 -50 maxStamina ──────────────────────────
        if (state.healthScore <= 0) {
          const er = applyEmergencyRoom({
            cash:       state.cash,
            debts:      state.debts as Debts,
            reputation: state.reputation,
            maxStamina: state.maxStamina,
          });
          state.cash        = er.cash;
          state.debts       = er.debts;
          state.maxStamina  = er.maxStamina;
          state.healthScore = er.healthScore;
        }
      });
    },

    // ── Social ────────────────────────────────────────────────────────────────
    performSocial: (mode) => {
      set((state) => {
        const res = calcSocial(mode, state.stamina, state.cash);
        if (!res.success) return;

        state.cash           -= res.cashCost;
        state.moodScore       = Math.max(0, Math.min(100, state.moodScore + res.moodDelta));
        state.careerScore     = Math.max(0, Math.min(100, state.careerScore + res.careerDelta));
        state.happinessScore  = Math.max(0, Math.min(100, state.happinessScore + res.happinessDelta));
        state.stamina         = Math.max(0, state.stamina - res.staminaCost);
        state.actionsRemaining = Math.max(0, state.actionsRemaining - 1);
      });
    },

    // ── Medical（每回合各限 1 次） ──────────────────────────────────────────────
    performMedical: (action) => {
      set((state) => {
        const alreadyUsed = state.thisRoundMedical[action];
        const res = calcMedical(action, state.stamina, state.cash, alreadyUsed);
        if (!res.success) return;

        state.stamina           = Math.max(0, state.stamina - res.staminaCost);
        state.cash             -= res.cashCost;
        state.healthScore       = Math.max(0, Math.min(100, state.healthScore + res.healthDelta));
        state.diseaseResistance = Math.min(100, state.diseaseResistance + res.diseaseResistanceDelta);
        state.actionsRemaining  = Math.max(0, state.actionsRemaining - 1);
        state.thisRoundMedical[action] = true;  // 标记本回合已使用
      });
    },

    // ── Study ─────────────────────────────────────────────────────────────────
    performStudy: (action) => {
      set((state) => {
        const res = calcStudy(action, state.stamina, state.cash);
        if (!res.success) return;

        state.stamina          = Math.max(0, state.stamina - res.staminaCost);
        state.cash            -= res.cashCost;
        state.careerScore      = Math.max(0, Math.min(100, state.careerScore + res.careerDelta));
        state.happinessScore   = Math.max(0, Math.min(100, state.happinessScore + res.happinessDelta));
        state.actionsRemaining = Math.max(0, state.actionsRemaining - 1);
      });
    },

    // ── Events ────────────────────────────────────────────────────────────────
    resolveEvent: (eventId) => {
      set((state) => {
        const idx = state.pendingEvents.findIndex(e => e.id === eventId);
        if (idx === -1) return;
        const event   = state.pendingEvents[idx];
        const applied = applyEventEffect(event.effect, {
          cash:             state.cash,
          healthScore:      state.healthScore,
          moodScore:        state.moodScore,
          happinessScore:   state.happinessScore,
          reputationScore:  state.reputationScore,
          salary:           state.salary,
          debts:            state.debts,
          isUnemployed:     state.isUnemployed,
          unemployedRounds: state.unemployedRounds,
        });
        Object.assign(state, applied);
        if (state.reputationScore >= 67)      state.reputation = 'good';
        else if (state.reputationScore >= 34) state.reputation = 'medium';
        else                                  state.reputation = 'poor';
        state.pendingEvents.splice(idx, 1);
      });
    },

    setUnemployed: (value) => {
      set((state) => {
        state.isUnemployed     = value;
        state.unemployedRounds = value ? state.unemployedRounds : 0;
      });
    },

    // ── Time Capsule ──────────────────────────────────────────────────────────
    setContributionPct: (pct) => {
      set((state) => {
        state.timeCapsule.contributionPct = Math.max(0, Math.min(100, pct));
      });
    },

    redeemTimeCapsule: () => {
      set((state) => {
        state.cash               += state.timeCapsule.balance;
        state.timeCapsule.balance = 0;
      });
    },

    // ── Assets / Stamina ─────────────────────────────────────────────────────
    unlockAsset: (asset) => {
      set((state) => {
        if (!state.unlockedAssets.includes(asset)) state.unlockedAssets.push(asset);
      });
    },

    consumeStamina: (cost) => {
      set((state) => {
        state.stamina          = Math.max(0, state.stamina - cost);
        state.actionsRemaining = Math.max(0, state.actionsRemaining - 1);
      });
    },
  })),
);

// ─── 派生选择器 ────────────────────────────────────────────────────────────────

/** 标称净资产 = 现金 + 所有资产持仓 + 时间胶囊 − 全部负债 */
export const selectNetWorth = (state: GameState): number => {
  const assetTotal = state.assets.reduce((sum, h) => sum + h.amount, 0);
  return state.cash + assetTotal + state.timeCapsule.balance - totalDebt(state.debts);
};

/** 某资产类别的当前持仓（供投资卖出滑块 max 使用） */
export const selectHoldingAmount = (assetClass: AssetClass) =>
  (state: GameState): number =>
    state.assets.find(h => h.assetClass === assetClass)?.amount ?? 0;
