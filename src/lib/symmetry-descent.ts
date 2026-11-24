export type Point = [number, number];

export function symmetryLoss([x, y]: Point): number {
  return (x + y - 1) ** 2 + (x * y) ** 2;
}

export function descent(initial: Point, rate: number, steps: number): Point[] {
  let [x, y] = initial;
  const points: Point[] = [[x, y]];
  for (let step = 0; step < steps; step++) {
    const gx = 2 * (x + y - 1) + 2 * x * y ** 2;
    const gy = 2 * (x + y - 1) + 2 * y * x ** 2;
    x -= rate * gx;
    y -= rate * gy;
    points.push([x, y]);
  }
  return points;
}

export function plotX(x: number): number {
  return 48 + 240 * x;
}

export function plotY(y: number): number {
  return 258 - 240 * y;
}

export function descentPath(points: Point[]): string {
  return points
    .map(([x, y], index) => {
      return (index === 0 ? 'M' : 'L') + plotX(x) + ' ' + plotY(y);
    })
    .join(' ');
}

export function resultText(point: Point): string {
  return (
    'x = ' +
    point[0].toFixed(4) +
    '，y = ' +
    point[1].toFixed(4) +
    '，Loss = ' +
    symmetryLoss(point).toFixed(6)
  );
}
