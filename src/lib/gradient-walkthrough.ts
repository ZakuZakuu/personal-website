export type Stage = 'zero' | 'forward' | 'backward' | 'step' | 'done';
export interface ExampleState { next: Stage; message: string; }
const x = 2, y = 7, w = 1, b = 1, lr = 0.1;
export function initialExample(): ExampleState {
  return { next: 'zero', message: '初始：w = 1，b = 1；梯度尚未计算。' };
}
export function advanceExample(state: ExampleState): ExampleState {
  const prediction = w * x + b;
  const loss = (prediction - y) ** 2;
  const gradW = 2 * (prediction - y) * x;
  const gradB = 2 * (prediction - y);
  switch (state.next) {
    case 'zero': return { next: 'forward', message: 'zero_grad()：w.grad 和 b.grad 已重置；w = 1，b = 1。' };
    case 'forward': return { next: 'backward', message: `前向：预测 = ${prediction}，loss = ${loss}；参数未改变。` };
    case 'backward': return { next: 'step', message: `backward()：w.grad = ${gradW}，b.grad = ${gradB}；参数未改变。` };
    case 'step': return { next: 'done', message: `step()：w = ${w - lr * gradW}，b = ${b - lr * gradB}；梯度仍保留。` };
    case 'done': return state;
  }
}
