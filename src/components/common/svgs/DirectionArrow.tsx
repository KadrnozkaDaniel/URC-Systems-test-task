import { memo } from 'react';

export const DirectionArrow = memo(() => {
  return (
    <svg width={34} height={34} viewBox="0 0 34 34">
      <line
        x1={17}
        y1={26}
        x2={17}
        y2={8}
        stroke="#2563eb"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <polygon points="17 4 11 14 23 14" fill="#2563eb" />
    </svg>
  );
});
