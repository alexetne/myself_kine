.PHONY: check format lint typecheck test build security artifact ci dev dev-down

check:
	./scripts/ci/repository-checks.sh

format:
	npm run format:check

lint:
	npm run lint

typecheck:
	npm run typecheck

test:
	npm test

build:
	npm run build

security:
	npm run security:dependencies

artifact:
	npm run artifact:build

ci: check format lint typecheck test build security

dev:
	docker compose up -d postgres

dev-down:
	docker compose down
