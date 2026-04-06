export const MEASURES_CODES = {
  Weight: "wfa",
  Height: "lhfa",
  "Head Circumference": "hcfa",
};

export const MEASURES_UNITS = {
  Weight: "kg.",
  Height: "cm.",
  "Head Circumference": "cm.",
};

export const MEASURES_INPUT = {
  Weight: "w",
  Height: "h",
  "Head Circumference": "hc",
};

/**
 * Format age in days to a human-readable string.
 * < 30 days: "15d", < 24 months: "3.2m", >= 24 months: "2.1 años"
 * Pass yearLabel to customize (e.g. "years", "anys")
 */
export function formatAgeDays(days, yearLabel = "años") {
  if (days < 30) return `${days}d`;
  const months = days / 30.5;
  if (months < 24) return `${months.toFixed(1)}m`;
  const years = months / 12;
  return `${years.toFixed(1)} ${yearLabel}`;
}

const cache = {};

export async function loadData(gender, measure) {
  const code = MEASURES_CODES[measure];
  const key = `${code}-${gender.toLowerCase()}`;

  if (cache[key]) return cache[key];

  const res = await fetch(`${import.meta.env.BASE_URL}data/${key}.json`);
  const data = await res.json();
  cache[key] = data;
  return data;
}
