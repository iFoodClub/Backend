# Observabilidade com AWS CloudWatch

## 📊 Visão Geral

Este projeto implementa observabilidade completa usando AWS CloudWatch com:
- **Logs estruturados** (CloudWatch Logs)
- **Métricas customizadas** (CloudWatch Metrics)
- **Interceptor automático** para todas as requisições HTTP

## 🚀 Configuração

### 1. Variáveis de Ambiente

Adicione no Render Dashboard ou no `.env` local:

```bash
# AWS Credentials (obrigatório para CloudWatch)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# CloudWatch Configuration (opcional, tem valores padrão)
CLOUDWATCH_LOG_GROUP=/aws/foodclub/backend
CLOUDWATCH_NAMESPACE=FoodClub/Backend
```

### 2. Criar Log Group no AWS Console

1. Acesse **CloudWatch** → **Logs** → **Log groups**
2. Clique em **Create log group**
3. Nome: `/aws/foodclub/backend`
4. Clique em **Create**

### 3. Instalar Dependências

```bash
npm install
```

As dependências do CloudWatch já foram adicionadas ao `package.json`:
- `@aws-sdk/client-cloudwatch`
- `@aws-sdk/client-cloudwatch-logs`

## 📈 Recursos Implementados

### Logs Automáticos

Todas as requisições HTTP são logadas automaticamente com:
- Método HTTP
- URL
- Status Code
- Duração da requisição
- User Agent
- Erros e stack traces

**Exemplo de log:**
```json
{
  "level": "INFO",
  "timestamp": "2025-11-22T10:30:45.123Z",
  "context": "HTTP",
  "message": {
    "method": "POST",
    "url": "/api/orders",
    "statusCode": 201,
    "duration": "245ms",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Métricas Customizadas

#### Métricas de API
- `ApiRequestCount`: Contador de requisições por endpoint, método e status
- `ApiRequestDuration`: Duração de requisições em ms

#### Métricas de Negócio
- `OrdersCreated`: Pedidos criados (individual/company)
- `DatabaseQueryCount`: Consultas ao banco
- `DatabaseQueryDuration`: Duração das queries
- `ErrorCount`: Erros por tipo e contexto

### Como Usar Métricas Customizadas

Injete o `CloudWatchMetricsService` em qualquer serviço:

```typescript
import { CloudWatchMetricsService } from '../../infrastructure/services/cloudwatch-metrics.service';

@Injectable()
export class OrderService {
  constructor(
    private metricsService: CloudWatchMetricsService,
  ) {}

  async createOrder(data: CreateOrderDto) {
    const order = await this.orderRepository.create(data);
    
    // Registrar métrica
    await this.metricsService.recordOrderCreated('individual');
    
    return order;
  }
}
```

### Como Usar Logger Customizado

Injete o `CloudWatchLoggerService`:

```typescript
import { CloudWatchLoggerService } from '../../infrastructure/services/cloudwatch-logger.service';

@Injectable()
export class PaymentService {
  constructor(
    private logger: CloudWatchLoggerService,
  ) {}

  async processPayment(orderId: string) {
    this.logger.log(`Processing payment for order ${orderId}`, 'PaymentService');
    
    try {
      // ... lógica de pagamento
      this.logger.log(`Payment processed successfully`, 'PaymentService');
    } catch (error) {
      this.logger.error(`Payment failed: ${error.message}`, error.stack, 'PaymentService');
      throw error;
    }
  }
}
```

## 📊 Dashboards no CloudWatch

### Criar Dashboard de Monitoramento

1. Acesse **CloudWatch** → **Dashboards** → **Create dashboard**
2. Nome: `FoodClub-Backend-Metrics`
3. Adicione widgets:

#### Widget 1: Requisições por Status
- Tipo: **Line**
- Métrica: `FoodClub/Backend` → `ApiRequestCount`
- Dimensões: StatusCode
- Statistic: Sum
- Period: 5 minutos

#### Widget 2: Latência de API
- Tipo: **Line**
- Métrica: `FoodClub/Backend` → `ApiRequestDuration`
- Dimensões: Endpoint
- Statistic: Average, p99
- Period: 5 minutos

#### Widget 3: Taxa de Erros
- Tipo: **Number**
- Métrica: `FoodClub/Backend` → `ErrorCount`
- Statistic: Sum
- Period: 5 minutos

#### Widget 4: Pedidos Criados
- Tipo: **Number**
- Métrica: `FoodClub/Backend` → `OrdersCreated`
- Dimensões: OrderType
- Statistic: Sum
- Period: 1 hora

## 🔔 Alarmes Recomendados

### Alarme 1: Alta Taxa de Erros
```
Metric: ErrorCount
Threshold: > 10 erros em 5 minutos
Action: SNS notification
```

### Alarme 2: Latência Alta
```
Metric: ApiRequestDuration
Threshold: Average > 1000ms por 2 períodos consecutivos
Action: SNS notification
```

### Alarme 3: Disponibilidade
```
Metric: ApiRequestCount (StatusCode=500)
Threshold: > 5 em 5 minutos
Action: SNS notification
```

## 🧪 Testando Localmente

O sistema funciona com fallback para console.log se as credenciais AWS não estiverem configuradas:

```bash
# Sem AWS configurado - logs apenas no console
npm run start:dev

# Com AWS configurado - logs no console + CloudWatch
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
npm run start:dev
```

## 📦 Estrutura de Arquivos

```
src/
├── infrastructure/
│   ├── services/
│   │   ├── cloudwatch-logger.service.ts    # Serviço de logs
│   │   └── cloudwatch-metrics.service.ts   # Serviço de métricas
│   └── observability/
│       └── metrics.interceptor.ts          # Interceptor HTTP automático
└── interfaces/
    └── http/
        └── observability.module.ts         # Módulo global
```

## 🔐 Segurança

### IAM Policy Mínima

Crie uma policy IAM com as permissões mínimas necessárias:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/aws/foodclub/backend:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "cloudwatch:namespace": "FoodClub/Backend"
        }
      }
    }
  ]
}
```

### Configurar no Render

1. Crie um usuário IAM com a policy acima
2. Gere Access Key e Secret Key
3. Adicione no Render Dashboard:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION=us-east-1`

## 💰 Custos Estimados

**AWS CloudWatch Pricing (us-east-1):**
- Logs: $0.50 por GB ingerido
- Métricas customizadas: $0.30 por métrica/mês
- Dashboards: $3.00 por dashboard/mês

**Estimativa para 10.000 requests/dia:**
- Logs: ~500MB/dia = ~$7.50/mês
- Métricas: ~10 métricas = ~$3.00/mês
- Dashboard: $3.00/mês
- **Total: ~$13.50/mês**

## 🎯 Próximos Passos

1. ✅ Configurar AWS credentials no Render
2. ✅ Criar Log Group no CloudWatch
3. ✅ Deploy da aplicação
4. 📊 Criar dashboard de monitoramento
5. 🔔 Configurar alarmes
6. 📈 Analisar métricas e otimizar

## 📚 Referências

- [AWS CloudWatch Logs](https://docs.aws.amazon.com/cloudwatch/logs/)
- [AWS CloudWatch Metrics](https://docs.aws.amazon.com/cloudwatch/metrics/)
- [NestJS Logger](https://docs.nestjs.com/techniques/logger)
