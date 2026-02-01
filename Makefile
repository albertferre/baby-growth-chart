.PHONY: run sync clean lint format check

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

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
