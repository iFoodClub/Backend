# 📋 Guia de Uso das Rotas de Audit Logs no Swagger

## 🔐 Autenticação

Todas as rotas de audit logs exigem autenticação JWT. Antes de testar, você precisa:

1. **Fazer login** via `/auth/login` para obter o token
2. **Autorizar no Swagger:**
   - Clique no botão **🔒 Authorize** no topo da página
   - Cole o token no formato: `Bearer seu_token_aqui`
   - Clique em **Authorize**

---

## 📡 Rotas Disponíveis

### 1. `GET /audit-logs` - Listar logs recentes

**Descrição:** Retorna os logs mais recentes de auditoria do sistema.

**Parâmetros:**
- `limit` (opcional): Quantidade de logs (padrão: 50)

**Exemplo no Swagger:**
```
GET /audit-logs?limit=20
```

**Resposta esperada:**
```json
[
  {
    "_id": "674589abc123def456789012",
    "eventType": "ORDER_CREATED",
    "entityType": "Order",
    "entityId": 123,
    "userId": 45,
    "metadata": {
      "orderType": "individual",
      "total": 29.90
    },
    "createdAt": "2025-11-26T10:30:00.000Z",
    "updatedAt": "2025-11-26T10:30:00.000Z"
  }
]
```

**Use quando:** Quiser ver uma visão geral das atividades recentes do sistema.

---

### 2. `GET /audit-logs/by-entity` - Buscar logs por entidade

**Descrição:** Retorna todo o histórico de uma entidade específica (Order, Dish, User, etc).

**Parâmetros:**
- `entityType` (obrigatório): Tipo da entidade (`Order`, `Dish`, `User`, `Company`, etc)
- `entityId` (obrigatório): ID da entidade no banco PostgreSQL

**Exemplo no Swagger:**
```
GET /audit-logs/by-entity?entityType=Order&entityId=123
```

**Resposta esperada:**
```json
[
  {
    "eventType": "ORDER_CREATED",
    "entityType": "Order",
    "entityId": 123,
    "userId": 45,
    "metadata": { "status": "pending" },
    "createdAt": "2025-11-26T10:30:00.000Z"
  },
  {
    "eventType": "ORDER_CONFIRMED",
    "entityType": "Order",
    "entityId": 123,
    "userId": 45,
    "metadata": { "status": "confirmed" },
    "createdAt": "2025-11-26T10:35:00.000Z"
  },
  {
    "eventType": "ORDER_DELIVERED",
    "entityType": "Order",
    "entityId": 123,
    "userId": 45,
    "metadata": { "status": "delivered" },
    "createdAt": "2025-11-26T11:00:00.000Z"
  }
]
```

**Use quando:** 
- Quiser rastrear o histórico completo de um pedido
- Investigar mudanças em um prato específico
- Auditoria de alterações em dados críticos

---

### 3. `GET /audit-logs/by-user` - Buscar logs por usuário

**Descrição:** Retorna todas as ações realizadas por um usuário específico.

**Parâmetros:**
- `userId` (obrigatório): ID do usuário
- `limit` (opcional): Quantidade de logs (padrão: 50)

**Exemplo no Swagger:**
```
GET /audit-logs/by-user?userId=45&limit=30
```

**Resposta esperada:**
```json
[
  {
    "eventType": "USER_LOGIN",
    "entityType": "User",
    "entityId": 45,
    "userId": 45,
    "metadata": { "ip": "192.168.1.100" },
    "createdAt": "2025-11-26T09:00:00.000Z"
  },
  {
    "eventType": "ORDER_CREATED",
    "entityType": "Order",
    "entityId": 123,
    "userId": 45,
    "metadata": { "total": 29.90 },
    "createdAt": "2025-11-26T10:30:00.000Z"
  },
  {
    "eventType": "ORDER_CANCELLED",
    "entityType": "Order",
    "entityId": 124,
    "userId": 45,
    "metadata": { "reason": "Mudou de ideia" },
    "createdAt": "2025-11-26T11:15:00.000Z"
  }
]
```

