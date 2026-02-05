import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { loadData } from "./utils/data";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";
import { LANGUAGES } from "./i18n/translations";
import Calculator from "./pages/Calculator";
import Evolution from "./pages/Evolution";
import UserManual from "./pages/UserManual";
import CoachMarks from "./components/CoachMarks";
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

function MedicalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const [measure, setMeasure] = useState("Weight");
  const [gender, setGender] = useState("Boys");
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    loadData(gender, measure).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [gender, measure]);

  // Translate measure and gender for display
  const getMeasureLabel = (m) => {
    if (m === "Weight") return t("measureWeight");
    if (m === "Height") return t("measureHeight");
    return t("measureHeadCircumference");
  };

  const getGenderLabel = (g) => {
    return g === "Boys" ? t("genderBoys") : t("genderGirls");
  };

  return (
    <div className="layout">
      <CoachMarks />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 4-6" />
            </svg>
          </div>
          <h2>{t("appTitle")}</h2>
        </div>

        <nav>
          <NavLink to="/">
            <span className="nav-icon"><CalculatorIcon /></span>
            {t("navCalculator")}
          </NavLink>
          <NavLink to="/evolution">
            <span className="nav-icon"><ChartIcon /></span>
            {t("navEvolution")}
          </NavLink>
          <NavLink to="/manual">
            <span className="nav-icon"><BookIcon /></span>
            {t("navManual")}
          </NavLink>
        </nav>

        <div className="sidebar-section">
          <span className="sidebar-section-label">{t("labelMetric")}</span>
          <select value={measure} onChange={(e) => setMeasure(e.target.value)}>
            {MEASURES.map((m) => (
              <option key={m} value={m}>{getMeasureLabel(m)}</option>
            ))}
          </select>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-section-label">{t("labelGender")}</span>
          <div className="gender-toggle">
            {GENDERS.map((g) => (
              <button
                key={g}
                className={gender === g ? `active-${g.toLowerCase()}` : ""}
                onClick={() => setGender(g)}
              >
                {getGenderLabel(g)}
              </button>
            ))}
          </div>
        </div>

        <div className="medical-disclaimer">
          <div className="medical-disclaimer-icon">
            <MedicalIcon />
          </div>
          <div className="medical-disclaimer-content">
            <strong>{t("medicalDisclaimerTitle")}</strong>
            <p>{t("medicalDisclaimerText")}</p>
          </div>
        </div>

        <div className="data-source">
          {t("dataSource")}{" "}
          <a
            href="https://www.who.int/tools/child-growth-standards/standards"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("dataSourceLink")}
          </a>
        </div>
      </aside>

      <main className="content">
        <div className="language-switcher">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`language-btn ${language === lang.code ? "active" : ""}`}
              onClick={() => setLanguage(lang.code)}
              title={lang.name}
            >
              <span className="language-flag">{lang.flag}</span>
              <span className="language-code">{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
        {data ? (
          <Routes>
            <Route
              path="/"
              element={<Calculator data={data} measure={measure} gender={gender} />}
            />
            <Route
              path="/evolution"
              element={
                <Evolution data={data} measure={measure} gender={gender} />
              }
            />
            <Route path="/manual" element={<UserManual />} />
          </Routes>
        ) : (
          <div className="loading">
            <div className="loading-spinner" />
            {t("loading")}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}
