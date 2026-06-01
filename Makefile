ENV_DIR := environments/local
PROD_DIR := environments/prod
DEV_DIR := environments/dev
LOCAL_DIR := environments/local

.PHONY: install-packages backend-install frontend-install db-create up down clean restart reset logs ps backend-shell frontend-shell db-shell migrate

install-packages:
	$(MAKE) backend-install
	$(MAKE) frontend-install

backend-install:
	cd packages/backend && npm install

frontend-install:
	cd packages/frontend && npm install

db-create:
	@if [ -z "$(DESC)" ]; then \
		echo 'Usage: make db-create DESC="migration description"'; \
		exit 1; \
	fi
	./db/create.sh "$(DESC)"

up:
	cd $(ENV_DIR) && ./start.sh

down:
	cd $(ENV_DIR) && ./stop.sh

clean: 
	cd $(ENV_DIR) && ./clean.sh

restart:
	$(MAKE) down
	$(MAKE) up

reset:
	$(MAKE) clean
	$(MAKE) up

logs:
	cd $(ENV_DIR) && docker-compose logs -f

ps:
	cd $(ENV_DIR) && docker-compose ps

backend-shell:
	cd $(ENV_DIR) && docker-compose exec backend sh

frontend-shell:
	cd $(ENV_DIR) && docker-compose exec frontend sh

db-shell:
	cd $(ENV_DIR) && docker-compose exec postgres psql -U crm_user -d crm_db

migrate:
	cd $(ENV_DIR) && docker-compose run --rm migrator

.PHONY: prod-up prod-down prod-clean prod-restart prod-logs prod-ps prod-migrate

prod-up:
	cd $(PROD_DIR) && ./start.sh

prod-down:
	cd $(PROD_DIR) && ./stop.sh

prod-clean:
	cd $(PROD_DIR) && ./clean.sh

prod-restart:
	$(MAKE) prod-down
	$(MAKE) prod-up

prod-logs:
	cd $(PROD_DIR) && docker compose logs -f

prod-ps:
	cd $(PROD_DIR) && docker compose ps

prod-migrate:
	cd $(PROD_DIR) && ./migrate.sh
