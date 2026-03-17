const STORAGE_KEY = "baby-growth-profiles";

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Ignore storage errors
  }
}

export function getProfiles() {
  return loadProfiles();
}

export function createProfile(name, gender) {
  const profiles = loadProfiles();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const profile = { id, name, gender, measurements: [], createdAt: Date.now() };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function deleteProfile(id) {
  const profiles = loadProfiles().filter((p) => p.id !== id);
  saveProfiles(profiles);
}

export function updateProfileName(id, name) {
  const profiles = loadProfiles();
  const p = profiles.find((p) => p.id === id);
  if (p) {
    p.name = name;
    saveProfiles(profiles);
  }
}

export function addMeasurement(profileId, { days, weight, height, hc, date }) {
  const profiles = loadProfiles();
  const p = profiles.find((p) => p.id === profileId);
  if (!p) return null;

  const entry = {
    id: Date.now().toString(36),
    days,
    weight: weight || null,
    height: height || null,
    hc: hc || null,
    date: date || new Date().toISOString().split("T")[0],
    createdAt: Date.now(),
  };
  p.measurements.push(entry);
  p.measurements.sort((a, b) => a.days - b.days);
  saveProfiles(profiles);
  return entry;
}

export function updateMeasurement(profileId, measurementId, updates) {
  const profiles = loadProfiles();
  const p = profiles.find((p) => p.id === profileId);
  if (!p) return;
  const m = p.measurements.find((m) => m.id === measurementId);
  if (m) {
    Object.assign(m, updates);
    p.measurements.sort((a, b) => a.days - b.days);
    saveProfiles(profiles);
  }
}

export function deleteMeasurement(profileId, measurementId) {
  const profiles = loadProfiles();
  const p = profiles.find((p) => p.id === profileId);
  if (p) {
    p.measurements = p.measurements.filter((m) => m.id !== measurementId);
    saveProfiles(profiles);
  }
}

export function getProfile(id) {
  return loadProfiles().find((p) => p.id === id) || null;
}

export function getActiveProfileId() {
  try {
    return localStorage.getItem("baby-growth-active-profile") || null;
  } catch {
    return null;
  }
}

export function setActiveProfileId(id) {
  try {
    localStorage.setItem("baby-growth-active-profile", id || "");
  } catch {
    // Ignore
  }
}
