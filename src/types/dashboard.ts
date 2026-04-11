export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface DashboardChecklistItem {
  title: string;
  detail: string;
}

export interface DashboardLink {
  label: string;
  href: string;
}

export interface DashboardConfig {
  role: string;
  title: string;
  summary: string;
  laneAdvice: string;
  ownership: string[];
  metrics: DashboardMetric[];
  checklist: DashboardChecklistItem[];
  primaryAction: DashboardLink;
  secondaryAction: DashboardLink;
}
