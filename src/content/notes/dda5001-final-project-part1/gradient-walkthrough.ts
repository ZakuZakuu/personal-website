const x = 2;
const y = 7;
const w = 1;
const b = 1;
const lr = 0.1;

export const phases = ['zero', 'forward', 'backward', 'step'] as const;
export type Phase = (typeof phases)[number];

export function workedExample(phase: Phase) {
  const product = w * x;
  const prediction = product + b;
  const residual = prediction - y;
  const loss = residual ** 2;
  const predictionGradient = 2 * residual;
  const weightGradient = predictionGradient * x;
  const biasGradient = predictionGradient;
  return {
    product,
    prediction,
    residual,
    loss,
    predictionGradient,
    weightGradient: phase === 'zero' || phase === 'forward' ? null : weightGradient,
    biasGradient: phase === 'zero' || phase === 'forward' ? null : biasGradient,
    w: phase === 'step' ? w - lr * weightGradient : w,
    b: phase === 'step' ? b - lr * biasGradient : b,
  };
}
