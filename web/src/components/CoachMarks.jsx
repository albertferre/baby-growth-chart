import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

const STORAGE_KEY = "baby-growth-coach-completed";

const STEPS = [
  // Welcome
  {
    target: ".navbar-brand",
    position: "bottom",
    titleKey: "coachWelcomeTitle",
    textKey: "coachWelcomeText",
    route: "/",
  },
  {
    target: ".navbar-nav",
    position: "bottom",
    titleKey: "coachNavTitle",
    textKey: "coachNavText",
    route: "/",
  },
  {
    target: ".language-dropdown",
    position: "bottom-left",
    titleKey: "coachLanguageTitle",
    textKey: "coachLanguageText",
    route: "/",
  },
  // Calculator steps
  {
    target: ".profile-dropdown",
    position: "bottom",
    titleKey: "coachProfileTitle",
    textKey: "coachProfileText",
    route: "/",
  },
  {
    target: ".age-tabs",
    position: "bottom",
    titleKey: "coachAgeInputTitle",
    textKey: "coachAgeInputText",
    route: "/",
  },
  {
    target: ".form-stack",
    position: "right",
    titleKey: "coachMeasurementTitle",
    textKey: "coachMeasurementText",
    route: "/",
  },
  {
    target: ".btn-primary",
    position: "right",
    titleKey: "coachCalculateTitle",
    textKey: "coachCalculateText",
    route: "/",
  },
  {
    target: ".result-card",
    position: "left",
    titleKey: "coachResultTitle",
    textKey: "coachResultText",
    route: "/",
  },
  // Evolution steps
  {
    target: ".plot-card",
    position: "top",
    titleKey: "coachChartTitle",
    textKey: "coachChartText",
    route: "/evolution",
  },
  {
    target: ".btn-register",
    position: "bottom",
    titleKey: "coachRegisterTitle",
    textKey: "coachRegisterText",
    route: "/evolution",
  },
  // Final step
  {
    target: ".navbar-brand",
    position: "bottom",
    titleKey: "coachDisclaimerTitle",
    textKey: "coachDisclaimerText",
    route: "/",
  },
];

function getElementPosition(selector) {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
    rect,
  };
}

export default function CoachMarks() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetPos, setTargetPos] = useState(null);

  // Compute if we need to navigate to a different route
  const step = STEPS[currentStep];
  const needsNavigation = step && step.route && location.pathname !== step.route;

  // Check if coach marks should be shown
  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        // Small delay to let the page render
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Skip steps that require a different route instead of forcing navigation
  useEffect(() => {
    if (!isVisible || !needsNavigation) return;
    // Auto-skip to next step instead of hijacking navigation
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, isVisible, needsNavigation]);

  // Update target position when step changes or after navigation
  useEffect(() => {
    if (!isVisible || needsNavigation) return;

    const updatePosition = () => {
      const pos = getElementPosition(STEPS[currentStep].target);
      if (pos) {
        setTargetPos(pos);
      } else {
        setTargetPos(null);
      }
    };

    // Wait a bit for the DOM to update after navigation
    const timer = setTimeout(updatePosition, 100);

    window.addEventListener("resize", updatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
    };
  }, [currentStep, isVisible, location.pathname, needsNavigation]);

  // Retry finding element if not found initially
  useEffect(() => {
    if (!isVisible || targetPos || needsNavigation) return;

    const retryTimer = setInterval(() => {
      const pos = getElementPosition(STEPS[currentStep].target);
      if (pos) {
        setTargetPos(pos);
      }
    }, 200);

    // Give up after 2 seconds
    const timeout = setTimeout(() => {
      clearInterval(retryTimer);
    }, 2000);

    return () => {
      clearInterval(retryTimer);
      clearTimeout(timeout);
    };
  }, [isVisible, targetPos, needsNavigation, currentStep]);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore storage errors
    }
    // Navigate back to home
    navigate("/");
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  if (!isVisible || needsNavigation) return null;

  const { position, titleKey, textKey } = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Calculate tooltip position
  let tooltipStyle = {};
  if (targetPos) {
    const gap = 12;
    switch (position) {
      case "right":
        tooltipStyle = {
          top: targetPos.top + targetPos.height / 2,
          left: targetPos.left + targetPos.width + gap,
          transform: "translateY(-50%)",
        };
        break;
      case "left":
        tooltipStyle = {
          top: targetPos.top + targetPos.height / 2,
          right: window.innerWidth - targetPos.left + gap,
          transform: "translateY(-50%)",
        };
        break;
      case "bottom":
        tooltipStyle = {
          top: targetPos.top + targetPos.height + gap,
          left: targetPos.left + targetPos.width / 2,
          transform: "translateX(-50%)",
        };
        break;
      case "bottom-left":
        tooltipStyle = {
          top: targetPos.top + targetPos.height + gap,
          right: window.innerWidth - targetPos.left - targetPos.width,
        };
        break;
      case "top":
        tooltipStyle = {
          bottom: window.innerHeight - targetPos.rect.top + gap,
          left: targetPos.left + targetPos.width / 2,
          transform: "translateX(-50%)",
        };
        break;
      default:
        tooltipStyle = {
          top: targetPos.top + targetPos.height + gap,
          left: targetPos.left,
        };
    }
  }

  return (
    <div className="coach-overlay">
      {/* Semi-transparent backdrop with spotlight */}
      <svg className="coach-backdrop" width="100%" height="100%" onClick={handleComplete}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetPos && (
              <rect
                x={targetPos.rect.left - 8}
                y={targetPos.rect.top - 8}
                width={targetPos.width + 16}
                height={targetPos.height + 16}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#spotlight-mask)" />
      </svg>

      {/* Spotlight border */}
      {targetPos && (
        <div
          className="coach-spotlight"
          style={{
            top: targetPos.rect.top - 4,
            left: targetPos.rect.left - 4,
            width: targetPos.width + 8,
            height: targetPos.height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      {targetPos && (
        <div className={`coach-tooltip coach-tooltip-${position}`} style={{ ...tooltipStyle, maxWidth: 320 }}>
          <div className="coach-tooltip-header">
            <h3>{t(titleKey)}</h3>
            <span className="coach-step-indicator">{currentStep + 1}/{STEPS.length}</span>
          </div>
          <p>{t(textKey)}</p>
          <div className="coach-tooltip-actions">
            <button className="coach-btn-skip" onClick={handleComplete}>
              {t("coachSkip")}
            </button>
            <div className="coach-btn-group">
              {currentStep > 0 && (
                <button className="coach-btn-prev" onClick={handlePrev}>
                  {t("coachPrev")}
                </button>
              )}
              <button className="coach-btn-next" onClick={handleNext}>
                {currentStep === STEPS.length - 1 ? t("coachFinish") : t("coachNext")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
