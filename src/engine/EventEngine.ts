import type { GameEvent, GameEventEffect, GameState } from '../types/game';

// ─── 事件池 ───────────────────────────────────────────────────────────────────

const EVENT_POOL: GameEvent[] = [
  // ── 正面事件 ────────────────────────────────────────────────────────────────
  {
    id: 'bonus',
    category: 'positive',
    title: '年终奖 🎉',
    description: '公司业绩超预期，你收到了一笔额外奖金。',
    effect: { cashDelta: 2_000, moodDelta: 10, happinessDelta: 5 },
  },
  {
    id: 'raise',
    category: 'positive',
    title: '薪资上调 📈',
    description: '你的表现得到认可，年薪提升 10%。',
    effect: { salaryMultiplier: 1.1, moodDelta: 8, reputationDelta: 5 },
  },
  {
    id: 'side_hustle',
    category: 'positive',
    title: '副业成功 💡',
    description: '你的周末兼职项目带来了一笔额外收入。',
    effect: { cashDelta: 1_200, moodDelta: 6 },
  },
  {
    id: 'networking',
    category: 'positive',
    title: '行业人脉 🤝',
    description: '一次偶然的聚会让你认识了关键人脉，声誉提升。',
    effect: { reputationDelta: 10, moodDelta: 5 },
  },
  // ── 普通负面事件 ─────────────────────────────────────────────────────────────
  {
    id: 'car_breakdown',
    category: 'negative',
    title: '汽车抛锚 🚗',
    description: '车坏了，维修费让你措手不及。',
    effect: { cashDelta: -800, moodDelta: -5 },
  },
  {
    id: 'medical_bill',
    category: 'negative',
    title: '意外医疗账单 🏥',
    description: '突发的小病让你支付了一笔门诊费用。',
    effect: { cashDelta: -600, healthDelta: -5, moodDelta: -8 },
  },
  {
    id: 'rent_hike',
    category: 'negative',
    title: '房租上涨 🏠',
    description: '房东通知明年租金上涨，你的月支出增加。',
    effect: { cashDelta: -400, moodDelta: -6, happinessDelta: -3 },
  },
  {
    id: 'burnout',
    category: 'negative',
    title: '工作倦怠 😩',
    description: '长期的压力让你感到精疲力竭。',
    effect: { healthDelta: -8, moodDelta: -12, happinessDelta: -5 },
  },
  {
    id: 'phone_broken',
    category: 'negative',
    title: '手机碎屏 📱',
    description: '手机屏幕碎了，换机花了不少钱。',
    effect: { cashDelta: -500, moodDelta: -4 },
  },
  // ── 黑天鹅事件 ─────────────────────────────────────────────────────────────
  {
    id: 'layoff',
    category: 'blackSwan',
    title: '公司裁员 ⚠️',
    description: '经济下行，你被列入裁员名单。失去工作收入。',
    effect: { isUnemployed: true, moodDelta: -25, happinessDelta: -15, reputationDelta: -10 },
  },
  {
    id: 'serious_illness',
    category: 'blackSwan',
    title: '突发重病 🚨',
    description: '你被确诊患有需要治疗的疾病，大笔医疗费用袭来。',
    effect: { creditCardDebt: 8_000, healthDelta: -20, moodDelta: -20 },
  },
  {
    id: 'market_crash',
    category: 'blackSwan',
    title: '市场崩盘 📉',
    description: '金融市场遭遇剧烈波动，你的投资账户损失惨重。',
    effect: { cashDelta: -1_500, moodDelta: -15, happinessDelta: -8 },
  },
  // ── 意外之财 ─────────────────────────────────────────────────────────────────
  {
    id: 'inheritance',
    category: 'windfall',
    title: '意外遗产 💰',
    description: '远亲离世，你收到了一笔意外的遗产。',
    effect: { cashDelta: 15_000, happinessDelta: 3 },
  },
  {
    id: 'equity_payout',
    category: 'windfall',
    title: '股权兑现 🏆',
    description: '前公司上市，你持有的期权兑现了可观回报。',
    effect: { cashDelta: 8_000, moodDelta: 15, reputationDelta: 8 },
  },
];

