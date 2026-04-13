import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { saveApiKey, getApiKey } from "./config.js";
import { scanRemote, ApiError } from "./api.js";
import { formatTerminal } from "./reporters/TerminalReporter.js";

const program = new Command();

program
  .name("mcpshield")
  .description("MCPShield CLI — Scan MCP servers for security vulnerabilities")
  .version("2.0.0");

// Auth command
program
  .command("auth")
  .description("Save your API key for authentication")
  .argument("<api-key>", "Your MCPShield API key (get one at mcpshield.co/settings)")
  .action((apiKey: string) => {
    if (!apiKey.startsWith("mcp_sk_")) {
      console.error(chalk.red("Invalid API key format. Keys start with mcp_sk_"));
      process.exit(1);
    }
    saveApiKey(apiKey);
    console.log(chalk.green("API key saved to ~/.mcpshield/config.json"));
  });

// Scan command
program
  .command("scan")
  .description("Scan an MCP server or GitHub repository for security vulnerabilities")
  .option("--url <url>", "URL of an HTTP MCP server endpoint")
  .option("--github <url>", "URL of a GitHub repository")
  .option("--json", "Output results as JSON")
  .option("--severity <level>", "Minimum severity to show (critical, high, medium, low, info)", "info")
  .action(async (opts) => {
    const target = opts.url ?? opts.github;
    if (!target) {
      console.error(chalk.red("Provide --url or --github. Example:"));
      console.error(chalk.dim("  mcpshield scan --url https://mcp-server.com/mcp"));
      console.error(chalk.dim("  mcpshield scan --github https://github.com/user/repo"));
      process.exit(1);
    }

    const severityOrder = ["critical", "high", "medium", "low", "info"];
    if (!severityOrder.includes(opts.severity)) {
      console.error(chalk.red(`Invalid severity "${opts.severity}". Must be one of: ${severityOrder.join(", ")}`));
      process.exit(1);
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      console.error(chalk.red("No API key found. Run:"));
      console.error(chalk.dim("  mcpshield auth <your-api-key>"));
      console.error(chalk.dim("\nGet a free API key at https://www.mcpshield.co/settings"));
      process.exit(1);
    }

    const type = opts.github ? "github" : "http";
    const spinner = ora(`Scanning ${target}...`).start();

    try {
      const result = await scanRemote(target, type, apiKey);
      spinner.stop();

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        // Filter by severity
        const minIndex = severityOrder.indexOf(opts.severity);
        if (minIndex > 0) {
          result.findings = result.findings.filter(
            (f) => severityOrder.indexOf(f.severity) <= minIndex,
          );
        }
        console.log(formatTerminal(result));
      }

      // Exit code 2 if critical findings exist
      const hasCritical = result.findings.some((f) => f.severity === "critical");
      process.exit(hasCritical ? 2 : 0);
    } catch (err) {
      spinner.stop();
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          console.error(chalk.red("Invalid API key. Check your key at https://www.mcpshield.co/settings"));
        } else if (err.statusCode === 429) {
          console.error(chalk.yellow("Rate limit reached. Upgrade to Pro for unlimited scans."));
        } else {
          console.error(chalk.red(`Scan failed: ${err.message}`));
        }
      } else {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : "Unknown error"}`));
      }
      process.exit(1);
    }
  });

program.parse();
