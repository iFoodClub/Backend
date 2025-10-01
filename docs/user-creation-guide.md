# Guia de Criação de Usuários - FoodClub API

## Visão Geral

A API do FoodClub suporta 3 tipos diferentes de usuários. Cada tipo tem campos obrigatórios e estrutura específica.

## Tipos de Usuário

### 1. Funcionário (employee)

**Campos obrigatórios:**
- `name`: Nome do funcionário
- `email`: Email do funcionário
- `password`: Senha do funcionário
- `userType`: Deve ser "employee"
- `cpf`: CPF do funcionário
- `employee`: Objeto com dados específicos do funcionário
- `company`: Objeto com referência à empresa

**Exemplo de requisição:**
```json
{
  "name": "João da Silva",
  "email": "joao.silva@email.com",
  "password": "senha123",
  "userType": "employee",
  "cpf": "12345678901",
  "employee": {
    "name": "João da Silva",
    "birthDate": "1990-05-10"
  },
  "company": {
    "id": 1
  }
}
```

### 2. Restaurante (restaurant)

**Campos obrigatórios:**
- `name`: Nome do restaurante
- `email`: Email do restaurante
- `password`: Senha do restaurante
- `userType`: Deve ser "restaurant"
- `cnpj`: CNPJ do restaurante
- `restaurant`: Objeto com dados específicos do restaurante

**Exemplo de requisição:**
```json
{
  "name": "Restaurante Saboroso",
  "email": "restaurante@email.com",
  "password": "senha123",
  "userType": "restaurant",
  "cnpj": "98765432000188",
  "restaurant": {
    "name": "Restaurante Saboroso",
    "cep": "87654321",
    "number": "200"
  }
}
```

### 3. Empresa (company)

**Campos obrigatórios:**
- `name`: Nome da empresa
- `email`: Email da empresa
- `password`: Senha da empresa
- `userType`: Deve ser "company"
- `cnpj`: CNPJ da empresa
- `company`: Objeto com dados específicos da empresa

**Exemplo de requisição:**
```json
{
  "name": "Empresa ABC Ltda",
  "email": "empresa@email.com",
  "password": "senha123",
  "userType": "company",
  "cnpj": "12345678000199",
  "company": {
    "name": "Empresa ABC Ltda",
    "cep": "12345678",
    "number": "100"
  }
}
```

## Endpoint

**POST** `/user`

## Respostas

### Sucesso (201)
```json
{
  "message": "Usuário criado com sucesso"
}
```

### Erro (400)
```json
{
  "success": false,
  "message": "Todos os campos são obrigatórios"
}
```

## Validações

- Todos os campos obrigatórios devem ser preenchidos
- O `userType` deve corresponder aos dados enviados
- Email deve ser único no sistema
- CPF deve ser válido para funcionários
- CNPJ deve ser válido para restaurantes e empresas
- Data de nascimento deve estar no formato YYYY-MM-DD
- CEP deve conter apenas números

## Observações

- Funcionários devem estar associados a uma empresa existente
- Restaurantes são entidades independentes
- Empresas podem ter múltiplos funcionários
- Todos os usuários podem fazer login com email e senha 