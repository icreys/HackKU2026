import { useEffect, useRef, useState } from 'react';
import { useGameStore, selectNetWorth } from '../store/gameStore';
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
  const state    = useGameStore();
  const netWorth = useGameStore(selectNetWorth);
  const { currentYear, playerAge } = state;

  const cumulativeInflation = Math.pow(1 + state.economy.inflationRate, state.gameYearOffset);
  const realNetWorth        = netWorth / cumulativeInflation;

  // ── 生活费 Toast（lastLivingExpenseDeducted 变化时短暂显示） ─────────────────
  const [showToast, setShowToast] = useState(false);
  const prevRound = useRef(state.currentRound);

  useEffect(() => {
    if (state.currentRound !== prevRound.current && state.lastLivingExpenseDeducted > 0) {
      prevRound.current = state.currentRound;
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 3_000);
      return () => clearTimeout(t);
    }
  }, [state.currentRound, state.lastLivingExpenseDeducted]);

  const { creditCardDebt, primeLoanDebt, studentLoan } = state.debts;

  return (
    <aside
      className="w-[220px] shrink-0 h-screen sticky top-0 border-r-2 border-ink/80 p-3 flex flex-col gap-3 overflow-y-auto"
      style={{ background: 'rgba(240, 240, 240, 0.55)', backdropFilter: 'blur(2px)' }}
    >
      {/* 标题 */}
      <h1 className="font-hand text-2xl leading-none tracking-tight">Life After Grad</h1>
      <div className="h-[2px] bg-ink/80 rounded-full" />

      {/* 回合 / 年份 / 年龄 */}
      <section className="doodle-card p-2">
        <div className="text-xs font-sketch text-ink/70">回合</div>
        <div className="font-hand text-2xl leading-tight">
          <AnimatedNumber value={state.currentRound} /> <span className="text-sm">/ 30</span>
        </div>
        <div className="mt-1 text-xs font-sketch flex justify-between">
          <span>年份 <AnimatedNumber value={currentYear} /></span>
          <span>年龄 <AnimatedNumber value={playerAge} /></span>
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
          <span className="font-hand text-lg leading-none">{getPhaseLabel(state.economy.phase)}</span>
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

      {/* 负债（双行，信用卡警示红） */}
      {(creditCardDebt > 0 || primeLoanDebt > 0 || studentLoan > 0) && (
        <section className="doodle-card p-2 space-y-1">
          <div className="text-xs font-sketch text-ink/70">负债明细</div>
          {studentLoan > 0 && (
            <div className="flex justify-between items-baseline text-xs font-sketch">
              <span>学生贷款 5.5%</span>
              <span className="font-hand tabular-nums text-amber-700">
                -{fmtMoney(studentLoan).replace('$', '')}
              </span>
            </div>
          )}
          {primeLoanDebt > 0 && (
            <div className="flex justify-between items-baseline text-xs font-sketch">
              <span>优惠贷款 6%</span>
              <AnimatedNumber
                value={primeLoanDebt}
                format={(n) => `-$${Math.round(n).toLocaleString('en-US')}`}
                className="font-hand text-amber-600"
              />
            </div>
          )}
          {creditCardDebt > 0 && (
            <div className="flex justify-between items-baseline text-xs font-sketch">
              <span className="font-semibold">信用卡 22% ⚠️</span>
              <AnimatedNumber
                value={creditCardDebt}
                format={(n) => `-$${Math.round(n).toLocaleString('en-US')}`}
                className="font-hand text-red-600 font-bold"
              />
            </div>
          )}
        </section>
      )}

      {/* 体力 */}
      <section className="doodle-card p-2">
        <StaminaBar value={state.stamina} max={state.maxStamina} />
        {state.maxStamina < 360 && (
          <div className="text-[10px] font-sketch text-red-500 mt-1">
            ⚠️ 体力上限已永久降至 {state.maxStamina}
          </div>
        )}
      </section>

      {/* 健康 / 心情 */}
      <section className="doodle-card p-2 space-y-2">
        <StatusDot value={state.healthScore}    label="健康" />
        <StatusDot value={state.moodScore}      label="心情" />
        <StatusDot value={state.happinessScore} label="幸福" />
      </section>

      {/* 声誉 */}
      <section className="doodle-card p-2">
        <div className="text-xs font-sketch text-ink/70">声誉勋章</div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-hand text-xl tracking-widest">{REP_BADGE[state.reputation]}</span>
          <span className="text-xs tabular-nums">{state.reputationScore}</span>
        </div>
      </section>

      <div className="mt-auto text-[10px] font-sketch text-ink/50 text-center">v0.1 · sketch build</div>

      {/* 生活费扣除 Toast */}
      {showToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-paper font-sketch text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50 animate-breathe"
        >
          📋 自动扣除本年生活费 -{fmtMoney(state.lastLivingExpenseDeducted)}
        </div>
      )}
    </aside>
  );
}
