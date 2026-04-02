# 🎓 OrderHub - Sistema de Gerenciamento de Pedidos (Laboratório de Pentest)

> Aplicação educacional para fins de treinamento em segurança e testes de penetração

## 📋 Visão Geral

OrderHub é uma aplicação profissional de gerenciamento de pedidos desenvolvida em **Laravel + React** com vulnerabilidades intencionais para fins educacionais. Os alunos irão explorar e identificar as falhas de segurança tanto no backend quanto no frontend.

## ✅ Funcionalidades Implementadas

- Autenticação com login e logout
- Dashboard com métricas e gráfico de vendas dinâmico
- CRUD completo de Pedidos
- CRUD completo de Clientes
- CRUD completo de Produtos
- Relatórios dinâmicos com filtros por tipo e período
- Exportação de relatório em CSV
- Interface moderna em tema escuro
- Formulários de criação/edição em modais (Pedidos, Clientes e Produtos)

## 🚀 Como Executar Localmente

### ✅ Pré-Requisitos

- **PHP 8.5+** (com extensões: sqlite, json, openssl)
- **Composer**
- **Node.js 18+**

### 🔧 Setup Automático (Windows)

Execute o script de bootstrap que faz tudo automaticamente:

```powershell
cd c:\vulnerable_lab
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
& '.\bootstrap-local.ps1'
```

Este script irá:
- ✓ Criar o projeto Laravel
- ✓ Instalar dependências PHP
- ✓ Copiar templates e controllers vulneráveis
- ✓ Configurar banco de dados SQLite
- ✓ Executar migrations e seeders
- ✓ Instalar dependências do React

### 🎯 Execução Manual

**Terminal 1 - Backend (Laravel):**
```bash
cd backend/app
php artisan serve --host=localhost --port=8000
```

Acessa em: **http://localhost:8000**

**Terminal 2 - Frontend (React):**
```bash
cd frontend
npm run dev
```

Acessa em: **http://localhost:3001**

---

## 🔓 Vulnerabilidades Intencionais

### 1. **SQL Injection** 🎯
**Localização:** Endpoints de busca
- `/api/v1/orders/search?q=<payload>`
- `/api/v1/customers/search?q=<payload>`

**Tipo:** Concatenação de string sem prepared statements
**Exploração:**
```
Payload: ' OR '1'='1' --
Efeito: Retorna todos os registros sem filtro
```

**Código Vulnerável:**
```php
$sql = "SELECT * FROM orders WHERE customer_name LIKE '%" . $q . "%'";
DB::select($sql);
```

---

### 2. **Insecure Direct Object Reference (IDOR)** 🎯
**Localização:** `/api/v1/orders/{id}`
**Tipo:** Sem verificação de autorização

**Exploração:** Acessar qualquer pedido apenas mudando o `{id}`
```
GET /api/v1/orders/1  ← Seu pedido
GET /api/v1/orders/2  ← Pedido de outro usuário (acesso não autorizado!)
GET /api/v1/orders/999 ← Qualquer pedido
```

---

### 3. **Stored XSS (Cross-Site Scripting)** 🎯
**Localização:** Notas de pedidos
**Endpoint:** POST `/api/v1/orders/{id}/notes`

**Exploração:**
```json
{
  "note": "<img src=x onerror=\"alert('XSS Explorado!')\">"
}
```

**Efeito:** Script é armazenado e executado quando o pedido é visualizado
**Frontend vulnerável:** O componente renderiza o HTML diretamente sem sanitização

```jsx
<div dangerouslySetInnerHTML={{ __html: selectedOrder.notes }} />
```

---

### 4. **Falta de Validação de Entrada** 🎯
**Localização:** `/api/v1/orders/{id}/status`

**Exploração:** Passar valores inválidos que não deviam ser aceitos
```
Valores válidos: pending, processing, shipped, completed
Payload: status=invalid_status ou status=null
```

---

### 5. **Autenticação Fraca e Vulnerável** 🎯
**Localização:** `/api/v1/login`, token em localStorage e validação de token

**Problemas intencionais:**
- SQL Injection no login
- Senhas em texto claro
- Token fraco (base64 sem assinatura)
- Token sem expiração
- Logout apenas client-side

**Exploração:**
- Bypass de login com payload SQL
- Manipulação de token trocando `user_id`
- Roubo de token via XSS/localStorage

---

### 6. **SQL Injection em CRUD e Relatórios** 🎯
**Localização:** criação/edição de pedidos, clientes, produtos e geração de relatórios

**Tipo:** concatenação de SQL com dados da requisição

**Exploração:**
- Campos de formulário com payloads SQL
- Parâmetro de ordenação em `/api/v1/reports`

---

### 7. **IDOR e Falta de Controle de Acesso** 🎯
**Localização:** endpoints de leitura/edição/exclusão por ID

**Exploração:**
- Acesso e alteração de recursos de outros usuários apenas trocando o ID

---

### 8. **Stored XSS em Notas e Campos Textuais** 🎯
**Localização:** notas de pedidos e renderização HTML no frontend

**Exploração:**
- Inserir payload HTML/JS e executar no painel

---

### 9. **Ausência de Proteções Operacionais** 🎯
**Tipo:** sem rate limit, sem CSRF robusto, sem trilha de auditoria e sem proteção adequada para operações críticas

---

## 📊 Endpoints Disponíveis

### Dashboard
```
GET /api/v1/dashboard
GET /api/v1/reports?type=sales&range=30&sort=created_at%20DESC
```
Retorna estatísticas de pedidos, clientes, receita e séries para gráfico/relatórios

### Autenticação
```
POST /api/v1/login
POST /api/v1/logout
POST /api/v1/verify-token
GET  /api/v1/me
```

