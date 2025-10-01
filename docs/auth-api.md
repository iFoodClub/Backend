# Documentação da API de Autenticação

## Endpoints

### POST /login
Realiza a autenticação do usuário e retorna um token JWT.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "token": "string (JWT Token)",
  "userDetails": {
    "id": "number",
    "email": "string",
    "userType": "string ('company' | 'employee' | 'restaurant')",
    // Detalhes específicos baseados no tipo de usuário
  }
}
```

**Erros:**
- 401 Unauthorized: Credenciais inválidas

### POST /logout
Realiza o logout do usuário (invalidação do token).

**Request:**
```json
{
  "token": "string (JWT Token)"
}
```

**Response (200 OK):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

## Autenticação

A API utiliza autenticação baseada em JWT (JSON Web Token). Para acessar endpoints protegidos:

1. Obtenha um token através do endpoint `/login`
2. Inclua o token no header de todas as requisições protegidas:
   ```
   Authorization: Bearer <seu-token-jwt>
   ```

## Segurança

- As senhas são armazenadas usando hash bcrypt
- Os tokens JWT expiram após 1 hora
- As senhas nunca são retornadas nas respostas da API
- O sistema usa variáveis de ambiente para configurações sensíveis

## Variáveis de Ambiente

```env
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRATION=3600  # Tempo de expiração em segundos
```

## Exemplos de Uso

### Login
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email": "usuario@exemplo.com", "password": "senha123"}'
```

### Requisição Autenticada
```bash
curl -X GET http://localhost:3000/endpoint-protegido \
  -H "Authorization: Bearer seu-token-jwt"
``` 