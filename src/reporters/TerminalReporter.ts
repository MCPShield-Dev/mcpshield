import chalk from "chalk";
import type { ScanResult, Finding, Severity } from "../types.js";

const severityIcon: Record<Severity, string> = {
  critical: chalk.bgRed.white(" !! "),
  high: chalk.red(" ! "),
  medium: chalk.yellow(" ~ "),
  low: chalk.blue(" - "),
  info: chalk.gray(" i "),
};

const gradeColor: Record<string, (s: string) => string> = {
  A: chalk.green,
  B: chalk.blue,
  C: chalk.yellow,
  D: chalk.hex("#FFA500"),
  F: chalk.red,
};

export function formatTerminal(result: ScanResult): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(chalk.bold("  MCPShield Security Report"));
  lines.push(chalk.dim("  ─".repeat(30)));
  lines.push("");

  // Grade and score
  const colorFn = gradeColor[result.grade] ?? chalk.gray;
  lines.push(`  Grade: ${colorFn(chalk.bold(result.grade))}  Score: ${colorFn(`${result.score}/100`)}`);
  lines.push(`  Findings: ${result.totalFindings}`);
  lines.push("");

  if (result.findings.length === 0) {
    lines.push(chalk.green("  No security issues found."));
    lines.push("");
    return lines.join("\n");
  }

  // Group by severity
  const groups = new Map<Severity, Finding[]>();
  for (const f of result.findings) {
    const sev = f.severity as Severity;
    if (!groups.has(sev)) groups.set(sev, []);
    groups.get(sev)!.push(f);
  }

  const order: Severity[] = ["critical", "high", "medium", "low", "info"];
  for (const sev of order) {
    const findings = groups.get(sev);
    if (!findings) continue;

    lines.push(`  ${chalk.bold(sev.toUpperCase())} (${findings.length})`);
    for (const f of findings) {
      lines.push(`  ${severityIcon[sev]} ${chalk.dim(f.ruleId)} ${f.title}`);
      lines.push(`     ${chalk.dim(f.location)}`);
    }
    lines.push("");
  }

  lines.push(chalk.dim(`  Scan ID: ${result.scanId}`));
  lines.push(chalk.dim(`  Full report: https://www.mcpshield.co/scans/${result.scanId}`));
  lines.push("");

  return lines.join("\n");
}
