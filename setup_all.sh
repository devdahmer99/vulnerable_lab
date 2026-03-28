#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Setup completo Vulnerable Lab (Docker-only): Laravel backend + React frontend"

check_cmd(){
  command -v "$1" >/dev/null 2>&1 || { echo "Comando '$1' não encontrado. Instale-o e rode novamente."; exit 1; }
}

echo "Verificando dependência: docker"
check_cmd docker

cd "$ROOT_DIR"

echo "*** Criando/atualizando projeto Laravel usando imagem 'composer' (se necessário) ***"
if [ ! -f backend/app/artisan ]; then
  docker run --rm -u $(id -u):$(id -g) -v "$ROOT_DIR/backend":/app -w /app composer:2 bash -lc "chmod +x bootstrap.sh || true; ./bootstrap.sh"
else
  echo "Projeto Laravel já existe em backend/app"
fi

echo "*** Instalando dependências do frontend usando imagem 'node' ***"
docker run --rm -u $(id -u):$(id -g) -v "$ROOT_DIR/frontend":/app -w /app node:18 bash -lc "npm install --legacy-peer-deps || npm install"

echo "*** Subindo containers com Docker Compose (build) ***"
docker compose up --build -d

echo "Aguardando containers inicializarem..."
sleep 8

echo "Executando migrations e seeders dentro do container backend..."
if docker compose ps | grep -q backend; then
  docker compose exec -T backend php artisan migrate:fresh --seed || echo "Falha ao rodar migrate dentro do container. Rode manualmente: 'docker compose exec backend php artisan migrate:fresh --seed'"
else
  echo "Container 'backend' não encontrado. Verifique 'docker compose ps' e logs."
fi

echo "Tudo pronto. Frontend: http://localhost:3000  Backend (nginx): http://localhost  API em /api/v1/*"
