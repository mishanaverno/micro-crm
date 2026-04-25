ENV_DIR := environments

.PHONY: install-packages backend-install frontend-install up down clean restart reset logs ps backend-shell frontend-shell db-shell migrate

install-packages:
	$(MAKE) backend-install
	$(MAKE) frontend-install

backend-install:
	cd packages/backend && npm install

frontend-install:
	cd packages/frontend && npm install

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