// ─── 按经济阶段过滤权重 ────────────────────────────────────────────────────────

type EconomyPhase = 'recovery' | 'boom' | 'recession' | 'freeze';

function weightedPool(
  phase: EconomyPhase,
  isUnemployed: boolean,
): GameEvent[] {
  // 衰退/冰冻阶段增加负面事件权重（通过重复元素实现）
  const negativeBoost: GameEvent[] = phase === 'recession' || phase === 'freeze'
    ? EVENT_POOL.filter(e => e.category === 'negative' || e.category === 'blackSwan')
    : [];

  const positiveBoost: GameEvent[] = phase === 'boom'
    ? EVENT_POOL.filter(e => e.category === 'positive' || e.category === 'windfall')
    : [];

  // 失业中屏蔽 raise 和 bonus（没有工作谈何加薪）
  const filtered = isUnemployed
    ? EVENT_POOL.filter(e => e.id !== 'raise' && e.id !== 'bonus' && e.id !== 'layoff')
    : EVENT_POOL;

  return [...filtered, ...negativeBoost, ...positiveBoost];
}

// ─── 主函数 ───────────────────────────────────────────────────────────────────

/**
 * 生成本回合的 2–4 个随机事件（去重）。
 * @param state 当前游戏状态（用于权重调整）
 * @param rng   随机函数，默认 Math.random（测试时可注入）
 */
export function triggerRandomEvent(
  state: Pick<GameState, 'economy' | 'isUnemployed'>,
  rng: () => number = Math.random,
): GameEvent[] {
  const count = 2 + Math.floor(rng() * 3);           // 2, 3 或 4
  const pool  = weightedPool(state.economy.phase, state.isUnemployed);

  const picked: GameEvent[] = [];
  const usedIds = new Set<string>();

  // 最多尝试 pool.length 次避免死循环
  let attempts = 0;
  while (picked.length < count && attempts < pool.length * 2) {
    const event = pool[Math.floor(rng() * pool.length)];
    if (!usedIds.has(event.id)) {
      picked.push(event);
      usedIds.add(event.id);
    }
    attempts++;
  }

  return picked;
}

// ─── 应用事件效果（纯函数，store 调用） ──────────────────────────────────────

export function applyEventEffect(
  effect: GameEventEffect,
  state: {
    cash: number;
    healthScore: number;
    moodScore: number;
    happinessScore: number;
    reputationScore: number;
    salary: number;
    debts: { creditCardDebt: number; primeLoanDebt: number; studentLoan: number };
    isUnemployed: boolean;
    unemployedRounds: number;
  },
) {
  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  return {
    cash:             state.cash + (effect.cashDelta ?? 0),
    healthScore:      clamp(state.healthScore  + (effect.healthDelta     ?? 0)),
    moodScore:        clamp(state.moodScore    + (effect.moodDelta       ?? 0)),
    happinessScore:   clamp(state.happinessScore + (effect.happinessDelta ?? 0)),
    reputationScore:  clamp(state.reputationScore + (effect.reputationDelta ?? 0)),
    salary:           effect.salaryMultiplier != null
                        ? state.salary * effect.salaryMultiplier
                        : state.salary,
    debts: {
      ...state.debts,
      creditCardDebt: state.debts.creditCardDebt + (effect.creditCardDebt ?? 0),
    },
    isUnemployed:     effect.isUnemployed ?? state.isUnemployed,
    unemployedRounds: effect.isUnemployed
                        ? state.unemployedRounds + 1
                        : state.unemployedRounds,
  };
}

// ─── 工具：阻塞门卫 ────────────────────────────────────────────────────────────

/**
 * 是否允许推进到下一回合。
 * 条件：所有待处理事件已被玩家确认。
 */
export function canAdvanceRound(pendingEvents: GameEvent[]): boolean {
  return pendingEvents.length === 0;
}
