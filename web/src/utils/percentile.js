/**
 * Normal CDF approximation using Abramowitz & Stegun formula 26.2.17.
 * Max error ~7.5e-8.
 */
export function normalCDF(x) {
  if (x === 0) return 0.5;

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * z);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Calculate percentile using the LMS method.
 * @param {number} value - The measurement value (weight, height, etc.)
 * @param {object} dayData - Object with L, M, S for the given day
 * @returns {number} Percentile (0-100)
 */
export function getPercentile(value, dayData) {
  const { L, M, S } = dayData;
  const zScore = (Math.pow(value / M, L) - 1) / (L * S);
  return normalCDF(zScore) * 100;
}
