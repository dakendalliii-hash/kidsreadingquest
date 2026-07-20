"use client";

export default function MetricsChart({
  wpm,
  accuracy,
  errors,
}: {
  wpm: number;
  accuracy: number;
  errors: number;
}) {
  const maxValue = Math.max(wpm, accuracy, errors, 1);

  const barData = [
    { label: "WPM", value: wpm, color: "#4CAF50" },
    { label: "Accuracy", value: accuracy, color: "#2196F3" },
    { label: "Errors", value: errors, color: "#F44336" },
  ];

  return (
    <div style={{ marginTop: "30px" }}>
      <svg width="100%" height="200">
        {barData.map((bar, index) => {
          const barHeight = (bar.value / maxValue) * 150;

          return (
            <g key={index} transform={`translate(${index * 120 + 40}, 0)`}>
              <rect
                x="0"
                y={180 - barHeight}
                width="60"
                height={barHeight}
                fill={bar.color}
                rx="6"
              />
              <text
                x="30"
                y="195"
                textAnchor="middle"
                fontSize="14"
                fill="#333"
              >
                {bar.label}
              </text>
              <text
                x="30"
                y={180 - barHeight - 10}
                textAnchor="middle"
                fontSize="14"
                fill="#000"
                fontWeight="bold"
              >
                {bar.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
