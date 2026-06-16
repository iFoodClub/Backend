# DevOps & Infra Roadmap - FoodClub Backend

**Data:** Maio 2026  
**Status:** Em Progresso  
**Objetivo:** Levar a infraestrutura de uma solução manual para uma arquitetura profissional com segurança, observabilidade e confiabilidade.

---

## 📊 Visão Geral Atual

### Recursos Provisionados (Azure)
- ✅ Container Apps (HML + PROD)
- ✅ PostgreSQL Flexible Server
- ✅ Azure Container Registry
- ✅ Key Vault
- ✅ Log Analytics Workspace
- ✅ Application Insights

### Pipeline CI/CD
- ✅ GitHub Actions (validate → build → docker push → deploy)
- ✅ Versionamento semântico
- ✅ Releases automáticas
- ⚠️ Deploy automático (sem aprovação)
- ❌ SAST/scanning de segurança
- ❌ Smoke tests
- ❌ Rollback automático

### Observabilidade
- ⚠️ CloudWatch Logger (desativado, voltado a AWS)
- ❌ Datadog não integrado
- ❌ Traces distribuídos
- ❌ Alertas configurados

### Infraestrutura como Código
- ❌ Nenhum arquivo Bicep/Terraform
- ⚠️ Recursos criados manualmente via Portal/CLI

---

## 🎯 Roadmap em 3 Fases

### Phase 1: Segurança no Pipeline (Semanas 1-2)
**Objetivo:** Proteger código, dependências e secrets antes de ir para produção

#### Tarefas:
- [ ] **Secret Scanning** - Detectar credenciais commitadas
  - GitHub native secret scanning ✅ (nativo, zero setup)
  - Implementar em: CI/CD
  
- [ ] **SAST (Static Application Security Testing)**
  - Implementar: GitHub CodeQL (grátis para public repos)
  - Scans: JavaScript/TypeScript, vulnerabilidades de código
  
- [ ] **Dependency Scanning**
  - Ativar: Dependabot
  - Autorizar PRs automáticos para patches
  
- [ ] **Image Scanning**
  - Integrar: Trivy no Docker build
  - Fail if vulnerabilities > HIGH
  
- [ ] **OIDC no GitHub Actions**
  - Remover: Credenciais hardcoded no GitHub Secrets
  - Implementar: Federated identity com Azure
  - Benefício: Sem secrets de longa duração

#### Saída esperada:
```
git push → CI dispara → secret scan → SAST → dependencies check → build → image scan → deploy
```

---

### Phase 2: Observabilidade (Semanas 2-3)
**Objetivo:** Centralizar logs, métricas e traces no Datadog

#### Tarefas:
- [ ] **OpenTelemetry no NestJS**
  - Instalar: `@opentelemetry/api`, `@opentelemetry/sdk-node`
  - Instrumentar: HTTP, database, decorators customizados
  
- [ ] **Datadog Exporter**
  - Configurar: exportador OTLP para Datadog
  - Enviar: logs, traces, métricas
  
- [ ] **Remover CloudWatch (opcional)**
  - Manter: código comentado (pode reativar)
  - Migrar: toda telemetria para Datadog
  
- [ ] **Dashboards Datadog**
  - Criar: visão de saúde da aplicação
  - Métricas: latência, erros, throughput
  - Logs: searchable por endpoint/user/error_type
  
- [ ] **Alertas**
  - Error rate > 5%
  - Latência p95 > 1s
  - Database connection pool > 80%
  - Pod restart loops

#### Saída esperada:
- Datadog dashboard mostrando health real-time
- Logs estruturados e searchable
- Traces de requisições lentas

---

### Phase 3: Confiabilidade + IaC (Semanas 3-4)
**Objetivo:** Reproduzir infra automaticamente e fazer rollback seguro

#### Tarefas:
- [ ] **Smoke Tests Pós-Deploy**
  - Script: validar endpoints críticos após deploy
  - Endpoints: health-check, user login, order creation
  - Ação: se falhar, rollback automático
  