**Use quando:**
- Rastrear atividades de um usuário específico
- Investigar comportamento suspeito
- Gerar relatórios de ações por usuário

---

### 4. `GET /audit-logs/by-event-type` - Buscar logs por tipo de evento

**Descrição:** Filtra logs por tipo de evento específico.

**Parâmetros:**
- `eventType` (obrigatório): Tipo do evento
- `limit` (opcional): Quantidade de logs (padrão: 100)

**Tipos de eventos comuns:**
- `ORDER_CREATED` - Pedido criado
- `ORDER_CONFIRMED` - Pedido confirmado
- `ORDER_CANCELLED` - Pedido cancelado
- `ORDER_DELIVERED` - Pedido entregue
- `USER_LOGIN` - Login de usuário
- `USER_LOGOUT` - Logout de usuário
- `DISH_CREATED` - Prato criado
- `DISH_UPDATED` - Prato atualizado
- `DISH_DELETED` - Prato deletado
- `COMPANY_CREATED` - Empresa criada

**Exemplo no Swagger:**
```
GET /audit-logs/by-event-type?eventType=ORDER_CREATED&limit=50
```

**Resposta esperada:**
```json
[
  {
    "eventType": "ORDER_CREATED",
    "entityType": "Order",
    "entityId": 123,
    "userId": 45,
    "metadata": { "orderType": "company" },
    "createdAt": "2025-11-26T10:30:00.000Z"
  },
  {
    "eventType": "ORDER_CREATED",
    "entityType": "Order",
    "entityId": 124,
    "userId": 46,
    "metadata": { "orderType": "individual" },
    "createdAt": "2025-11-26T10:31:00.000Z"
  }
]
```

**Use quando:**
- Analisar padrões de eventos específicos
- Contar quantos pedidos foram criados em um período
- Filtrar apenas cancelamentos ou entregas

---

### 5. `GET /audit-logs/stats` - Estatísticas de eventos

**Descrição:** Retorna contagem agregada de eventos por tipo. Útil para dashboards.

**Parâmetros:** Nenhum

**Exemplo no Swagger:**
```
GET /audit-logs/stats
```

**Resposta esperada:**
```json
[
  {
    "_id": "ORDER_CREATED",
    "count": 1523
  },
  {
    "_id": "USER_LOGIN",
    "count": 892
  },
  {
    "_id": "ORDER_DELIVERED",
    "count": 1401
  },
  {
    "_id": "ORDER_CANCELLED",
    "count": 143
  },
  {
    "_id": "DISH_UPDATED",
    "count": 67
  }
]
```

**Use quando:**
- Criar dashboards de métricas
- Análise de volume de operações
- Relatórios gerenciais

---

## 🧪 Como Testar no Swagger

### Passo a passo completo:

1. **Acesse o Swagger:**
   ```
   http://localhost:3000/api
   ```

2. **Faça login:**
   - Expanda a seção **Auth** ou **Users**
   - Execute `POST /auth/login` com suas credenciais
   - Copie o `accessToken` da resposta

3. **Autorize:**
   - Clique no botão **🔒 Authorize** no topo
   - Cole o token (automaticamente adiciona `Bearer` se necessário)
   - Clique em **Authorize** e depois **Close**

4. **Teste as rotas:**
   - Expanda a seção **Audit Logs 📋**
   - Escolha uma rota (ex: `GET /audit-logs`)
   - Clique em **Try it out**
   - Preencha os parâmetros (se houver)
   - Clique em **Execute**
   - Veja a resposta abaixo

### Exemplo de teste completo:

