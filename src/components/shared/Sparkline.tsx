interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  stroke = "currentColor",
  fill,
  strokeWidth = 1.5,
}: SparklineProps) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / Math.max(1, data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const areaPath = fill
    ? `${path} L ${width} ${height} L 0 ${height} Z`
    : null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible", maxWidth: "100%" }}
      aria-hidden
    >
      {areaPath && <path d={areaPath} fill={fill} stroke="none" />}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function MiniBars({
  data,
  width = 100,
  height = 24,
  gap = 2,
  fill = "currentColor",
}: {
  data: number[];
  width?: number;
  height?: number;
  gap?: number;
  fill?: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data) || 1;
  const barW = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
      aria-hidden
    >
      {data.map((v, i) => {
        const h = (v / max) * height;
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={height - h}
            width={barW}
            height={h}
            fill={fill}
            rx={1}
          />
        );
      })}
    </svg>
  );
}
