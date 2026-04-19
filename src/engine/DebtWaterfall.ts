import type { Debts, PaymentResult, ReputationLevel } from '../types/game';

// ─── 利率常量 ─────────────────────────────────────────────────────────────────

export const APR = {
  studentLoan:  0.055,  // 5.5%  — 联邦学生贷款
  primeLoan:    0.060,  // 6.0%  — 优惠利率贷款（低息，声望门控）
  creditCard:   0.22,   // 22%   — 信用卡紧急兜底
} as const;

/** 每回合时长（年），与 advanceRound.ts 保持一致 */
const ROUND_DURATION_YEARS = 43 / 30;

/** 季度复利：单回合利息系数 */
export function interestPerRound(apr: number): number {
  return Math.pow(1 + apr / 4, 4 * ROUND_DURATION_YEARS) - 1;
}

// ─── Prime Loan 额度（基于声望等级） ──────────────────────────────────────────

const PRIME_LOAN_LIMITS: Record<ReputationLevel, number> = {
  good:   25_000,  // 良好声望：$25,000 可用额度
  medium: 15_000,  // 中等声望：$15,000 可用额度
  poor:    5_000,  // 较差声望：$5,000 可用额度
};

export function primeLoanLimit(reputation: ReputationLevel): number {
  return PRIME_LOAN_LIMITS[reputation];
}

// ─── Debt Waterfall ───────────────────────────────────────────────────────────

/**
 * 支付费用：Cash → Prime Loan（声望额度内）→ Credit Card（无上限兜底）
 *
 * @param amount      本次费用金额
 * @param cash        当前现金
 * @param debts       当前债务对象
 * @param reputation  当前声望等级（决定 prime loan 可用额度）
 */
export function applyExpense(
  amount: number,
  cash: number,
  debts: Debts,
  reputation: ReputationLevel,
): { cash: number; debts: Debts; result: PaymentResult } {
  let remaining = amount;

  const result: PaymentResult = {
    success:          true,
    cashPaid:         0,
    primeLoanDrawn:   0,
    creditCardCharged:0,
    unpaid:           0,
  };

  // ── 1. 现金优先 ──────────────────────────────────────────────────────────────
  const cashUsed = Math.min(remaining, cash);
  cash      -= cashUsed;
  remaining -= cashUsed;
  result.cashPaid = cashUsed;

  if (remaining <= 0) {
    return { cash, debts: { ...debts }, result };
  }

  // ── 2. Prime Loan（低息，额度由声望决定） ─────────────────────────────────────
  const limit          = primeLoanLimit(reputation);
  const primeAvailable = Math.max(0, limit - debts.primeLoanBalance);
  const primeUsed      = Math.min(remaining, primeAvailable);
  remaining -= primeUsed;
  result.primeLoanDrawn = primeUsed;

  if (remaining <= 0) {
    return {
      cash,
      debts: { ...debts, primeLoanBalance: debts.primeLoanBalance + primeUsed },
      result,
    };
  }

  // ── 3. 信用卡兜底（22% APR，无硬上限） ───────────────────────────────────────
  result.creditCardCharged = remaining;

  return {
    cash,
    debts: {
      ...debts,
      primeLoanBalance: debts.primeLoanBalance + primeUsed,
      creditCard:       debts.creditCard + remaining,
    },
    result,
  };
}

// ─── 债务利息滚动（每回合调用） ───────────────────────────────────────────────

/**
 * 对三类债务分别计算该回合利息并累加，返回更新后的 debts。
 */
export function accrueDebtInterest(debts: Debts): Debts {
  return {
    studentLoan: debts.studentLoan > 0
      ? debts.studentLoan * (1 + interestPerRound(APR.studentLoan))
      : 0,
    primeLoanBalance: debts.primeLoanBalance > 0
      ? debts.primeLoanBalance * (1 + interestPerRound(APR.primeLoan))
      : 0,
    creditCard: debts.creditCard > 0
      ? debts.creditCard * (1 + interestPerRound(APR.creditCard))
      : 0,
  };
}

// ─── 主动还款（高息优先） ─────────────────────────────────────────────────────

/**
 * 用现金主动还款，优先清偿高利率债务：
 * creditCard (22%) → primeLoan (6%) → studentLoan (5.5%)
 */
export function repayDebt(
  paymentAmount: number,
  cash: number,
  debts: Debts,
): { cash: number; debts: Debts } {
  let budget = Math.min(paymentAmount, cash);
  cash -= budget;

  const order: (keyof Debts)[] = ['creditCard', 'primeLoanBalance', 'studentLoan'];
  const updated = { ...debts };

  for (const key of order) {
    if (budget <= 0) break;
    const paid    = Math.min(budget, updated[key]);
    updated[key] -= paid;
    budget       -= paid;
  }

  cash += budget; // 未用完还款预算退回现金
  return { cash, debts: updated };
}

// ─── 工具函数 ─────────────────────────────────────────────────────────────────

export function totalDebt(debts: Debts): number {
  return debts.studentLoan + debts.primeLoanBalance + debts.creditCard;
}
