import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts Wei (smallest unit of Ethereum) to ETH
 * @param wei - The amount in Wei as a string or number
 * @returns The amount in ETH as a number
 */
export function weiToEth(wei: string | number): number {
  // 1 ETH = 10^18 Wei
  const weiValue = typeof wei === 'string' ? wei : wei.toString();
  return Number(weiValue) / 1e18;
}
