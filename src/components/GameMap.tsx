import { useGameStore } from '../store/gameStore';
import Building from './Building';

/**
 * 主地图：5 个手绘建筑可交互图标。
 * 公司 / 学校 / 投资 / 社交 / 医疗
 *
 * 医疗建筑根据 thisRoundMedical 自动 disabled。
 * 投资卖出滑块 max 须从 selectHoldingAmount 读取（不得绑 cash）。
 */
export default function GameMap() {
  const { thisRoundMedical, actionsRemaining } = useGameStore();
  const noActions = actionsRemaining <= 0;

  // 健身房 / 体检各自的禁用状态
  const gymDone     = thisRoundMedical.gym;
  const checkupDone = thisRoundMedical.checkup;
  // 医疗建筑：两项均完成才整体禁用（玩家仍可进入选另一项）
  const medicalFullyDone = gymDone && checkupDone;

  return (
    <div className="relative w-full h-screen p-6">
      <header className="mb-4">
        <h2 className="font-hand text-3xl">小镇地图</h2>
        <p className="font-sketch text-sm text-ink/60">
          点击建筑物开始你的回合行动
          {noActions && <span className="ml-2 text-red-500 font-semibold">（行动已用尽）</span>}
        </p>
      </header>

      {/* 手绘小路 */}
      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 m-auto w-[min(95%,900px)] h-[min(80vh,600px)] pointer-events-none opacity-70"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d="M 80 420 Q 200 380 280 320 T 500 220 T 720 120" className="doodle-stroke" style={{ strokeDasharray: '6 6' }} />
        <path d="M 80 420 Q 200 460 360 440 T 720 380"            className="doodle-stroke" style={{ strokeDasharray: '6 6' }} />
      </svg>

      {/* 建筑布局 */}
      <div className="relative grid grid-cols-3 gap-6 max-w-[900px] mx-auto mt-8">
        <Building
          kind="company"
          label="公司"
          disabled={noActions}
          disabledText="行动已用尽"
        />
        <Building
          kind="school"
          label="学校"
          disabled={noActions}
          disabledText="行动已用尽"
        />
        <Building
          kind="invest"
          label="投资"
          disabled={noActions}
          disabledText="行动已用尽"
        />
        <Building
          kind="social"
          label="社交"
          disabled={noActions}
          disabledText="行动已用尽"
        />
        <Building
          kind="medical"
          label="医疗"
          disabled={noActions || medicalFullyDone}
          disabledText={
            medicalFullyDone
              ? '本年已锻炼 & 体检'
              : gymDone
                ? '本年已锻炼'
                : checkupDone
                  ? '本年已体检'
                  : undefined
          }
        />
        <div />
      </div>

      {/* 医疗子选项提示（仅部分完成时显示） */}
      {(gymDone || checkupDone) && !medicalFullyDone && (
        <div className="fixed bottom-4 right-4 bg-amber-50 border-2 border-amber-400 rounded-xl px-4 py-2 font-sketch text-xs text-amber-800 shadow">
          {gymDone    && <div>✅ 本年已锻炼（健身房）</div>}
          {checkupDone && <div>✅ 本年已体检（全面体检）</div>}
        </div>
      )}
    </div>
  );
}
