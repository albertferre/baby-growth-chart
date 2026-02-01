import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function UserManual() {
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
        setContent("Failed to load user manual.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        Loading manual...
      </div>
    );
  }

  return (
    <div className="page">
      <div className="manual-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
