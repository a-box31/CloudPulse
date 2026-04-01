dev:
	sudo docker compose --env-file .env.development -f docker-compose.dev.yml up --build

prod:
	sudo docker compose --env-file .env.production -f docker-compose-prod.yml up --no-deps cloudpulse-app --build

proxy:
	sudo docker compose --env-file .env.production -f docker-compose-prod.yml up --build nginxproxymanager