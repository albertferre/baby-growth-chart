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

function RulerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" />
      <path d="m11.5 9.5 2-2" />
      <path d="m8.5 6.5 2-2" />
      <path d="m17.5 15.5 2-2" />
    </svg>
  );
}

function GenderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="8" r="5" />
      <path d="M2 21a8 8 0 0 1 13.292-6" />
      <circle cx="19" cy="19" r="3" />
      <path d="m22 22-1.5-1.5" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function AppContent() {
  const { t, language, setLanguage } = useLanguage();
  const [measure, setMeasure] = useState("Weight");
  const [gender, setGender] = useState("Boys");
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("baby-growth-theme") || "light";
    } catch {
      return "light";
    }
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("baby-growth-theme", theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

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
      <a href="#main-content" className="skip-link">{t("skipToContent")}</a>
      <CoachMarks />
      <aside className="sidebar" role="complementary" aria-label={t("sidebarLabel")}>
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

        <div className="sidebar-settings">
          <div className="sidebar-settings-header">
            <span>{t("labelSettings")}</span>
          </div>
          <div className="sidebar-settings-content">
            <div className="sidebar-section" data-coach="metric">
              <span className="sidebar-section-label"><RulerIcon /> {t("labelMetric")}</span>
              <div className="metric-toggle">
                {MEASURES.map((m) => (
                  <button
                    key={m}
                    className={measure === m ? "active" : ""}
                    onClick={() => setMeasure(m)}
                  >
                    {getMeasureLabel(m)}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <span className="sidebar-section-label"><GenderIcon /> {t("labelGender")}</span>
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

        <div className="github-signature">
          <a
            href="https://github.com/albertferre"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GitHubIcon />
            <span>made by ants albertferre</span>
          </a>
        </div>
      </aside>

      <main id="main-content" className="content" role="main">
        <div className="top-controls">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "light" ? t("switchToDark") : t("switchToLight")}
            title={theme === "light" ? t("switchToDark") : t("switchToLight")}
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
          <nav className="language-switcher" aria-label={t("languageSwitcherLabel")}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`language-btn ${language === lang.code ? "active" : ""}`}
                onClick={() => setLanguage(lang.code)}
                title={lang.name}
                aria-label={lang.name}
                aria-pressed={language === lang.code}
              >
                <span className="language-flag" aria-hidden="true">{lang.flag}</span>
                <span className="language-code">{lang.code.toUpperCase()}</span>
              </button>
            ))}
          </nav>
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
