# Phase 1: Segurança no Pipeline - Guia de Setup

## 1️⃣ Secret Scanning (GitHub Nativo)

### O que faz?
Detecta automaticamente se credenciais, tokens, chaves de API foram commitadas no repositório.

### Como ativar:
1. Vá ao repositório no GitHub
2. **Settings** → **Security & analysis**
3. Ative **Secret scanning**
4. Ative **Push protection** (opcional, mas recomendado)
5. Pronto! GitHub vai alertar a cada push com possíveis secrets

### Resultado:
Se alguém tentar fazer `git push` com um AWS key ou JWT secret:
```
❌ This push is blocked
Secret scanning has detected credentials
```

---

## 2️⃣ SAST com CodeQL (Já Ativo no CI/CD)

### O que faz?
Analisa o código TypeScript/JavaScript em busca de vulnerabilidades (SQL injection, XSS, etc).

### Status:
✅ Já adicionado ao `.github/workflows/ci-cd.yml`

### Como visualizar:
1. **Repository** → **Security** → **Code scanning**
2. Cada PR vai mostrar issues encontradas
3. Você pode fechar a issue com contexto (false positive, etc)

### Exemplo de falha:
```typescript
// ❌ Isso vai gerar alerta CodeQL
const query = `SELECT * FROM users WHERE id = ${userId}`; // SQL injection

// ✅ Isso é seguro
const query = 'SELECT * FROM users WHERE id = $1';
client.query(query, [userId]);
```

---

## 3️⃣ Dependency Scanning (Dependabot - Já Ativo)

### O que faz?
Monitora dependências (npm packages) em busca de vulnerabilidades conhecidas.
Cria PRs automáticas para atualizar dependências.

### Status:
✅ Já configurado em `.github/dependabot.yml`

### Configuração:
- **Frequência:** Semanalmente (segunda-feira)
- **Auto-merge:** Desabilitado (você aprova manualmente)
- **Grupos:** Dependências separadas por tipo (prod vs dev)

### Como visualizar:
1. **Dependabot alerts** na aba Security
2. Cada dependência vulnerável tem um alerta
3. Dependabot cria PR com a atualização

### Exemplo:
```
dependabot: chore(deps): bump lodash from 4.17.19 to 4.17.21
  Esta atualização corrige 4 vulnerabilidades
  [✅ Merge pull request]
```

---

## 4️⃣ Image Scanning (Trivy - Já Ativo no CI/CD)

### O que faz?
Verifica a imagem Docker em busca de vulnerabilidades do SO (libraries, binaries).
Falha o build se encontrar vulnerabilidades CRITICAL ou HIGH.

### Status:
✅ Já adicionado ao job `docker_build_push_acr`

### Configuração:
- **Tipos:** OS packages + library dependencies
- **Severidade:** Falha em HIGH e CRITICAL
- **Ignora:** Vulnerabilidades já conhecidas/patched

### Exemplo de falha no CI:
```
Trivy vulnerability scan
  nginx base image: 2 CRITICAL vulnerabilities found
  ❌ Build failed. Fix vulnerabilities before merging
```

### Como corrigir:
1. Atualizar base image no `Dockerfile` (ex: FROM node:20-alpine → node:21-alpine)
2. Rodar `docker build` localmente e verificar com Trivy
3. Fazer push novamente

---

## 5️⃣ OIDC para Azure (TODO - Próximo passo)

### O que é?
Autenticação federada entre GitHub e Azure sem usar credenciais hardcoded.

### Benefícios:
- ✅ Sem secrets de longa duração no GitHub
- ✅ Auditoria melhor
- ✅ Revogação instantânea

### Como configurar:

#### Passo 1: Criar App Registration no Azure
```bash
az ad app create --display-name "GitHub-FoodClub-OIDC"
# Copie o Application ID
```

#### Passo 2: Criar Federated Credential
```bash
AZURE_TENANT_ID="<seu-tenant-id>"
GITHUB_OWNER="<seu-usuario>"
GITHUB_REPO="<seu-repo>"

az ad app federated-credential create \
  --id <Application-ID> \
  --parameters "{
    'name': 'foodclub-github-oidc',
    'issuer': 'https://token.actions.githubusercontent.com',
    'subject': 'repo:${GITHUB_OWNER}/${GITHUB_REPO}:ref:refs/heads/main',
    'audiences': ['api://AzureADTokenExchange']
  }"
```

#### Passo 3: Criar Service Principal
```bash
az ad sp create --id <Application-ID>
SERVICE_PRINCIPAL_ID=$(az ad sp show --id <Application-ID> --query id -o tsv)

# Dar permissão no Resource Group
az role assignment create \
  --assignee-object-id $SERVICE_PRINCIPAL_ID \
  --role "Contributor" \
  --scope "/subscriptions/<subscription-id>/resourceGroups/rg-foodclub"
```

#### Passo 4: Configurar GitHub Secrets
No repositório, adicione:
- `AZURE_TENANT_ID`: seu tenant ID
- `AZURE_SUBSCRIPTION_ID`: seu subscription ID
- `AZURE_CLIENT_ID`: Application ID do app registration

#### Passo 5: Atualizar CI/CD
```yaml
- uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
    # NÃO precisa mais de AZURE_CREDENTIALS (secret da conta inteira)
```

---

## 📊 Checklist de Setup (Phase 1)

- [x] Secret Scanning ativado
- [x] SAST/CodeQL no CI/CD
- [x] Image Scanning (Trivy) no CI/CD
- [x] Dependabot configurado
- [ ] OIDC configurado (próximo)

---

## 🚨 Troubleshooting

### CodeQL rodando muito lentamente?
- Aumentar timeout em `.github/workflows/ci-cd.yml`
- Rodar em schedule (noite) ao invés de cada push

### Trivy bloqueando builds legítimos?
- Rever a severidade (mudar de HIGH para CRITICAL only)
- Documentar exceções em `trivy.yaml`

### Dependabot criando PRs demais?
- Aumentar intervalo (semanal → bi-semanal)
- Desabilitar para dev dependencies

---

## 📚 Documentação Adicional

- [GitHub Secret Scanning Docs](https://docs.github.com/en/code-security/secret-scanning)
- [CodeQL Documentation](https://codeql.github.com/)
- [Trivy GitHub Action](https://github.com/aquasecurity/trivy-action)
- [Azure OIDC Setup](https://docs.microsoft.com/en-us/azure/active-directory/workload-identities/workload-identity-federation)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)

---

**Status:** Phase 1 em progresso  
**Última atualização:** Maio 3, 2026