- [ ] **Rollback Automático**
  - Usar: Azure Container Apps revisions
  - Trigger: smoke test fail ou error rate spike
  - Manual: opção de rollback via CLI/Portal
  
- [ ] **Bicep IaC**
  - Arquivo: `infra/main.bicep`
  - Módulos: container-apps, postgres, key-vault, etc
  - Parâmetros: environment (dev/hml/prod)
  - Teste: rodar Bicep e validar recurso criado
  
- [ ] **CI/CD para Infra**
  - Validar: `bicep build` no PR
  - Preview: mostrar mudanças antes de aplicar
  - Deploy: aplicar Bicep antes do app deploy
  
- [ ] **Aprovações e Gates**
  - Adicionar: approval manual para PROD
  - Validar: testes passaram antes de deploy
  - Documentar: quem fez deploy e quando

#### Saída esperada:
- `git push → infra valida → app deploy → smoke tests → rollback automático se falhar`
- Infra toda versionada em Bicep
- Ambiente novo em 15 minutos

---

## 📋 Checklist de Implementação Atual

### ✅ Já Feito
- [x] Azure infra base (Container Apps, Postgres, etc)
- [x] GitHub Actions pipeline (validate → build → deploy)
- [x] Docker build e push para ACR
- [x] Versionamento semântico
- [x] GitHub releases

### 🚧 Em Progresso (Phase 1)
- [ ] Secret scanning no GitHub
- [ ] SAST com CodeQL
- [ ] Dependency scanning (Dependabot)
- [ ] Image scanning (Trivy)
- [ ] OIDC para Azure

### ❌ Próximas Fases
- [ ] OpenTelemetry + Datadog (Phase 2)
- [ ] Smoke tests + rollback (Phase 3)
- [ ] IaC com Bicep (Phase 3)

---

## 🔧 Como Usar Este Roadmap

### Para Desenvolvimento:
1. Seguir ordem das fases
2. Atualizar checklist conforme avança
3. Cada tarefa = um PR no GitHub

### Para Apresentações:
- **Executivos:** "Estamos securizando o pipeline (fase 1), depois vem observabilidade (fase 2) e automação total (fase 3)"
- **Técnicos:** Mostrar este documento + métricas de progresso
- **PO:** Estimar 6-8 semanas até tudo pronto

### Para Sprints:
- **Sprint 1 (1-2 weeks):** Todas as tarefas da Phase 1
- **Sprint 2 (1-2 weeks):** Todas as tarefas da Phase 2
- **Sprint 3 (2-3 weeks):** Todas as tarefas da Phase 3

---

## 💰 Custo de Implementação

| Item | Custo/mês | Notas |
|------|----------|-------|
| **Azure Container Apps** | ~$10-20 | Já incluído no plano atual |
| **PostgreSQL** | FREE (12m) | Gratuito nos primeiros 12 meses |
| **Log Analytics** | FREE (5GB/mês) | Incluído em Free tier |
| **Datadog** | $50-150 | Dependendo do volume |
| **GitHub Actions** | FREE | Minutos gratuitos suficientes |
| **Total estimado** | $60-170/mês | Reduz se aproveitar free tiers |

---

## 🚀 Próximos Passos Imediatos

1. **Hoje:** Ativar Secret Scanning + SAST no GitHub
2. **Amanhã:** Configurar OIDC para Azure (remover credenciais hardcoded)
3. **Esta semana:** Integrar Dependabot + Image Scanning
4. **Próxima semana:** Começar Phase 2 com OpenTelemetry

---

## 📚 Referências

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Azure Container Apps Security](https://learn.microsoft.com/en-us/azure/container-apps/security)
- [OpenTelemetry for Node.js](https://opentelemetry.io/docs/instrumentation/js/)
- [Datadog Docs](https://docs.datadoghq.com/)
- [Bicep Documentation](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
