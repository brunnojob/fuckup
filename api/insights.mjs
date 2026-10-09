import { randomUUID } from "node:crypto";
import {
  ApiError,
  bodyObject,
  principal,
  database,
  sendError,
} from "../lib/supabase.mjs";
import { summarize } from "../lib/insights.mjs";

async function github(path) {
  const response = await fetch(`https://api.github.com/repos/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "brunnodev-repository-insights",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  if (!response.ok)
    throw new ApiError(
      response.status === 404
        ? 404
        : response.status === 403 || response.status === 429
          ? 429
          : 502,
      response.status === 404 ? "repository_not_found" : "github_unavailable",
    );
  return response.json();
}
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method !== "POST") throw new ApiError(405, "method_not_allowed");
    const { token } = await principal(req);
    const body = bodyObject(req.body, 4096);
    if (
      typeof body.repository !== "string" ||
      !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}\/[a-zA-Z0-9_.-]{1,100}$/.test(
        body.repository,
      )
    )
      throw new ApiError(400, "invalid_repository");
    const [repository, issues, contributors, commits, files, languages] =
      await Promise.all(
        [
          "",
          "/issues?state=closed&per_page=100",
          "/contributors?per_page=100",
          "/commits?per_page=100",
          "/contents",
          "/languages",
        ].map((path) => github(body.repository + path)),
      );
    if (repository.private) throw new ApiError(403, "public_repositories_only");
    const report = summarize(
      repository,
      issues,
      contributors,
      commits,
      files,
      languages,
    );
    const saved = await database(token, "rpc/bd_record_run", {
      method: "POST",
      body: JSON.stringify({
        p_project: "fuckup",
        p_key: randomUUID(),
        p_kind: "repository.analysis",
        p_result: report,
        p_events: [],
      }),
    });
    return res.status(200).json({ report, recordId: saved });
  } catch (error) {
    return sendError(res, error);
  }
}