```bash
# 1. Login para obter token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu@email.com","password":"senha123"}'

# Resposta: { "accessToken": "eyJhbGc..." }

# 2. Buscar logs recentes
curl -X GET 'http://localhost:3000/audit-logs?limit=10' \
  -H "Authorization: Bearer eyJhbGc..."

# 3. Buscar histórico de um pedido específico
curl -X GET 'http://localhost:3000/audit-logs/by-entity?entityType=Order&entityId=123' \
  -H "Authorization: Bearer eyJhbGc..."

# 4. Ver estatísticas
curl -X GET 'http://localhost:3000/audit-logs/stats' \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🎯 Casos de Uso Práticos

### 1. Rastrear um pedido do início ao fim
```
GET /audit-logs/by-entity?entityType=Order&entityId=123
```
Retorna: Criação → Confirmação → Preparação → Entrega

### 2. Ver o que um usuário fez hoje
```
GET /audit-logs/by-user?userId=45&limit=100
```
Retorna: Logins, pedidos criados, cancelamentos, etc

### 3. Contar quantos pedidos foram cancelados
```
GET /audit-logs/by-event-type?eventType=ORDER_CANCELLED&limit=1000
```
Conte os resultados para análise

### 4. Dashboard de métricas gerais
```
GET /audit-logs/stats
```
Use para criar gráficos de pizza ou barras

### 5. Visão geral das últimas atividades
```
GET /audit-logs?limit=20
```
Feed de atividades em tempo real

---

## 🔍 Estrutura de um Log de Auditoria

```typescript
{
  "_id": "string",              // ID único do MongoDB
  "eventType": "string",        // Tipo do evento (ORDER_CREATED, USER_LOGIN, etc)
  "entityType": "string",       // Tipo da entidade (Order, User, Dish, etc)
  "entityId": number,           // ID da entidade no PostgreSQL (opcional)
  "userId": number,             // ID do usuário que executou a ação (opcional)
  "metadata": object,           // Dados adicionais flexíveis
  "createdAt": "ISO date",      // Data/hora de criação
  "updatedAt": "ISO date"       // Data/hora de atualização
}
```

### Exemplo de metadata comum:

```json
{
  // Para ORDER_CREATED
  "metadata": {
    "orderType": "individual",
    "total": 29.90,
    "items": 3
  },

  // Para USER_LOGIN
  "metadata": {
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  },

  // Para ORDER_CANCELLED
  "metadata": {
    "reason": "Cliente desistiu",
    "cancelledBy": "user"
  }
}
```

---

## 📊 Visualizando no MongoDB Atlas

Além do Swagger, você pode ver os logs diretamente no Atlas:

1. Acesse seu cluster no Atlas
2. Vá em **Collections**
3. Selecione o banco `foodclub` (ou o nome configurado)
4. Veja a collection `auditlogs`
5. Use os filtros para buscar: `{ "eventType": "ORDER_CREATED" }`

---

## 🛠️ Troubleshooting

### Erro 401 Unauthorized
❌ Problema: Token JWT não foi enviado ou expirou
✅ Solução: Faça login novamente e atualize a autorização no Swagger

### Erro 500 Internal Server Error
❌ Problema: MongoDB não está conectado
✅ Solução: 
- Verifique se `DOCUMENTDB_URI` está configurado corretamente
- Teste a conexão no Atlas (Network Access configurado?)
- Veja os logs da aplicação para detalhes

### Nenhum log retornado
❌ Problema: Collection vazia ou filtros muito restritivos
✅ Solução:
- Teste primeiro `GET /audit-logs/stats` (não precisa de dados)
- Crie um log manualmente para testar
- Verifique se a aplicação está gravando logs (veja seção de implementação)

---

## 🚀 Próximos Passos

Agora que você sabe usar as rotas, pode:

1. **Implementar logging automático** - Use o `AuditInterceptor` ou chame `auditLogService.create()` manualmente
2. **Criar dashboards** - Consuma as APIs no frontend para visualizar métricas
3. **Configurar alertas** - Monitore eventos críticos (muitos cancelamentos, logins suspeitos)
4. **Exportar relatórios** - Gere CSVs com dados de auditoria para compliance

---

**Documentação atualizada em:** 26/11/2025
