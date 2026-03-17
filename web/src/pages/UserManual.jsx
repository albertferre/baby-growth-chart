import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "../i18n/LanguageContext";
import SEOHead from "../components/SEOHead";

const MANUAL_FILES = {
  en: "user_manual.md",
  es: "user_manual_es.md",
  ca: "user_manual_ca.md",
};

export default function UserManual() {
  const { t, language } = useLanguage();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const file = MANUAL_FILES[language] || MANUAL_FILES.en;
    fetch(`${import.meta.env.BASE_URL}${file}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        // Fallback to English
        if (language !== "en") {
          fetch(`${import.meta.env.BASE_URL}${MANUAL_FILES.en}`)
            .then((res) => res.text())
            .then((text) => { setContent(text); setLoading(false); })
            .catch(() => { setContent(""); setLoading(false); });
        } else {
          setContent("");
          setLoading(false);
        }
      });
  }, [language]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        {t("manualLoading")}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>{t("manualTitle")}</h1>
        </div>
        <div className="warning">
          {t("manualError")}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <SEOHead
        title={t("seoManualTitle")}
        description={t("seoManualDescription")}
        path="/manual"
      />
      <div className="manual-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
