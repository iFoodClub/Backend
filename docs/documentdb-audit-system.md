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

## 🚀 Configuração AWS DocumentDB

### 1. Criar Cluster DocumentDB

```bash
# Via AWS Console:
1. AWS Console → DocumentDB → Create cluster
2. Cluster identifier: foodclub-audit
3. Master username: foodclub_admin
4. Master password: [sua senha segura]
5. Instance class: db.t3.medium (free tier eligible)
6. Number of instances: 1
7. VPC: Same VPC as Elastic Beanstalk (importante!)
8. Security group: Permitir porta 27017 do Beanstalk
```

### 2. Baixar Certificado SSL

```bash
# No seu projeto:
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O rds-combined-ca-bundle.pem
```

### 3. Configurar Variáveis de Ambiente

**Render (.env ou Dashboard):**
```env
DOCUMENTDB_URI=mongodb://foodclub_admin:sua_senha@foodclub-audit.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017/?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
DOCUMENTDB_CA_FILE=./rds-combined-ca-bundle.pem
```

**Elastic Beanstalk:**
```bash
# Configuration → Software → Environment properties
DOCUMENTDB_URI=mongodb://foodclub_admin:sua_senha@foodclub-audit.cluster-xxxxx.sa-east-1.docdb.amazonaws.com:27017/?tls=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
DOCUMENTDB_CA_FILE=/var/app/current/rds-combined-ca-bundle.pem
```

### 4. Atualizar Security Group

No DocumentDB, permita conexões da porta 27017 vindo do Security Group do Elastic Beanstalk:

```
Type: Custom TCP
Port Range: 27017
Source: [Security Group do Beanstalk]
```

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

## ✅ Checklist

- [ ] `npm install` executado
- [ ] Cluster DocumentDB criado na AWS
- [ ] Security Group configurado
- [ ] Certificado SSL baixado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Testar endpoint `/audit-logs`
- [ ] Registrar evento manualmente para validar
