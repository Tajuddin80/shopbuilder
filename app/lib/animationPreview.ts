import type { CSSProperties } from "react";
import type { AnimationSettings } from "./pageSchema";

const PREVIEW_ANIMATION_MAP: Record<AnimationSettings["type"], string> = {
  none: "",
  fadeIn: "pb-fade-in",
  fadeInUp: "pb-fade-in-up",
  fadeInDown: "pb-fade-in-down",
  slideInLeft: "pb-slide-in-left",
  slideInRight: "pb-slide-in-right",
  zoomIn: "pb-zoom-in",
};

export const PREVIEW_ANIMATION_STYLES = `
  @keyframes pb-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pb-fade-in-up {
    from { opacity: 0; transform: translate3d(0, 24px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes pb-fade-in-down {
    from { opacity: 0; transform: translate3d(0, -24px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes pb-slide-in-left {
    from { opacity: 0; transform: translate3d(-32px, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes pb-slide-in-right {
    from { opacity: 0; transform: translate3d(32px, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes pb-zoom-in {
    from { opacity: 0; transform: scale3d(0.92, 0.92, 1); }
    to { opacity: 1; transform: scale3d(1, 1, 1); }
  }
`;

export function getPreviewAnimationStyle(
  animation?: Partial<AnimationSettings> | null,
): CSSProperties {
  const type = animation?.type || "none";
  const animationName = PREVIEW_ANIMATION_MAP[type];
  if (!animationName) return {};

  return {
    animationName,
    animationDuration: `${Math.max(100, Number(animation?.duration) || 600)}ms`,
    animationDelay: `${Math.max(0, Number(animation?.delay) || 0)}ms`,
    animationTimingFunction: "ease",
    animationFillMode: "both",
    willChange: "opacity, transform",
  };
}
