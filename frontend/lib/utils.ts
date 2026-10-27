import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Rating text for a provider: the real average only when real reviews exist, otherwise "No ratings yet". */
export function ratingLabel(rating: number | null | undefined, reviewCount: number | null | undefined): string {
  const n = reviewCount ?? 0;
  if (!n || rating === null || rating === undefined) return 'No ratings yet';
  return `${rating.toFixed(1)} (${n} ${n === 1 ? 'rating' : 'ratings'})`;
}

/** Price text: the real amount, or "Price not set" (never a default). */
export function priceLabel(price: number | null | undefined): string {
  return price && price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Price not set';
}
