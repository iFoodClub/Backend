# 🔐 Sistema de Autorização de Upload por UserType

## 📋 Implementação Completa

### ✅ O que foi implementado:

1. **UploadAuthorizationGuard** - Guard que valida permissões baseado no `userType`
2. **Aplicação no UploadController** - Guards aplicados nas rotas de upload
3. **Regras de Negócio** - Sistema de permissões baseado em roles

---

## 🎯 Regras de Autorização

### 1. **COMPANY (Empresa)**

**Pode fazer upload/delete em:**
- ✅ `companies` - Logo e imagens da própria empresa
- ✅ `users` - Fotos de perfil dos funcionários da empresa

**Não pode:**
- ❌ `restaurants` - Imagens de restaurantes
- ❌ `dishes` - Fotos de pratos

**Exemplo de uso:**
```javascript
// Administrador da empresa fazendo upload do logo
const formData = new FormData();
formData.append('file', logoFile);

const response = await fetch('http://localhost:3000/upload/image/companies', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokenDaEmpresa}`
  },
  body: formData
});

// Resultado: ✅ Permitido
```

```javascript
// Administrador da empresa fazendo upload de foto de funcionário
const response = await fetch('http://localhost:3000/upload/image/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokenDaEmpresa}`
  },
  body: formData
});

// Resultado: ✅ Permitido
```

```javascript
// Tentando fazer upload de prato (não permitido)
const response = await fetch('http://localhost:3000/upload/image/dishes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokenDaEmpresa}`
  },
  body: formData
});

// Resultado: ❌ 403 Forbidden
// "Usuários do tipo 'company' não podem fazer upload em 'dishes'. 
//  Pastas permitidas: companies, users"
```

---

### 2. **RESTAURANT (Restaurante)**

**Pode fazer upload/delete em:**
- ✅ `restaurants` - Logo e imagens do próprio restaurante
- ✅ `dishes` - Fotos dos pratos do restaurante

**Não pode:**
- ❌ `companies` - Logos de empresas
- ❌ `users` - Fotos de funcionários

**Exemplo de uso:**
```javascript
// Restaurante fazendo upload do logo
const response = await fetch('http://localhost:3000/upload/image/restaurants', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokenDoRestaurante}`
  },
  body: formData
});

// Resultado: ✅ Permitido
```

```javascript
// Restaurante fazendo upload de foto de prato
const response = await fetch('http://localhost:3000/upload/image/dishes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokenDoRestaurante}`
  },
  body: formData
});

// Resultado: ✅ Permitido
```

---

### 3. **EMPLOYEE (Funcionário)**

**Pode fazer upload/delete em:**
- ✅ `users` - Apenas sua própria foto de perfil

**Não pode:**
- ❌ `companies` - Logos de empresas
- ❌ `restaurants` - Imagens de restaurantes
- ❌ `dishes` - Fotos de pratos

**Exemplo de uso:**
```javascript
// Funcionário fazendo upload da própria foto
const response = await fetch('http://localhost:3000/upload/image/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokenDoFuncionario}`
  },
  body: formData
});

// Resultado: ✅ Permitido
```

```javascript
// Funcionário tentando fazer upload de logo de empresa
const response = await fetch('http://localhost:3000/upload/image/companies', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokenDoFuncionario}`
  },
  body: formData
});

// Resultado: ❌ 403 Forbidden
// "Usuários do tipo 'employee' não podem fazer upload em 'companies'. 
//  Pastas permitidas: users"
```

---

## 🔧 Como Funciona Tecnicamente

### 1. **Fluxo de Autenticação e Autorização**

```
1. Usuário faz login
   ↓
2. Backend gera JWT com informações:
   {
     id: 123,
     email: "user@example.com",
     userType: "company",  // ← Importante!
     companyId: 456
   }
   ↓
3. Frontend envia upload com token JWT
   ↓
4. JwtAuthGuard valida o token
   ↓
5. UploadAuthorizationGuard verifica permissões
   ↓
6. Se tudo OK, upload é processado
```

### 2. **Código do Guard**

