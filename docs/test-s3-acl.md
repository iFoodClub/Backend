# 🧪 Script de Teste - Verificar ACL do S3

## Teste 1: Via cURL (Terminal)

```bash
# Fazer upload de teste
curl -X POST http://localhost:3000/upload/image/dishes \
  -F "file=@caminho/para/imagem.jpg"
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Imagem enviada com sucesso",
  "data": {
    "url": "https://foodclub-uploads.s3.us-east-1.amazonaws.com/dishes/1697123456789-abc.jpg",
    "key": "dishes/1697123456789-abc.jpg"
  }
}
```

## Teste 2: Acessar URL Pública

Copie a URL retornada e cole no navegador:
```
https://foodclub-uploads.s3.us-east-1.amazonaws.com/dishes/1697123456789-abc.jpg
```

**Resultado esperado:**
- ✅ Imagem carrega normalmente
- ❌ Se mostrar erro 403 (Access Denied), ACL não está habilitado corretamente

## Teste 3: Via AWS CLI

```bash
# Verificar ACL do objeto
aws s3api get-object-acl \
  --bucket foodclub-uploads \
  --key dishes/1697123456789-abc.jpg
```

**Resposta esperada:**
```json
{
  "Owner": {
    "DisplayName": "...",
    "ID": "..."
  },
  "Grants": [
    {
      "Grantee": {
        "Type": "Group",
        "URI": "http://acs.amazonaws.com/groups/global/AllUsers"
      },
      "Permission": "READ"
    }
  ]
}
```

O importante é ver `"Permission": "READ"` para `AllUsers`.

## Teste 4: Verificar Configuração do Bucket

```bash
# Verificar Object Ownership
aws s3api get-bucket-ownership-controls \
  --bucket foodclub-uploads
```

**Resposta esperada:**
```json
{
  "OwnershipControls": {
    "Rules": [
      {
        "ObjectOwnership": "BucketOwnerPreferred"
      }
    ]
  }
}
```

```bash
# Verificar Block Public Access
aws s3api get-public-access-block \
  --bucket foodclub-uploads
```

**Resposta esperada:**
```json
{
  "PublicAccessBlockConfiguration": {
    "BlockPublicAcls": false,
    "IgnorePublicAcls": false,
    "BlockPublicPolicy": false,
    "RestrictPublicBuckets": false
  }
}
```

Todos devem estar `false` para ACL público funcionar.

## Troubleshooting

### Erro: "The bucket does not allow ACLs"

**Causa:** ACL está desabilitado no bucket

**Solução:**
1. Console AWS → S3 → foodclub-uploads
2. Permissions → Object Ownership
3. Edit → Selecione "ACLs enabled"
4. Salve

### Erro: "Access Denied" ao tentar acessar URL

**Causa 1:** Block Public Access está habilitado

**Solução:**
1. Console AWS → S3 → foodclub-uploads
2. Permissions → Block public access
3. Edit → Desmarque todas opções
4. Digite "confirm" e salve

**Causa 2:** ACL não foi aplicado no objeto

**Solução:** Refaça o upload do arquivo

### Erro: "InvalidBucketName"

**Causa:** Nome do bucket incorreto no .env

**Solução:** Verifique `AWS_S3_BUCKET_NAME=foodclub-uploads`

### Erro: "SignatureDoesNotMatch"

**Causa:** Credenciais AWS incorretas

**Solução:** Verifique:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

## Checklist de Configuração

- [ ] ACL habilitado no bucket (Object Ownership)
- [ ] Block Public Access desabilitado
- [ ] CORS configurado
- [ ] Credenciais AWS corretas no .env
- [ ] Região correta no .env
- [ ] Bucket existe e nome está correto
- [ ] IAM user tem permissões corretas

## Script de Teste Completo (Node.js)

Salve como `test-upload.js`:

```javascript
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    // 1. Fazer upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream('./test-image.jpg'));

    console.log('📤 Fazendo upload...');
    const uploadResponse = await fetch('http://localhost:3000/upload/image/dishes', {
      method: 'POST',
      body: formData,
    });

    const uploadData = await uploadResponse.json();
    console.log('✅ Upload bem-sucedido:', uploadData);

    // 2. Testar acesso público
    const imageUrl = uploadData.data.url;
    console.log('\n🌐 Testando acesso público...');
    const imageResponse = await fetch(imageUrl);

    if (imageResponse.ok) {
      console.log('✅ Imagem pública acessível!');
      console.log('📊 Status:', imageResponse.status);
      console.log('🔗 URL:', imageUrl);
    } else {
      console.error('❌ Erro ao acessar imagem:', imageResponse.status);
      console.error('Mensagem:', await imageResponse.text());
    }

    // 3. Deletar arquivo de teste
    console.log('\n🗑️ Deletando arquivo de teste...');
    const deleteResponse = await fetch('http://localhost:3000/upload/image', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: uploadData.data.key }),
    });

    const deleteData = await deleteResponse.json();
    console.log('✅ Deleção:', deleteData.message);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testUpload();
```

Execute:
```bash
npm install node-fetch form-data
node test-upload.js
```

## Resultado Esperado

```
📤 Fazendo upload...
✅ Upload bem-sucedido: {
  success: true,
  message: 'Imagem enviada com sucesso',
  data: {
    url: 'https://foodclub-uploads.s3.us-east-1.amazonaws.com/dishes/...',
    key: 'dishes/...'
  }
}

🌐 Testando acesso público...
✅ Imagem pública acessível!
📊 Status: 200
🔗 URL: https://foodclub-uploads.s3.us-east-1.amazonaws.com/dishes/...

🗑️ Deletando arquivo de teste...
✅ Deleção: Imagem deletada com sucesso
```

Se tudo estiver ✅, sua configuração está perfeita! 🎉
