import { useState, useMemo } from "react";
import Plot from "react-plotly.js";
import { getPercentile } from "../utils/percentile";
import { MEASURES_UNITS, MEASURES_INPUT } from "../utils/data";
import { useLanguage } from "../i18n/LanguageContext";

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

const PLOTLY_LAYOUT_BASE = {
  autosize: true,
  font: { family: "Inter, sans-serif", size: 13 },
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  margin: { t: 48, r: 24, b: 56, l: 56 },
  xaxis: {
    gridcolor: "#f1f5f9",
    zerolinecolor: "#e2e8f0",
    title: { text: "Days", font: { size: 12, color: "#64748b" } },
  },
  yaxis: {
    gridcolor: "#f1f5f9",
    zerolinecolor: "#e2e8f0",
  },
  legend: {
    orientation: "h",
    y: -0.18,
    x: 0.5,
    xanchor: "center",
    font: { size: 11 },
  },
};

export default function Evolution({ data, measure, gender }) {
  const { t } = useLanguage();
  const [babyData, setBabyData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const col = MEASURES_INPUT[measure];
  const unit = MEASURES_UNITS[measure];
  const accentColor = gender === "Girls" ? "#ec4899" : "#3b82f6";

  // Translate measure and gender
  const getMeasureLabel = () => {
    if (measure === "Weight") return t("measureWeight");
    if (measure === "Height") return t("measureHeight");
    return t("measureHeadCircumference");
  };

  const getGenderLabel = () => {
    return gender === "Boys" ? t("genderBoys").toLowerCase() : t("genderGirls").toLowerCase();
  };

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");

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
    if (!babyData) return null;
    return babyData
      .filter((r) => r.day >= 0 && r.day < data.length)
      .map((r) => ({
        day: r.day,
        percentile: getPercentile(r.value, data[r.day]),
      }));
  }, [babyData, data]);

  const pCurveStyles = {
    P01: { color: "#cbd5e1", dash: "dot", width: 1 },
    P25: { color: "#94a3b8", dash: "dash", width: 1.5 },
    P50: { color: "#64748b", width: 2 },
    P75: { color: "#94a3b8", dash: "dash", width: 1.5 },
    P99: { color: "#cbd5e1", dash: "dot", width: 1 },
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

  if (babyData) {
    traces.push({
      x: babyData.map((r) => r.day),
      y: babyData.map((r) => r.value),
      name: t("evoBaby"),
      type: "scatter",
      mode: "lines+markers",
      line: { color: accentColor, width: 2.5 },
      marker: { color: accentColor, size: 5 },
      hovertemplate: `Day %{x}: %{y:.2f} ${unit}<extra></extra>`,
    });
  }

  return (
    <div className="page">
      <div className="evolution-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>{t("evoTitle", { measure: getMeasureLabel() })}</h1>
          <p>{t("evoSubtitle", { gender: getGenderLabel() })}</p>
        </div>

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
      </div>

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

      {uploadError && (
        <div className="warning" style={{ marginBottom: "1rem" }}>
          <WarningIcon />
          {uploadError}
        </div>
      )}

      <div className="plot-card">
        <Plot
          data={traces}
          layout={{
            ...PLOTLY_LAYOUT_BASE,
            title: {
              text: t("evoChartTitle", { measure: getMeasureLabel(), gender: gender === "Boys" ? t("genderBoys") : t("genderGirls") }),
              font: { size: 15, color: "#1e293b", family: "Inter, sans-serif" },
            },
            yaxis: {
              ...PLOTLY_LAYOUT_BASE.yaxis,
              title: { text: unit, font: { size: 12, color: "#64748b" } },
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
              ...PLOTLY_LAYOUT_BASE,
              title: {
                text: t("evoChartPercentile"),
                font: { size: 15, color: "#1e293b", family: "Inter, sans-serif" },
              },
              yaxis: {
                ...PLOTLY_LAYOUT_BASE.yaxis,
                title: { text: `${getMeasureLabel()} percentile`, font: { size: 12, color: "#64748b" } },
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
