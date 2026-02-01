import { useState } from "react";
import { getPercentile } from "../utils/percentile";
import { MEASURES_UNITS } from "../utils/data";

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
    <svg className="warning-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function Calculator({ data, measure, gender }) {
  const [birthDate, setBirthDate] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState(null);
  const [warning, setWarning] = useState("");

  function handleCalculate(e) {
    e.preventDefault();
    setResult(null);
    setWarning("");

    if (!birthDate) {
      setWarning("Please select a birth date.");
      return;
    }

    const birth = new Date(birthDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (birth > today) {
      setWarning("The birth date cannot be in the future.");
      return;
    }

    const numValue = parseFloat(value);
    if (!value || numValue <= 0) {
      setWarning("Please enter a positive value for the measurement.");
      return;
    }

    const days = Math.floor((today - birth) / (1000 * 60 * 60 * 24));

    if (days < 0 || days >= data.length) {
      setWarning(
        "The age exceeds the supported range (0\u20135 years). Cannot calculate percentile."
      );
      return;
    }

    const dayData = data[days];
    const percentile = getPercentile(numValue, dayData);
    const months = (days / 30.5).toFixed(1);

    setResult({ days, months, percentile: percentile.toFixed(1) });
  }

  const unit = MEASURES_UNITS[measure];
  const pNum = result ? parseFloat(result.percentile) : 0;
  const pColor = result ? getPercentileColor(pNum, gender) : "#ccc";

  return (
    <div className="page">
      <div className="page-header">
        <h1>Percentile Calculator</h1>
        <p>Enter birth date and measurement to calculate the growth percentile</p>
      </div>

      <div className="calculator-layout">
        <div className="card">
          <form onSubmit={handleCalculate} className="calculator-form">
            <div className="form-group">
              <label className="form-label" htmlFor="birthdate">Birth date</label>
              <input
                id="birthdate"
                className="form-input"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="measurement">
                {measure} ({unit})
              </label>
              <input
                id="measurement"
                className="form-input"
                type="number"
                step="any"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`e.g. ${measure === "Weight" ? "7.5" : measure === "Height" ? "68" : "43"}`}
              />
            </div>

            <button type="submit" className="btn-primary">
              Calculate
            </button>
          </form>

          {warning && (
            <div className="warning" style={{ marginTop: "1.25rem" }}>
              <WarningIcon />
              {warning}
            </div>
          )}
        </div>

        <div className="card result-card">
          {result ? (
            <>
              <div className="percentile-display">
                <span className="percentile-number" style={{ color: pColor }}>
                  {result.percentile}%
                </span>
                <span className="percentile-label">percentile</span>

                <div className="percentile-bar">
                  <div
                    className="percentile-bar-fill"
                    style={{
                      width: `${pNum}%`,
                      background: `linear-gradient(90deg, ${pColor}33, ${pColor})`,
                    }}
                  />
                  <div
                    className="percentile-bar-marker"
                    style={{ left: `${pNum}%`, background: pColor }}
                  />
                </div>
                <div className="percentile-range">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1.5rem" }}>
                <div className="result-stat">
                  <span className="result-stat-label">Age</span>
                  <span className="result-stat-value">{result.months} months</span>
                </div>
                <div className="result-stat">
                  <span className="result-stat-label">Days</span>
                  <span className="result-stat-value">{result.days}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="result-empty">
              Enter data and press Calculate
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
