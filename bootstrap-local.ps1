# Bootstrap Local - Setup Laravel + React sem Docker
# Para Windows com PHP 8.5+, Composer e Node.js instalados

Write-Host ""
Write-Host "======================================"
Write-Host "Bootstrap Local - Vulnerable Lab"
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Verificar dependencias
Write-Host "[1/6] Verificando dependencias..." -ForegroundColor Cyan

$php_installed = $null -ne (Get-Command php -ErrorAction SilentlyContinue)
$composer_installed = $null -ne (Get-Command composer -ErrorAction SilentlyContinue)
$node_installed = $null -ne (Get-Command node -ErrorAction SilentlyContinue)

if (-not $php_installed) {
    Write-Host "[ERROR] PHP nao encontrado. Instale PHP 8.5+ antes de continuar." -ForegroundColor Red
    exit 1
}

if (-not $composer_installed) {
    Write-Host "[ERROR] Composer nao encontrado. Instale Composer antes de continuar." -ForegroundColor Red
    exit 1
}

if (-not $node_installed) {
    Write-Host "[ERROR] Node.js nao encontrado. Instale Node.js antes de continuar." -ForegroundColor Red
    exit 1
}

Write-Host "[OK] PHP, Composer e Node.js encontrados" -ForegroundColor Green
Write-Host ""

# Backend: Criar/preparar projeto Laravel
Write-Host "[2/6] Preparando projeto Laravel..." -ForegroundColor Cyan

$backend_exists = (Test-Path "backend\app\artisan") -and (Test-Path "backend\app\composer.json")

if ($backend_exists) {
    Write-Host "[OK] Projeto Laravel ja existe em backend/app"
}
else {
    Write-Host "[INFO] Criando novo projeto Laravel..."
    Push-Location backend
    composer create-project laravel/laravel app --prefer-dist --no-interaction
    Pop-Location
    Write-Host "[OK] Projeto Laravel criado" -ForegroundColor Green
}

Write-Host ""

# Instalar dependencias composer
Write-Host "[3/6] Instalando dependencias PHP..." -ForegroundColor Cyan
Push-Location backend\app
composer install --no-interaction
Pop-Location
Write-Host "[OK] Dependencias PHP instaladas" -ForegroundColor Green
Write-Host ""

# Copiar templates vulneraveis
Write-Host "[4/6] Copiando templates vulneraveis..." -ForegroundColor Cyan

$api_dir = "backend\app\app\Http\Controllers\Api"
if (-not (Test-Path $api_dir)) {
    New-Item -Path $api_dir -ItemType Directory -Force | Out-Null
}

Copy-Item -Path "backend\templates\VulnerableController.php" -Destination "$api_dir\VulnerableController.php" -Force
Copy-Item -Path "backend\templates\UsersController.php" -Destination "$api_dir\UsersController.php" -Force

# Adicionar rotas vulneraveis
$routesFile = "backend\app\routes\api.php"
$routesContent = Get-Content $routesFile -Raw

if ($routesContent -notlike "*vulnerable routes*") {
    Write-Host "[INFO] Adicionando rotas vulneraveis..."
    Add-Content $routesFile ""
    Add-Content $routesFile "// ===== vulnerable routes added by bootstrap-local.ps1 ====="
    Get-Content "backend\templates\routes_vulnerable.php" | Add-Content $routesFile
}
else {
    Write-Host "[INFO] Rotas vulneraveis ja existem"
}

# Copiar migrations e seeders
Copy-Item -Path "backend\templates\migrations\*" -Destination "backend\app\database\migrations\" -Force
Copy-Item -Path "backend\templates\seeders\*" -Destination "backend\app\database\seeders\" -Force

Write-Host "[OK] Templates copiados" -ForegroundColor Green
Write-Host ""

# Configurar .env
Write-Host "[5/6] Configurando arquivo .env..." -ForegroundColor Cyan

$envFile = "backend\app\.env"

if (-not (Test-Path $envFile)) {
    Copy-Item -Path "backend\app\.env.example" -Destination $envFile
}

# Configurar para SQLite local
$envContent = Get-Content $envFile -Raw
$envContent = $envContent -replace 'DB_CONNECTION=mysql', 'DB_CONNECTION=sqlite'
$envContent = $envContent -replace 'DB_HOST=.*', '#DB_HOST (using sqlite)'

Set-Content $envFile $envContent

# Gerar APP_KEY
Push-Location backend\app
php artisan key:generate --force
Pop-Location

Write-Host "[OK] Arquivo .env configurado (SQLite)" -ForegroundColor Green
Write-Host ""

# Executar migrations e seeders
Write-Host "[6/6] Executando migrations e seeders..." -ForegroundColor Cyan

Push-Location backend\app
php artisan migrate:fresh --seed --force
Pop-Location

Write-Host "[OK] Banco de dados configurado" -ForegroundColor Green
Write-Host ""

# Frontend: Instalar dependencias
Write-Host "[BONUS] Instalando dependencias do React/Frontend..." -ForegroundColor Cyan

Push-Location frontend
npm install
Pop-Location

Write-Host "[OK] Dependencias do Frontend instaladas" -ForegroundColor Green
Write-Host ""

# Resumo final
Write-Host "======================================"
Write-Host "SETUP CONCLUIDO COM SUCESSO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. BACKEND (Laravel em http://localhost:8000):"
Write-Host "   cd backend\app"
Write-Host "   php artisan serve"
Write-Host ""
Write-Host "2. FRONTEND (React em http://localhost:5173):"
Write-Host "   cd frontend"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "Banco de dados: SQLite (database.sqlite em backend/app)"
Write-Host "Credenciais de teste:"
Write-Host "  - alice@example.com / admin123"
Write-Host "  - bob@example.com / password"
Write-Host "  - carol@example.com / 123456"
Write-Host ""
Write-Host "======================================"
