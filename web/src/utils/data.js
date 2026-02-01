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
