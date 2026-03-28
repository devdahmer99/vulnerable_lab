#!/usr/bin/env bash
set -e
echo "Bootstrap do projeto Laravel vulnerável"

if [ -d "app" ] && [ -f "app/artisan" ]; then
  echo "Parece que já existe um projeto Laravel em backend/app"
else
  echo "Criando projeto Laravel via composer..."
  composer create-project laravel/laravel app --prefer-dist --no-interaction
fi

echo "Instalando dependências do projeto (se necessário)..."
cd app
composer install --no-interaction || true
cd ..

echo "Copiando templates vulneráveis para locais corretos..."
mkdir -p app/app/Http/Controllers/Api
cp templates/VulnerableController.php app/app/Http/Controllers/Api/VulnerableController.php

echo "Adicionando rotas vulneráveis em routes/api.php"
if ! grep -q "vulnerable routes" app/routes/api.php 2>/dev/null; then
  cat templates/routes_vulnerable.php >> app/routes/api.php
  echo "\n// vulnerable routes added by bootstrap" >> app/routes/api.php
else
  echo "Rotas vulneráveis já adicionadas em app/routes/api.php"
fi
echo "Copiando migrations e seeders vulneráveis para o projeto"
mkdir -p app/database/migrations
mkdir -p app/database/seeders
cp -r templates/migrations/* app/database/migrations/ || true
cp -r templates/seeders/* app/database/seeders/ || true

echo "Executando migrations e seeders (se php e artisan estiverem disponíveis localmente)"
cd app
if command -v php >/dev/null 2>&1 && [ -f artisan ]; then
  php artisan migrate:fresh --seed || true
else
  echo "Aviso: php/artisan não encontrado localmente. Rode migrations dentro do container ou na máquina com PHP."
fi
cd ..

echo "Pronto. Ajuste o arquivo .env em backend/app se necessário e rode 'docker compose up --build' na raiz do repositório."
