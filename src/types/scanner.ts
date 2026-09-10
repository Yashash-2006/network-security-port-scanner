export type PortStatus = 'open' | 'closed' | 'filtered' | 'unreachable' | 'error';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ServiceInfo {
  port: number;
  name: string;
  category: 'Web' | 'Remote Access' | 'Database' | 'File Transfer' | 'Mail' | 'Infrastructure' | 'Other';
  description: string;
  riskLevel: RiskLevel;
  securityImplication: string;
  recommendation: string;
  officialService?: string;
}

export interface PortResult {
  port: number;
  status: PortStatus;
  latencyMs: number;
  banner?: string;
  reason?: string;
  service?: ServiceInfo;
  timestamp?: number;
}

export interface ScanSummary {
  target: string;
  ip: string;
  totalScanned: number;
  openCount: number;
  closedCount: number;
  filteredCount: number;
  durationMs: number;
  avgLatencyMs: number;
  startedAt: number;
  completedAt?: number;
}

export type PortSelectionMode = 'presets' | 'range' | 'custom';

export interface PortPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  ports: number[];
}

export interface TargetDnsInfo {
  host: string;
  ip: string;
  family?: string;
  resolved: boolean;
  error?: string;
}
