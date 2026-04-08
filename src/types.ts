// Public response types — these are just interface shapes, no detection logic

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface Finding {
  ruleId: string;
  category: string;
  severity: Severity;
  title: string;
  description: string;
  evidence: string;
  location: string;
  owaspCategory?: string;
  remediation: string;
}

export interface ScanResult {
  scanId: string;
  status: "completed" | "failed";
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  totalFindings: number;
  findings: Finding[];
  error?: string;
}
