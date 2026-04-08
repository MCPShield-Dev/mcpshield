# MCPShield CLI

Scan MCP servers and GitHub repositories for security vulnerabilities.

Powered by [MCPShield](https://www.mcpshield.co) — the MCP security scanner with 59+ detection rules covering the OWASP MCP Top 10.

## Install

```bash
npm install -g mcpshield
```

## Setup

Get a free API key at [mcpshield.co/settings](https://www.mcpshield.co/settings), then:

```bash
mcpshield auth mcp_sk_your_key_here
```

## Usage

```bash
# Scan an HTTP MCP server
mcpshield scan --url https://mcp-server.example.com/mcp

# Scan a GitHub repository
mcpshield scan --github https://github.com/user/repo

# JSON output (for CI/CD)
mcpshield scan --url https://mcp-server.example.com/mcp --json

# Filter by severity
mcpshield scan --url https://mcp-server.example.com/mcp --severity high
```

## Exit Codes

- `0` — Scan completed, no critical findings
- `1` — Error (invalid key, rate limit, scan failure)
- `2` — Scan completed with critical findings

## Environment Variables

- `MCPSHIELD_API_KEY` — API key (alternative to `mcpshield auth`)
- `MCPSHIELD_API_URL` — Custom API endpoint (for self-hosted)

## License

MIT
