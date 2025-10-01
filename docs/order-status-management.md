# Gerenciamento de Status dos Pedidos

Este documento descreve as novas funcionalidades implementadas para gerenciar o status dos pedidos individuais e dos pedidos da empresa.

## Visão Geral

O sistema agora permite:
- Atualizar o status de pedidos individuais (funcionários)
- Atualizar o status de pedidos da empresa
- Consultar o progresso de um pedido da empresa
- Atualização automática do status da empresa quando todos os pedidos individuais são concluídos

## Status Disponíveis

### Pedidos Individuais (Individual Orders)
- `preparing`: Preparando
- `completed`: Concluído

### Pedidos da Empresa (Company Orders)
- `pending`: Enviado
- `confirmed`: Confirmado
- `preparing`: Preparando
- `delivered`: Entregue
- `canceled`: Cancelado

## Rotas Implementadas

### 1. Atualizar Status do Pedido Individual

**PUT** `/Restaurant/:restaurantId/orders/:orderId/individual-orders/:individualOrderId/status`

Atualiza o status de um pedido individual específico. Se o status for alterado para "completed" e todos os outros pedidos individuais do mesmo pedido da empresa também estiverem completos, o status do pedido da empresa será automaticamente atualizado para "delivered".

**Parâmetros:**
- `restaurantId`: ID do restaurante
- `orderId`: ID do pedido da empresa
- `individualOrderId`: ID do pedido individual

**Body:**
```json
{
  "id": 1,
  "status": "completed"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Status do pedido individual atualizado e pedido da empresa marcado como entregue",
  "companyOrderUpdated": true
}
```

### 2. Atualizar Status do Pedido da Empresa

**PUT** `/Restaurant/:restaurantId/orders/:orderId/status`

Atualiza o status de um pedido da empresa.

**Parâmetros:**
- `restaurantId`: ID do restaurante
- `orderId`: ID do pedido da empresa

**Body:**
```json
{
  "id": 1,
  "status": "delivered"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Status do pedido da empresa atualizado com sucesso"
}
```

### 3. Consultar Progresso do Pedido

**GET** `/Restaurant/:restaurantId/orders/:orderId/progress`

Retorna informações detalhadas sobre o progresso de um pedido da empresa, incluindo contadores e porcentagem de conclusão.

**Parâmetros:**
- `restaurantId`: ID do restaurante
- `orderId`: ID do pedido da empresa

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "companyOrderId": 1,
    "companyOrderStatus": "Preparando",
    "totalOrders": 5,
    "completedOrders": 3,
    "progressPercentage": 60,
    "isAllCompleted": false
  }
}
```

## Fluxo de Atualização Automática

1. Quando um pedido individual é marcado como "completed"
2. O sistema verifica se todos os outros pedidos individuais do mesmo pedido da empresa também estão completos
3. Se todos estiverem completos, o status do pedido da empresa é automaticamente atualizado para "delivered"
4. A resposta inclui a informação `companyOrderUpdated: true` quando isso acontece

## Exemplos de Uso

### Cenário 1: Atualizando um pedido individual
```bash
curl -X PUT http://localhost:3000/Restaurant/1/orders/5/individual-orders/10/status \
  -H "Content-Type: application/json" \
  -d '{"id": 10, "status": "completed"}'
```

### Cenário 2: Consultando progresso
```bash
curl -X GET http://localhost:3000/Restaurant/1/orders/5/progress
```

### Cenário 3: Atualizando status da empresa
```bash
curl -X PUT http://localhost:3000/Restaurant/1/orders/5/status \
  -H "Content-Type: application/json" \
  -d '{"id": 5, "status": "delivered"}'
```

## Tratamento de Erros

### Erro 404 - Pedido não encontrado
```json
{
  "success": false,
  "message": "Pedido individual não encontrado"
}
```

### Erro 400 - Validação
```json
{
  "success": false,
  "message": "ID do pedido individual na URL não corresponde ao ID no corpo da requisição"
}
```

### Erro 500 - Erro interno
```json
{
  "success": false,
  "message": "Erro interno do servidor"
}
```

## Migração Necessária

Antes de usar as novas funcionalidades, execute a migration para adicionar o campo status na tabela individual_order:

```bash
npm run migration:run
```

A migration `20250101000000-add-status-to-individual-order.js` adicionará o campo status com valores padrão 'preparing' para todos os registros existentes. 