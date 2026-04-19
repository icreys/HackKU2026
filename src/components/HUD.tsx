import { useGameStore, selectNetWorth, selectCalendarYear } from '../store/gameStore';
import { getPhaseLabel } from '../engine/EconomyEngine';
import AnimatedNumber from './AnimatedNumber';
import StaminaBar from './StaminaBar';
import StatusDot from './StatusDot';
import type { EconomyPhase } from '../types/game';

const PHASE_DOT: Record<EconomyPhase, string> = {
  recovery:  '#008F5D',
  boom:      '#0072CE',
  recession: '#D9A400',
  freeze:    '#C62828',
};

const REP_BADGE: Record<'good' | 'medium' | 'poor', string> = {
  good:   '★★★',
  medium: '★★☆',
  poor:   '★☆☆',
};

const fmtMoney = (n: number) =>
  (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');

export default function HUD() {
  const state          = useGameStore();
  const netWorth       = useGameStore(selectNetWorth);
  const calendarYear   = useGameStore(selectCalendarYear);
  const age            = 22 + Math.floor(state.gameYearOffset);
  // 实际净资产 = 名义 / (1 + 累计通胀近似)
  const cumulativeInflation = Math.pow(1 + state.economy.inflationRate, state.gameYearOffset);
  const realNetWorth   = netWorth / cumulativeInflation;

  return (
    <aside
      className="w-[200px] shrink-0 h-screen sticky top-0 border-r-2 border-ink/80 p-3 flex flex-col gap-3"
      style={{ background: 'rgba(240, 240, 240, 0.55)', backdropFilter: 'blur(2px)' }}
    >
      {/* 标题 */}
      <h1 className="font-hand text-2xl leading-none tracking-tight">
        Life After Grad
      </h1>
      <div className="h-[2px] bg-ink/80 rounded-full" />

      {/* 回合 / 年份 / 年龄 */}
      <section className="doodle-card p-2">
        <div className="text-xs font-sketch text-ink/70">回合</div>
        <div className="font-hand text-2xl leading-tight">
          <AnimatedNumber value={state.currentRound} /> <span className="text-sm">/ 30</span>
        </div>
        <div className="mt-1 text-xs font-sketch flex justify-between">
          <span>年份 <AnimatedNumber value={calendarYear} format={(n) => String(n)} /></span>
          <span>年龄 <AnimatedNumber value={age} format={(n) => String(n)} /></span>
        </div>
      </section>

      {/* 经济阶段 */}
      <section className="doodle-card p-2">
        <div className="text-xs font-sketch text-ink/70">经济阶段</div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-3 h-3 rounded-full border-2 border-ink"
            style={{ background: PHASE_DOT[state.economy.phase] }}
          />
          <span className="font-hand text-lg leading-none">
            {getPhaseLabel(state.economy.phase)}
          </span>
        </div>
      </section>

      {/* 财务 */}
      <section className="doodle-card p-2 space-y-1">
        <div className="flex justify-between items-baseline text-xs font-sketch">
          <span>标称净资产</span>
          <AnimatedNumber value={netWorth} format={fmtMoney} positiveColor className="font-hand text-base" />
        </div>
        <div className="flex justify-between items-baseline text-xs font-sketch">
          <span>实际净资产</span>
          <AnimatedNumber value={realNetWorth} format={fmtMoney} positiveColor className="font-hand text-base" />
        </div>
        <div className="border-t border-dashed border-ink/30 my-1" />
        <div className="flex justify-between items-baseline text-xs font-sketch">
          <span>现金</span>
          <AnimatedNumber value={state.cash} format={fmtMoney} className="font-hand text-base" />
        </div>
      </section>

      {/* 体力 */}
      <section className="doodle-card p-2">
        <StaminaBar value={state.stamina} />
      </section>

      {/* 健康 / 心情 */}
      <section className="doodle-card p-2 space-y-2">
        <StatusDot value={state.healthScore}    label="健康" />
        <StatusDot value={state.happinessScore} label="心情" />
      </section>

      {/* 声誉勋章 */}
      <section className="doodle-card p-2">
        <div className="text-xs font-sketch text-ink/70">声誉勋章</div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-hand text-xl tracking-widest">
            {REP_BADGE[state.reputation]}
          </span>
          <span className="text-xs tabular-nums">{state.reputationScore}</span>
        </div>
      </section>

      <div className="mt-auto text-[10px] font-sketch text-ink/50 text-center">
        v0.1 · sketch build
      </div>
    </aside>
  );
}
