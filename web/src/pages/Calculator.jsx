import { useState, useEffect, useRef } from "react";
import { getPercentile } from "../utils/percentile";
import { MEASURES_UNITS } from "../utils/data";
import { useLanguage } from "../i18n/LanguageContext";
import SEOHead from "../components/SEOHead";

const STORAGE_KEY_BIRTHDATE = "baby-growth-birthdate";

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

const MEASURES = ["Weight", "Height", "Head Circumference"];

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

export default function Calculator({ allData, gender }) {
  const { t } = useLanguage();
  const [ageInputMode, setAgeInputMode] = useState("birthdate");
  const [birthDate, setBirthDate] = useState(getSavedBirthDate);
  const [ageInDays, setAgeInDays] = useState("");
  const [ageInMonths, setAgeInMonths] = useState("");
  const [weightValue, setWeightValue] = useState("");
  const [heightValue, setHeightValue] = useState("");
  const [hcValue, setHcValue] = useState("");
  const [results, setResults] = useState(null);
  const [warning, setWarning] = useState("");
  const resultRef = useRef(null);

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
            <div className="form-group">
              <label className="form-label">{t("calcAgeMethod")}</label>
              <div className="age-mode-toggle">
                <button
                  type="button"
                  className={ageInputMode === "birthdate" ? "active" : ""}
                  onClick={() => setAgeInputMode("birthdate")}
                >
                  {t("calcBirthDate")}
                </button>
                <button
                  type="button"
                  className={ageInputMode === "days" ? "active" : ""}
                  onClick={() => setAgeInputMode("days")}
                >
                  {t("calcDays")}
                </button>
                <button
                  type="button"
                  className={ageInputMode === "months" ? "active" : ""}
                  onClick={() => setAgeInputMode("months")}
                >
                  {t("calcMonths")}
                </button>
              </div>
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
              <button className="btn-export" onClick={exportResult} title={t("exportResult")}>
                <DownloadIcon />
                <span>{t("exportResult")}</span>
              </button>
            </div>
          )}
          {hasResults ? (
            <>
              <div className="multi-results">
                {results.map((r, i) => {
                  if (!r) return null;
                  const pNum = parseFloat(r.percentile);
                  const pColor = getPercentileColor(pNum, gender);
                  const label = r.measure === "Weight" ? t("measureWeight")
                    : r.measure === "Height" ? t("measureHeight")
                    : t("measureHeadCircumference");
                  return (
                    <div key={r.measure} className="multi-result-item">
                      <MiniGauge percentile={pNum} color={pColor} size={80} />
                      <div className="multi-result-info">
                        <span className="multi-result-label">{label}</span>
                        <span className="multi-result-percentile" style={{ color: pColor }}>
                          {r.percentile}%
                        </span>
                        <span className="percentile-label">{t("calcResultPercentile")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
