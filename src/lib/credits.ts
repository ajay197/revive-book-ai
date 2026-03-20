/**
 * Credit calculation utilities.
 * 1 credit = 1 minute of calling.
 * Formula: deductedCredits = durationSeconds / 60
 */

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function secondsToCredits(seconds: number): number {
  return roundToTwo(seconds / 60);
}

export function creditsToMinutes(credits: number): number {
  return roundToTwo(credits * 1);
}

export function formatRemainingTime(credits: number): string {
  const totalMinutes = creditsToMinutes(credits);
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export const CREDIT_PACKS = [
  { name: "1,000 Credits", baseCredits: 1000, bonusCredits: 0, totalCredits: 1000, price: 500, popular: false },
  { name: "2,200 Credits", baseCredits: 2000, bonusCredits: 200, totalCredits: 2200, price: 1000, popular: false, bonusLabel: "+10% bonus" },
  { name: "15,000 Credits", baseCredits: 10000, bonusCredits: 5000, totalCredits: 15000, price: 5000, popular: false, bonusLabel: "+50% bonus" },
] as const;

export const LOW_BALANCE_THRESHOLD = 50;
export const BLOCK_CALLS_THRESHOLD = 5;
