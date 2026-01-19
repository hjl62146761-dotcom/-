
export enum ReportStatus {
  GREEN = 'Green',
  YELLOW = 'Yellow',
  RED = 'Red',
  MIXED = 'Mixed',
  UNKNOWN = 'Unknown'
}

export type UserRole = 'EXECUTIVE' | 'MANAGER' | 'STAFF';

export interface ReportItem {
  issue_id?: string; // [ORG]-[CATEGORY]-[KEYWORD]-[YYYY]-[SEQ]
  section?: string; // New: Specific to PDF page/section structure
  org_unit: string;
  category: 'KPI' | 'PROJECT' | 'FINANCE' | 'RISK' | 'OPERATION' | 'OTHER';
  item: string;
  plan: string;
  actual: string;
  gap: string;
  status: ReportStatus;
  next_action?: string;
  owner?: string;
  is_new?: boolean;
}

export interface ReportMeta {
  company?: string;
  week: string;
  report_date: string;
  source: string;
}

export interface ReportSummary {
  overall_status: ReportStatus;
  key_messages: string[];
  top_risks: string[];
  next_week_priorities: string[];
}

export interface StructuredReport {
  id: string;
  report_meta: ReportMeta;
  summary: ReportSummary;
  details: ReportItem[];
  createdAt: number;
}

export interface KpiTimeSeries {
  kpi_name: string;
  org_unit: string;
  unit: string;
  data: {
    week: string;
    plan: number | null;
    actual: number | null;
    status: ReportStatus;
  }[];
}

export type AppView = 'EXTRACT' | 'SUMMARY' | 'TRACKING' | 'KPI_DASHBOARD' | 'CHAT' | 'HISTORY';
