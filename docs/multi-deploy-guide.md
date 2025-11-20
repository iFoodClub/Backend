# 🚀 Guia de Multi-Deploy - FoodClub Backend

Este guia explica como configurar e realizar deploy automático do backend FoodClub em **múltiplas plataformas** simultaneamente:
- ✅ **AWS Elastic Beanstalk** (Já configurado)
- ✅ **Render** (Docker - Novo)
- ✅ **Docker Hub** (Registro de imagens)

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Configuração AWS Elastic Beanstalk](#aws-elastic-beanstalk)
3. [Configuração Docker Hub](#docker-hub)
4. [Configuração Render](#render)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Deploy Manual](#deploy-manual)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Visão Geral da Arquitetura

### Pipeline de CI/CD

```
Push para GitHub (main/development)
         ↓
   GitHub Actions
         ↓
    ┌────┴────┐
    ↓         ↓
Validação   Build
    ↓         ↓
    └────┬────┘
         ↓
  ┌──────┴──────┬───────────┐
  ↓             ↓           ↓
Deploy AWS   Docker Hub   Release
(Beanstalk)   (Imagem)    (Tag)
                ↓
              Render
           (Auto-deploy)
```

### Estratégia de Deploy

- **Development Branch**: Deploy automático para ambientes de dev/staging
- **Main Branch**: Deploy automático para produção
- **Docker**: Imagem publicada no Docker Hub para ambas as branches
- **Render**: Detecta nova imagem e faz deploy automático

---

## ☁️ AWS Elastic Beanstalk

### Status
✅ **Já configurado e funcionando**

### Como funciona
1. GitHub Actions faz build da aplicação
2. Cria pacote ZIP com os artefatos
3. Faz upload para S3
4. Deploy no Elastic Beanstalk

### Configuração necessária
Nenhuma ação adicional necessária. O deploy para Beanstalk continua funcionando normalmente.

---

## 🐳 Docker Hub

### 1. Criar conta no Docker Hub

Se ainda não tem conta:
```bash
# Acesse: https://hub.docker.com/signup
```

### 2. Criar repositório

1. Acesse https://hub.docker.com/repositories
2. Clique em **"Create Repository"**
3. Nome: `foodclub-backend`
4. Visibilidade: **Public** ou **Private** (recomendado Private)
5. Clique em **"Create"**

### 3. Configurar Secrets no GitHub

Vá em: `GitHub Repository → Settings → Secrets and variables → Actions`

Adicione os seguintes secrets:

| Secret Name | Valor | Descrição |
|------------|-------|-----------|
| `DOCKER_USERNAME` | seu-usuario-docker | Username do Docker Hub |
| `DOCKER_PASSWORD` | seu-token-docker | Access Token do Docker Hub |

**Como criar Access Token no Docker Hub:**
1. Docker Hub → Account Settings → Security
2. Clique em **"New Access Token"**
3. Nome: `github-actions`
4. Permissões: **Read, Write, Delete**
5. Copie o token (só aparece uma vez!)

### 4. Testar build local (opcional)

```powershell
# Build da imagem
docker build -t foodclub-backend:local .

# Testar localmente
docker run -p 3000:3000 `
  -e DB_HOST=seu-host `
  -e DB_PORT=5432 `
  -e DB_USERNAME=usuario `
  -e DB_PASSWORD=senha `
  -e DB_DATABASE=foodclub `
  -e JWT_SECRET=seu-secret `
  foodclub-backend:local
```

---

## 🎨 Render

### 1. Criar conta no Render

```bash
# Acesse: https://render.com/
# Faça login com GitHub (recomendado)
```

### 2. Opção A: Deploy via Blueprint (Recomendado)

#### Passo 1: Push do render.yaml
```powershell
git add render.yaml
git commit -m "feat: add Render deployment configuration"
git push origin development
```

#### Passo 2: Conectar no Render Dashboard
1. Acesse: https://dashboard.render.com/
2. Clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório GitHub
4. Selecione o repositório: **iFoodClub/Backend**
5. Branch: **development** (ou main para produção)
6. Render detecta automaticamente o `render.yaml`
7. Clique em **"Apply"**

#### Passo 3: Configurar variáveis sensíveis

O Render criará automaticamente:
- ✅ Banco de dados PostgreSQL
- ✅ Backend API
- ✅ Variáveis de ambiente do banco

Você precisa adicionar manualmente (se usar S3):
1. Dashboard → foodclub-backend → Environment
2. Adicione:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET_NAME`
   - `AWS_REGION`

### 3. Opção B: Deploy Manual (Alternativa)

#### Criar Banco de Dados
1. Dashboard → **New +** → **PostgreSQL**
2. Nome: `foodclub-postgres`
3. Database: `foodclub`
4. User: `foodclub_user`
5. Region: **Oregon** (mais próximo da AWS)
6. Instance Type: **Free**
7. Clique em **"Create Database"**

#### Criar Web Service
1. Dashboard → **New +** → **Web Service**
2. Conecte o repositório GitHub
3. Configure:
   - **Name**: `foodclub-backend`
   - **Region**: Oregon
   - **Branch**: development
   - **Runtime**: Docker
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Instance Type**: Free

4. Variáveis de ambiente (Environment):
```bash
NODE_ENV=production
PORT=3000
DB_HOST=[clique em "From Database" e selecione foodclub-postgres → Host]
DB_PORT=[From Database → Port]
DB_USERNAME=[From Database → User]
DB_PASSWORD=[From Database → Password]
DB_DATABASE=[From Database → Database]
JWT_SECRET=[Generate Value - deixe o Render gerar]
JWT_EXPIRATION=7d
```

5. **Advanced** → Health Check Path: `/health`
6. Clique em **"Create Web Service"**

### 4. Configurar Auto-Deploy do Docker Hub (Opcional)

Se quiser que o Render use a imagem do Docker Hub ao invés de buildar:

1. Modifique o `render.yaml`:
```yaml
services:
  - type: web
    name: foodclub-backend
    env: docker
    image:
      url: docker.io/seu-usuario/foodclub-backend:development
```

2. Configure webhook no Docker Hub:
   - Docker Hub → Repository → Webhooks
   - URL: `https://api.render.com/deploy/srv-xxxxx?key=xxxxx`
   - (Copie do Render Dashboard → Settings → Deploy Hook)

---

## 🔐 Variáveis de Ambiente

### GitHub Secrets necessários

| Secret | Descrição | Usado em |
|--------|-----------|----------|
| `AWS_ACCESS_KEY_ID` | Credencial AWS | Beanstalk |
| `AWS_SECRET_ACCESS_KEY` | Credencial AWS | Beanstalk |
| `DOCKER_USERNAME` | Username Docker Hub | Docker Hub |
| `DOCKER_PASSWORD` | Token Docker Hub | Docker Hub |
| `FOODCLUB_EMAIL` | Email para notificações | Notificações |
| `FOODCLUB_EMAIL_PASSWORD` | Senha do email | Notificações |

### Variáveis de Ambiente da Aplicação

Configuradas automaticamente no Render via `render.yaml`:

```bash
NODE_ENV=production
PORT=3000
DB_HOST=<auto-configurado>
DB_PORT=<auto-configurado>
DB_USERNAME=<auto-configurado>
DB_PASSWORD=<auto-configurado>
DB_DATABASE=<auto-configurado>
JWT_SECRET=<gerado automaticamente>
JWT_EXPIRATION=7d
```

---

## 🚀 Deploy Manual

### Via GitHub Actions

```powershell
# Commit e push acionam automaticamente
git add .
git commit -m "feat: nova funcionalidade"
git push origin development  # Ou main
```

### Build e Push Docker Manual

```powershell
# Login no Docker Hub
docker login -u seu-usuario

# Build com multi-stage
docker build -t seu-usuario/foodclub-backend:latest .

# Tag específica
docker tag seu-usuario/foodclub-backend:latest seu-usuario/foodclub-backend:v1.0.0

# Push
docker push seu-usuario/foodclub-backend:latest
docker push seu-usuario/foodclub-backend:v1.0.0
```

### Testar Docker Compose Localmente

```powershell
# Sobe banco + API
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Parar
docker-compose down

# Parar e limpar volumes
docker-compose down -v
```

---

## 🐛 Troubleshooting

### Problema: Build falha no GitHub Actions

**Sintoma**: Erro durante `npm ci` ou `npm run build`

**Solução**:
```powershell
# Limpar cache localmente
npm cache clean --force
rm package-lock.json
npm install

# Commitar novo package-lock.json
git add package-lock.json
git commit -m "chore: update package-lock.json"
git push
```

### Problema: Docker build falha

**Sintoma**: `ERROR [builder X/Y]`

**Soluções**:
1. Verificar `.dockerignore` não está bloqueando arquivos essenciais
2. Testar build local:
```powershell
docker build --no-cache -t teste .
```
3. Verificar logs completos:
```powershell
docker build --progress=plain -t teste .
```

### Problema: Render não conecta ao banco

**Sintoma**: `Connection refused` ou `ECONNREFUSED`

**Soluções**:
1. Verificar variáveis de ambiente no Dashboard
2. Certificar que usou **"From Database"** para DB_HOST, DB_PORT, etc.
3. Verificar se banco está na mesma região do serviço
4. Testar conexão manual:
```bash
# No Shell do Render Web Service
echo $DB_HOST
psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE
```

### Problema: Render build timeout

**Sintoma**: Build excede 15 minutos no plano Free

**Soluções**:
1. Usar imagem do Docker Hub (mais rápido):
   - GitHub Actions builda e publica
   - Render apenas puxa a imagem pronta
2. Otimizar Dockerfile (já feito)
3. Upgrade para plano pago (builds mais rápidos)

### Problema: Health check falha

**Sintoma**: Serviço fica em estado "Deploying" infinitamente

**Solução**:
1. Adicionar endpoint de health check:

```typescript
// src/app.controller.ts
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}
```

2. Configurar no Render:
   - Dashboard → Settings → Health Check Path: `/health`

### Problema: Variável JWT_SECRET não persiste

**Sintoma**: Usuários deslogam após restart

**Solução**:
1. Não use "Generate Value" para JWT_SECRET
2. Defina manualmente um valor fixo:
```bash
JWT_SECRET=seu-secret-super-secreto-e-longo-aqui-minimo-32-caracteres
```

---

## 📊 Monitoramento

### Logs no Render
```bash
# Dashboard → foodclub-backend → Logs
# Logs em tempo real
# Filtro por timestamp
```

### Logs no Elastic Beanstalk
```bash
# AWS Console → Elastic Beanstalk → Logs
# Download full logs
```

### Métricas Docker Hub
```bash
# Docker Hub → Repository → Analytics
# Pulls, storage, vulnerabilities
```

---

## 🎯 Checklist de Deploy

### Antes do primeiro deploy:

- [ ] Criar conta Docker Hub
- [ ] Criar repositório `foodclub-backend` no Docker Hub
- [ ] Adicionar `DOCKER_USERNAME` e `DOCKER_PASSWORD` nos GitHub Secrets
- [ ] Criar conta no Render
- [ ] Conectar repositório GitHub ao Render
- [ ] Fazer push do `render.yaml`
- [ ] Criar Blueprint no Render
- [ ] Verificar variáveis de ambiente no Render
- [ ] Adicionar endpoint `/health` na aplicação
- [ ] Testar build local do Docker

### Para cada deploy:

- [ ] Código testado localmente
- [ ] Migrations criadas (se necessário)
- [ ] Commit com mensagem semântica
- [ ] Push para branch correta
- [ ] Acompanhar GitHub Actions
- [ ] Verificar deploy no Beanstalk
- [ ] Verificar imagem no Docker Hub
- [ ] Verificar deploy no Render
- [ ] Testar endpoints em produção
- [ ] Verificar logs em ambas plataformas

---

## 🔗 Links Úteis

- **GitHub Actions**: `https://github.com/iFoodClub/Backend/actions`
- **Docker Hub**: `https://hub.docker.com/r/seu-usuario/foodclub-backend`
- **Render Dashboard**: `https://dashboard.render.com/`
- **AWS Beanstalk**: Console AWS → Elastic Beanstalk
- **Documentação Render**: https://render.com/docs
- **Documentação Docker**: https://docs.docker.com/

---

## 📝 Notas Importantes

1. **Plano Free do Render**:
   - Serviços ficam inativos após 15min sem uso
   - Primeiro request pode demorar ~30s (cold start)
   - Banco tem limite de 1GB
   - Considere upgrade para produção real

2. **Custos**:
   - Docker Hub: Free para 1 repositório privado
   - Render Free: $0/mês (com limitações)
   - AWS Beanstalk: Varia conforme uso

3. **Segurança**:
   - Sempre use HTTPS em produção
   - Não commite secrets no código
   - Rotacione tokens periodicamente
   - Use senhas fortes para banco de dados

4. **Performance**:
   - Render Free usa CPU compartilhada
   - Para alta disponibilidade, considere planos pagos
   - Configure CDN para assets estáticos

---

**Criado por:** FoodClub Team  
**Última atualização:** Novembro 2025  
**Versão:** 1.0.0
