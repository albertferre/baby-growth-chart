/**
 * Pediatric milestones from reliable sources:
 *
 * Motor milestones: WHO Multicentre Growth Reference Study (2006)
 *   "WHO Motor Development Study: Windows of achievement for six gross motor
 *    development milestones" — Acta Paediatrica, 95(S450), 86–95.
 *
 * Well-child visits: AAP Bright Futures / CDC recommended schedule
 *
 * Nutrition milestones: WHO / AAP infant feeding guidelines
 */

// All ages in days for precision, display will convert to months
const DAY = 1;
const MONTH = 30.5;

export const MILESTONE_SOURCES = {
  checkup: {
    name: "AAP Bright Futures",
    url: "https://www.aap.org/en/practice-management/bright-futures/bright-futures-in-clinical-practice/",
  },
  nutrition: {
    name: "WHO Infant Feeding Guidelines",
    url: "https://www.who.int/health-topics/complementary-feeding",
  },
  motor: {
    name: "WHO Motor Development Study (2006)",
    url: "https://www.who.int/publications/i/item/9241594233",
  },
};

export const MILESTONES = [
  // Well-child visits (AAP Bright Futures)
  { ageDays: 3 * DAY, type: "checkup", key: "milestone_checkup_newborn" },
  { ageDays: 1 * MONTH, type: "checkup", key: "milestone_checkup_1m" },
  { ageDays: 2 * MONTH, type: "checkup", key: "milestone_checkup_2m" },
  { ageDays: 4 * MONTH, type: "checkup", key: "milestone_checkup_4m" },
  { ageDays: 6 * MONTH, type: "checkup", key: "milestone_checkup_6m" },
  { ageDays: 9 * MONTH, type: "checkup", key: "milestone_checkup_9m" },
  { ageDays: 12 * MONTH, type: "checkup", key: "milestone_checkup_12m" },
  { ageDays: 15 * MONTH, type: "checkup", key: "milestone_checkup_15m" },
  { ageDays: 18 * MONTH, type: "checkup", key: "milestone_checkup_18m" },
  { ageDays: 24 * MONTH, type: "checkup", key: "milestone_checkup_24m" },
  { ageDays: 30 * MONTH, type: "checkup", key: "milestone_checkup_30m" },
  { ageDays: 36 * MONTH, type: "checkup", key: "milestone_checkup_3y" },

  // Nutrition milestones (WHO/AAP)
  { ageDays: 6 * MONTH, type: "nutrition", key: "milestone_solids_intro" },
  { ageDays: 8 * MONTH, type: "nutrition", key: "milestone_finger_foods" },
  { ageDays: 12 * MONTH, type: "nutrition", key: "milestone_cow_milk" },

  // WHO Motor milestones (median age of achievement)
  { ageDays: 6 * MONTH, type: "motor", key: "milestone_sitting" },
  { ageDays: 8.5 * MONTH, type: "motor", key: "milestone_crawling" },
  { ageDays: 7.6 * MONTH, type: "motor", key: "milestone_standing_help" },
  { ageDays: 9.2 * MONTH, type: "motor", key: "milestone_walking_help" },
  { ageDays: 12.1 * MONTH, type: "motor", key: "milestone_standing_alone" },
  { ageDays: 12.1 * MONTH, type: "motor", key: "milestone_walking_alone" },
];

/**
 * Get upcoming milestones for a baby given their age in days.
 * Returns the next `count` milestones that haven't been reached yet.
 */
export function getUpcomingMilestones(ageDays, count = 3) {
  if (ageDays == null || ageDays < 0) return [];

  return MILESTONES
    .filter((m) => m.ageDays > ageDays)
    .sort((a, b) => a.ageDays - b.ageDays)
    .slice(0, count);
}

/**
 * Format milestone age for display (e.g. "6 months", "2 years")
 */
export function formatMilestoneAge(ageDays) {
  const months = Math.round(ageDays / 30.5);
  if (months >= 24) {
    const years = Math.floor(months / 12);
    return `${years}y`;
  }
  return `${months}m`;
}

/**
 * Get icon name for milestone type
 */
export function getMilestoneIcon(type) {
  switch (type) {
    case "checkup": return "stethoscope";
    case "nutrition": return "restaurant";
    case "motor": return "directions_walk";
    default: return "event";
  }
}
