interface Props {
  /** 0 - 360 */
  value: number;
  max?: number;
}

/**
 * 铅笔涂鸦风格的体力条。
 * 总量 360。随着体力消耗，填充部分缩短并整体变浅（被擦除感）。
 */
export default function StaminaBar({ value, max = 360 }: Props) {
  const pct = Math.max(0, Math.min(1, value / max));
  // 体力越低 → 填充越浅（模拟橡皮擦痕）
  const opacity = 0.35 + pct * 0.65;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs font-sketch tracking-wide">体力</span>
        <span className="text-xs tabular-nums">
          {Math.round(value)} / {max}
        </span>
      </div>

      {/* 手绘外框 */}
      <svg viewBox="0 0 200 22" className="w-full h-5">
        <rect
          x="2" y="2" width="196" height="18" rx="6"
          className="doodle-stroke"
          style={{ strokeDasharray: '4 2' }}
        />
      </svg>

      {/* 填充层 */}
      <div className="relative -mt-[20px] mx-[2px] h-[18px] rounded-md overflow-hidden">
        <div
          className="pencil-fill h-full transition-all duration-500 ease-out"
          style={{ width: `${pct * 100}%`, opacity }}
        />
      </div>
    </div>
  );
}