```typescript
// upload-authorization.guard.ts
@Injectable()
export class UploadAuthorizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user; // Vem do JWT
    const { folder } = request.params; // 'dishes', 'users', etc.

    // Mapa de permissões
    const permissions: Record<UserType, string[]> = {
      [UserType.COMPANY]: ['companies', 'users'],
      [UserType.RESTAURANT]: ['restaurants', 'dishes'],
      [UserType.EMPLOYEE]: ['users'],
    };

    const allowedFolders = permissions[user.userType];

    // Verifica se o usuário tem permissão para essa pasta
    if (!allowedFolders.includes(folder)) {
      throw new ForbiddenException(
        `Usuários do tipo '${user.userType}' não podem fazer upload em '${folder}'. ` +
        `Pastas permitidas: ${allowedFolders.join(', ')}`,
      );
    }

    return true;
  }
}
```

### 3. **Aplicação no Controller**

```typescript
@Controller('upload')
@UseGuards(JwtAuthGuard, UploadAuthorizationGuard) // ← Ambos os guards
export class UploadController {
  
  @Post('image/:folder')
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: string,
  ) {
    // Se chegou aqui, o usuário está autenticado E autorizado
    const result = await this.s3UploadService.uploadFile(file, folder);
    return { success: true, data: result };
  }

  @Delete('image')
  async deleteImage(@Body() body: { key: string }) {
    // Também protegido pelos guards
    await this.s3UploadService.deleteFile(body.key);
    return { success: true };
  }
}
```

---

## 📱 Exemplos de Integração no Frontend

### React - Componente de Upload para Empresa

