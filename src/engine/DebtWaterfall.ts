import type { Debts, PaymentResult, ReputationLevel } from '../types/game';

// ─── 利率常量 ─────────────────────────────────────────────────────────────────

export const APR = {
  studentLoan:  0.055,  // 5.5%  — 联邦学生贷款
  primeLoan:    0.060,  // 6.0%  — 优惠利率贷款（低息，声望门控）
  creditCard:   0.22,   // 22%   — 信用卡紧急兜底
} as const;

const ROUND_DURATION_YEARS = 43 / 30;

/** 季度复利：单回合利息系数 */
export function interestPerRound(apr: number): number {
  return Math.pow(1 + apr / 4, 4 * ROUND_DURATION_YEARS) - 1;
}

// ─── Prime Loan 额度（基于声望等级） ──────────────────────────────────────────

const PRIME_LOAN_LIMITS: Record<ReputationLevel, number> = {
  good:   25_000,
  medium: 15_000,
  poor:    5_000,
};

export function primeLoanLimit(reputation: ReputationLevel): number {
  return PRIME_LOAN_LIMITS[reputation];
}

// ─── Debt Waterfall ───────────────────────────────────────────────────────────

/**
 * 费用支付瀑布：Cash → primeLoanDebt（声望额度内）→ creditCardDebt（无上限兜底）
 */
export function applyExpense(
  amount: number,
  cash: number,
  debts: Debts,
  reputation: ReputationLevel,
): { cash: number; debts: Debts; result: PaymentResult } {
  let remaining = amount;

  const result: PaymentResult = {
    success:           true,
    cashPaid:          0,
    primeLoanDrawn:    0,
    creditCardCharged: 0,
    unpaid:            0,
  };

  // 1. 现金优先
  const cashUsed = Math.min(remaining, cash);
  cash      -= cashUsed;
  remaining -= cashUsed;
  result.cashPaid = cashUsed;
  if (remaining <= 0) return { cash, debts: { ...debts }, result };

  // 2. Prime Loan（低息，声望额度内）
  const limit          = primeLoanLimit(reputation);
  const primeAvailable = Math.max(0, limit - debts.primeLoanDebt);
  const primeUsed      = Math.min(remaining, primeAvailable);
  remaining -= primeUsed;
  result.primeLoanDrawn = primeUsed;
  if (remaining <= 0) {
    return {
      cash,
      debts: { ...debts, primeLoanDebt: debts.primeLoanDebt + primeUsed },
      result,
    };
  }

  // 3. 信用卡兜底（22% APR，无硬上限）
  result.creditCardCharged = remaining;
  return {
    cash,
    debts: {
      ...debts,
      primeLoanDebt:  debts.primeLoanDebt + primeUsed,
      creditCardDebt: debts.creditCardDebt + remaining,
    },
    result,
  };
}

// ─── 债务利息滚动（每回合调用） ───────────────────────────────────────────────

export function accrueDebtInterest(debts: Debts): Debts {
  return {
    studentLoan: debts.studentLoan > 0
      ? debts.studentLoan * (1 + interestPerRound(APR.studentLoan))
      : 0,
    primeLoanDebt: debts.primeLoanDebt > 0
      ? debts.primeLoanDebt * (1 + interestPerRound(APR.primeLoan))
      : 0,
    creditCardDebt: debts.creditCardDebt > 0
      ? debts.creditCardDebt * (1 + interestPerRound(APR.creditCard))
      : 0,
  };
}

// ─── 主动还款（高息优先） ─────────────────────────────────────────────────────

/**
 * creditCardDebt (22%) → primeLoanDebt (6%) → studentLoan (5.5%)
 */
export function repayDebt(
  paymentAmount: number,
  cash: number,
  debts: Debts,
): { cash: number; debts: Debts } {
  let budget = Math.min(paymentAmount, cash);
  cash -= budget;

  const order: (keyof Debts)[] = ['creditCardDebt', 'primeLoanDebt', 'studentLoan'];
  const updated = { ...debts };

  for (const key of order) {
    if (budget <= 0) break;
    const paid    = Math.min(budget, updated[key]);
    updated[key] -= paid;
    budget       -= paid;
  }

  cash += budget;
  return { cash, debts: updated };
}

export function totalDebt(debts: Debts): number {
  return debts.studentLoan + debts.primeLoanDebt + debts.creditCardDebt;
}
