.PHONY: check test ci

check:
	./scripts/ci/repository-checks.sh

test: check

ci: check

