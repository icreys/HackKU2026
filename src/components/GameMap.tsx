import Building from './Building';

/**
 * 主地图：5 个手绘建筑可交互图标。
 * 公司 / 学校 / 投资 / 社交 / 医疗
 */
export default function GameMap() {
  return (
    <div className="relative w-full h-screen p-6">
      {/* 标题 */}
      <header className="mb-4">
        <h2 className="font-hand text-3xl">小镇地图</h2>
        <p className="font-sketch text-sm text-ink/60">
          点击建筑物开始你的回合行动
        </p>
      </header>

      {/* 手绘地形：弯曲的小路 */}
      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 m-auto w-[min(95%,900px)] h-[min(80vh,600px)] pointer-events-none opacity-70"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M 80 420 Q 200 380 280 320 T 500 220 T 720 120"
          className="doodle-stroke"
          style={{ strokeDasharray: '6 6' }}
        />
        <path
          d="M 80 420 Q 200 460 360 440 T 720 380"
          className="doodle-stroke"
          style={{ strokeDasharray: '6 6' }}
        />
      </svg>

      {/* 建筑布局 */}
      <div className="relative grid grid-cols-3 gap-6 max-w-[900px] mx-auto mt-8">
        <Building kind="company"   label="公司" />
        <Building kind="school"    label="学校" />
        <Building kind="invest"    label="投资" />
        <Building kind="social"    label="社交" />
        <Building kind="medical"   label="医疗" />
        <div /> {/* spacer */}
      </div>
    </div>
  );
}
