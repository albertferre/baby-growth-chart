import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getPercentile } from "../utils/percentile";
import { MEASURES_UNITS, formatAgeDays } from "../utils/data";
import { useLanguage } from "../i18n/LanguageContext";
import { addMeasurement, getProfile, deleteMeasurement, updateMeasurement, updateProfileBirthDate } from "../utils/babyStore";
import { getUpcomingMilestones, formatMilestoneAge, getMilestoneIcon, MILESTONE_SOURCES } from "../utils/milestones";
import SEOHead from "../components/SEOHead";

const STORAGE_KEY_BIRTHDATE = "baby-growth-birthdate";
const STORAGE_KEY_VALUES = "baby-growth-last-values";

function getSavedBirthDate() {
  try { return localStorage.getItem(STORAGE_KEY_BIRTHDATE) || ""; }
  catch { return ""; }
}

function getZone(p) {
  if (p < 3) return "veryLow";
  if (p < 15) return "low";
  if (p <= 85) return "normal";
  if (p <= 97) return "high";
  return "veryHigh";
}

function getZoneColor(zone) {
  switch (zone) {
    case "veryLow": return "#b31b25";
    case "low": return "#b31b25";
    case "normal": return "#005da7";
    case "high": return "#6a5b00";
    case "veryHigh": return "#b31b25";
    default: return "#747779";
  }
}

function getStatusType(zone) {
  return zone === "normal" ? "normal" : "error";
}

function getStatusLabel(zone, t) {
  const labels = {
    veryLow: t("interpZoneVeryLow"),
    low: t("interpZoneLow"),
    normal: t("interpZoneNormal"),
    high: t("interpZoneHigh"),
    veryHigh: t("interpZoneVeryHigh"),
  };
  return labels[zone] || "";
}

function getStatusIcon(zone) {
  return zone === "normal" ? "check_circle" : "warning";
}

function getMeasureIcon(measure) {
  if (measure === "Weight") return "monitor_weight";
  if (measure === "Height") return "straighten";
  return "face";
}

function getMeasureForAgeLabel(measure, t) {
  if (measure === "Weight") return t("measureWeight") + "-for-age";
  if (measure === "Height") return t("measureHeight") + "-for-age";
  return t("measureHeadCircumference");
}

function WarningIcon() {
  return (
    <svg className="warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function getSavedValues() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VALUES);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function BirthDateInput({ value, onChange }) {
  // Display as DD/MM/YYYY, store as YYYY-MM-DD
  function toDisplay(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  const [text, setText] = useState(toDisplay(value));

  useEffect(() => {
    setText(toDisplay(value));
  }, [value]);

  function handleChange(e) {
    let raw = e.target.value.replace(/[^\d]/g, "").slice(0, 8);
    // Auto-insert slashes
    let formatted = raw;
    if (raw.length > 4) formatted = raw.slice(0, 2) + "/" + raw.slice(2, 4) + "/" + raw.slice(4);
    else if (raw.length > 2) formatted = raw.slice(0, 2) + "/" + raw.slice(2);
    setText(formatted);

    // Emit valid date
    if (raw.length === 8) {
      const dd = raw.slice(0, 2);
      const mm = raw.slice(2, 4);
      const yyyy = raw.slice(4, 8);
      const d = parseInt(dd, 10), m = parseInt(mm, 10), y = parseInt(yyyy, 10);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1900) {
        const date = new Date(y, m - 1, d);
        if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d && date <= new Date()) {
          onChange(`${yyyy}-${mm}-${dd}`);
        }
      }
    }
  }

  const dateRef = useRef(null);

  function handleDatePicker(e) {
    const iso = e.target.value;
    if (iso) {
      onChange(iso);
      setText(toDisplay(iso));
    }
  }

  return (
    <div className="date-input-wrapper">
      <input
        className="form-input"
        type="text"
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        value={text}
        onChange={handleChange}
        aria-label="Birth date"
      />
      <input
        ref={dateRef}
        type="date"
        className="date-input-hidden"
        value={value || ""}
        max={new Date().toISOString().split("T")[0]}
        onChange={handleDatePicker}
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        className="date-picker-btn"
        onClick={() => dateRef.current?.showPicker()}
        aria-label="Open calendar"
      >
        📅
      </button>
    </div>
  );
}

