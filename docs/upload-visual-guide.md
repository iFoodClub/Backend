# 🎨 Guia Visual: Upload com Autorização por UserType

## 🔐 Sistema Implementado

```
┌─────────────────────────────────────────────────────────────┐
│                    UPLOAD CONTROLLER                        │
│  @UseGuards(JwtAuthGuard, UploadAuthorizationGuard)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   1. JwtAuthGuard             │
              │   ✓ Valida token JWT          │
              │   ✓ Extrai dados do usuário   │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   2. UploadAuthorizationGuard │
              │   ✓ Verifica userType         │
              │   ✓ Valida permissões         │
              └───────────────┬───────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   3. S3UploadService          │
              │   ✓ Upload para S3            │
              │   ✓ Retorna URL               │
              └───────────────────────────────┘
```

---

## 📊 Matriz de Permissões

```
┌──────────────┬──────────┬──────┬──────────────┬────────┐
│   UserType   │companies │users │ restaurants  │ dishes │
├──────────────┼──────────┼──────┼──────────────┼────────┤
│   COMPANY    │    ✅    │  ✅  │      ❌      │   ❌   │
├──────────────┼──────────┼──────┼──────────────┼────────┤
│  RESTAURANT  │    ❌    │  ❌  │      ✅      │   ✅   │
├──────────────┼──────────┼──────┼──────────────┼────────┤
│   EMPLOYEE   │    ❌    │  ✅  │      ❌      │   ❌   │
└──────────────┴──────────┴──────┴──────────────┴────────┘
```

---

## 🎯 Cenários de Uso

### Cenário 1: Empresa fazendo upload de logo

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 Usuário: Admin da Empresa ABC                            │
│ 🎫 Token JWT: { userType: "company", companyId: 1 }        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        POST /upload/image/companies
        Headers: { Authorization: "Bearer <token>" }
        Body: FormData { file: logo.jpg }
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ ✅ SUCESSO                                                   │
│ {                                                            │
│   "success": true,                                           │
│   "message": "Imagem enviada com sucesso",                   │
│   "data": {                                                  │
│     "url": "https://.../companies/123-abc.jpg",              │
│     "key": "companies/123-abc.jpg"                           │
│   }                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Cenário 2: Empresa tentando fazer upload de prato (NEGADO)

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 Usuário: Admin da Empresa ABC                            │
│ 🎫 Token JWT: { userType: "company", companyId: 1 }        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        POST /upload/image/dishes  ← ❌ Pasta não permitida
        Headers: { Authorization: "Bearer <token>" }
        Body: FormData { file: prato.jpg }
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ ❌ ERRO 403 - FORBIDDEN                                      │
│ {                                                            │
│   "statusCode": 403,                                         │
│   "message": "Usuários do tipo 'company' não podem fazer    │
│              upload em 'dishes'. Pastas permitidas:         │
│              companies, users",                              │
│   "error": "Forbidden"                                       │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Cenário 3: Restaurante fazendo upload de foto de prato

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 Usuário: Dono do Restaurante XYZ                         │
│ 🎫 Token JWT: { userType: "restaurant", restaurantId: 5 }  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        POST /upload/image/dishes
        Headers: { Authorization: "Bearer <token>" }
        Body: FormData { file: prato-delicioso.jpg }
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ ✅ SUCESSO                                                   │
│ {                                                            │
│   "success": true,                                           │
│   "message": "Imagem enviada com sucesso",                   │
│   "data": {                                                  │
│     "url": "https://.../dishes/789-xyz.jpg",                 │
│     "key": "dishes/789-xyz.jpg"                              │
│   }                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Cenário 4: Funcionário fazendo upload de foto de perfil

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 Usuário: João Silva (Funcionário)                        │
│ 🎫 Token JWT: { userType: "employee", employeeId: 10 }     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        POST /upload/image/users
        Headers: { Authorization: "Bearer <token>" }
        Body: FormData { file: minha-foto.jpg }
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ ✅ SUCESSO                                                   │
│ {                                                            │
│   "success": true,                                           │
│   "message": "Imagem enviada com sucesso",                   │
│   "data": {                                                  │
│     "url": "https://.../users/456-def.jpg",                  │
│     "key": "users/456-def.jpg"                               │
│   }                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Cenário 5: Funcionário tentando fazer upload de logo (NEGADO)

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 Usuário: João Silva (Funcionário)                        │
│ 🎫 Token JWT: { userType: "employee", employeeId: 10 }     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        POST /upload/image/companies  ← ❌ Pasta não permitida
        Headers: { Authorization: "Bearer <token>" }
        Body: FormData { file: logo.jpg }
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ ❌ ERRO 403 - FORBIDDEN                                      │
│ {                                                            │
│   "statusCode": 403,                                         │
│   "message": "Usuários do tipo 'employee' não podem fazer   │
│              upload em 'companies'. Pastas permitidas:      │
│              users",                                         │
│   "error": "Forbidden"                                       │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Testando no Postman

### Passo 1: Fazer Login

```
POST http://localhost:3000/auth/login

Body (JSON):
{
  "email": "empresa@example.com",
  "password": "senha123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userType": "company"
}

👉 Copie o token para usar nos próximos requests
```

### Passo 2: Upload de Imagem (Permitido)

```
POST http://localhost:3000/upload/image/companies

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Body (form-data):
  file: [selecione um arquivo .jpg]

Response (✅ 201 Created):
{
  "success": true,
  "message": "Imagem enviada com sucesso",
  "data": {
    "url": "https://foodclub-uploads.s3.amazonaws.com/companies/123.jpg",
    "key": "companies/123.jpg"
  }
}
```

### Passo 3: Upload em Pasta Não Permitida (Negado)

```
POST http://localhost:3000/upload/image/dishes

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  (mesmo token de empresa)

Body (form-data):
  file: [selecione um arquivo .jpg]

Response (❌ 403 Forbidden):
{
  "statusCode": 403,
  "message": "Usuários do tipo 'company' não podem fazer upload em 'dishes'. Pastas permitidas: companies, users",
  "error": "Forbidden"
}
```

---

## 📱 Exemplo de Integração Frontend (React)

### Hook Personalizado para Upload

```jsx
// hooks/useUpload.js
import { useState } from 'react';
import { useAuth } from './useAuth';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const upload = async (file, folder) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `http://localhost:3000/upload/image/${folder}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao fazer upload');
      }

      return result.data; // { url, key }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
};
```

### Componente Universal de Upload

```jsx
// components/ImageUploader.jsx
import React from 'react';
import { useUpload } from '../hooks/useUpload';
import { useAuth } from '../hooks/useAuth';

const ImageUploader = ({ folder, onUploadSuccess, label }) => {
  const { upload, uploading, error } = useUpload();
  const { userType } = useAuth();

  // Validação de permissões no frontend
  const canUpload = () => {
    const permissions = {
      company: ['companies', 'users'],
      restaurant: ['restaurants', 'dishes'],
      employee: ['users'],
    };
    return permissions[userType]?.includes(folder);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!canUpload()) {
      alert(`Você não tem permissão para fazer upload em ${folder}`);
      return;
    }

    // Validações básicas
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP');
      return;
    }

    try {
      const result = await upload(file, folder);
      onUploadSuccess?.(result);
    } catch (err) {
      // Erro já está no state
    }
  };

  if (!canUpload()) {
    return (
      <div style={{ color: 'red', padding: '10px', background: '#fee' }}>
        ⚠️ Você não tem permissão para fazer upload em {folder}
      </div>
    );
  }

  return (
    <div>
      <label>
        {label || `Upload para ${folder}`}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: 'block', marginTop: '10px' }}
        />
      </label>
      {uploading && <p>⏳ Enviando...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
    </div>
  );
};

