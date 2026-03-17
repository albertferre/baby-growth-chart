import { useState, useEffect, useMemo, useRef } from "react";
import Plot from "react-plotly.js";
import { getPercentile } from "../utils/percentile";
import { MEASURES_UNITS, MEASURES_INPUT } from "../utils/data";
import { useLanguage } from "../i18n/LanguageContext";
import { getProfile } from "../utils/babyStore";
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
      } catch (err) {
        reject(err);
      }
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
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    autosize: true,
    font: { family: "Inter, sans-serif", size: 13, color: isDark ? "#a8a3b8" : "#5c566b" },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { t: 48, r: 24, b: 56, l: 56 },
    xaxis: {
      gridcolor: isDark ? "rgba(255,255,255,0.06)" : "#f3f0eb",
      zerolinecolor: isDark ? "rgba(255,255,255,0.08)" : "#e8e4dd",
      title: { text: "Days", font: { size: 12, color: isDark ? "#6e6880" : "#5c566b" } },
    },
    yaxis: {
      gridcolor: isDark ? "rgba(255,255,255,0.06)" : "#f3f0eb",
      zerolinecolor: isDark ? "rgba(255,255,255,0.08)" : "#e8e4dd",
    },
    legend: {
      orientation: "h",
      y: -0.18,
      x: 0.5,
      xanchor: "center",
      font: { size: 11, color: isDark ? "#a8a3b8" : "#5c566b" },
    },
  };
}

