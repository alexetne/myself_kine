#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required." >&2
  exit 1
fi

repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"

for environment in development staging; do
  gh api --method PUT "repos/${repo}/environments/${environment}" --input - <<'JSON'
{}
JSON
done

gh api --method PUT "repos/${repo}/branches/main/protection" --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "repository-policy",
      "secrets",
      "quality",
      "dependencies",
      "dependency-review",
      "reproducible-build"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_conversation_resolution": true,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "lock_branch": false,
  "allow_fork_syncing": true
}
JSON

echo "Protected main and created empty development/staging environments for ${repo}."
