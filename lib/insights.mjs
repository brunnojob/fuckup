export function summarize(
  repository,
  issues,
  contributors,
  commits,
  files,
  languages,
) {
  const completed = issues
    .filter((issue) => !issue.pull_request && issue.closed_at)
    .map(
      (issue) =>
        (Date.parse(issue.closed_at) - Date.parse(issue.created_at)) / 86400000,
    )
    .filter((days) => Number.isFinite(days) && days >= 0)
    .sort((a, b) => a - b);
  const middle = Math.floor(completed.length / 2);
  const median = completed.length
    ? completed.length % 2
      ? completed[middle]
      : (completed[middle - 1] + completed[middle]) / 2
    : null;
  const names = new Set(files.map((file) => file.name.toLocaleLowerCase()));
  const languageBytes = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  return {
    repository: {
      name: repository.full_name,
      url: repository.html_url,
      description: repository.description,
      defaultBranch: repository.default_branch,
      archived: repository.archived,
      license: repository.license?.spdx_id ?? null,
      pushedAt: repository.pushed_at,
    },
    coverage: {
      issuesLimit: 100,
      contributorsLimit: 100,
      commitsLimit: 100,
      observedAt: new Date().toISOString(),
    },
    metrics: {
      openIssues: repository.open_issues_count,
      sampledClosedIssues: completed.length,
      medianIssueDays: median === null ? null : Math.round(median * 100) / 100,
      sampledContributors: contributors.length,
      sampledCommits: commits.length,
      rootFiles: files.length,
    },
    checks: {
      readme: [...names].some((name) => /^readme(?:\.|$)/.test(name)),
      license: Boolean(repository.license),
      tests: names.has("tests") || names.has("test"),
      workflow: names.has(".github"),
      contributing: [...names].some((name) => name.startsWith("contributing")),
      security: [...names].some((name) => name.startsWith("security")),
    },
    languages: languageBytes.map(([name, bytes]) => ({ name, bytes })),
    contributors: contributors.map((row) => ({
      login: row.login,
      contributions: row.contributions,
      url: row.html_url,
    })),
    commits: commits.map((row) => ({
      sha: row.sha,
      message: row.commit.message.split("\n")[0],
      at: row.commit.author?.date,
      url: row.html_url,
    })),
  };
}
