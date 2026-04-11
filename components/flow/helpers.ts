export function vL(x: number, y1: number, y2: number) {
  return `M${x},${y1}L${x},${y2}`;
}

export function elbow(x1: number, y1: number, x2: number, y2: number) {
  const my = y1 + (y2 - y1) * 0.5;
  return `M${x1},${y1}L${x1},${my}L${x2},${my}L${x2},${y2}`;
}
