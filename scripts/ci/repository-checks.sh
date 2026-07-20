#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

required=(brief-projet.md fonctionnalite.md .github/CODEOWNERS SECURITY.md docs/cicd/README.md)
for path in "${required[@]}"; do
  if [[ ! -f "$path" ]]; then
    printf 'Required repository file is missing: %s\n' "$path" >&2
    exit 1
  fi
done

if find . -type f -not -path './.git/*' \( -name '*.pem' -o -name '*.p12' -o -name '*.pfx' -o -name 'terraform.tfstate*' -o -name '.env' -o -name '.env.*' \) ! -name '.env.example' -print -quit | grep -q .; then
  echo 'A forbidden secret or state file is present.' >&2
  exit 1
fi

# Database URLs are intentionally not matched here because local/CI examples use
# explicit synthetic credentials. A dedicated secret scanner must cover entropy
# and provider-specific formats in GitHub Actions.
secret_pattern='(BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9_]{30,})'
health_fixture_pattern='(nom_complet|full_name|date_de_naissance|medical_history|antecedent|symptom(e|es)?)[[:space:]]*[:=][[:space:]]*["'"'][^"'"']+["'"']'

if command -v rg >/dev/null 2>&1; then
  secret_scan=(rg -n --hidden --glob '!.git/**' --glob '!scripts/ci/repository-checks.sh' --glob '!.env.example' "$secret_pattern" .)
  health_scan=(rg -n --hidden --glob '!.git/**' --glob '!brief-projet.md' --glob '!fonctionnalite.md' "$health_fixture_pattern" .)
else
  secret_scan=(grep -RInIE --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage --exclude-dir=.next --exclude=repository-checks.sh --exclude=.env.example "$secret_pattern" .)
  health_scan=(grep -RInIE --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage --exclude-dir=.next --exclude=brief-projet.md --exclude=fonctionnalite.md "$health_fixture_pattern" .)
fi

if "${secret_scan[@]}"; then
  echo 'A value resembling a credential was found. Do not add exceptions without security review.' >&2
  exit 1
fi

if "${health_scan[@]}"; then
  echo 'Potential personal or health fixture detected. CI accepts synthetic fixtures only.' >&2
  exit 1
fi

while IFS= read -r -d '' file; do
  if [[ -s "$file" ]] && [[ "$(tail -c 1 "$file" | wc -l | tr -d ' ')" == "0" ]]; then
    printf 'Missing final newline: %s\n' "$file" >&2
    exit 1
  fi
done < <(find .github docs scripts -type f -print0; printf '%s\0' .editorconfig .gitignore Makefile SECURITY.md brief-projet.md fonctionnalite.md)

echo 'Repository policy checks passed.'
