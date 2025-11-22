# ⚡ Setup Rápido - CloudWatch Observability

## 🎯 Resumo

Implementação completa de observabilidade com AWS CloudWatch para logs e métricas.

## 📦 1. Instalar Dependências

```bash
npm install
```

## ☁️ 2. Configurar AWS

### Opção A: AWS Console (Recomendado)

1. **Criar Log Group:**
   - Acesse: https://console.aws.amazon.com/cloudwatch
   - Clique em **Logs** → **Log groups** → **Create log group**
   - Nome: `/aws/foodclub/backend`
   - Retention: 7 dias (para economizar)

2. **Criar usuário IAM:**
   - Acesse: https://console.aws.amazon.com/iam
   - **Users** → **Add users**
   - Nome: `foodclub-backend-cloudwatch`
   - **Attach policies directly** → **Create policy**
   - Cole a policy abaixo:

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

3. **Gerar Access Key:**
   - Selecione o usuário criado
   - **Security credentials** → **Create access key**
   - Use case: **Application running outside AWS**
   - Copie **Access Key ID** e **Secret Access Key**

### Opção B: AWS CLI

```bash
# Criar log group
aws logs create-log-group --log-group-name /aws/foodclub/backend --region us-east-1

# Criar usuário
aws iam create-user --user-name foodclub-backend-cloudwatch

# Criar policy (salve como policy.json primeiro)
aws iam create-policy --policy-name FoodClubCloudWatchAccess --policy-document file://policy.json

# Anexar policy ao usuário
aws iam attach-user-policy --user-name foodclub-backend-cloudwatch --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/FoodClubCloudWatchAccess

# Criar access key
aws iam create-access-key --user-name foodclub-backend-cloudwatch
```

## 🔧 3. Configurar Variáveis de Ambiente

### No Render Dashboard:

1. Acesse seu serviço **Backend**
2. **Environment** → **Add Environment Variable**
3. Adicione:

```
AWS_REGION = us-east-1
AWS_ACCESS_KEY_ID = AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
CLOUDWATCH_LOG_GROUP = /aws/foodclub/backend
CLOUDWATCH_NAMESPACE = FoodClub/Backend
```

4. Clique em **Save Changes**

### Localmente (.env):

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
CLOUDWATCH_LOG_GROUP=/aws/foodclub/backend
CLOUDWATCH_NAMESPACE=FoodClub/Backend
```

## 🚀 4. Deploy

```bash
git add .
git commit -m "feat: add CloudWatch observability"
git push origin feat/multi-deploy
```

O Render vai auto-deployar com as novas configurações.

## 📊 5. Verificar Funcionamento

### Ver Logs no CloudWatch:

1. Acesse: https://console.aws.amazon.com/cloudwatch
2. **Logs** → **Log groups** → `/aws/foodclub/backend`
3. Você verá um log stream criado automaticamente
4. Clique no stream para ver os logs

### Ver Métricas:

1. **CloudWatch** → **Metrics** → **All metrics**
2. Procure por namespace: **FoodClub/Backend**
3. Você verá métricas como:
   - ApiRequestCount
   - ApiRequestDuration
   - ErrorCount
   - OrdersCreated

## 📈 6. Criar Dashboard (Opcional)

1. **CloudWatch** → **Dashboards** → **Create dashboard**
2. Nome: `FoodClub-Backend`
3. **Add widget** → **Line**
4. Selecione métricas:
   - `FoodClub/Backend` → `ApiRequestCount`
   - `FoodClub/Backend` → `ApiRequestDuration`
5. **Create widget**

## 🧪 7. Testar

Faça algumas requisições para o backend:

```bash
# Health check
curl https://seu-backend.onrender.com/health-check

# Fazer login
curl -X POST https://seu-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

Depois, verifique os logs e métricas no CloudWatch!

## ⚠️ Importante

- **Sem AWS configurado:** A aplicação funciona normalmente, apenas loga no console
- **Com AWS configurado:** Logs vão para CloudWatch + console (para debug)
- **Custos:** ~$10-15/mês para 10k requests/dia

## 📚 Documentação Completa

Veja `docs/cloudwatch-observability.md` para detalhes completos sobre:
- Como usar métricas customizadas
- Como criar alarmes
- Exemplos de código
- Dashboards avançados
