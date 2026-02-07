import { useEffect } from "react";
import { useLanguage } from "../i18n/LanguageContext";

const BASE_URL = "https://baby-growth-chart.vercel.app";

const LOCALE_MAP = {
  en: "en_US",
  es: "es_ES",
  ca: "ca_ES",
};

function setMetaTag(attr, attrValue, content) {
  let el = document.querySelector(`meta[${attr}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

function setHreflangLinks(path) {
  // Remove existing hreflang links
  document.querySelectorAll('link[hreflang]').forEach((el) => el.remove());

  const langs = ["en", "es", "ca"];
  langs.forEach((lang) => {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", lang);
    link.setAttribute("href", `${BASE_URL}${path}`);
    document.head.appendChild(link);
  });

  // x-default
  const xDefault = document.createElement("link");
  xDefault.setAttribute("rel", "alternate");
  xDefault.setAttribute("hreflang", "x-default");
  xDefault.setAttribute("href", `${BASE_URL}${path}`);
  document.head.appendChild(xDefault);
}

export default function SEOHead({ title, description, path = "/" }) {
  const { language } = useLanguage();

  useEffect(() => {
    const fullUrl = `${BASE_URL}${path}`;
    const locale = LOCALE_MAP[language] || "en_US";

    // Document title
    document.title = title;

    // Primary meta
    setMetaTag("name", "description", description);

    // Open Graph
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", fullUrl);
    setMetaTag("property", "og:locale", locale);

    // Twitter
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);

    // Canonical & hreflang
    setCanonical(fullUrl);
    setHreflangLinks(path);

    // Update html lang attribute
    document.documentElement.lang = language;
  }, [title, description, path, language]);

  return null;
}
