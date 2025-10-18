# 📚 Guia Visual do Swagger - Upload de Imagens

Este guia mostra passo a passo como usar o Swagger para testar o upload de imagens.

## 🚀 Como Acessar o Swagger

1. Inicie o servidor: `npm run start:dev`
2. Abra o navegador em: `http://localhost:3000/api`
3. Procure pela seção **"📤 Upload de Imagens"**

## 📤 Fazendo Upload de Imagem

### Passo 1: Localizar o Endpoint

Procure por: **POST /upload/image/{folder}**

### Passo 2: Abrir o Endpoint

1. Clique no endpoint para expandir
2. Você verá a documentação completa com:
   - Descrição detalhada
   - Parâmetros necessários
   - Exemplos de resposta
   - Tipos de arquivo aceitos

### Passo 3: Testar o Endpoint

1. **Clique em "Try it out"** (canto superior direito)

2. **Escolha a pasta (folder):**
   - Clique no dropdown de `folder`
   - Opções disponíveis:
     - `dishes` - Para fotos de pratos
     - `users` - Para fotos de perfil de usuários
     - `restaurants` - Para fotos de restaurantes
     - `companies` - Para logos de empresas
   - Selecione a pasta desejada (ex: `dishes`)

3. **Selecione o arquivo:**
   - Encontre o campo **"file"**
   - Clique em **"Choose File"** ou **"Escolher arquivo"**
   - Selecione uma imagem do seu computador
   - Formatos aceitos: JPG, PNG, GIF, WebP
   - Tamanho máximo: 5MB

4. **Execute:**
   - Clique no botão azul **"Execute"**
   - Aguarde o upload (pode levar alguns segundos)

### Passo 4: Ver a Resposta

#### ✅ Sucesso (Status 201)

```json
{
  "success": true,
  "message": "Imagem enviada com sucesso",
  "data": {
    "url": "https://foodclub-uploads.s3.us-east-1.amazonaws.com/dishes/1697123456789-abc123.jpg",
    "key": "dishes/1697123456789-abc123.jpg"
  }
}
```

**O que fazer com a resposta:**
- **URL** (`data.url`): Este é o link público da sua imagem. Use-o para:
  - Salvar no banco de dados
  - Exibir na interface do usuário
  - Compartilhar com outros sistemas

- **Key** (`data.key`): Guarde esta chave para:
  - Deletar a imagem depois
  - Referência interna

#### ❌ Erro (Status 400)

**Exemplo 1: Arquivo não selecionado**
```json
{
  "statusCode": 400,
  "message": "Nenhum arquivo foi enviado",
  "error": "Bad Request"
}
```

**Exemplo 2: Tipo de arquivo inválido**
```json
{
  "statusCode": 400,
  "message": "O arquivo deve ser uma imagem (JPEG, PNG, GIF ou WebP)",
  "error": "Bad Request"
}
```

**Exemplo 3: Arquivo muito grande**
```json
{
  "statusCode": 400,
  "message": "O arquivo deve ter no máximo 5MB",
  "error": "Bad Request"
}
```

**Exemplo 4: Pasta inválida**
```json
{
  "statusCode": 400,
  "message": "Pasta inválida. Use uma das seguintes: dishes, users, restaurants, companies",
  "error": "Bad Request"
}
```

## 🗑️ Deletando uma Imagem

### Passo 1: Localizar o Endpoint

Procure por: **DELETE /upload/image**

### Passo 2: Testar o Endpoint

1. **Clique em "Try it out"**

2. **Cole a chave do arquivo:**
   - No campo de exemplo, você verá:
   ```json
   {
     "key": "dishes/1697123456789-abc123.jpg"
   }
   ```
   - Substitua `"dishes/1697123456789-abc123.jpg"` pela chave real que você recebeu no upload
   - **IMPORTANTE:** Mantenha as aspas!

3. **Execute:**
   - Clique em **"Execute"**
   - Aguarde a confirmação

### Passo 3: Ver a Resposta

#### ✅ Sucesso (Status 200)

```json
{
  "success": true,
  "message": "Imagem deletada com sucesso"
}
```

#### ❌ Erro (Status 400)

**Exemplo 1: Chave não informada**
```json
{
  "statusCode": 400,
  "message": "A chave do arquivo é obrigatória",
  "error": "Bad Request"
}
```

**Exemplo 2: Arquivo não encontrado**
```json
{
  "statusCode": 400,
  "message": "Erro ao deletar imagem: arquivo não encontrado",
  "error": "Bad Request"
}
```

