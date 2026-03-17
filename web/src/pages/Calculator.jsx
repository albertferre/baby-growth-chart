import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getPercentile } from "../utils/percentile";
import { MEASURES_UNITS } from "../utils/data";
import { useLanguage } from "../i18n/LanguageContext";
import { addMeasurement, getProfile, deleteMeasurement, updateMeasurement } from "../utils/babyStore";
import SEOHead from "../components/SEOHead";

const STORAGE_KEY_BIRTHDATE = "baby-growth-birthdate";
const STORAGE_KEY_VALUES = "baby-growth-last-values";

function getSavedBirthDate() {
  try {
    return localStorage.getItem(STORAGE_KEY_BIRTHDATE) || "";
  } catch {
    return "";
  }
}

function getPercentileColor(p, gender) {
  if (gender === "Girls") {
    if (p < 15) return "#f472b6";
    if (p < 85) return "#ec4899";
    return "#db2777";
  }
  if (p < 15) return "#60a5fa";
  if (p < 85) return "#3b82f6";
  return "#2563eb";
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
    case "veryLow": return "#ef4444";
    case "low": return "#f59e0b";
    case "normal": return "#22c55e";
    case "high": return "#f59e0b";
    case "veryHigh": return "#ef4444";
    default: return "#94a3b8";
  }
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

function EmptyStateIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 4-6" />
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

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function MiniGauge({ percentile, color, size = 80 }) {
  const r = (size / 2) - 10;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percentile / 100);

  return (
    <div className="mini-gauge" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle
          className="percentile-gauge-bg"
          cx={size / 2}
          cy={size / 2}
          r={r}
        />
        <circle
          className="percentile-gauge-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
      </svg>
      <div className="percentile-gauge-value">
        <span className="percentile-number animated" style={{ color, fontSize: "1.25rem" }}>
          {percentile}%
        </span>
      </div>
    </div>
  );
}

function ZoneBar({ percentile, t }) {
  const zones = [
    { key: "veryLow", end: 3, color: "#ef4444" },
    { key: "low", end: 15, color: "#f59e0b" },
    { key: "normal", end: 85, color: "#22c55e" },
    { key: "high", end: 97, color: "#f59e0b" },
    { key: "veryHigh", end: 100, color: "#ef4444" },
  ];
  const zoneLabels = {
    veryLow: t("interpZoneVeryLow"),
    low: t("interpZoneLow"),
    normal: t("interpZoneNormal"),
    high: t("interpZoneHigh"),
    veryHigh: t("interpZoneVeryHigh"),
  };

  return (
    <div className="zone-bar-container">
      <div className="zone-bar">
        {zones.map((z, i) => {
          const prevEnd = i === 0 ? 0 : zones[i - 1].end;
          const width = z.end - prevEnd;
          return (
            <div
              key={z.key}
              className="zone-bar-segment"
              style={{ width: `${width}%`, background: z.color }}
              title={zoneLabels[z.key]}
            />
          );
        })}
        <div
          className="zone-bar-marker"
          style={{ left: `${Math.min(Math.max(percentile, 1), 99)}%` }}
        >
          <div className="zone-bar-marker-dot" />
        </div>
      </div>
      <div className="zone-bar-labels">
        <span style={{ position: "absolute", left: "0%" }}>P3</span>
        <span style={{ position: "absolute", left: "15%", transform: "translateX(-50%)" }}>P15</span>
        <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>P50</span>
        <span style={{ position: "absolute", left: "85%", transform: "translateX(-50%)" }}>P85</span>
        <span style={{ position: "absolute", left: "97%", transform: "translateX(-50%)" }}>P97</span>
      </div>
    </div>
  );
}

