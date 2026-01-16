
export enum ReportStatus {
  GREEN = 'Green',
  YELLOW = 'Yellow',
  RED = 'Red',
  UNKNOWN = 'Unknown'
}

export interface Metric {
  name: string;
  value: number | string;
  unit: string;
  currency?: string;
}

export interface ReportItem {
  title: string;
  plan: { text: string; metrics: Metric[] };
  actual: { text: string; metrics: Metric[] };
  delta: { text: string; metrics: Metric[] };
  status: ReportStatus;
  risks: string[];
  next_actions: string[];
  due_date: string | null;
  owner: string | null;
  tags: string[];
  evidence_quotes: string[];
}

export interface ReportSection {
  org_unit: string;
  category: 'KPI' | 'Project' | 'Finance' | 'Risk' | 'Operation' | 'Other';
  items: ReportItem[];
}

export interface ReportMeta {
  company: string;
  week_label: string;
  report_date: string;
  source_file: string;
  language: string;
}

export interface StructuredReport {
  id: string; // Internal local ID
  report_meta: ReportMeta;
  sections: ReportSection[];
  createdAt: number;
}

export type AppView = 'EXTRACT' | 'SUMMARY' | 'TRACKING' | 'CHAT' | 'HISTORY';
