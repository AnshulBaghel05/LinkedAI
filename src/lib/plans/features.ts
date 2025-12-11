/**
 * Plan-based feature access configuration
 * Standard plan names: 'free' | 'pro' | 'standard' | 'enterprise'
 * Must match database CHECK constraints and PLAN_CONFIGS
 */

export type Plan = 'free' | 'pro' | 'standard' | 'enterprise'

export interface PlanFeatures {
  // Navigation Features
  analytics: boolean
  bestTime: boolean
  abTests: boolean
  workspaces: boolean
  apiAccess: boolean

  // Limits
  linkedinAccounts: number
  postsPerMonth: number
  aiCredits: number
  workspaceMembers: number
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  free: {
    analytics: false,
    bestTime: false,
    abTests: false,
    workspaces: false,
    apiAccess: false,
    linkedinAccounts: 1,
    postsPerMonth: 20,
    aiCredits: 10,
    workspaceMembers: 0,
  },
  pro: {
    analytics: true,
    bestTime: true,
    abTests: true,
    workspaces: false,
    apiAccess: false,
    linkedinAccounts: 5,
    postsPerMonth: 100,
    aiCredits: 200,
    workspaceMembers: 1,
  },
  standard: {
    analytics: true,
    bestTime: true,
    abTests: true,
    workspaces: false,
    apiAccess: false,
    linkedinAccounts: 10,
    postsPerMonth: 500,
    aiCredits: 1000,
    workspaceMembers: 3,
  },
  enterprise: {
    analytics: true,
    bestTime: true,
    abTests: true,
    workspaces: true,
    apiAccess: true,
    linkedinAccounts: -1, // unlimited
    postsPerMonth: -1, // unlimited
    aiCredits: -1, // unlimited
    workspaceMembers: -1, // unlimited
  },
}

export function hasFeatureAccess(plan: Plan, feature: keyof PlanFeatures): boolean {
  return PLAN_FEATURES[plan]?.[feature] === true || PLAN_FEATURES[plan]?.[feature] === -1
}

export function getFeatureLimit(plan: Plan, feature: keyof PlanFeatures): number {
  const value = PLAN_FEATURES[plan]?.[feature]
  return typeof value === 'number' ? value : 0
}

export function canAccessRoute(plan: Plan, route: string): boolean {
  const routeFeatureMap: Record<string, keyof PlanFeatures | null> = {
    '/analytics': 'analytics',
    '/best-time': 'bestTime',
    '/ab-tests': 'abTests',
    '/workspaces': 'workspaces',
    '/api-docs': 'apiAccess',
    '/competitors': 'abTests', // Pro feature
    '/top-engagers': 'abTests', // Pro feature
    // Free routes - available to all users
    '/dashboard': null,
    '/generate': null,
    '/templates': null,
    '/drafts': null,
    '/calendar': null,
    '/scheduled': null,
    '/leads': null,
    '/viral-score': null,
    '/audience-growth': null,
    '/trending': null,
    '/content-ideas': null,
    '/notifications': null,
    '/settings': null,
    '/support': null,
  }

  const feature = routeFeatureMap[route]
  if (feature === null) return true // Free route
  if (feature === undefined) return false // Unknown route

  return hasFeatureAccess(plan, feature)
}
