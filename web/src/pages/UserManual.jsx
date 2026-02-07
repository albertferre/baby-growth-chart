import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "../i18n/LanguageContext";
import SEOHead from "../components/SEOHead";

export default function UserManual() {
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}user_manual.md`)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch(() => {
        setContent("");
        setLoading(false);
      });
  }, []);

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
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
