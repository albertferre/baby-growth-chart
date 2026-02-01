.PHONY: run sync clean lint format check web-install web-dev web-build web-data

run: ## Start the Streamlit app
	uv run streamlit run app.py

sync: ## Install/update dependencies
	uv sync

clean: ## Remove cache and temporary files
	rm -rf __pycache__ .streamlit/cache .ruff_cache

lint: ## Run linter
	uv run --with ruff ruff check .

format: ## Auto-format code
	uv run --with ruff ruff format .

check: lint ## Run all checks
	uv run --with ruff ruff format --check .

web-install: ## Install web app dependencies
	cd web && npm install

web-dev: ## Start web app dev server
	cd web && npm run dev

web-build: ## Build web app for production
	cd web && npm run build

web-data: ## Convert Excel data to JSON for web app
	cd web && node scripts/convert-data.js

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