### Relatórios
```
GET /api/v1/reports?type=<sales|products|customers|revenue>&range=<7|30|90|365>&sort=<campo>
```

### Pedidos
```
GET /api/v1/orders?limit=10
GET /api/v1/orders/search?q=<termo>        [SQL Injection]
GET /api/v1/orders/{id}                     [IDOR]
POST /api/v1/orders                          [SQL Injection]
PUT /api/v1/orders/{id}                      [SQL Injection + IDOR]
DELETE /api/v1/orders/{id}                   [IDOR]
POST /api/v1/orders/{id}/status             [Validação fraca]
POST /api/v1/orders/{id}/notes              [Stored XSS]
```

### Clientes
```
GET /api/v1/customers
GET /api/v1/customers/search?q=<termo>     [SQL Injection]
POST /api/v1/customers                       [SQL Injection]
PUT /api/v1/customers/{id}                   [SQL Injection + IDOR]
DELETE /api/v1/customers/{id}                [IDOR]
```

### Produtos
```
GET /api/v1/products
POST /api/v1/products                        [SQL Injection]
PUT /api/v1/products/{id}                    [SQL Injection + IDOR]
DELETE /api/v1/products/{id}                 [IDOR]
```

---

## 👥 Dados de Teste

Banco de dados é pré-populado com dados fictícios:

**Clientes:**
- João Silva (joao.silva@example.com)
- Maria Santos (maria.santos@example.com)
- Carlos Oliveira (carlos@example.com)
- Ana Costa (ana@example.com)
- Tech Solutions Ltda (contato@techsolutions.com)

**Produtos:** 8 produtos fictícios (Notebooks, Mouses, Teclados, etc)

**Pedidos:** 15 pedidos de teste com diferentes status

---

## 🧪 Desafios Para Alunos

### Nível Iniciante
1. **Encontre SQL Injection:** Execute uma query SQL através da busca
2. **IDOR:** Acesse um pedido não seu mudando o ID
3. **XSS via notas:** Injete um script que mostre um popup
4. **Token fraco:** decodifique e altere o token do login

### Nível Intermediário
4. **Bypass de validação:** Altere o status do pedido para um valor inválido
5. **Data Disclosure:** Use SQL Injection para extrair dados de tabelas
6. **Enumeração:** Use um loop para descobrir IDs de pedidos
7. **CRUD abusivo:** crie/edite/exclua recursos sem autorização adequada

### Nível Avançado  
7. **Chained Attacks:** Combine SQL Injection + IDOR
8. **DOM-based XSS:** Encontre e exploreXSS no frontend
9. **Second Order SQL Injection:** Via notas (Stored XSS → SQL Injection)
10. **Manipulação de relatório:** abuse de filtros e ordenação para alterar/forçar consultas

---

## 🛠️ Estrutura do Projeto

```
vulnerable_lab/
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── App.jsx             # Layout principal
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Orders.jsx      # [XSS, IDOR]
│   │   │   ├── Customers.jsx   # [SQL Injection]
│   │   │   ├── Products.jsx
│   │   │   └── Reports.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/                     # Laravel
│   ├── app/
│   │   ├── app/Http/Controllers/Api/
│   │   │   └── VulnerableController.php  # [SQL Injection, IDOR, XSS]
│   │   ├── database/
│   │   │   ├── migrations/      # Tabelas: customers, products, orders, order_items
│   │   │   └── seeders/          # Dados de teste
│   │   ├── routes/
│   │   │   └── api.php          # Endpoints vulneráveis
│   │   └── bootstrap/
│   │       └── app.php          # Configuração
│   └── templates/               # Templates dos componentes
│       ├── migrations/
│       ├── seeders/
│       ├── VulnerableController.php
│       └── routes_vulnerable.php
│
└── bootstrap-local.ps1          # Script de setup automático
```

---

## 🔍 Ferramentas Recomendadas

- **Burp Suite Community** - Interceptação e modificação de requisições
- **Postman** - Testes de API
- **SQL Map** - Automação de testes de SQL Injection
- **OWASP ZAP** - Scanner de vulnerabilidades
- **DevTools do Navegador** - Análise do frontend

---

## 📝 Instruções Para Professores

1. Clone o repositório
2. Execute o `bootstrap-local.ps1`
3. Compartilhe os URLs:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3001`
4. Peça que os alunos encontrem e documentem as vulnerabilidades
5. Crie um relatório de segurança com:
   - Vulnerabilidade encontrada
   - Tipo (OWASP Top 10)
   - Impacto
   - Prova de conceito (screenshot/vídeo)
   - Recomendação de correção

---

## ⚠️ Aviso Legal

⚠️ **SOMENTE USE PARA FINS EDUCACIONAIS EM AMBIENTE ISOLADO**

Esta aplicação contém vulnerabilidades intencionais. NÃO use em produção ou em redes públicas.

---

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [HackTricks - SQL Injection](https://book.hacktricks.xyz/pentesting-web/sql-injection)
- [PortSwigger - Web Security Academy](https://portswigger.net/web-security)

---

## 🆘 Troubleshooting

### Erro: "Could not open input file: artisan"
```bash
# Certifique-se de estar no diretório correto
cd backend/app
```

### Erro: "Port already in use"
```bash
# Laravel tentará outra porta automaticamente
# Ou especifique uma porta diferente:
php artisan serve --port=8001
```

### Frontend não conecta ao backend
```bash
# Verifique se o backend está rodando em http://localhost:8000
# Verifique se há erro de CORS (se implementado)
```

### Banco de dados não foi criado
```bash
# Rode as migrations manualmente:
cd backend/app
php artisan migrate:fresh --seed
```

---

## 📞 Suporte

Dúvidas ou sugestões? Abra uma issue no repositório!

---

**Desenvolvido para fins educacional em segurança da informação e pentest** 🔐
