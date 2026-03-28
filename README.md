Vulnerable Lab - Laravel + React (para estudo local)

ATENÇÃO: Este repositório é para fins educacionais somente. Execute apenas em ambiente isolado (máquina local, VM ou rede interna).

Conteúdo:
- `docker-compose.yml` — orquestra containers (PHP, MySQL, nginx, frontend)
- `backend/` — scripts e templates para inicializar um projeto Laravel vulnerável
- `frontend/` — app React (Vite) com interface para explorar vulnerabilidades

Como usar (resumo):
1. Instale Docker e Docker Compose
2. Execute `./backend/bootstrap.sh` para criar o projeto Laravel e copiar rotas/Controllers vulneráveis
3. Rode `docker compose up --build` para subir a stack
4. Abra o frontend em `http://localhost:3000` e o backend em `http://localhost` (nginx)

Leia os arquivos dentro de `backend/templates` antes de usar.

Use com responsabilidade e mantenha o ambiente isolado.
