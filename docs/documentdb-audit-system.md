# 📊 Sistema de Auditoria com AWS DocumentDB

## 🎯 Objetivo

Implementar um sistema de auditoria que registra eventos importantes da aplicação em um banco NoSQL (AWS DocumentDB - compatível com MongoDB).

## 🤔 Por que usar NoSQL aqui?

- **Dados não estruturados**: Eventos podem ter metadados variáveis
- **Alto volume de escrita**: Logs de auditoria são write-heavy
- **Consultas flexíveis**: Buscar por tipo de evento, usuário, período, etc
- **Sem relacionamentos**: Não precisa de JOINs complexos
- **Escalabilidade**: DocumentDB escala horizontalmente

## 📦 Estrutura Implementada

```
src/
├── domain/
│   └── models/
│       └── audit-log.schema.ts          # Schema MongoDB/Mongoose
├── infrastructure/
│   ├── services/
│   │   └── audit-log.service.ts         # Service com métodos de consulta
│   └── observability/
│       └── audit.interceptor.ts         # Interceptor automático (opcional)
└── interfaces/
    └── http/
        ├── audit-log.module.ts          # Módulo com conexão DocumentDB
        └── controllers/
            └── audit-log.controller.ts  # Endpoints REST
```

## 🚀 Configuração MongoDB Atlas (RECOMENDADO - GRÁTIS!)

### 1. Pegar Connection String do Atlas

1. Acesse https://cloud.mongodb.com/
2. Seu cluster → **Connect** → **Connect your application**
3. Driver: **Node.js** versão **5.5 or later**
4. Copie a connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Permitir Acesso do Render/Beanstalk

1. Atlas → **Network Access** → **Add IP Address**
2. Adicione:
   - `0.0.0.0/0` (permite qualquer IP - mais fácil)
   - Ou IPs específicos do Render/Beanstalk (mais seguro)

### 3. Configurar Variáveis de Ambiente

**Render Dashboard ou .env:**
```env
# Substitua <username>, <password> e cluster0.xxxxx pelos seus valores
DOCUMENTDB_URI=mongodb+srv://foodclub_user:sua_senha@cluster0.xxxxx.mongodb.net/foodclub-audit?retryWrites=true&w=majority
# NÃO precisa de DOCUMENTDB_CA_FILE para Atlas!
```

**Elastic Beanstalk:**
```bash
# Configuration → Software → Environment properties
DOCUMENTDB_URI=mongodb+srv://foodclub_user:sua_senha@cluster0.xxxxx.mongodb.net/foodclub-audit?retryWrites=true&w=majority
```

### 4. Usar Banco Existente (PODE!)

Se você já tem um banco no cluster:
- **Opção 1**: Usar o mesmo banco
  ```
  mongodb+srv://...mongodb.net/seu-banco-existente?...
  ```
  → Adiciona collection `auditlogs` automaticamente

- **Opção 2**: Criar banco separado (recomendado)
  ```
  mongodb+srv://...mongodb.net/foodclub-audit?...
  ```
  → Melhor organização

**Sem problema usar banco existente!** Mongoose cria as collections automaticamente.

## 📝 Como Usar

### Instalação

```bash
npm install
```

### Registrar Eventos Manualmente

```typescript
import { AuditLogService } from '@/infrastructure/services/audit-log.service';

@Injectable()
export class OrderService {
  constructor(private auditLogService: AuditLogService) {}

  async createOrder(data: CreateOrderDto, userId: number) {
    const order = await this.orderRepository.create(data);

    // Registrar evento de auditoria
    await this.auditLogService.create({
      eventType: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: order.id,
      userId: userId,
      description: `Pedido #${order.id} criado`,
      metadata: {
        totalAmount: order.totalAmount,
        restaurantId: order.restaurantId,
      },
    });

    return order;
  }
}
```

### Usar Interceptor Automático

```typescript
import { UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from '@/infrastructure/observability/audit.interceptor';

@Controller('orders')
@UseInterceptors(AuditInterceptor) // Registra automaticamente
export class OrderController {
  @Post()
  async create(@Body() dto: CreateOrderDto) {
    // Evento será registrado automaticamente após sucesso
    return this.orderService.create(dto);
  }
}
```

## 🔍 Endpoints Disponíveis

### GET /audit-logs
Listar logs recentes
```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://api.foodclub.com/audit-logs?limit=50"
```

### GET /audit-logs/by-entity
Buscar logs de uma entidade específica
```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://api.foodclub.com/audit-logs/by-entity?entityType=Order&entityId=123"
```

### GET /audit-logs/by-user
Buscar logs de um usuário
```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://api.foodclub.com/audit-logs/by-user?userId=456"
```

### GET /audit-logs/by-event-type
Buscar por tipo de evento
```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://api.foodclub.com/audit-logs/by-event-type?eventType=ORDER_CREATED"
```

### GET /audit-logs/stats
Estatísticas de eventos
```bash
curl -H "Authorization: Bearer TOKEN" \
  "https://api.foodclub.com/audit-logs/stats"
```

## 📊 Tipos de Eventos Sugeridos

```typescript
// Adicione conforme necessário
const EVENT_TYPES = {
  // Pedidos
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  
  // Usuários
  USER_LOGIN: 'USER_LOGIN',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  
  // Restaurantes
  RESTAURANT_CREATED: 'RESTAURANT_CREATED',
  DISH_CREATED: 'DISH_CREATED',
  DISH_UPDATED: 'DISH_UPDATED',
  
  // Empresas
  COMPANY_CREATED: 'COMPANY_CREATED',
  EMPLOYEE_ADDED: 'EMPLOYEE_ADDED',
};
```

## 💰 Custos Estimados

**AWS DocumentDB:**
- db.t3.medium (1 instância): ~$57/mês
- Storage: $0.10 por GB/mês
- I/O: $0.20 por milhão de requisições

**Total estimado:** ~$60-70/mês

**Alternativa mais barata:**
- Use MongoDB Atlas (free tier 512MB)
- Mude apenas a `DOCUMENTDB_URI` para apontar pro Atlas
- Código funciona igual (compatível 100%)

## 🧪 Testando Localmente

### Opção 1: MongoDB Local

```bash
# Instalar MongoDB localmente
docker run -d -p 27017:27017 --name mongodb mongo:latest

# .env
DOCUMENTDB_URI=mongodb://localhost:27017/foodclub-audit
# DOCUMENTDB_CA_FILE não é necessário para local
```

### Opção 2: MongoDB Atlas (Grátis)

1. Criar conta em https://www.mongodb.com/cloud/atlas
2. Criar cluster gratuito
3. Pegar connection string
4. Atualizar `DOCUMENTDB_URI`
