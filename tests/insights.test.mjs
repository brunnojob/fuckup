import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize } from "../lib/insights.mjs";
test("issue duration excludes pull requests and missing closures", () => {
  const report = summarize(
    { full_name: "owner/repo", html_url: "https://github.com/owner/repo" },
    [
      { created_at: "2026-01-01", closed_at: "2026-01-03" },
      { created_at: "2026-01-01", closed_at: "2026-01-05" },
      { created_at: "2026-01-01", closed_at: "2026-01-10", pull_request: {} },
    ],
    [],
    [],
    [{ name: "README.md" }],
    { Java: 20, C: 10 },
  );
  assert.equal(report.metrics.medianIssueDays, 3);
  assert.equal(report.metrics.sampledClosedIssues, 2);
  assert.equal(report.checks.readme, true);
  assert.equal(report.languages[0].name, "Java");
});
