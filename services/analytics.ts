
export type AnalyticsEvent = 
  | 'list_created'
  | 'task_created'
  | 'task_status_changed'
  | 'task_assigned'
  | 'task_completed'
  | 'view_saved'
  | 'search_executed'
  | 'bulk_action_applied';

export const trackEvent = (event: AnalyticsEvent, properties?: Record<string, any>) => {
  console.info(`[Analytics] Tracked: ${event}`, properties);
  // Real implementation would send to Segment, PostHog, or Amplitude
};
