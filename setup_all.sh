#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Setup completo Vulnerable Lab: instala Docker (se necessário) e sobe a stack via Docker Compose"

check_cmd(){
  command -v "$1" >/dev/null 2>&1 || return 1
  return 0
}

ensure_docker(){
  if check_cmd docker; then
    echo "Docker já instalado"
    return 0
  fi

  echo "Docker não encontrado. Tentando instalar (requer sudo)..."

  if check_cmd apt-get; then
    echo "Detectado apt-get — instalando Docker via repositório oficial"
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg || true
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin || sudo apt-get install -y docker.io || true
  elif check_cmd dnf || check_cmd yum; then
    echo "Detectado yum/dnf — instalando Docker via repositório oficial"
    if check_cmd dnf; then
      PKG_MGR=dnf
    else
      PKG_MGR=yum
    fi
    sudo $PKG_MGR -y install yum-utils
    sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo || true
    sudo $PKG_MGR -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin || sudo $PKG_MGR -y install docker || true
    sudo systemctl enable --now docker || true
  else
    echo "Sistema não suportado automaticamente pelo instalador. Instale Docker manualmente e reexecute o script."
    return 1
  fi

  # tentar instalar o binário docker-compose se plugin não estiver disponível
  if ! docker compose version >/dev/null 2>&1; then
    echo "Plugin 'docker compose' não disponível — instalando binário 'docker-compose' como fallback"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose || true
    sudo chmod +x /usr/local/bin/docker-compose || true
  fi

  # adicionar usuário ao grupo docker (requer logout/login)
  if check_cmd usermod; then
    echo "Adicionando $USER ao grupo docker (pode requerer logout/login)"
    sudo usermod -aG docker $USER || true
  fi

  echo "Instalação do Docker (ou verificação) finalizada. Verifique com 'docker --version' e 'docker compose version'"
}

cd "$ROOT_DIR"

ensure_docker || { echo "Não foi possível instalar o Docker automaticamente."; exit 1; }

echo "*** Criando/atualizando projeto Laravel usando imagem 'composer' (se necessário) ***"
if [ ! -f backend/app/artisan ]; then
  docker run --rm -u $(id -u):$(id -g) -v "$ROOT_DIR/backend":/app -w /app composer:2 bash -lc "chmod +x bootstrap.sh || true; ./bootstrap.sh"
else
  echo "Projeto Laravel já existe em backend/app"
fi

echo "*** Instalando dependências do frontend usando imagem 'node' ***"
docker run --rm -u $(id -u):$(id -g) -v "$ROOT_DIR/frontend":/app -w /app node:18 bash -lc "npm install --legacy-peer-deps || npm install"

echo "*** Subindo containers com Docker Compose (build) ***"
# prefer 'docker compose' quando disponível, senão 'docker-compose'
if docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE_CMD="docker compose"
else
  DOCKER_COMPOSE_CMD="docker-compose"
fi

${DOCKER_COMPOSE_CMD} up --build -d

echo "Aguardando containers inicializarem..."
sleep 8

echo "Executando migrations e seeders dentro do container backend..."
if ${DOCKER_COMPOSE_CMD} ps | grep -q backend; then
  ${DOCKER_COMPOSE_CMD} exec -T backend php artisan migrate:fresh --seed || echo "Falha ao rodar migrate dentro do container. Rode manualmente: '${DOCKER_COMPOSE_CMD} exec backend php artisan migrate:fresh --seed'"
else
  echo "Container 'backend' não encontrado. Verifique '${DOCKER_COMPOSE_CMD} ps' e logs."
fi

echo "Tudo pronto. Frontend: http://localhost:3000  Backend (nginx): http://localhost  API em /api/v1/*"
