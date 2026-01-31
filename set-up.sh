# $ sudo docker compose down -v && sudo docker compose build && sudo docker compose --env-file .env.docker -f docker-compose.dev.yml up 

sudo docker compose -f docker-compose.dev.yml down -v
sudo docker compose -f docker-compose.dev.yml build
sudo docker compose --env-file .env.docker -f docker-compose.dev.yml up 