export default function Calculator({ allData, gender, onGenderChange, activeProfileId, onProfileUpdated, onRequestCreateProfile }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [ageInputMode, setAgeInputMode] = useState("birthdate");
  const [birthDate, setBirthDate] = useState(getSavedBirthDate);
  const [ageInDays, setAgeInDays] = useState(() => getSavedValues().ageInDays || "");
  const [ageInMonths, setAgeInMonths] = useState(() => getSavedValues().ageInMonths || "");
  const [weightValue, setWeightValue] = useState(() => getSavedValues().weight || "");
  const [heightValue, setHeightValue] = useState(() => getSavedValues().height || "");
  const [hcValue, setHcValue] = useState(() => getSavedValues().hc || "");
  const [results, setResults] = useState(null);
  const [warning, setWarning] = useState("");
  const [savedMessage, setSavedMessage] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveDate, setSaveDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [shareConfirm, setShareConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);
  const [editValues, setEditValues] = useState({});
  const resultRef = useRef(null);

  const profile = activeProfileId ? getProfile(activeProfileId) : null;

  // Sync birthDate from profile when switching profiles
  useEffect(() => {
    if (profile && profile.birthDate) {
      setBirthDate(profile.birthDate);
    }
  }, [activeProfileId]);

  const calcAlerts = useMemo(() => {
    if (!profile?.measurements?.length || !results || !allData) return [];
    const lastM = profile.measurements[profile.measurements.length - 1];
    const alerts = [];
    const pairs = [
      { key: "Weight", field: "weight" },
      { key: "Height", field: "height" },
      { key: "Head Circumference", field: "hc" },
    ];
    for (const p of pairs) {
      const r = results.find((r) => r && r.measure === p.key);
      if (!r || !lastM[p.field] || !allData[p.key]) continue;
      const lastDayData = allData[p.key][lastM.days];
      if (!lastDayData) continue;
      const lastPerc = getPercentile(lastM[p.field], lastDayData);
      const diff = parseFloat(r.percentile) - lastPerc;
      if (Math.abs(diff) >= 15) {
        alerts.push({ type: diff < 0 ? "drop" : "rise", key: p.key, prev: lastPerc.toFixed(0), current: parseFloat(r.percentile).toFixed(0) });
      }
    }
    return alerts;
  }, [profile, results, allData]);

  const historyWithPercentiles = useMemo(() => {
    if (!profile?.measurements || !allData) return [];
    return profile.measurements.map((m) => {
      const percs = [];
      if (m.days < (allData.Weight?.length || 0)) {
        if (m.weight) percs.push("W:" + getPercentile(m.weight, allData.Weight[m.days]).toFixed(0));
        if (m.height) percs.push("H:" + getPercentile(m.height, allData.Height[m.days]).toFixed(0));
        if (m.hc) percs.push("HC:" + getPercentile(m.hc, allData["Head Circumference"][m.days]).toFixed(0));
      }
      return { ...m, percText: percs.join(" ") };
    });
  }, [profile, allData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VALUES, JSON.stringify({
        weight: weightValue, height: heightValue, hc: hcValue,
        ageInDays, ageInMonths,
      }));
    } catch { /* ignore */ }
  }, [weightValue, heightValue, hcValue, ageInDays, ageInMonths]);

  const exportResult = async () => {
    if (!results || !resultRef.current) return;
    const activeResults = results.filter(r => r !== null);
    if (activeResults.length === 0) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const scale = 2;
    const cardHeight = 80;
    const totalHeight = 180 + activeResults.length * cardHeight;
    canvas.width = 400 * scale;
    canvas.height = totalHeight * scale;
    ctx.scale(scale, scale);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, totalHeight);

    ctx.fillStyle = "#005da7";
    ctx.fillRect(0, 0, 400, 50);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Baby Growth Chart", 20, 32);

    const p = activeProfileId ? getProfile(activeProfileId) : null;
    if (p) {
      ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(p.name, 380, 32);
      ctx.textAlign = "left";
    }

    const firstResult = activeResults[0];
    ctx.fillStyle = "#2c2f31";
    ctx.font = "12px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`${t("calcResultAge")}: ${firstResult.months} ${t("calcResultMonths")} (${firstResult.days} ${t("calcResultDays")})`, 20, 75);

    let y = 100;
    for (const r of activeResults) {
      const zone = getZone(parseFloat(r.percentile));
      const color = getZoneColor(zone);
      const label = r.measure === "Weight" ? t("measureWeight") : r.measure === "Height" ? t("measureHeight") : t("measureHeadCircumference");

      ctx.fillStyle = "#595c5e";
      ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, 20, y + 15);

      ctx.fillStyle = color;
      ctx.font = "bold 28px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${r.percentile}%`, 380, y + 18);

      ctx.fillStyle = "#eef1f3";
      ctx.fillRect(20, y + 35, 360, 8);
      ctx.fillStyle = zone === "normal" ? "#64a8fe" : "#fb5151";
      ctx.fillRect(20, y + 35, 360 * (parseFloat(r.percentile) / 100), 8);

      y += cardHeight;
    }

    ctx.fillStyle = "#747779";
    ctx.font = "10px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("WHO Child Growth Standards", 200, totalHeight - 15);

    const link = document.createElement("a");
    link.download = `baby-growth-percentiles.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  useEffect(() => {
    if (birthDate) {
      try { localStorage.setItem(STORAGE_KEY_BIRTHDATE, birthDate); }
      catch { /* Ignore */ }
      // Save to active profile
      if (activeProfileId) {
        updateProfileBirthDate(activeProfileId, birthDate);
      }
    }
  }, [birthDate, activeProfileId]);

  function calculateDaysFromInput() {
    if (ageInputMode === "birthdate") {
      if (!birthDate) return null;
      const birth = new Date(birthDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birth > today) return -1;
      return Math.floor((today - birth) / (1000 * 60 * 60 * 24));
    } else if (ageInputMode === "days") {
      const d = parseInt(ageInDays, 10);
      return isNaN(d) ? null : d;
    } else if (ageInputMode === "months") {
      const m = parseFloat(ageInMonths);
      return isNaN(m) ? null : Math.round(m * 30.5);
    }
    return null;
  }

  function handleCalculate(e) {
    e.preventDefault();
    setResults(null);
    setWarning("");
    setSavedMessage("");

    const days = calculateDaysFromInput();

    if (days === null) {
      if (ageInputMode === "birthdate") setWarning(t("calcWarnSelectDate"));
      else if (ageInputMode === "days") setWarning(t("calcWarnEnterDays"));
      else setWarning(t("calcWarnEnterMonths"));
      return;
    }

    if (days < 0) { setWarning(t("calcWarnFutureDate")); return; }

    const wVal = parseFloat(weightValue);
    const hVal = parseFloat(heightValue);
    const hcVal = parseFloat(hcValue);
    const hasWeight = weightValue && wVal > 0;
    const hasHeight = heightValue && hVal > 0;
    const hasHc = hcValue && hcVal > 0;

    if (!hasWeight && !hasHeight && !hasHc) { setWarning(t("calcWarnAtLeastOne")); return; }
    if (!allData) return;

    const newResults = [];
    const measures = [
      { key: "Weight", value: wVal, has: hasWeight },
      { key: "Height", value: hVal, has: hasHeight },
      { key: "Head Circumference", value: hcVal, has: hasHc },
    ];

    for (const m of measures) {
      if (!m.has) { newResults.push(null); continue; }
      const data = allData[m.key];
      if (days >= data.length) { setWarning(t("calcWarnAgeExceeds")); return; }
      const dayData = data[days];
      const percentile = getPercentile(m.value, dayData);
      const months = (days / 30.5).toFixed(1);
      newResults.push({ measure: m.key, days, months, percentile: percentile.toFixed(1) });
    }

    setResults(newResults);
    setTimeout(() => {
      if (window.innerWidth < 768) {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }

  function handleOpenSaveDialog() {
    setSaveDate(new Date().toISOString().split("T")[0]);
    setShowSaveDialog(true);
  }

  function handleConfirmSave() {
    if (!activeProfileId || !results) return;
    const days = calculateDaysFromInput();
    const wVal = parseFloat(weightValue);
    const hVal = parseFloat(heightValue);
    const hcVal = parseFloat(hcValue);

    addMeasurement(activeProfileId, {
      days,
      weight: weightValue && wVal > 0 ? wVal : null,
      height: heightValue && hVal > 0 ? hVal : null,
      hc: hcValue && hcVal > 0 ? hcVal : null,
      date: saveDate,
    });

    setShowSaveDialog(false);
    setSavedMessage(true);
    if (onProfileUpdated) onProfileUpdated();
    setTimeout(() => setSavedMessage(false), 5000);
  }

  async function handleShare() {
    if (!results) return;
    const activeResults = results.filter((r) => r !== null);
    if (activeResults.length === 0) return;

    const profileName = profile ? profile.name : "";
    const lines = activeResults.map((r) => {
      const label = r.measure === "Weight" ? t("measureWeight") : r.measure === "Height" ? t("measureHeight") : t("measureHeadCircumference");
      return `${label}: P${r.percentile}`;
    });
    const age = `${activeResults[0].months} ${t("calcResultMonths")}`;
    const text = [profileName ? `${profileName} - ${age}` : age, ...lines, "", "Baby Growth Chart - WHO Standards"].join("\n");

    if (navigator.share) {
      try { await navigator.share({ title: "Baby Growth Chart", text }); return; }
      catch { /* cancelled */ }
    }
    try { await navigator.clipboard.writeText(text); }
    catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setShareConfirm(true);
    setTimeout(() => setShareConfirm(false), 2000);
  }

  function handleDeleteMeasurement(mId) {
    if (!activeProfileId) return;
    deleteMeasurement(activeProfileId, mId);
    if (onProfileUpdated) onProfileUpdated();
  }

  function handleStartEdit(m) {
    setEditingMeasurement(m.id);
    setEditValues({ days: m.days, weight: m.weight || "", height: m.height || "", hc: m.hc || "", date: m.date || "" });
  }

  function handleSaveEdit() {
    if (!activeProfileId || !editingMeasurement) return;
    updateMeasurement(activeProfileId, editingMeasurement, {
      days: parseInt(editValues.days, 10),
      weight: editValues.weight ? parseFloat(editValues.weight) : null,
      height: editValues.height ? parseFloat(editValues.height) : null,
      hc: editValues.hc ? parseFloat(editValues.hc) : null,
      date: editValues.date,
    });
    setEditingMeasurement(null);
    if (onProfileUpdated) onProfileUpdated();
  }

  async function handleExportHistory() {
    if (!profile || !profile.measurements || profile.measurements.length === 0) return;
    const XLSX = await import("xlsx");
    const rows = profile.measurements.map((m) => {
      const row = { date: m.date || "", day: m.days, w: m.weight, h: m.height, hc: m.hc };
      if (allData && m.days < (allData.Weight?.length || 0)) {
        if (m.weight) row["w_percentile"] = parseFloat(getPercentile(m.weight, allData.Weight[m.days]).toFixed(1));
        if (m.height) row["h_percentile"] = parseFloat(getPercentile(m.height, allData.Height[m.days]).toFixed(1));
        if (m.hc) row["hc_percentile"] = parseFloat(getPercentile(m.hc, allData["Head Circumference"][m.days]).toFixed(1));
      }
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, `${profile.name}-measurements.xlsx`);
  }

  const hasResults = results && results.some(r => r !== null);
  const activeResults = hasResults ? results.filter(r => r !== null) : [];

  return (
    <div className="page">
      <SEOHead title={t("seoHomeTitle")} description={t("seoHomeDescription")} path="/" />

      <div className="page-header">
        <h1>{t("calcTitle")}</h1>
        <p>
          {profile ? t("calcSubtitle", { name: profile.name }) : t("calcSubtitleGeneric")}
          {(() => {
            if (!profile?.measurements?.length) return null;
            const lastTs = Math.max(...profile.measurements.map(m => m.createdAt || 0));
            if (!lastTs) return null;
            const d = new Date(lastTs);
            const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const isToday = new Date().toDateString() === d.toDateString();
            const dateStr = isToday ? t("lastUpdateToday") : d.toLocaleDateString();
            return `. ${t("lastUpdateAt", { date: dateStr, time })}`;
          })()}
        </p>
      </div>

      <div className="bento-grid bento-grid-5-7">
        {/* Left: New Measurement Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon primary">
              <span className="material-symbols-outlined">straighten</span>
            </div>
            <h2>{t("calcTitle")}</h2>
          </div>

          <form onSubmit={handleCalculate} className="form-stack">
            {!activeProfileId && onGenderChange && (
              <div className="settings-toggle" style={{ alignSelf: "center" }}>
                {["Boys", "Girls"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={gender === g ? "active" : ""}
                    onClick={() => onGenderChange(g)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>{g === "Boys" ? "male" : "female"}</span>
                    {g === "Boys" ? t("genderBoy") : t("genderGirl")}
                  </button>
                ))}
              </div>
            )}
            {/* Age Tabs */}
            <div className="age-tabs">
              {[
                { key: "birthdate", label: t("calcBirthDate") },
                { key: "days", label: t("calcDays") },
                { key: "months", label: t("calcMonths") },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={ageInputMode === opt.key ? "active" : ""}
                  onClick={() => setAgeInputMode(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {ageInputMode === "birthdate" && (
              <div className="form-group">
                <label className="form-label">
                  {t("calcBirthDate")}
                  <span className="form-hint">{t("calcSavedAuto")}</span>
                </label>
                <BirthDateInput value={birthDate} onChange={setBirthDate} />
              </div>
            )}

            {ageInputMode === "days" && (
              <div className="form-group">
                <label className="form-label" htmlFor="age-days">{t("calcAgeDays")}</label>
                <input id="age-days" className="form-input" type="number" min="0" max="1826" value={ageInDays} onChange={(e) => setAgeInDays(e.target.value)} placeholder={t("calcPlaceholderDays")} />
              </div>
            )}

            {ageInputMode === "months" && (
              <div className="form-group">
                <label className="form-label" htmlFor="age-months">{t("calcAgeMonths")}</label>
                <input id="age-months" className="form-input" type="number" step="0.1" min="0" max="60" value={ageInMonths} onChange={(e) => setAgeInMonths(e.target.value)} placeholder={t("calcPlaceholderMonths")} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t("measureWeight")} ({MEASURES_UNITS["Weight"]})</label>
              <input className="form-input" type="number" step="any" min="0" value={weightValue} onChange={(e) => setWeightValue(e.target.value)} placeholder="7.8" />
            </div>

            <div className="form-group">
              <label className="form-label">{t("measureHeight")} ({MEASURES_UNITS["Height"]})</label>
              <input className="form-input" type="number" step="any" min="0" value={heightValue} onChange={(e) => setHeightValue(e.target.value)} placeholder="68.0" />
            </div>

            <div className="form-group">
              <label className="form-label">{t("measureHeadCircumference")} ({MEASURES_UNITS["Head Circumference"]})</label>
              <input className="form-input" type="number" step="any" min="0" value={hcValue} onChange={(e) => setHcValue(e.target.value)} placeholder="43.5" />
            </div>

            <button type="submit" className="btn-primary">
              {t("calcCalculate")}
              <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>analytics</span>
            </button>
          </form>

          {warning && (
            <div className="warning" style={{ marginTop: "1.25rem" }}>
              <WarningIcon />
              {warning}
            </div>
          )}
        </div>

        {/* Right column: Analysis + bottom cards */}
        <div className="right-column">
        <div ref={resultRef} className={`card result-card ${hasResults ? "has-result" : ""}`} role="region" aria-label={t("calcResultLabel")} aria-live="polite">
          {hasResults && (
            <>
              <div className="result-header" />

              {showSaveDialog && (
                <div className="save-dialog">
                  <label className="form-label">{t("saveMeasurementDate")}</label>
                  <p className="save-dialog-hint">{t("saveMeasurementDateHint")}</p>
                  <input type="date" className="form-input" value={saveDate} onChange={(e) => setSaveDate(e.target.value)} />
                  <div className="save-dialog-actions">
                    <button className="profile-form-btn create" onClick={handleConfirmSave}>{t("profileSaveToHistory")}</button>
                    <button className="profile-form-btn cancel" onClick={() => setShowSaveDialog(false)}>{t("profileCancel")}</button>
                  </div>
                </div>
              )}

              {calcAlerts.length > 0 && (
                <div className="evo-alerts" style={{ marginBottom: "0.75rem" }}>
                  {calcAlerts.map((a, i) => {
                    const label = a.key === "Weight" ? t("measureWeight") : a.key === "Height" ? t("measureHeight") : t("measureHeadCircumference");
                    return (
                      <div key={i} className={`evo-alert evo-alert-${a.type}`}>
                        {t(a.type === "drop" ? "calcAlertDrop" : "calcAlertRise", { measure: label, prev: a.prev, current: a.current })}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="card-header" style={{ marginBottom: "1.5rem" }}>
                <div className="card-header-icon tertiary">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
                <h2>{t("calcResultLabel")}</h2>
                <span className="card-header-badge">{t("dataSourceLink")}</span>
              </div>

              <div className="analysis-section">
                {activeResults.map((r) => {
                  const pNum = parseFloat(r.percentile);
                  const zone = getZone(pNum);
                  const statusType = getStatusType(zone);
                  const statusLabel = getStatusLabel(zone, t);
                  const statusIcon = getStatusIcon(zone);
                  const forAgeLabel = getMeasureForAgeLabel(r.measure, t);

                  return (
                    <div key={r.measure} className="analysis-item">
                      <div className="analysis-item-header">
                        <div className="analysis-item-left">
                          <h3>{forAgeLabel}</h3>
                          <span className={`analysis-item-status ${statusType}`}>
                            <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>{statusIcon}</span>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="analysis-item-right">
                          <span className={`analysis-percentile ${statusType}`}>{Math.round(pNum)}<sup style={{ fontSize: "0.75em" }}>th</sup></span>
                          <div className="analysis-percentile-label">{t("calcResultPercentile")}</div>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className={`progress-bar-fill ${statusType}`} style={{ width: `${Math.max(pNum, 2)}%` }} />
                      </div>
                      {statusType === "error" && (
                        <p className="analysis-item-note">{t("summarySomeConcern")}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="result-actions">
                {activeProfileId && !savedMessage && (
                  <button className="btn-save-history" onClick={handleOpenSaveDialog} title={t("profileSaveToHistory")}>
                    <SaveIcon />
                    <span>{t("profileSaveToHistory")}</span>
                  </button>
                )}
                {!activeProfileId && onRequestCreateProfile && (
                  <button className="btn-save-history" onClick={onRequestCreateProfile}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>person_add</span>
                    <span>{t("profileAdd")}</span>
                  </button>
                )}
                {savedMessage && (
                  <span className="saved-confirmation">
                    <CheckCircleIcon /> {t("profileSaved")}
                    <button className="saved-evo-link" onClick={() => navigate("/evolution")}>{t("savedViewEvolution")}</button>
                  </span>
                )}
                <button className="btn-export" onClick={handleShare} title={t("shareResult")}>
                  {shareConfirm ? <CheckCircleIcon /> : <ShareIcon />}
                  <span>{shareConfirm ? t("shareCopied") : t("shareResult")}</span>
                </button>
                <button className="btn-export" onClick={exportResult} title={t("exportResult")}>
                  <DownloadIcon />
                  <span>{t("exportResult")}</span>
                </button>
              </div>
            </>
          )}

          {!hasResults && (
            <div className="result-empty" role="status" aria-live="polite">
              <div className="result-empty-icon">
                <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>monitoring</span>
              </div>
              <span className="result-empty-text">{t("calcResultEmpty")}</span>
              <span className="result-empty-hint">{t("calcResultHint")}</span>
              {!activeProfileId && onRequestCreateProfile && (
                <div className="onboarding-hint">
                  <p>{t("onboardingCreateProfile")}</p>
                  <button className="onboarding-btn" onClick={onRequestCreateProfile}>{t("onboardingCreate")}</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom row: Milestones + Recent History */}
        <div className="bottom-cards-grid">
          {/* Upcoming Milestones */}
          <div className="card card-muted" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--secondary)" }}>event_upcoming</span>
              <h3 style={{ fontWeight: 700, color: "var(--on-surface)", fontSize: "1rem" }}>{t("milestonesTitle")}</h3>
            </div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(() => {
                const ageDays = calculateDaysFromInput();
                const milestones = getUpcomingMilestones(ageDays, 3);
                if (milestones.length === 0) return (
                  <li style={{ fontSize: "0.8125rem", color: "var(--on-surface-variant)" }}>
                    {ageDays == null ? t("calcWarnSelectDate") : "—"}
                  </li>
                );
                return milestones.map((m, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--secondary-container)", marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--on-surface)" }}>
                        <a href={MILESTONE_SOURCES[m.type]?.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>
                          {t(m.key)} <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>↗</span>
                        </a>
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>
                        {t(`milestone${m.type.charAt(0).toUpperCase() + m.type.slice(1)}`)} · {t("milestoneAt", { age: formatMilestoneAge(m.ageDays) })}
                      </p>
                    </div>
                  </li>
                ));
              })()}
            </ul>
          </div>

          {/* Recent History */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>history</span>
              <h3 style={{ fontWeight: 700, color: "var(--on-surface)", fontSize: "1rem" }}>{t("recentHistoryTitle")}</h3>
            </div>
            {profile && profile.measurements && profile.measurements.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {profile.measurements.slice(-3).reverse().map((m) => {
                  const parts = [];
                  if (m.weight) parts.push(`${m.weight}kg`);
                  if (m.height) parts.push(`${m.height}cm`);
                  if (m.hc) parts.push(`HC ${m.hc}cm`);
                  return (
                    <button
                      key={m.id}
                      className="recent-item"
                      onClick={() => setShowHistory(true)}
                      style={{ border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                    >
                      <div>
                        <p className="recent-item-date">{m.date || `${m.days}d`}</p>
                        <p className="recent-item-detail">{parts.join(" · ")}</p>
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: "0.875rem", color: "var(--primary)" }}>arrow_forward_ios</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: "0.8125rem", color: "var(--on-surface-variant)" }}>{t("historyEmpty")}</p>
            )}
          </div>
        </div>
        </div>{/* close right-column */}

        {/* History detail modal */}
        {showHistory && profile && profile.measurements && profile.measurements.length > 0 && (
          <div className="modal-backdrop" onClick={() => setShowHistory(false)}>
            <div className="history-modal" onClick={(e) => e.stopPropagation()}>
              <div className="history-modal-header">
                <h3>{t("historyTitle")} ({profile.measurements.length})</h3>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <button className="btn-secondary" onClick={handleExportHistory}>
                    <DownloadIcon /> <span>{t("historyExport")}</span>
                  </button>
                  <button className="navbar-icon-btn" onClick={() => setShowHistory(false)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>{t("historyDate")}</th>
                      <th>{t("historyAge")}</th>
                      <th>{t("measureWeight")}</th>
                      <th>{t("measureHeight")}</th>
                      <th>PC</th>
                      <th>{t("historyPercentile")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyWithPercentiles.map((m) =>
                      editingMeasurement === m.id ? (
                        <tr key={m.id}>
                          <td><input type="date" className="history-edit-input" value={editValues.date} onChange={(e) => setEditValues({ ...editValues, date: e.target.value })} /></td>
                          <td><input type="number" className="history-edit-input" value={editValues.days} onChange={(e) => setEditValues({ ...editValues, days: e.target.value })} /></td>
                          <td><input type="number" step="any" className="history-edit-input" value={editValues.weight} onChange={(e) => setEditValues({ ...editValues, weight: e.target.value })} /></td>
                          <td><input type="number" step="any" className="history-edit-input" value={editValues.height} onChange={(e) => setEditValues({ ...editValues, height: e.target.value })} /></td>
                          <td><input type="number" step="any" className="history-edit-input" value={editValues.hc} onChange={(e) => setEditValues({ ...editValues, hc: e.target.value })} /></td>
                          <td></td>
                          <td className="history-actions">
                            <button className="history-action-btn save" onClick={handleSaveEdit} title={t("historyEditSave")}><CheckCircleIcon /></button>
                            <button className="history-action-btn" onClick={() => setEditingMeasurement(null)} title={t("historyEditCancel")}>&times;</button>
                          </td>
                        </tr>
                      ) : (
                        <tr key={m.id}>
                          <td className="font-semibold">{m.date || "—"}</td>
                          <td className="text-muted">{formatAgeDays(m.days, t("ageYears"))}</td>
                          <td className="font-bold">{m.weight ?? "—"}</td>
                          <td>{m.height ?? "—"}</td>
                          <td>{m.hc ?? "—"}</td>
                          <td className="history-percs">{m.percText || "—"}</td>
                          <td className="history-actions">
                            <button className="history-action-btn" onClick={() => handleStartEdit(m)} title={t("historyEdit")}><EditIcon /></button>
                            <button className="history-action-btn delete" onClick={() => handleDeleteMeasurement(m.id)} title={t("historyDelete")}><TrashIcon /></button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
