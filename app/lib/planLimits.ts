export const PLAN_LIMITS = {
  FREE: {
    maxPages: 3,
    maxTemplates: 10,
    versionHistory: false,
    customCode: false,
    abTesting: false,
    aiContent: false,
    analytics: false,
    prioritySupport: false,
    removeBranding: false,
    multiStore: false,
  },
  PRO: {
    maxPages: Infinity,
    maxTemplates: Infinity,
    versionHistory: true,
    customCode: true,
    abTesting: false,
    aiContent: true,
    analytics: true,
    prioritySupport: false,
    removeBranding: true,
    multiStore: false,
  },
  AGENCY: {
    maxPages: Infinity,
    maxTemplates: Infinity,
    versionHistory: true,
    customCode: true,
    abTesting: true,
    aiContent: true,
    analytics: true,
    prioritySupport: true,
    removeBranding: true,
    multiStore: true,
  },
} as const;

export function checkLimit(
  plan: keyof typeof PLAN_LIMITS,
  feature: keyof typeof PLAN_LIMITS.FREE,
) {
  return PLAN_LIMITS[plan][feature];
}

