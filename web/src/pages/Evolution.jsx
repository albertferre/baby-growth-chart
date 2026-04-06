import { useState, useEffect, useMemo, useRef } from "react";
import Plot from "react-plotly.js";
import { getPercentile } from "../utils/percentile";
import { MEASURES_UNITS, MEASURES_INPUT, formatAgeDays } from "../utils/data";
import { useLanguage } from "../i18n/LanguageContext";
import { getProfile, addMeasurement } from "../utils/babyStore";
import SEOHead from "../components/SEOHead";

function linearInterpolate(arr) {
  const result = [...arr];
  for (let i = 0; i < result.length; i++) {
    if (result[i] == null) {
      let prev = i - 1;
      while (prev >= 0 && result[prev] == null) prev--;
      let next = i + 1;
      while (next < result.length && result[next] == null) next++;
      if (prev >= 0 && next < result.length) {
        const ratio = (i - prev) / (next - prev);
        result[i] = result[prev] + ratio * (result[next] - result[prev]);
      }
    }
  }
  return result;
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const XLSX = await import("xlsx");
        const wb = XLSX.read(e.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        resolve(rows);
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function UploadIcon() {
  return (
    <svg className="dropzone-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="dropzone-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function getPlotlyLayoutBase() {
  return {
    autosize: true,
    font: { family: "'Plus Jakarta Sans', sans-serif", size: 13, color: "#595c5e" },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { t: 48, r: 24, b: 56, l: 56 },
    xaxis: {
      gridcolor: "#eef1f3",
      zerolinecolor: "#e5e9eb",
      title: { font: { size: 12, color: "#595c5e" } },
    },
    yaxis: {
      gridcolor: "#eef1f3",
      zerolinecolor: "#e5e9eb",
    },
    legend: {
      orientation: "h",
      y: -0.18,
      x: 0.5,
      xanchor: "center",
      font: { size: 11, color: "#595c5e" },
    },
  };
}

function getZone(p) {
  if (p < 3) return "veryLow";
  if (p < 15) return "low";
  if (p <= 85) return "normal";
  if (p <= 97) return "high";
  return "veryHigh";
}

export default function Evolution({ data, measure, gender, activeProfileId, onProfileUpdated, onRequestCreateProfile }) {
  const { t } = useLanguage();
  const [babyData, setBabyData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerValue, setRegisterValue] = useState("");
  const [registerDate, setRegisterDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [showHelp, setShowHelp] = useState(false);
  const plotRef = useRef(null);

  const col = MEASURES_INPUT[measure];
  const unit = MEASURES_UNITS[measure];
  const accentColor = gender === "Girls" ? "#ec4899" : "#005da7";

  const profile = activeProfileId ? getProfile(activeProfileId) : null;
  const hasHistory = profile && profile.measurements && profile.measurements.length > 0;

  const [dataSource, setDataSource] = useState(() =>
    hasHistory ? "history" : "file"
  );

  useEffect(() => {
    if (hasHistory && !babyData) setDataSource("history");
    else if (!hasHistory && dataSource === "history") setDataSource("file");
  }, [activeProfileId]);

  const historyData = useMemo(() => {
    if (!profile || !profile.measurements || profile.measurements.length === 0) return null;
    const colMap = { Weight: "weight", Height: "height", "Head Circumference": "hc" };
    const field = colMap[measure];
    return profile.measurements
      .filter((m) => m[field] != null)
      .map((m) => ({ day: m.days, value: m[field] }))
      .sort((a, b) => a.day - b.day);
  }, [profile, measure]);

  const effectiveData = dataSource === "history" ? historyData : babyData;

  const getMeasureLabel = () => {
    if (measure === "Weight") return t("measureWeight");
    if (measure === "Height") return t("measureHeight");
    return t("measureHeadCircumference");
  };

  const handleRegisterMeasurement = () => {
    if (!activeProfileId || !registerValue) return;
    const val = parseFloat(registerValue);
    if (isNaN(val) || val <= 0) return;

    const birth = profile?.birthDate;
    let days = 0;
    if (birth) {
      const birthDate = new Date(birth + "T00:00:00");
      const measDate = new Date(registerDate + "T00:00:00");
      days = Math.floor((measDate - birthDate) / (1000 * 60 * 60 * 24));
    }

    const colMap = { Weight: "weight", Height: "height", "Head Circumference": "hc" };
    const field = colMap[measure];
    addMeasurement(activeProfileId, {
      days,
      [field]: val,
      date: registerDate,
    });

    setShowRegisterModal(false);
    setRegisterValue("");
    setRegisterDate(new Date().toISOString().split("T")[0]);
    if (onProfileUpdated) onProfileUpdated();
  };

  const getGenderLabel = () => {
    return gender === "Boys" ? t("genderBoys").toLowerCase() : t("genderGirls").toLowerCase();
  };

  async function downloadTemplate() {
    const XLSX = await import("xlsx");
    const data = [
      { day: 0, w: 3.2, h: 50, hc: 35 },
      { day: 30, w: 4.1, h: 54, hc: 37 },
      { day: 60, w: 5.0, h: 58, hc: 39 },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "baby-growth-template.xlsx");
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    setDataSource("file");

    try {
      const rows = await parseExcel(file);
      const required = ["day", "h", "w", "hc"];
      const missing = required.filter((c) => !Object.keys(rows[0] || {}).includes(c));
      if (missing.length) {
        setUploadError(t("evoErrorMissing", { cols: missing.join(", ") }));
        setBabyData(null);
        setFileName("");
        return;
      }

      const days = rows.map((r) => r.day);
      const values = linearInterpolate(rows.map((r) => r[col]));
      setBabyData(days.map((d, i) => ({ day: d, value: values[i] })).filter((r) => r.value != null));
      setFileName(file.name);
    } catch {
      setUploadError(t("evoErrorParse"));
      setBabyData(null);
      setFileName("");
    }
  }

  function handleClearData() {
    setBabyData(null);
    setFileName("");
    setUploadError("");
    setDataSource("file");
  }

  function handleUseHistory() {
    setDataSource("history");
    setBabyData(null);
    setFileName("");
  }

  async function exportChart() {
    if (!plotRef.current) return;
    const Plotly = await import("plotly.js");
    const gd = plotRef.current.el;
    if (!gd) return;
    Plotly.downloadImage(gd, {
      format: "png",
      width: 1200,
      height: 600,
      filename: `growth-evolution-${measure.toLowerCase()}`,
    });
  }

  const percentileCurves = useMemo(() => {
    const months = data.map((r) => +(r.Day / 30.5).toFixed(2));
    return {
      months,
      P01: data.map((r) => r.P01),
      P25: data.map((r) => r.P25),
      P50: data.map((r) => r.P50),
      P75: data.map((r) => r.P75),
      P99: data.map((r) => r.P99),
    };
  }, [data]);

  const babyPercentiles = useMemo(() => {
    if (!effectiveData || effectiveData.length === 0) return null;
    return effectiveData
      .filter((r) => r.day >= 0 && r.day < data.length)
      .map((r) => ({
        day: r.day,
        percentile: getPercentile(r.value, data[r.day]),
      }));
  }, [effectiveData, data]);

  const alerts = useMemo(() => {
    if (!babyPercentiles || babyPercentiles.length < 2) return [];
    const result = [];
    for (let i = 1; i < babyPercentiles.length; i++) {
      const prev = babyPercentiles[i - 1].percentile;
      const curr = babyPercentiles[i].percentile;
      const diff = curr - prev;
      if (Math.abs(diff) >= 20) {
        result.push({ type: diff < 0 ? "drop" : "rise", prev: prev.toFixed(0), current: curr.toFixed(0), day: babyPercentiles[i].day });
      }
    }
    return result;
  }, [babyPercentiles]);

  // Latest percentile for sidebar
  const latestPercentile = babyPercentiles && babyPercentiles.length > 0
    ? babyPercentiles[babyPercentiles.length - 1].percentile
    : null;

  const latestZone = latestPercentile !== null ? getZone(latestPercentile) : null;
  const isAlert = latestZone && latestZone !== "normal" && latestZone !== "high";

  const whoBlue = "#4a90d9";
  const whoBlueLight = "rgba(74, 144, 217, 0.08)";
  const whoBlueMed = "rgba(74, 144, 217, 0.15)";

  const traces = [
    // P01-P99 shaded band
    {
      x: percentileCurves.months,
      y: percentileCurves.P01,
      type: "scatter",
      mode: "lines",
      line: { color: "transparent", width: 0 },
      showlegend: false,
      hoverinfo: "skip",
    },
    {
      x: percentileCurves.months,
      y: percentileCurves.P99,
      type: "scatter",
      mode: "lines",
      line: { color: "transparent", width: 0 },
      fill: "tonexty",
      fillcolor: whoBlueLight,
      showlegend: false,
      hoverinfo: "skip",
    },
    // P25-P75 shaded band
    {
      x: percentileCurves.months,
      y: percentileCurves.P25,
      type: "scatter",
      mode: "lines",
      line: { color: "transparent", width: 0 },
      showlegend: false,
      hoverinfo: "skip",
    },
    {
      x: percentileCurves.months,
      y: percentileCurves.P75,
      type: "scatter",
      mode: "lines",
      line: { color: "transparent", width: 0 },
      fill: "tonexty",
      fillcolor: whoBlueMed,
      showlegend: false,
      hoverinfo: "skip",
    },
    // P50 median line
    {
      x: percentileCurves.months,
      y: percentileCurves.P50,
      name: t("evoWhoAverage"),
      type: "scatter",
      mode: "lines",
      line: { color: whoBlue, width: 2.5 },
      hovertemplate: `${t("evoWhoAverage")}: %{y:.1f} ${unit}<extra></extra>`,
    },
  ];

  if (effectiveData && effectiveData.length > 0) {
    traces.push({
      x: effectiveData.map((r) => +(r.day / 30.5).toFixed(2)),
      y: effectiveData.map((r) => r.value),
      name: profile ? profile.name : t("evoBaby"),
      type: "scatter",
      mode: "lines+markers",
      line: { color: isAlert ? "#fb5151" : accentColor, width: 2.5 },
      marker: { color: isAlert ? "#fb5151" : accentColor, size: 5 },
      hovertemplate: `%{x:.1f}m: %{y:.2f} ${unit}<extra></extra>`,
    });
  }

  const profileName = profile ? profile.name : "";

  return (
    <div className="page">
      <SEOHead title={t("seoEvolutionTitle")} description={t("seoEvolutionDescription")} path="/evolution" />

      {/* Hero Header */}
      <div className="evolution-header">
        <div className="evolution-hero">
          <h1>{profileName ? t("evoTitleProfile", { name: profileName }) : t("evoTitle")}</h1>
          <p>{t("evoSubtitle", { gender: getGenderLabel() })}</p>
        </div>
        {activeProfileId ? (
          <button className="btn-register" onClick={() => setShowRegisterModal(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>add</span>
            {t("evoRegister", { measure: getMeasureLabel() })}
          </button>
        ) : onRequestCreateProfile && (
          <button className="btn-register" onClick={onRequestCreateProfile}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>person_add</span>
            {t("profileAdd")}
          </button>
        )}

        <div className="upload-actions">
          {hasHistory && (
            <div className="data-source-toggle">
              <span className="data-source-label">{t("evoDataSource")}:</span>
              <button className={`data-source-btn ${dataSource === "file" ? "active" : ""}`} onClick={() => setDataSource("file")}>
                {t("evoSourceFile")}
              </button>
              <button className={`data-source-btn ${dataSource === "history" ? "active" : ""}`} onClick={handleUseHistory}>
                {t("evoSourceHistory")} ({profile.measurements.length})
              </button>
            </div>
          )}

          {dataSource === "file" && (
            <>
              <div className="upload-section">
                <div className={`dropzone ${fileName ? "has-file" : ""}`}>
                  <input type="file" accept=".xls,.xlsx" onChange={handleFileUpload} />
                  {fileName ? <CheckIcon /> : <UploadIcon />}
                  <span className="dropzone-text">
                    {fileName ? fileName : (<><strong>{t("evoUpload")}</strong> {t("evoUploadHint")}</>)}
                  </span>
                </div>
                {fileName && <button className="btn-clear" onClick={handleClearData} title="Clear data">&times;</button>}
              </div>
              <button className="btn-template" onClick={downloadTemplate}>
                <DownloadIcon /> {t("evoDownloadTemplate")}
              </button>
            </>
          )}

          {dataSource === "history" && !hasHistory && (
            <div className="evo-no-history"><p>{t("evoNoHistory")}</p></div>
          )}
        </div>
      </div>

      {dataSource === "file" && (
        <>
          <button className="help-toggle" onClick={() => setShowHelp(!showHelp)} aria-expanded={showHelp}>
            <InfoIcon />
            <span>{showHelp ? t("evoHelpHide") : t("evoHelpToggle")}</span>
          </button>

          {showHelp && (
            <div className="help-panel">
              <h3>{t("evoHelpTitle")}</h3>
              <p dangerouslySetInnerHTML={{ __html: t("evoHelpIntro") }} />
              <table className="help-table">
                <thead>
                  <tr>
                    <th>{t("evoHelpColColumn")}</th>
                    <th>{t("evoHelpColDesc")}</th>
                    <th>{t("evoHelpColExample")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>day</code></td><td>{t("evoHelpDayDesc")}</td><td>0, 30, 60, 90...</td></tr>
                  <tr><td><code>w</code></td><td>{t("evoHelpWeightDesc")}</td><td>3.2, 4.5, 5.8...</td></tr>
                  <tr><td><code>h</code></td><td>{t("evoHelpHeightDesc")}</td><td>50, 54, 58...</td></tr>
                  <tr><td><code>hc</code></td><td>{t("evoHelpHcDesc")}</td><td>35, 37, 39...</td></tr>
                </tbody>
              </table>
              <h4>{t("evoHelpExample")}</h4>
              <div className="help-example">
                <table>
                  <thead><tr><th>day</th><th>w</th><th>h</th><th>hc</th></tr></thead>
                  <tbody>
                    <tr><td>0</td><td>3.2</td><td>50</td><td>35</td></tr>
                    <tr><td>30</td><td>4.1</td><td>54</td><td>37</td></tr>
                    <tr><td>60</td><td>5.0</td><td>58</td><td>39</td></tr>
                    <tr><td>90</td><td>5.8</td><td>61</td><td>40</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="help-tips">
                <h4>{t("evoHelpTips")}</h4>
                <ul>
                  <li dangerouslySetInnerHTML={{ __html: t("evoHelpTip1") }} />
                  <li>{t("evoHelpTip2")}</li>
                  <li>{t("evoHelpTip3")}</li>
                  <li dangerouslySetInnerHTML={{ __html: t("evoHelpTip4") }} />
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {uploadError && (
        <div className="warning" style={{ marginBottom: "1rem" }}>
          <WarningIcon />
          {uploadError}
        </div>
      )}

      {/* Main grid: Chart + Sidebar */}
      <div className="bento-grid bento-grid-8-4">
        {/* Chart */}
        <div className="plot-card">
          {(effectiveData && effectiveData.length > 0) && (
            <button className="btn-export-chart" onClick={exportChart} title={t("evoExportChart")}>
              <DownloadIcon />
              <span>{t("evoExportChart")}</span>
            </button>
          )}
          <Plot
            ref={plotRef}
            data={traces}
            layout={{
              ...getPlotlyLayoutBase(),
              title: {
                text: t("evoChartTitle", { measure: getMeasureLabel(), gender: gender === "Boys" ? t("genderBoys") : t("genderGirls") }),
                font: { size: 15, color: "#2c2f31", family: "'Plus Jakarta Sans', sans-serif", weight: 700 },
              },
              xaxis: {
                ...getPlotlyLayoutBase().xaxis,
                title: { text: t("calcResultMonths"), font: { size: 12, color: "#595c5e" } },
                tickvals: [0, ...Array.from({ length: Math.ceil(percentileCurves.months[percentileCurves.months.length - 1] / 6) }, (_, i) => (i + 1) * 6)],
                ticktext: [t("evoBirth"), ...Array.from({ length: Math.ceil(percentileCurves.months[percentileCurves.months.length - 1] / 6) }, (_, i) => `${(i + 1) * 6}`)],
              },
              yaxis: {
                ...getPlotlyLayoutBase().yaxis,
                title: { text: unit, font: { size: 12, color: "#595c5e" } },
              },
            }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler
            className="plot"
          />
        </div>

        {/* Sidebar stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Percentile alert/info card */}
          {latestPercentile !== null && (
            isAlert ? (
              <div className="alert-card">
                <div className="alert-card-header">
                  <div>
                    <p className="alert-card-label">{t("interpZoneLow")}</p>
                    <h3 className="alert-card-title">
                      {t("calcResultPercentile")} {Math.round(latestPercentile)}
                      <sup style={{ fontSize: "0.5em" }}>th</sup>
                    </h3>
                  </div>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.5rem", color: "var(--error)" }}>warning</span>
                </div>
                <p className="alert-card-text">{t("summarySomeConcern")}</p>
                <div className="percentile-scale">
                  <div className="percentile-scale-labels">
                    <span>P0</span><span>P50</span><span>P100</span>
                  </div>
                  <div className="percentile-scale-bar">
                    <div className="percentile-scale-marker" style={{ left: `${latestPercentile}%` }}>
                      <div className="percentile-scale-marker-dot error" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div className="card-header-icon primary">
                    <span className="material-symbols-outlined">monitoring</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--on-surface-variant)" }}>{getMeasureLabel()}</p>
                    <h4 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--on-surface)" }}>
                      {t("calcResultPercentile")} {Math.round(latestPercentile)}<sup style={{ fontSize: "0.5em" }}>th</sup>
                    </h4>
                  </div>
                </div>
                <div className="metric-card-percentile">
                  <span className="metric-card-percentile-label">{t("calcResultPercentile")} {Math.round(latestPercentile)}º</span>
                  <span className="metric-card-percentile-badge normal">{t("interpZoneNormal")}</span>
                </div>
                <div className="percentile-scale" style={{ marginTop: "0.75rem" }}>
                  <div className="percentile-scale-bar">
                    <div className="percentile-scale-marker" style={{ left: `${latestPercentile}%` }}>
                      <div className="percentile-scale-marker-dot primary" />
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Percentile change alerts */}
          {alerts.length > 0 && (
            <div className="alert-card">
              <div className="alert-card-header">
                <div>
                  <p className="alert-card-label">{t("alertDropTitle")}</p>
                  <h3 className="alert-card-title">
                    P{alerts[0].prev}<sup style={{ fontSize: "0.5em" }}>th</sup> → P{alerts[0].current}<sup style={{ fontSize: "0.5em" }}>th</sup>
                  </h3>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: "1.5rem", color: "var(--error)" }}>trending_down</span>
              </div>
              {alerts.map((a, i) => (
                <p key={i} className="alert-card-text" style={i > 0 ? { marginTop: "0.5rem" } : undefined}>
                  {a.type === "drop"
                    ? t("alertDrop", { measure: getMeasureLabel(), prev: a.prev, current: a.current })
                    : t("alertRise", { measure: getMeasureLabel(), prev: a.prev, current: a.current })}
                </p>
              ))}
            </div>
          )}

          {/* Latest measurement card */}
          {effectiveData && effectiveData.length > 0 && (() => {
            const last = effectiveData[effectiveData.length - 1];
            const ageLabel = formatAgeDays(last.day, t("ageYears"));
            return (
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div className="card-header-icon primary">
                    <span className="material-symbols-outlined">straighten</span>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--on-surface-variant)" }}>{t("evoLatestMeasurement")}</p>
                    <h4 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--on-surface)" }}>
                      {last.value} <span style={{ fontSize: "0.875rem", fontWeight: 400 }}>{unit}</span>
                    </h4>
                  </div>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--on-surface-variant)" }}>
                  {profileName ? `${profileName} · ` : ""}{ageLabel}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Measurement History Table */}
      {hasHistory && dataSource === "history" && (
        <section style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: "var(--on-surface)", marginBottom: "1.5rem" }}>{t("historyTitle")}</h2>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>{t("historyDate")}</th>
                    <th>{t("historyAge")}</th>
                    <th>{t("measureWeight")}</th>
                    <th>{t("measureHeight")}</th>
                    <th>{t("calcResultPercentile")}</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.measurements.map((m, idx) => {
                    const colMap = { Weight: "weight", Height: "height", "Head Circumference": "hc" };
                    const field = colMap[measure];
                    const val = m[field];
                    let perc = null;
                    let zone = null;
                    if (val != null && m.days < data.length) {
                      perc = getPercentile(val, data[m.days]);
                      zone = getZone(perc);
                    }
                    const isError = zone && zone !== "normal" && zone !== "high";
                    return (
                      <tr key={m.id || idx}>
                        <td className="font-semibold">{m.date || "—"}</td>
                        <td className="text-muted">{formatAgeDays(m.days, t("ageYears"))}</td>
                        <td className="font-bold">{m.weight ?? "—"} {m.weight ? "kg" : ""}</td>
                        <td>{m.height ?? "—"} {m.height ? "cm" : ""}</td>
                        <td>
                          {perc !== null ? (
                            <div className="history-percentile-indicator">
                              <span className={`history-percentile-value ${isError ? "error" : "primary"}`}>
                                {Math.round(perc)}º
                              </span>
                              <div className="history-percentile-bar">
                                <div className={`history-percentile-dot ${isError ? "error" : "primary"}`} style={{ left: `${perc}%` }} />
                              </div>
                            </div>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Register measurement modal */}
      {showRegisterModal && (
        <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("evoRegister", { measure: getMeasureLabel() })}</h3>
            <div className="form-group" style={{ marginTop: "0.75rem" }}>
              <label className="form-label">{getMeasureLabel()} ({unit})</label>
              <input
                type="number"
                step="any"
                min="0"
                className="profile-form-input"
                placeholder={measure === "Weight" ? "7.8" : "68.0"}
                value={registerValue}
                onChange={(e) => setRegisterValue(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginTop: "0.75rem" }}>
              <label className="form-label">{t("historyDate")}</label>
              <input
                type="date"
                className="profile-form-input"
                value={registerDate}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setRegisterDate(e.target.value)}
              />
            </div>
            <div className="profile-form-actions">
              <button className="profile-form-btn create" onClick={handleRegisterMeasurement}>
                {t("profileSaveToHistory")}
              </button>
              <button className="profile-form-btn cancel" onClick={() => setShowRegisterModal(false)}>
                {t("profileCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
