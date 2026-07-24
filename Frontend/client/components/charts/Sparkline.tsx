"use client";

export default function Sparkline({
  data,
  width = 120,
  height = 36,
  strokeWidth = 2,
}: {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
}) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} className="opacity-40">
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          strokeDasharray="3 4"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M${points.join(" L")}`;
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={areaPath} fill="var(--primary)" opacity={0.12} />
      <path
        d={linePath}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
