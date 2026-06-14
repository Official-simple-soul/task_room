export const taskStepRanges = [
  '10-25',
  '26-50',
  '51-75',
  '76-130',
  '130-200',
] as const;

export const legacyTaskStepRanges = [
  '25-50',
  '50-75',
  '75-100',
  '100-130',
] as const;

export const acceptedTaskStepRanges = [
  ...taskStepRanges,
  ...legacyTaskStepRanges,
] as const;

export const taskRateCents: Record<string, number> = {
  '10-25': 300,
  '25-50': 350,
  '26-50': 350,
  '50-75': 450,
  '51-75': 450,
  '75-100': 600,
  '100-130': 600,
  '76-130': 600,
  '130-200': 900,
};

export const taskPaymentRates = [
  { range: '10-25', price: '$3.00' },
  { range: '26-50', price: '$3.50' },
  { range: '51-75', price: '$4.50' },
  { range: '76-130', price: '$6.00' },
  { range: '130-200', price: '$9.00' },
];

export function taskFeeCents(stepRange: string, fee?: number) {
  if (typeof fee === 'number') return Math.round(fee * 100);
  return taskRateCents[stepRange] ?? 300;
}

export function taskStepRangeForCount(stepCount: number) {
  if (stepCount <= 25) return '10-25';
  if (stepCount <= 50) return '26-50';
  if (stepCount <= 75) return '51-75';
  if (stepCount <= 130) return '76-130';
  return '130-200';
}

export function taskFeeCentsForStepCount(stepCount: number) {
  return taskRateCents[taskStepRangeForCount(stepCount)] ?? 300;
}
