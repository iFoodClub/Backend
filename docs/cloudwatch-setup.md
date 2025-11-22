# 🔥 Guia Rápido - CloudWatch Observability

## ✅ Código (Já implementado)

- ✅ Services criados em `src/infrastructure/services/`
- ✅ Interceptor HTTP automático
- ✅ Módulo integrado no `app.module.ts`
- ✅ Logger configurado no `main.ts`
- ✅ Variáveis de ambiente no `render.yaml`

## 🚀 Próximos Passos

### 1️⃣ Instalar dependências

```bash
npm install
```

### 2️⃣ Configurar AWS CloudWatch

#### Opção A: Elastic Beanstalk (Recomendado - usa IAM Role)

**Não precisa de Access Keys!** O Beanstalk roda em EC2, use IAM Role:

1. **Criar IAM Role:**
   - AWS Console → IAM → Roles → Create role
   - Trusted entity: **AWS service** → **EC2**
   - Attach policy: Crie uma nova com este JSON:

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
      "Action": ["cloudwatch:PutMetricData"],
      "Resource": "*"
    }
  ]
}
```

2. **Criar Log Group:**
   - CloudWatch → Logs → Create log group
   - Nome: `/aws/foodclub/backend`

3. **Anexar Role ao Beanstalk:**
   - Elastic Beanstalk → Configuration → Security
   - **EC2 instance profile**: Selecione o role criado
   - Save

4. **Variáveis de ambiente no Beanstalk:**
   - Configuration → Software → Environment properties
   - Adicione apenas:
     - `AWS_REGION` = `sa-east-1`
     - `CLOUDWATCH_LOG_GROUP` = `/aws/foodclub/backend`
     - `CLOUDWATCH_NAMESPACE` = `FoodClub/Backend`
   - **NÃO adicione** `AWS_ACCESS_KEY_ID` nem `AWS_SECRET_ACCESS_KEY`

#### Opção B: Render (Precisa de Access Keys)

1. **Criar usuário IAM:**
   - IAM → Users → Create user
   - Nome: `foodclub-cloudwatch`
   - Attach policy diretamente com o JSON acima

2. **Gerar Access Key:**
   - Security credentials → Create access key
   - Use case: Application running outside AWS

3. **Adicionar no Render Dashboard:**
   - Backend → Environment
   - Adicione:
     - `AWS_ACCESS_KEY_ID` = sua key
     - `AWS_SECRET_ACCESS_KEY` = seu secret
   - As outras já estão no `render.yaml`

### 3️⃣ Testar Localmente

Crie um `.env` na raiz do projeto:

```env
# AWS CloudWatch (opcional para local)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
CLOUDWATCH_LOG_GROUP=/aws/foodclub/backend
CLOUDWATCH_NAMESPACE=FoodClub/Backend
```

Se não configurar, a aplicação funciona normalmente, apenas loga no console.

### 4️⃣ Deploy

```bash
git add .
git commit -m "feat: add CloudWatch observability"
git push origin development
```

### 5️⃣ Verificar Funcionamento

1. **Logs no CloudWatch:**
   - AWS Console → CloudWatch → Logs → `/aws/foodclub/backend`
   - Você verá logs de todas as requisições HTTP

2. **Métricas no CloudWatch:**
   - CloudWatch → Metrics → FoodClub/Backend
   - Métricas disponíveis:
     - `ApiRequestCount` - Contador de requisições
     - `ApiRequestDuration` - Latência das APIs
     - `ErrorCount` - Contador de erros
     - `OrdersCreated` - Pedidos criados

## 📊 Como Usar Métricas Customizadas

Injete o service em qualquer use case:

```typescript
import { CloudWatchMetricsService } from '../../infrastructure/services/cloudwatch-metrics.service';

export class CreateOrderUseCase {
  constructor(
    private metricsService: CloudWatchMetricsService,
  ) {}

  async execute(data: any) {
    // Sua lógica...
    const order = await this.orderRepo.create(data);
    
    // Registrar métrica
    await this.metricsService.recordOrderCreated('individual');
    
    return order;
  }
}
```

## 🎯 Resumo

### Beanstalk:
- ✅ Use IAM Role (mais seguro)
- ✅ Não precisa de Access Keys
- ✅ Configure apenas `AWS_REGION`

### Render:
- ⚠️ Precisa de Access Keys
- ✅ Configure `AWS_ACCESS_KEY_ID_CLOUDWATCH` e `AWS_SECRET_ACCESS_KEY_CLOUDWATCH` no Dashboard

### Local:
- 🔧 Opcional: configure `.env` para testar CloudWatch
- 🔧 Sem configurar: funciona normalmente, loga no console

## 💰 Custos Estimados

- Logs: ~$0.50 por GB
- Métricas: ~$0.30 por métrica/mês
- **Total estimado**: ~$10-15/mês para 10k requests/dia