export default function Evolution({ data, measure, gender, activeProfileId }) {
  const { t } = useLanguage();
  const [babyData, setBabyData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const plotRef = useRef(null);

  const col = MEASURES_INPUT[measure];
  const unit = MEASURES_UNITS[measure];
  const accentColor = gender === "Girls" ? "#ec4899" : "#3b82f6";

  const profile = activeProfileId ? getProfile(activeProfileId) : null;
  const hasHistory = profile && profile.measurements && profile.measurements.length > 0;

  const [dataSource, setDataSource] = useState(() =>
    hasHistory ? "history" : "file"
  );

  // Sync dataSource when profile changes
  useEffect(() => {
    if (hasHistory && !babyData) {
      setDataSource("history");
    } else if (!hasHistory && dataSource === "history") {
      setDataSource("file");
    }
  }, [activeProfileId]);

  // Build baby data from history
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

  // Translate measure and gender
  const getMeasureLabel = () => {
    if (measure === "Weight") return t("measureWeight");
    if (measure === "Height") return t("measureHeight");
    return t("measureHeadCircumference");
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
      const missing = required.filter(
        (c) => !Object.keys(rows[0] || {}).includes(c)
      );
      if (missing.length) {
        setUploadError(t("evoErrorMissing", { cols: missing.join(", ") }));
        setBabyData(null);
        setFileName("");
        return;
      }

      const days = rows.map((r) => r.day);
      const values = linearInterpolate(rows.map((r) => r[col]));
      setBabyData(
        days.map((d, i) => ({ day: d, value: values[i] })).filter((r) => r.value != null)
      );
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
    const days = data.map((r) => r.Day);
    return {
      days,
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

  // Detect significant percentile changes (alerts)
  const alerts = useMemo(() => {
    if (!babyPercentiles || babyPercentiles.length < 2) return [];
    const result = [];
    for (let i = 1; i < babyPercentiles.length; i++) {
      const prev = babyPercentiles[i - 1].percentile;
      const curr = babyPercentiles[i].percentile;
      const diff = curr - prev;
      if (Math.abs(diff) >= 20) {
        result.push({
          type: diff < 0 ? "drop" : "rise",
          prev: prev.toFixed(0),
          current: curr.toFixed(0),
          day: babyPercentiles[i].day,
        });
      }
    }
    return result;
  }, [babyPercentiles]);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const pCurveStyles = {
    P01: { color: isDark ? "#3d3756" : "#d4d0e0", dash: "dot", width: 1 },
    P25: { color: isDark ? "#5c566b" : "#a8a3b8", dash: "dash", width: 1.5 },
    P50: { color: isDark ? "#8f899e" : "#7c7694", width: 2 },
    P75: { color: isDark ? "#5c566b" : "#a8a3b8", dash: "dash", width: 1.5 },
    P99: { color: isDark ? "#3d3756" : "#d4d0e0", dash: "dot", width: 1 },
  };

  const traces = Object.entries(pCurveStyles).map(([key, style]) => ({
    x: percentileCurves.days,
    y: percentileCurves[key],
    name: key,
    type: "scatter",
    mode: "lines",
    line: { ...style, shape: "vh" },
    hovertemplate: `${key}: %{y:.1f} ${unit}<extra></extra>`,
  }));

  if (effectiveData && effectiveData.length > 0) {
    traces.push({
      x: effectiveData.map((r) => r.day),
      y: effectiveData.map((r) => r.value),
      name: profile ? profile.name : t("evoBaby"),
      type: "scatter",
      mode: "lines+markers",
      line: { color: accentColor, width: 2.5 },
      marker: { color: accentColor, size: 5 },
      hovertemplate: `Day %{x}: %{y:.2f} ${unit}<extra></extra>`,
    });
  }

  return (
    <div className="page">
      <SEOHead
        title={t("seoEvolutionTitle")}
        description={t("seoEvolutionDescription")}
        path="/evolution"
      />
      <div className="evolution-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>{t("evoTitle", { measure: getMeasureLabel() })}</h1>
          <p>{t("evoSubtitle", { gender: getGenderLabel() })}</p>
        </div>

        <div className="upload-actions">
          {hasHistory && (
            <div className="data-source-toggle">
              <span className="data-source-label">{t("evoDataSource")}:</span>
              <button
                className={`data-source-btn ${dataSource === "file" ? "active" : ""}`}
                onClick={() => { setDataSource("file"); }}
              >
                {t("evoSourceFile")}
              </button>
              <button
                className={`data-source-btn ${dataSource === "history" ? "active" : ""}`}
                onClick={handleUseHistory}
              >
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
                    {fileName ? (
                      fileName
                    ) : (
                      <>
                        <strong>{t("evoUpload")}</strong> {t("evoUploadHint")}
                      </>
                    )}
                  </span>
                </div>
                {fileName && (
                  <button className="btn-clear" onClick={handleClearData} title="Clear data">
                    &times;
                  </button>
                )}
              </div>
              <button className="btn-template" onClick={downloadTemplate}>
                <DownloadIcon /> {t("evoDownloadTemplate")}
              </button>
            </>
          )}

          {dataSource === "history" && !hasHistory && (
            <div className="evo-no-history">
              <p>{t("evoNoHistory")}</p>
            </div>
          )}
        </div>
      </div>

      {dataSource === "file" && (
        <>
          <button
            className="help-toggle"
            onClick={() => setShowHelp(!showHelp)}
            aria-expanded={showHelp}
          >
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
                  <tr>
                    <td><code>day</code></td>
                    <td>{t("evoHelpDayDesc")}</td>
                    <td>0, 30, 60, 90...</td>
                  </tr>
                  <tr>
                    <td><code>w</code></td>
                    <td>{t("evoHelpWeightDesc")}</td>
                    <td>3.2, 4.5, 5.8...</td>
                  </tr>
                  <tr>
                    <td><code>h</code></td>
                    <td>{t("evoHelpHeightDesc")}</td>
                    <td>50, 54, 58...</td>
                  </tr>
                  <tr>
                    <td><code>hc</code></td>
                    <td>{t("evoHelpHcDesc")}</td>
                    <td>35, 37, 39...</td>
                  </tr>
                </tbody>
              </table>

              <h4>{t("evoHelpExample")}</h4>
              <div className="help-example">
                <table>
                  <thead>
                    <tr><th>day</th><th>w</th><th>h</th><th>hc</th></tr>
                  </thead>
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

      {/* Alerts for significant percentile changes */}
      {alerts.length > 0 && (
        <div className="evo-alerts">
          <div className="evo-alerts-title">
            <AlertTriangleIcon />
            <span>{t("alertDropTitle")}</span>
          </div>
          {alerts.map((a, i) => (
            <div key={i} className={`evo-alert evo-alert-${a.type}`}>
              {a.type === "drop"
                ? t("alertDrop", { measure: getMeasureLabel(), prev: a.prev, current: a.current })
                : t("alertRise", { measure: getMeasureLabel(), prev: a.prev, current: a.current })}
            </div>
          ))}
        </div>
      )}

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
              font: { size: 15, color: document.documentElement.getAttribute("data-theme") === "dark" ? "#f0eef5" : "#1a1625", family: "Inter, sans-serif", weight: 700 },
            },
            yaxis: {
              ...getPlotlyLayoutBase().yaxis,
              title: { text: unit, font: { size: 12, color: document.documentElement.getAttribute("data-theme") === "dark" ? "#6e6880" : "#5c566b" } },
            },
          }}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
          className="plot"
        />
      </div>

      {babyPercentiles && (
        <div className="plot-card">
          <Plot
            data={[
              {
                x: babyPercentiles.map((r) => r.day),
                y: babyPercentiles.map((r) => r.percentile),
                type: "bar",
                marker: {
                  color: babyPercentiles.map((r) =>
                    `${accentColor}${Math.round(40 + (r.percentile / 100) * 60).toString(16).padStart(2, "0")}`
                  ),
                  line: { width: 0 },
                },
                hovertemplate: "Day %{x}: %{y:.1f}%<extra></extra>",
              },
            ]}
            layout={{
              ...getPlotlyLayoutBase(),
              title: {
                text: t("evoChartPercentile"),
                font: { size: 15, color: document.documentElement.getAttribute("data-theme") === "dark" ? "#f0eef5" : "#1a1625", family: "Inter, sans-serif", weight: 700 },
              },
              yaxis: {
                ...getPlotlyLayoutBase().yaxis,
                title: { text: `${getMeasureLabel()} percentile`, font: { size: 12, color: document.documentElement.getAttribute("data-theme") === "dark" ? "#6e6880" : "#5c566b" } },
                range: [0, 105],
              },
              showlegend: false,
            }}
            config={{ displayModeBar: false, responsive: true }}
            useResizeHandler
            className="plot"
          />
        </div>
      )}
    </div>
  );
}
