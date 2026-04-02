interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export default function Sparkline({ data, width = 80, height = 24, color = '#818cf8' }: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;
  const innerH = height - padding * 2;
  const step = (width - padding * 2) / (data.length - 1);

  const points = data.map((v, i) =>
    `${padding + i * step},${padding + innerH - ((v - min) / range) * innerH}`
  ).join(' ');

  return (
    <svg width={width} height={height} className="inline-block shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
