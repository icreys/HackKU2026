import type { Debts, PaymentResult } from '../types/game';

// ─── 利率常量 ─────────────────────────────────────────────────────────────────

/** 季度复利下的有效年利率 */
export const APR = {
  studentLoan: 0.055,  // 5.5%
  creditLine:  0.12,   // 12%
  creditCard:  0.22,   // 22%
} as const;

/** 每回合（约 43/30 年）的利息系数 */
const ROUND_DURATION_YEARS = 43 / 30;

export function interestPerRound(apr: number): number {
  // 季度复利：(1 + apr/4)^(4 * roundDuration) - 1
  return Math.pow(1 + apr / 4, 4 * ROUND_DURATION_YEARS) - 1;
}

// ─── Debt Waterfall ───────────────────────────────────────────────────────────

/**
 * 支付费用时按优先级依序扣款：
 *   现金 → 应急信用额度 → 信用卡（无上限，紧急兜底）
 *
 * 返回更新后的 cash、debts 和支付明细。
 */
export function applyExpense(
  amount: number,
  cash: number,
  debts: Debts,
): { cash: number; debts: Debts; result: PaymentResult } {
  let remaining = amount;

  const result: PaymentResult = {
    success: true,
    cashPaid: 0,
    creditLinePaid: 0,
    creditCardCharged: 0,
    unpaid: 0,
  };

  // ── 1. 先用现金 ─────────────────────────────────────────────────────────────
  const cashUsed = Math.min(remaining, cash);
  cash -= cashUsed;
  remaining -= cashUsed;
  result.cashPaid = cashUsed;

  if (remaining <= 0) {
    return { cash, debts: { ...debts }, result };
  }

  // ── 2. 应急信用额度（偿还已有额度内的空间） ──────────────────────────────────
  // 信用额度上限建模为固定 $10,000；已用部分存在 debts.creditLine
  const CREDIT_LINE_LIMIT = 10_000;
  const creditLineAvailable = Math.max(0, CREDIT_LINE_LIMIT - debts.creditLine);
  const creditLineUsed = Math.min(remaining, creditLineAvailable);
  const newCreditLine = debts.creditLine + creditLineUsed;
  remaining -= creditLineUsed;
  result.creditLinePaid = creditLineUsed;

  if (remaining <= 0) {
    return {
      cash,
      debts: { ...debts, creditLine: newCreditLine },
      result,
    };
  }

  // ── 3. 信用卡（紧急兜底，无硬上限，高利率） ──────────────────────────────────
  const newCreditCard = debts.creditCard + remaining;
  result.creditCardCharged = remaining;
  remaining = 0;

  return {
    cash,
    debts: {
      ...debts,
      creditLine: newCreditLine,
      creditCard: newCreditCard,
    },
    result,
  };
}

// ─── 债务利息滚动（每回合调用一次） ──────────────────────────────────────────

/**
 * 对所有债务应用该回合的利息，返回更新后的 debts。
 */
export function accrueDebtInterest(debts: Debts): Debts {
  return {
    studentLoan: debts.studentLoan > 0
      ? debts.studentLoan * (1 + interestPerRound(APR.studentLoan))
      : 0,
    creditLine: debts.creditLine > 0
      ? debts.creditLine * (1 + interestPerRound(APR.creditLine))
      : 0,
    creditCard: debts.creditCard > 0
      ? debts.creditCard * (1 + interestPerRound(APR.creditCard))
      : 0,
  };
}

/**
 * 主动还款：按瀑布顺序优先偿还高利率债务（信用卡→信用额度→学生贷款）
 */
export function repayDebt(
  paymentAmount: number,
  cash: number,
  debts: Debts,
): { cash: number; debts: Debts } {
  let budget = Math.min(paymentAmount, cash);
  cash -= budget;

  const order: (keyof Debts)[] = ['creditCard', 'creditLine', 'studentLoan'];
  const updated = { ...debts };

  for (const key of order) {
    if (budget <= 0) break;
    const paid = Math.min(budget, updated[key]);
    updated[key] -= paid;
    budget -= paid;
  }

  // 未用完的还款预算退回现金
  cash += budget;
  return { cash, debts: updated };
}

/**
 * 计算所有债务总额
 */
export function totalDebt(debts: Debts): number {
  return debts.studentLoan + debts.creditLine + debts.creditCard;
}
