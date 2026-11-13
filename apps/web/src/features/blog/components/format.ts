/** Formats a number as Bangladeshi taka, e.g. ৳1,50,000. */
export const taka = (n: number) => `৳${Math.round(n).toLocaleString('en-IN')}`;

export const pct = (n: number) => `${Math.round(n)}%`;
