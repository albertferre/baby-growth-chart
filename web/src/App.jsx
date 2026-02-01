import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { loadData } from "./utils/data";
import Calculator from "./pages/Calculator";
import Evolution from "./pages/Evolution";
import UserManual from "./pages/UserManual";
import "./App.css";

const MEASURES = ["Weight", "Height", "Head Circumference"];
const GENDERS = ["Boys", "Girls"];

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15z" />
    </svg>
  );
}

function CalculatorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8" y2="10.01" />
      <line x1="12" y1="10" x2="12" y2="10.01" />
      <line x1="16" y1="10" x2="16" y2="10.01" />
      <line x1="8" y1="14" x2="8" y2="14.01" />
      <line x1="12" y1="14" x2="12" y2="14.01" />
      <line x1="16" y1="14" x2="16" y2="14.01" />
      <line x1="8" y1="18" x2="16" y2="18" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 4-6" />
    </svg>
  );
}

export default function App() {
  const [measure, setMeasure] = useState("Weight");
  const [gender, setGender] = useState("Boys");
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    loadData(gender, measure).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [gender, measure]);

  return (
    <BrowserRouter>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="M7 16l4-8 4 4 4-6" />
              </svg>
            </div>
            <h2>Baby Growth Chart</h2>
          </div>

          <nav>
            <NavLink to="/">
              <span className="nav-icon"><BookIcon /></span>
              User Manual
            </NavLink>
            <NavLink to="/calculator">
              <span className="nav-icon"><CalculatorIcon /></span>
              Calculator
            </NavLink>
            <NavLink to="/evolution">
              <span className="nav-icon"><ChartIcon /></span>
              Evolution
            </NavLink>
          </nav>

          <div className="sidebar-section">
            <span className="sidebar-section-label">Metric</span>
            <select value={measure} onChange={(e) => setMeasure(e.target.value)}>
              {MEASURES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-label">Gender</span>
            <div className="gender-toggle">
              {GENDERS.map((g) => (
                <button
                  key={g}
                  className={gender === g ? `active-${g.toLowerCase()}` : ""}
                  onClick={() => setGender(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="content">
          {data ? (
            <Routes>
              <Route path="/" element={<UserManual />} />
              <Route
                path="/calculator"
                element={<Calculator data={data} measure={measure} gender={gender} />}
              />
              <Route
                path="/evolution"
                element={
                  <Evolution data={data} measure={measure} gender={gender} />
                }
              />
            </Routes>
          ) : (
            <div className="loading">
              <div className="loading-spinner" />
              Loading data...
            </div>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}