## 📋 Exemplos de Uso Completo

### Cenário 1: Upload de Foto de Prato

**Objetivo:** Adicionar foto de um novo prato de pizza

1. Abra: **POST /upload/image/{folder}**
2. Clique em "Try it out"
3. Selecione folder: `dishes`
4. Escolha arquivo: `pizza-margherita.jpg`
5. Execute
6. Copie a URL retornada:
   ```
   https://foodclub-uploads.s3.us-east-1.amazonaws.com/dishes/1697123456789-abc123.jpg
   ```
7. Use esta URL ao criar o prato no endpoint **POST /Dish**

### Cenário 2: Upload de Foto de Perfil de Funcionário

**Objetivo:** Adicionar foto de perfil de um funcionário

1. Abra: **POST /upload/image/{folder}**
2. Clique em "Try it out"
3. Selecione folder: `users`
4. Escolha arquivo: `funcionario-joao.jpg`
5. Execute
6. Copie a URL retornada
7. Use ao atualizar o funcionário em **PUT /employee/{id}**

### Cenário 3: Atualizar Logo da Empresa

**Objetivo:** Trocar o logo antigo por um novo

**Parte 1: Upload do novo logo**
1. Abra: **POST /upload/image/{folder}**
2. Selecione folder: `companies`
3. Escolha arquivo: `novo-logo.png`
4. Execute
5. Guarde a URL e a Key retornadas

**Parte 2: Deletar logo antigo (opcional)**
1. Abra: **DELETE /upload/image**
2. Cole a key do logo antigo:
   ```json
   {
     "key": "companies/1697000000000-old123.png"
   }
   ```
3. Execute

**Parte 3: Atualizar empresa**
1. Use **PUT /company/{id}** com a nova URL

## 🎨 Schemas Disponíveis

O Swagger mostra automaticamente os schemas (modelos) de dados:

### UploadImageDto
```typescript
{
  file: binary // Arquivo para upload
}
```

### UploadResponseDto
```typescript
{
  success: boolean,
  message: string,
  data: {
    url: string,    // URL pública da imagem
    key: string     // Chave para deletar depois
  }
}
```

### DeleteImageDto
```typescript
{
  key: string // Chave do arquivo a deletar
}
```

### DeleteImageResponseDto
```typescript
{
  success: boolean,
  message: string
}
```

## 💡 Dicas Importantes

### ✅ Boas Práticas

1. **Sempre guarde a key retornada** - Você vai precisar dela para deletar
2. **Valide no frontend** - Verifique tipo e tamanho antes de enviar
3. **Trate erros** - Sempre verifique o status da resposta
4. **Use nomes descritivos** - Ajuda na organização

### ⚠️ Erros Comuns

1. **Esquecer de clicar em "Try it out"**
   - Solução: Sempre clique antes de tentar usar

2. **Não selecionar arquivo**
   - Solução: Clique em "Choose File"

3. **Arquivo muito grande**
   - Solução: Redimensione para menos de 5MB

4. **Tipo de arquivo errado**
   - Solução: Use apenas JPG, PNG, GIF ou WebP

5. **Key incorreta no delete**
   - Solução: Copie exatamente como recebeu no upload

### 🔐 Segurança (Futuro)

Quando a autenticação for implementada:

1. Você verá um cadeado 🔒 nos endpoints
2. Clique em **"Authorize"** no topo
3. Cole seu token JWT
4. Clique em "Authorize"
5. Agora pode usar os endpoints protegidos

## 🐛 Troubleshooting

### "Cannot read properties of undefined"
- Verifique se selecionou um arquivo
- Tente outro arquivo

### "Network Error"
- Verifique se o servidor está rodando
- Confirme a URL: `http://localhost:3000`

### "500 Internal Server Error"
- Verifique as credenciais AWS no `.env`
- Confirme que o bucket S3 existe
- Veja os logs do servidor

### Imagem não carrega (URL retorna 403)
- Verifique as permissões do bucket S3
- Confirme se ACL está habilitado
- Desabilite "Block Public Access" se necessário

## 📞 Suporte

Se encontrar problemas:
1. Veja os logs do servidor
3. Teste com cURL para isolar o problema
4. Verifique as configurações AWS

---

**Lembre-se:** O Swagger é apenas para testes! Em produção, use o endpoint diretamente do seu frontend.
