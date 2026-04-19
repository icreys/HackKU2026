import { useEffect, useRef, useState } from 'react';

/**
 * 包裹一个数字：当数字变化时触发 500ms 的 "呼吸" 特效 + 手绘 wiggle。
 */
interface Props {
  value: number;
  format?: (n: number) => string;
  className?: string;
  positiveColor?: boolean; // true 时根据数值正负着色
}

export default function AnimatedNumber({
  value,
  format = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 0 }),
  className = '',
  positiveColor = false,
}: Props) {
  const [pulse, setPulse] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 500);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  const colorClass = positiveColor
    ? value > 0
      ? 'text-positive'
      : value < 0
        ? 'text-negative'
        : ''
    : '';

  return (
    <span
      className={[
        'inline-block tabular-nums',
        pulse ? 'animate-breathe' : 'animate-wiggle',
        colorClass,
        className,
      ].join(' ')}
    >
      {format(value)}
    </span>
  );
}