export default ImageUploader;
```

### Uso em Diferentes Contextos

```jsx
// pages/CompanyProfile.jsx
import ImageUploader from '../components/ImageUploader';

const CompanyProfile = () => {
  const handleLogoUpload = async (result) => {
    // Atualizar o logo da empresa no banco
    await fetch('http://localhost:3000/companies/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        profileImage: result.url,
        profileImageKey: result.key,
      }),
    });
    
    alert('Logo atualizado com sucesso!');
  };

  return (
    <div>
      <h1>Perfil da Empresa</h1>
      <ImageUploader 
        folder="companies" 
        label="Logo da Empresa"
        onUploadSuccess={handleLogoUpload}
      />
    </div>
  );
};
```

```jsx
// pages/RestaurantDish.jsx
const RestaurantDish = ({ dishId }) => {
  const handleDishPhotoUpload = async (result) => {
    await fetch(`http://localhost:3000/dishes/${dishId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        image: result.url,
        imageKey: result.key,
      }),
    });
    
    alert('Foto do prato atualizada!');
  };

  return (
    <div>
      <h2>Adicionar Foto do Prato</h2>
      <ImageUploader 
        folder="dishes" 
        label="Foto do Prato"
        onUploadSuccess={handleDishPhotoUpload}
      />
    </div>
  );
};
```

```jsx
// pages/EmployeeProfile.jsx
const EmployeeProfile = () => {
  const { userId } = useAuth();

  const handleProfilePhotoUpload = async (result) => {
    await fetch(`http://localhost:3000/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        profileImage: result.url,
        profileImageKey: result.key,
      }),
    });
    
    alert('Foto de perfil atualizada!');
  };

  return (
    <div>
      <h2>Meu Perfil</h2>
      <ImageUploader 
        folder="users" 
        label="Foto de Perfil"
        onUploadSuccess={handleProfilePhotoUpload}
      />
    </div>
  );
};
```

---

## 🔍 Debugging: Como Verificar Permissões

### Ver informações do JWT decodificado

```javascript
// No navegador (console)
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('UserType:', payload.userType);
console.log('UserId:', payload.id);
console.log('CompanyId:', payload.companyId);
console.log('RestaurantId:', payload.restaurantId);
```

### Logs no Backend

```typescript
// No guard
console.log('User:', request.user);
console.log('Folder:', folder);
console.log('UserType:', user.userType);
console.log('Allowed Folders:', allowedFolders);
```

---

## ✅ Resumo Visual

```
🔐 AUTENTICAÇÃO + AUTORIZAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ JWT Token com userType
   ├── company      → 📁 companies, users
   ├── restaurant   → 📁 restaurants, dishes
   └── employee     → 📁 users

2️⃣ Guard valida permissões automaticamente

3️⃣ Frontend recebe feedback claro:
   ├── ✅ 201 Created (sucesso)
   └── ❌ 403 Forbidden (sem permissão)

4️⃣ Frontend atualiza entidade no banco
   └── PATCH /companies/:id
   └── PATCH /dishes/:id
   └── PATCH /users/:id
```
