import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { loadData } from "./utils/data";
import { LanguageProvider, useLanguage } from "./i18n/LanguageContext";
import { LANGUAGES } from "./i18n/translations";
import { getProfiles, createProfile, deleteProfile, getActiveProfileId, setActiveProfileId, getProfile, updateProfile } from "./utils/babyStore";
import Calculator from "./pages/Calculator";
import Evolution from "./pages/Evolution";
import UserManual from "./pages/UserManual";
import CoachMarks from "./components/CoachMarks";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";

const MEASURES = ["Weight", "Height", "Head Circumference"];
const GENDERS = ["Boys", "Girls"];

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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
  const location = useLocation();
  const isCalculator = location.pathname === "/";
  const isManual = location.pathname === "/manual";
  const isEvolution = location.pathname === "/evolution";
  const [measure, setMeasure] = useState("Weight");
  const [gender, setGender] = useState("Boys");
  const [data, setData] = useState(null);
  const [allData, setAllData] = useState(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profiles, setProfiles] = useState(() => getProfiles());
  const [activeProfileId, setActiveProfile] = useState(() => getActiveProfileId());
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileGender, setNewProfileGender] = useState("Boys");
  const [editingProfile, setEditingProfile] = useState(null);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState("Boys");

  const refreshProfiles = useCallback(() => {
    setProfiles(getProfiles());
  }, []);

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    const p = createProfile(newProfileName.trim(), newProfileGender);
    setActiveProfile(p.id);
    setActiveProfileId(p.id);
    setGender(newProfileGender);
    setNewProfileName("");
    setNewProfileGender("Boys");
    setShowProfileForm(false);
    refreshProfiles();
  };

  const handleDeleteProfile = (id) => {
    const p = getProfile(id);
    if (p && window.confirm(t("profileDeleteConfirm", { name: p.name }))) {
      deleteProfile(id);
      if (activeProfileId === id) {
        const remaining = getProfiles();
        const newId = remaining.length > 0 ? remaining[0].id : null;
        setActiveProfile(newId);
        setActiveProfileId(newId);
      }
      refreshProfiles();
    }
  };

  const handleOpenEditProfile = (p) => {
    setEditingProfile(p);
    setEditName(p.name);
    setEditGender(p.gender || "Boys");
    setProfileMenuOpen(false);
  };

  const handleSaveEditProfile = () => {
    if (!editingProfile || !editName.trim()) return;
    updateProfile(editingProfile.id, { name: editName.trim(), gender: editGender });
    if (activeProfileId === editingProfile.id) {
      setGender(editGender);
    }
    setEditingProfile(null);
    refreshProfiles();
  };

  const handleSelectProfile = (id) => {
    setActiveProfile(id);
    setActiveProfileId(id);
    const p = getProfile(id);
    if (p && p.gender) setGender(p.gender);
    setProfileMenuOpen(false);
  };

  useEffect(() => {
    let cancelled = false;
    loadData(gender, measure).then((d) => {
      if (!cancelled) setData(d);
    });
    return () => { cancelled = true; };
  }, [gender, measure]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadData(gender, "Weight"),
      loadData(gender, "Height"),
      loadData(gender, "Head Circumference"),
    ]).then(([weightData, heightData, hcData]) => {
      if (!cancelled) setAllData({ Weight: weightData, Height: heightData, "Head Circumference": hcData });
    });
    return () => { cancelled = true; };
  }, [gender]);

  const getMeasureLabel = (m) => {
    if (m === "Weight") return t("measureWeight");
    if (m === "Height") return t("measureHeight");
    return t("measureHeadCircumference");
  };

  const getGenderLabel = (g) => {
    return g === "Boys" ? t("genderBoys") : t("genderGirls");
  };

  const activeProfile = activeProfileId ? getProfile(activeProfileId) : null;
  const profileInitial = activeProfile ? activeProfile.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="layout">
      <a href="#main-content" className="skip-link">{t("skipToContent")}</a>
      <CoachMarks />

      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="top-navbar-inner">
          <div className="navbar-left">
            <span className="navbar-brand">{t("appTitle")}</span>
            <nav className="navbar-nav">
              <NavLink to="/">{t("navCalculator")}</NavLink>
              <NavLink to="/evolution">{t("navEvolution")}</NavLink>
              <NavLink to="/manual">{t("navManual")}</NavLink>
            </nav>
          </div>

          <div className="navbar-right">
            {/* Profile switcher */}
            <div className="profile-dropdown">
              <button className="profile-chip" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
                <div className="profile-chip-avatar">{profileInitial}</div>
                <div className="profile-chip-info">
                  <span className="profile-chip-name">{activeProfile ? activeProfile.name : t("profileLabel")}</span>
                  {activeProfile && (
                    <span className="profile-chip-detail">
                      {activeProfile.birthDate
                        ? (() => {
                            const days = Math.floor((new Date() - new Date(activeProfile.birthDate + "T00:00:00")) / (1000 * 60 * 60 * 24));
                            const months = Math.floor(days / 30.5);
                            return months < 24 ? `${months}m` : `${Math.floor(months / 12)}y`;
                          })()
                        : t("profileMeasurements", { count: activeProfile.measurements?.length || 0 })
                      }
                    </span>
                  )}
                </div>
                <span className="material-symbols-outlined profile-chip-arrow" style={{ fontSize: "1rem" }}>expand_more</span>
              </button>

              {profileMenuOpen && (
                <>
                  <div className="profile-dropdown-backdrop" onClick={() => setProfileMenuOpen(false)} />
                  <div className="profile-dropdown-menu">
                    {profiles.map((p) => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center" }}>
                        <button
                          className={`profile-dropdown-item ${activeProfileId === p.id ? "active" : ""}`}
                          onClick={() => handleSelectProfile(p.id)}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "0.875rem", color: p.gender === "Girls" ? "var(--error)" : "var(--primary)" }}>
                              {p.gender === "Girls" ? "female" : "male"}
                            </span>
                            {p.name}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--on-surface-variant)" }}>
                            {p.measurements?.length || 0}
                          </span>
                        </button>
                        <button
                          className="profile-dropdown-item-delete"
                          onClick={(e) => { e.stopPropagation(); handleOpenEditProfile(p); }}
                          title={t("profileEdit")}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>edit</span>
                        </button>
                        <button
                          className="profile-dropdown-item-delete"
                          onClick={(e) => { e.stopPropagation(); handleDeleteProfile(p.id); }}
                          title={t("profileDelete")}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>delete</span>
                        </button>
                      </div>
                    ))}
                    <button className="profile-dropdown-add" onClick={() => { setShowProfileForm(true); setProfileMenuOpen(false); }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>add</span>
                      {t("profileAdd")}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Language dropdown */}
            <div className="language-dropdown" aria-label={t("languageSwitcherLabel")}>
              <button
                className="language-dropdown-trigger"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-expanded={langMenuOpen}
                aria-haspopup="listbox"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>translate</span>
                <span className="language-current">
                  {LANGUAGES.find((l) => l.code === language)?.flag}
                </span>
              </button>
              {langMenuOpen && (
                <>
                  <div className="language-dropdown-backdrop" onClick={() => setLangMenuOpen(false)} />
                  <ul className="language-dropdown-menu" role="listbox">
                    {LANGUAGES.map((lang) => (
                      <li key={lang.code}>
                        <button
                          className={`language-dropdown-item ${language === lang.code ? "active" : ""}`}
                          onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }}
                          role="option"
                          aria-selected={language === lang.code}
                        >
                          <span className="language-flag" aria-hidden="true">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/">
          <span className="material-symbols-outlined">calculate</span>
          <span>{t("navCalculator")}</span>
        </NavLink>
        <NavLink to="/evolution">
          <span className="material-symbols-outlined">query_stats</span>
          <span>{t("navEvolution")}</span>
        </NavLink>
        <NavLink to="/manual">
          <span className="material-symbols-outlined">menu_book</span>
          <span>{t("navManual")}</span>
        </NavLink>
      </nav>

      <main id="main-content" className="content" role="main">
        {/* Settings bar */}
        {!isManual && (
          <div className="settings-bar">
            {isEvolution && (
              <div className="settings-toggle" data-coach="metric">
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
            )}
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={allData ? <Calculator allData={allData} gender={gender} onGenderChange={setGender} activeProfileId={activeProfileId} onProfileUpdated={refreshProfiles} onRequestCreateProfile={() => setShowProfileForm(true)} /> : <div className="loading"><div className="loading-spinner" />{t("loading")}</div>}
          />
          <Route
            path="/evolution"
            element={data ? <Evolution data={data} measure={measure} gender={gender} activeProfileId={activeProfileId} onProfileUpdated={refreshProfiles} onRequestCreateProfile={() => setShowProfileForm(true)} /> : <div className="loading"><div className="loading-spinner" />{t("loading")}</div>}
          />
          <Route path="/manual" element={<UserManual />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footer-inner">
          <div className="app-footer-brand">
            <span className="navbar-brand">{t("appTitle")}</span>
            <p>{t("medicalDisclaimerText")}</p>
          </div>
          <div className="app-footer-links">
            <div className="app-footer-links-section">
              <span className="app-footer-links-title">Platform</span>
              <a href="https://www.who.int/tools/child-growth-standards/standards" target="_blank" rel="noopener noreferrer">{t("dataSourceLink")}</a>
              <a href="https://www.aap.org/en/practice-management/bright-futures/bright-futures-in-clinical-practice/" target="_blank" rel="noopener noreferrer">AAP Bright Futures</a>
              <a href="https://www.who.int/health-topics/complementary-feeding" target="_blank" rel="noopener noreferrer">WHO Infant Feeding</a>
              <a href="https://www.who.int/publications/i/item/9241594233" target="_blank" rel="noopener noreferrer">WHO Motor Development Study</a>
              <a href="https://github.com/albertferre" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
            <div className="app-footer-links-section">
              <span className="app-footer-links-title">Support</span>
              <a href="/manual">{t("navManual")}</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Profile creation modal */}
      {showProfileForm && (
        <div className="modal-backdrop" onClick={() => { setShowProfileForm(false); setNewProfileName(""); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("profileAdd")}</h3>
            <input
              type="text"
              className="profile-form-input"
              placeholder={t("profileNamePlaceholder")}
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProfile()}
              autoFocus
            />
            <div className="settings-toggle" style={{ marginTop: "0.75rem", alignSelf: "center" }}>
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={newProfileGender === g ? "active" : ""}
                  onClick={() => setNewProfileGender(g)}
                >
                  {g === "Boys" ? t("genderBoy") : t("genderGirl")}
                </button>
              ))}
            </div>
            <div className="profile-form-actions">
              <button className="profile-form-btn create" onClick={handleCreateProfile}>
                {t("profileCreate")}
              </button>
              <button className="profile-form-btn cancel" onClick={() => { setShowProfileForm(false); setNewProfileName(""); }}>
                {t("profileCancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile edit modal */}
      {editingProfile && (
        <div className="modal-backdrop" onClick={() => setEditingProfile(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t("profileEdit")}</h3>
            <input
              type="text"
              className="profile-form-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveEditProfile()}
              autoFocus
            />
            <div className="settings-toggle" style={{ marginTop: "0.75rem", alignSelf: "center" }}>
              {GENDERS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={editGender === g ? "active" : ""}
                  onClick={() => setEditGender(g)}
                >
                  {g === "Boys" ? t("genderBoy") : t("genderGirl")}
                </button>
              ))}
            </div>
            <div className="profile-form-actions">
              <button className="profile-form-btn create" onClick={handleSaveEditProfile}>
                {t("profileSave")}
              </button>
              <button className="profile-form-btn cancel" onClick={() => setEditingProfile(null)}>
                {t("profileCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Analytics />
      <SpeedInsights />
    </LanguageProvider>
  );
}
