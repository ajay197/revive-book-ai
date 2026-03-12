/**
 * Credit calculation utilities.
 * 1 credit = 2.5 minutes of calling.
 * Formula: deductedCredits = durationSeconds / 150
 */

export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function secondsToCredits(seconds: number): number {
  return roundToTwo(seconds / 150);
}

export function creditsToMinutes(credits: number): number {
  return roundToTwo(credits * 2.5);
}

export function formatRemainingTime(credits: number): string {
  const totalMinutes = creditsToMinutes(credits);
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export const CREDIT_PACKS = [
  { name: "500 Credits", baseCredits: 500, bonusCredits: 0, totalCredits: 500, popular: false },
  { name: "2,000 Credits", baseCredits: 2000, bonusCredits: 100, totalCredits: 2100, popular: true, bonusLabel: "+5% bonus" },
  { name: "5,000 Credits", baseCredits: 5000, bonusCredits: 500, totalCredits: 5500, popular: false, bonusLabel: "+10% bonus" },
] as const;

export const LOW_BALANCE_THRESHOLD = 50;
export const BLOCK_CALLS_THRESHOLD = 5;
