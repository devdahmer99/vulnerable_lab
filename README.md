OrderHub - Laboratorio de Pentest (Laravel + React)

ATENCAO: este repositorio e para fins educacionais somente. Execute apenas em ambiente isolado (maquina local, VM ou rede interna).

## Visao Geral

Aplicacao de gerenciamento de pedidos com vulnerabilidades propositais para treinamento de pentest em backend e frontend.

Conteudo principal:
- `backend/` - estrutura Laravel com endpoints vulneraveis e templates
- `frontend/` - app React (Vite) com dashboard, CRUD e relatorios
- `docker-compose.yml` - opcao de execucao em containers
- `bootstrap-local.ps1` - setup local no Windows sem Docker
- `README-EDUCACIONAL.md` - guia completo de features e vulnerabilidades

## Modos de Execucao

### Opcao Recomendada: PHP Puro (sem Docker)

Recomendacao: use esta opcao no curso, pois deixa a experiencia mais realista para os alunos (ambiente local, comportamento proximo de apps reais e mais visibilidade para debug/exploracao).

Pre-requisitos:
- PHP 8.5+
- Composer
- Node.js 18+

Setup automatico (Windows):

```powershell
cd c:\vulnerable_lab
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
& '.\bootstrap-local.ps1'
```

Subir aplicacao:

Backend (Terminal 1):

```powershell
cd backend\app
php artisan serve --host=localhost --port=8000
```

Frontend (Terminal 2):

```powershell
cd frontend
npm run dev
```

URLs:
- Frontend: `http://localhost:3001` (ou porta exibida pelo Vite)
- Backend API: `http://localhost:8000/api`

### Opcao Alternativa: Docker

Use esta opcao se quiser ambiente totalmente conteinerizado.

Pre-requisitos:
- Docker
- Docker Compose

Passos:

```bash
cd backend
./bootstrap.sh
cd ..
docker compose up --build
```

URLs (dependendo da configuracao da stack):
- Frontend: `http://localhost:3000`
- Backend: `http://localhost`

## Credenciais de Teste

- `alice@example.com` / `admin123`
- `bob@example.com` / `password`
- `carol@example.com` / `123456`

## Observacoes

- Algumas funcionalidades sao intencionalmente inseguras para exploracao em aula.
- Para detalhes tecnicos de vulnerabilidades e desafios, consulte `README-EDUCACIONAL.md`.
- Mantenha o ambiente isolado e nunca exponha este laboratorio em producao.
