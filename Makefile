.PHONY: help install dev build test lint format clean docker-up docker-down docker-logs docker-health

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

dev: ## Start development environment
	docker-compose up -d
	npm run dev

build: ## Build all packages
	npm run build

test: ## Run tests
	npm run test

lint: ## Lint code
	npm run lint

format: ## Format code
	npm run format

clean: ## Clean build artifacts
	rm -rf node_modules
	rm -rf packages/*/node_modules
	rm -rf services/*/node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/dist
	rm -rf services/*/dist
	rm -rf apps/*/dist

docker-up: ## Start Docker services
	docker-compose up -d
	@echo "Waiting for services to be healthy..."
	@sleep 5
	@bash scripts/docker-healthcheck.sh

docker-down: ## Stop Docker services
	docker-compose down

docker-logs: ## Show Docker logs
	docker-compose logs -f

docker-health: ## Check Docker services health
	@bash scripts/docker-healthcheck.sh

docker-clean: ## Remove Docker volumes
	docker-compose down -v
	docker volume prune -f