function PercentileInterpretation({ results, gender, t }) {
  const activeResults = results.filter((r) => r !== null);
  if (activeResults.length === 0) return null;

  const genderLabel = gender === "Boys" ? t("genderBoys").toLowerCase() : t("genderGirls").toLowerCase();

  // Calculate summary
  const zones = activeResults.map((r) => getZone(parseFloat(r.percentile)));
  const allNormal = zones.every((z) => z === "normal");
  const hasVeryLowOrHigh = zones.some((z) => z === "veryLow" || z === "veryHigh");
  const abnormalCount = zones.filter((z) => z !== "normal").length;

  let summary;
  if (allNormal) {
    summary = t("summaryAllNormal");
  } else if (abnormalCount === 1 && !hasVeryLowOrHigh) {
    summary = t("summaryMostlyNormal");
  } else if (hasVeryLowOrHigh) {
    summary = t("summaryConsultDoctor");
  } else {
    summary = t("summarySomeConcern");
  }

  const summaryType = allNormal ? "good" : hasVeryLowOrHigh ? "concern" : "info";

  return (
    <div className="interpretation-section">
      {activeResults.map((r) => {
        const pNum = parseFloat(r.percentile);
        const zone = getZone(pNum);
        const zoneColor = getZoneColor(zone);
        const label =
          r.measure === "Weight" ? t("measureWeight")
          : r.measure === "Height" ? t("measureHeight")
          : t("measureHeadCircumference");

        const interpKey =
          zone === "veryLow" ? "interpVeryLow"
          : zone === "low" ? "interpLow"
          : zone === "normal" ? "interpNormal"
          : zone === "high" ? "interpHigh"
          : "interpVeryHigh";

        return (
          <div key={r.measure} className="interpretation-item">
            <div className="interpretation-item-header">
              <span className="interpretation-item-label">{label}</span>
              <span className="interpretation-item-badge" style={{ background: zoneColor + "20", color: zoneColor }}>
                {t(interpKey)}
              </span>
            </div>
            <p className="interpretation-item-desc">
              {t("interpDesc", { percentile: r.percentile, genderLabel }).split(r.percentile).map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>{part}<strong className="interp-percentile-highlight" style={{ color: zoneColor }}>{r.percentile}%</strong></span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>
            <ZoneBar percentile={pNum} t={t} />
          </div>
        );
      })}

      <div className={`interpretation-summary interpretation-summary-${summaryType}`}>
        <p>{summary}</p>
      </div>
    </div>
  );
}

function getSavedValues() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VALUES);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export default function Calculator({ allData, gender, activeProfileId, onProfileUpdated, onRequestCreateProfile }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [ageInputMode, setAgeInputMode] = useState("birthdate");
  const [ageMethodOpen, setAgeMethodOpen] = useState(false);
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

  // Compute percentile change alerts vs last saved measurement
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

  // Memoize history percentile calculations
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

  // Persist form values to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VALUES, JSON.stringify({
        weight: weightValue, height: heightValue, hc: hcValue,
        ageInDays, ageInMonths,
      }));
    } catch { /* ignore */ }
  }, [weightValue, heightValue, hcValue, ageInDays, ageInMonths]);

  // Export result as PNG image
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

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 400, totalHeight);

    // Header
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(0, 0, 400, 50);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Inter, sans-serif";
    ctx.fillText("Baby Growth Chart", 20, 32);

    // Baby name if profile active
    const profile = activeProfileId ? getProfile(activeProfileId) : null;
    if (profile) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(profile.name, 380, 32);
      ctx.textAlign = "left";
    }

    // Age info
    const firstResult = activeResults[0];
    ctx.fillStyle = "#1e293b";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${t("calcResultAge")}: ${firstResult.months} ${t("calcResultMonths")} (${firstResult.days} ${t("calcResultDays")})`, 20, 75);

    // Results
    let y = 100;
    for (const r of activeResults) {
      const pColor = getPercentileColor(parseFloat(r.percentile), gender);
      const label = r.measure === "Weight" ? t("measureWeight")
        : r.measure === "Height" ? t("measureHeight")
        : t("measureHeadCircumference");

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 12px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, 20, y + 15);

      ctx.fillStyle = pColor;
      ctx.font = "bold 28px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${r.percentile}%`, 380, y + 18);

      // Progress bar
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(20, y + 35, 360, 8);
      ctx.fillStyle = pColor;
      ctx.fillRect(20, y + 35, 360 * (parseFloat(r.percentile) / 100), 8);

      y += cardHeight;
    }

    // Footer
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("WHO Child Growth Standards • babygrowthchart.app", 200, totalHeight - 15);

    // Download
    const link = document.createElement("a");
    link.download = `baby-growth-percentiles.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Save birthdate to localStorage when it changes
  useEffect(() => {
    if (birthDate) {
      try {
        localStorage.setItem(STORAGE_KEY_BIRTHDATE, birthDate);
      } catch {
        // Ignore storage errors
      }
    }
  }, [birthDate]);

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
      if (ageInputMode === "birthdate") {
        setWarning(t("calcWarnSelectDate"));
      } else if (ageInputMode === "days") {
        setWarning(t("calcWarnEnterDays"));
      } else {
        setWarning(t("calcWarnEnterMonths"));
      }
      return;
    }

    if (days < 0) {
      setWarning(t("calcWarnFutureDate"));
      return;
    }

    const wVal = parseFloat(weightValue);
    const hVal = parseFloat(heightValue);
    const hcVal = parseFloat(hcValue);

    const hasWeight = weightValue && wVal > 0;
    const hasHeight = heightValue && hVal > 0;
    const hasHc = hcValue && hcVal > 0;

    if (!hasWeight && !hasHeight && !hasHc) {
      setWarning(t("calcWarnAtLeastOne"));
      return;
    }

    if (!allData) return;

    const newResults = [];
    const measures = [
      { key: "Weight", value: wVal, has: hasWeight },
      { key: "Height", value: hVal, has: hasHeight },
      { key: "Head Circumference", value: hcVal, has: hasHc },
    ];

    for (const m of measures) {
      if (!m.has) {
        newResults.push(null);
        continue;
      }
      const data = allData[m.key];
      if (days >= data.length) {
        setWarning(t("calcWarnAgeExceeds"));
        return;
      }
      const dayData = data[days];
      const percentile = getPercentile(m.value, dayData);
      const months = (days / 30.5).toFixed(1);
      newResults.push({
        measure: m.key,
        days,
        months,
        percentile: percentile.toFixed(1),
      });
    }

    setResults(newResults);

    // Auto-scroll to results on mobile
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    const text = [
      profileName ? `${profileName} - ${age}` : age,
      ...lines,
      "",
      "Baby Growth Chart - WHO Standards",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "Baby Growth Chart", text });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for insecure contexts (HTTP)
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

  return (
    <div className="page">
      <SEOHead
        title={t("seoHomeTitle")}
        description={t("seoHomeDescription")}
        path="/"
      />
      <div className="page-header">
        <h1>{t("calcTitle")}</h1>
        <p>{t("calcSubtitle")}</p>
      </div>

      <div className="calculator-layout">
        <div className="card">
          <form onSubmit={handleCalculate} className="calculator-form">
            <div className="form-group age-method-group">
              <button
                type="button"
                className="age-method-trigger"
                onClick={() => setAgeMethodOpen(!ageMethodOpen)}
              >
                <span className="age-method-label">{t("calcAgeMethod")}:</span>
                <span className="age-method-current">
                  {ageInputMode === "birthdate" ? t("calcBirthDate") : ageInputMode === "days" ? t("calcDays") : t("calcMonths")}
                </span>
                <svg className={`age-method-chevron ${ageMethodOpen ? "open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {ageMethodOpen && (
                <div className="age-mode-toggle">
                  {[
                    { key: "birthdate", label: t("calcBirthDate") },
                    { key: "days", label: t("calcDays") },
                    { key: "months", label: t("calcMonths") },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={ageInputMode === opt.key ? "active" : ""}
                      onClick={() => { setAgeInputMode(opt.key); setAgeMethodOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {ageInputMode === "birthdate" && (
              <div className="form-group">
                <label className="form-label" htmlFor="birthdate">
                  {t("calcBirthDate")}
                  <span className="form-hint">{t("calcSavedAuto")}</span>
                </label>
                <input
                  id="birthdate"
                  className="form-input"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            )}

            {ageInputMode === "days" && (
              <div className="form-group">
                <label className="form-label" htmlFor="age-days">{t("calcAgeDays")}</label>
                <input
                  id="age-days"
                  className="form-input"
                  type="number"
                  min="0"
                  max="1826"
                  value={ageInDays}
                  onChange={(e) => setAgeInDays(e.target.value)}
                  placeholder={t("calcPlaceholderDays")}
                />
              </div>
            )}

            {ageInputMode === "months" && (
              <div className="form-group">
                <label className="form-label" htmlFor="age-months">{t("calcAgeMonths")}</label>
                <input
                  id="age-months"
                  className="form-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="60"
                  value={ageInMonths}
                  onChange={(e) => setAgeInMonths(e.target.value)}
                  placeholder={t("calcPlaceholderMonths")}
                />
              </div>
            )}

            <div className="measurements-row">
              <div className="form-group">
                <label className="form-label" htmlFor="measurement-weight">
                  {t("measureWeight")} ({MEASURES_UNITS["Weight"]})
                </label>
                <input
                  id="measurement-weight"
                  className="form-input"
                  type="number"
                  step="any"
                  min="0"
                  value={weightValue}
                  onChange={(e) => setWeightValue(e.target.value)}
                  placeholder="7.5"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="measurement-height">
                  {t("measureHeight")} ({MEASURES_UNITS["Height"]})
                </label>
                <input
                  id="measurement-height"
                  className="form-input"
                  type="number"
                  step="any"
                  min="0"
                  value={heightValue}
                  onChange={(e) => setHeightValue(e.target.value)}
                  placeholder="68"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="measurement-hc">
                  {t("measureHeadCircumference")} ({MEASURES_UNITS["Head Circumference"]})
                </label>
                <input
                  id="measurement-hc"
                  className="form-input"
                  type="number"
                  step="any"
                  min="0"
                  value={hcValue}
                  onChange={(e) => setHcValue(e.target.value)}
                  placeholder="43"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              {t("calcCalculate")}
            </button>
          </form>

          {warning && (
            <div className="warning" style={{ marginTop: "1.25rem" }}>
              <WarningIcon />
              {warning}
            </div>
          )}
        </div>

        <div ref={resultRef} className={`card result-card ${hasResults ? "has-result" : ""}`} role="region" aria-label={t("calcResultLabel")} aria-live="polite">
          {hasResults && (
            <div className="result-header">
              {profile && <span className="result-profile-name">{t("profileResultsFor", { name: profile.name })}</span>}
              {activeProfileId && !savedMessage && (
                <button className="btn-save-history" onClick={handleOpenSaveDialog} title={t("profileSaveToHistory")}>
                  <SaveIcon />
                  <span>{t("profileSaveToHistory")}</span>
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
          )}

          {/* Save dialog with date picker */}
          {showSaveDialog && (
            <div className="save-dialog">
              <label className="form-label">{t("saveMeasurementDate")}</label>
              <p className="save-dialog-hint">{t("saveMeasurementDateHint")}</p>
              <input
                type="date"
                className="form-input"
                value={saveDate}
                onChange={(e) => setSaveDate(e.target.value)}
              />
              <div className="save-dialog-actions">
                <button className="profile-form-btn create" onClick={handleConfirmSave}>{t("profileSaveToHistory")}</button>
                <button className="profile-form-btn cancel" onClick={() => setShowSaveDialog(false)}>{t("profileCancel")}</button>
              </div>
            </div>
          )}

          {hasResults ? (
            <>
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

              <PercentileInterpretation results={results} gender={gender} t={t} />

              <div className="result-stats-row">
                <div className="result-stat">
                  <span className="result-stat-label">{t("calcResultAge")}</span>
                  <span className="result-stat-value">{results.find(r => r)?.months} {t("calcResultMonths")}</span>
                </div>
                <div className="result-stat">
                  <span className="result-stat-label">{t("calcResultDays")}</span>
                  <span className="result-stat-value">{results.find(r => r)?.days}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="result-empty" role="status" aria-live="polite">
              <div className="result-empty-icon">
                <EmptyStateIcon />
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

        {/* Measurement History */}
        {profile && profile.measurements && profile.measurements.length > 0 && (
          <div className="card history-card">
            <div className="history-header">
              <button className="history-toggle" onClick={() => setShowHistory(!showHistory)}>
                <HistoryIcon />
                <span>{t("historyTitle")} ({profile.measurements.length})</span>
                <svg className={`age-method-chevron ${showHistory ? "open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {showHistory && (
                <button className="btn-export-history" onClick={handleExportHistory}>
                  <DownloadIcon /> <span>{t("historyExport")}</span>
                </button>
              )}
            </div>
            {showHistory && (
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
                        <tr key={m.id} className="history-row-edit">
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
                          <td>{m.date || "—"}</td>
                          <td>{m.days}{t("historyDays")}</td>
                          <td>{m.weight ?? "—"}</td>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