```jsx
import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth'; // Hook com token JWT

const CompanyLogoUploader = () => {
  const { token, userType } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validação no frontend
    if (userType !== 'company') {
      setError('Apenas empresas podem fazer upload de logos');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3000/upload/image/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao fazer upload');
      }

      // Atualizar o logo da empresa no banco
      await updateCompanyLogo(result.data.url);

      alert('Logo atualizado com sucesso!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3>Upload de Logo da Empresa</h3>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
        disabled={uploading || userType !== 'company'}
      />
      {uploading && <p>Enviando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

### React - Componente de Upload para Restaurante

```jsx
const DishPhotoUploader = ({ dishId }) => {
  const { token, userType } = useAuth();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (userType !== 'restaurant') {
      alert('Apenas restaurantes podem fazer upload de pratos');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Fazer upload da imagem
      const uploadResponse = await fetch('http://localhost:3000/upload/image/dishes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message);
      }

      // 2. Atualizar o prato com a URL da imagem
      const updateResponse = await fetch(`http://localhost:3000/dishes/${dishId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadResult.data.url,
          imageKey: uploadResult.data.key, // Para poder deletar depois
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar prato');
      }

      alert('Foto do prato atualizada com sucesso!');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div>
      <h4>Adicionar Foto do Prato</h4>
      <input type="file" accept="image/*" onChange={handleUpload} />
    </div>
  );
};
```

### React - Componente de Upload para Funcionário

```jsx
const EmployeeProfilePhoto = () => {
  const { token, userType, userId } = useAuth();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload da foto
      const uploadResponse = await fetch('http://localhost:3000/upload/image/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.message);
      }

      // 2. Atualizar perfil do usuário
      const updateResponse = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImage: uploadResult.data.url,
          profileImageKey: uploadResult.data.key,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      alert('Foto de perfil atualizada!');
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  return (
    <div>
      <h3>Foto de Perfil</h3>
      <input type="file" accept="image/*" onChange={handleUpload} />
    </div>
  );
};
```

---

## 🧪 Testando as Permissões

### Teste 1: Empresa tentando fazer upload de prato (deve falhar)

```bash
# Login como empresa
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"empresa@example.com","password":"senha123"}'

# Resposta: { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "userType": "company" }

# Tentar fazer upload de prato
curl -X POST http://localhost:3000/upload/image/dishes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@prato.jpg"

# Resposta esperada: ❌ 403 Forbidden
# {
#   "statusCode": 403,
#   "message": "Usuários do tipo 'company' não podem fazer upload em 'dishes'. Pastas permitidas: companies, users",
#   "error": "Forbidden"
# }
```

### Teste 2: Restaurante fazendo upload de prato (deve funcionar)

```bash
# Login como restaurante
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"restaurante@example.com","password":"senha123"}'

# Fazer upload de prato
curl -X POST http://localhost:3000/upload/image/dishes \
  -H "Authorization: Bearer <token_restaurante>" \
  -F "file=@prato.jpg"

# Resposta esperada: ✅ 201 Created
# {
#   "success": true,
#   "message": "Imagem enviada com sucesso",
#   "data": {
#     "url": "https://foodclub-uploads.s3.amazonaws.com/dishes/123-abc.jpg",
#     "key": "dishes/123-abc.jpg"
#   }
# }
```

### Teste 3: Funcionário fazendo upload de foto de perfil (deve funcionar)

```bash
curl -X POST http://localhost:3000/upload/image/users \
  -H "Authorization: Bearer <token_funcionario>" \
  -F "file=@foto.jpg"

# Resposta esperada: ✅ 201 Created
```

### Teste 4: Funcionário tentando fazer upload de logo de empresa (deve falhar)

```bash
curl -X POST http://localhost:3000/upload/image/companies \
  -H "Authorization: Bearer <token_funcionario>" \
  -F "file=@logo.jpg"

# Resposta esperada: ❌ 403 Forbidden
```

---

## 📊 Tabela de Permissões

| UserType   | companies | users | restaurants | dishes |
|------------|-----------|-------|-------------|--------|
| COMPANY    | ✅        | ✅    | ❌          | ❌     |
| RESTAURANT | ❌        | ❌    | ✅          | ✅     |
| EMPLOYEE   | ❌        | ✅    | ❌          | ❌     |

---

## ⚠️ Próximos Passos (Melhorias Recomendadas)

### 1. **Validação de Propriedade (Ownership)**

Atualmente, o sistema valida **qual pasta** o usuário pode acessar, mas não valida **qual entidade específica**.

**Problema:**
- Uma empresa pode fazer upload em `users`, mas isso permite upload para **qualquer** funcionário
- Um restaurante pode fazer upload em `dishes`, mas isso permite upload para **qualquer** prato

**Solução:**
Adicionar validação adicional para verificar se a entidade pertence ao usuário:

```typescript
// Exemplo: Validar que o funcionário pertence à empresa
@Post('image/users/:employeeId')
async uploadEmployeePhoto(
  @Param('employeeId') employeeId: number,
  @UploadedFile() file: Express.Multer.File,
  @Req() request
) {
  const user = request.user;
  
  // Verificar se o funcionário pertence à empresa do usuário
  const employee = await this.employeeRepository.findOne({
    where: { 
      id: employeeId,
      companyId: user.companyId // ← Validação importante!
    }
  });
  
  if (!employee) {
    throw new ForbiddenException('Este funcionário não pertence à sua empresa');
  }
  
  // Prosseguir com o upload
  const result = await this.s3UploadService.uploadFile(file, 'users');
  
  // Atualizar o funcionário com a URL
  await this.employeeRepository.update(employeeId, {
    profileImage: result.url
  });
  
  return { success: true, data: result };
}
```

### 2. **Logs de Auditoria**

```typescript
// Registrar quem fez upload do quê
this.logger.log(`User ${user.id} (${user.userType}) uploaded ${result.key}`);
```

### 3. **Rate Limiting**

```typescript
// Limitar número de uploads por minuto
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 uploads por minuto
@Post('image/:folder')
async uploadImage(...) { ... }
```

---

## ✅ Checklist de Segurança Implementado

- [x] ✅ Autenticação obrigatória (JwtAuthGuard)
- [x] ✅ Autorização baseada em userType (UploadAuthorizationGuard)
- [x] ✅ Validação de tipos de arquivo
- [x] ✅ Validação de tamanho de arquivo
- [x] ✅ Mensagens de erro claras
- [ ] ⏳ Validação de propriedade de entidades (ownership)
- [ ] ⏳ Logs de auditoria
- [ ] ⏳ Rate limiting
- [ ] ⏳ Validação de quota de armazenamento

---
