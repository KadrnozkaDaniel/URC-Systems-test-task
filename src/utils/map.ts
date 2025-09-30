export const intersectWithRect = (
  centerX: number,
  centerY: number,
  targetX: number,
  targetY: number,
  viewportWidth: number,
  viewportHeight: number,
) => {
  const margin = 50;
  const rightEdgeX = viewportWidth - margin;
  const bottomEdgeY = viewportHeight - margin;

  const deltaX = targetX - centerX;
  const deltaY = targetY - centerY;

  const candidates: { x: number; y: number; t: number }[] = [];

  if (deltaX !== 0) {
    const tLeft = (margin - centerX) / deltaX;
    const yAtLeft = centerY + tLeft * deltaY;
    if (tLeft > 0 && yAtLeft >= margin && yAtLeft <= bottomEdgeY) {
      candidates.push({ x: margin, y: yAtLeft, t: tLeft });
    }

    const tRight = (rightEdgeX - centerX) / deltaX;
    const yAtRight = centerY + tRight * deltaY;
    if (tRight > 0 && yAtRight >= margin && yAtRight <= bottomEdgeY) {
      candidates.push({ x: rightEdgeX, y: yAtRight, t: tRight });
    }
  }

  if (deltaY !== 0) {
    const tTop = (margin - centerY) / deltaY;
    const xAtTop = centerX + tTop * deltaX;
    if (tTop > 0 && xAtTop >= margin && xAtTop <= rightEdgeX) {
      candidates.push({ x: xAtTop, y: margin, t: tTop });
    }

    const tBottom = (bottomEdgeY - centerY) / deltaY;
    const xAtBottom = centerX + tBottom * deltaX;
    if (tBottom > 0 && xAtBottom >= margin && xAtBottom <= rightEdgeX) {
      candidates.push({ x: xAtBottom, y: bottomEdgeY, t: tBottom });
    }
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => a.t - b.t);

  return { x: candidates[0].x, y: candidates[0].y };
};
