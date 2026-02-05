import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

const STORAGE_KEY = "baby-growth-coach-completed";

const STEPS = [
  // Sidebar steps
  {
    target: ".sidebar-brand",
    position: "right",
    titleKey: "coachWelcomeTitle",
    textKey: "coachWelcomeText",
    route: "/",
  },
  {
    target: ".sidebar nav",
    position: "right",
    titleKey: "coachNavTitle",
    textKey: "coachNavText",
    route: "/",
  },
  {
    target: "[data-coach='metric']",
    position: "right",
    titleKey: "coachMetricTitle",
    textKey: "coachMetricText",
    route: "/",
  },
  {
    target: ".gender-toggle",
    position: "right",
    titleKey: "coachGenderTitle",
    textKey: "coachGenderText",
    route: "/",
  },
  {
    target: ".language-switcher",
    position: "bottom-left",
    titleKey: "coachLanguageTitle",
    textKey: "coachLanguageText",
    route: "/",
  },
  // Calculator steps
  {
    target: ".age-mode-toggle",
    position: "bottom",
    titleKey: "coachAgeInputTitle",
    textKey: "coachAgeInputText",
    route: "/",
  },
  {
    target: "#measurement",
    position: "bottom",
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
    target: ".dropzone",
    position: "bottom",
    titleKey: "coachUploadTitle",
    textKey: "coachUploadText",
    route: "/evolution",
  },
  {
    target: ".help-toggle",
    position: "right",
    titleKey: "coachHelpTitle",
    textKey: "coachHelpText",
    route: "/evolution",
  },
  {
    target: ".plot-card",
    position: "top",
    titleKey: "coachChartTitle",
    textKey: "coachChartText",
    route: "/evolution",
  },
  // Final step
  {
    target: ".medical-disclaimer",
    position: "right",
    titleKey: "coachDisclaimerTitle",
    textKey: "coachDisclaimerText",
    route: "/evolution",
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

  // Navigate to the correct route for current step
  useEffect(() => {
    if (!isVisible || !needsNavigation) return;
    navigate(step.route);
  }, [currentStep, isVisible, needsNavigation, navigate, step?.route]);

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

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  if (!isVisible) return null;

  // Show loading state while waiting for navigation or element
  if (!targetPos || needsNavigation) {
    return (
      <div className="coach-overlay">
        <div className="coach-backdrop-loading" />
      </div>
    );
  }

  const padding = 8;

  // Calculate tooltip position
  let tooltipStyle = {};
  const tooltipOffset = 16;

  switch (step.position) {
    case "right":
      tooltipStyle = {
        top: targetPos.rect.top + targetPos.height / 2,
        left: targetPos.rect.right + tooltipOffset,
        transform: "translateY(-50%)",
      };
      break;
    case "left":
      tooltipStyle = {
        top: targetPos.rect.top + targetPos.height / 2,
        right: window.innerWidth - targetPos.rect.left + tooltipOffset,
        transform: "translateY(-50%)",
      };
      break;
    case "bottom":
      tooltipStyle = {
        top: targetPos.rect.bottom + tooltipOffset,
        left: targetPos.rect.left + targetPos.width / 2,
        transform: "translateX(-50%)",
      };
      break;
    case "top":
      tooltipStyle = {
        bottom: window.innerHeight - targetPos.rect.top + tooltipOffset,
        left: targetPos.rect.left + targetPos.width / 2,
        transform: "translateX(-50%)",
      };
      break;
    case "bottom-left":
      tooltipStyle = {
        top: targetPos.rect.bottom + tooltipOffset,
        right: window.innerWidth - targetPos.rect.right,
      };
      break;
    default:
      tooltipStyle = {
        top: targetPos.rect.bottom + tooltipOffset,
        left: targetPos.rect.left,
      };
  }

  return (
    <div className="coach-overlay">
      {/* Dark overlay with spotlight hole */}
      <svg className="coach-backdrop" width="100%" height="100%">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={targetPos.rect.left - padding}
              y={targetPos.rect.top - padding}
              width={targetPos.width + padding * 2}
              height={targetPos.height + padding * 2}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border */}
      <div
        className="coach-spotlight"
        style={{
          top: targetPos.rect.top - padding,
          left: targetPos.rect.left - padding,
          width: targetPos.width + padding * 2,
          height: targetPos.height + padding * 2,
        }}
      />

      {/* Tooltip */}
      <div
        className={`coach-tooltip coach-tooltip-${step.position}`}
        style={{ ...tooltipStyle, maxWidth: 320 }}
      >
        <div className="coach-tooltip-header">
          <h3>{t(step.titleKey)}</h3>
          <span className="coach-step-indicator">
            {currentStep + 1} / {STEPS.length}
          </span>
        </div>
        <p>{t(step.textKey)}</p>
        <div className="coach-tooltip-actions">
          <button className="coach-btn-skip" onClick={handleSkip}>
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
    </div>
  );
}
