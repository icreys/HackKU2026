interface Props {
  /** 0 - 100 */
  value: number;
  label: string;
}

/**
 * 健康/心情指示灯：根据数值呈红/黄/绿色点。
 */
export default function StatusDot({ value, label }: Props) {
  let color = '#C62828'; // red
  if (value >= 67) color = '#008F5D';
  else if (value >= 34) color = '#D9A400';

  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block w-3 h-3 rounded-full border-2 border-ink"
        style={{ background: color }}
        title={`${label}: ${value}`}
      />
      <span className="text-xs font-sketch">{label}</span>
      <span className="ml-auto text-xs tabular-nums">{Math.round(value)}</span>
    </div>
  );
}
