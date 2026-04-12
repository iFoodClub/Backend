# 📸 Guia de Upload com Blob - FoodClub

Este guia mostra como enviar imagens usando Blob para o backend FoodClub.

## 🎯 Cenários Suportados

### 1. Upload de Arquivo Selecionado pelo Usuário

```typescript
// React/Next.js
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file); // File é um tipo de Blob

  try {
    const response = await fetch('http://localhost:3000/upload/image/dishes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}` // Adicionar quando tiver auth
      },
      body: formData
    });

    const data = await response.json();
    console.log('URL da imagem:', data.data.url);
  } catch (error) {
    console.error('Erro no upload:', error);
  }
};

// JSX
<input type="file" accept="image/*" onChange={handleFileUpload} />
```

### 2. Upload de Imagem Capturada da Câmera (Blob)

```typescript
// React Native ou Web com acesso à câmera
const uploadCameraImage = async (blob: Blob) => {
  const formData = new FormData();
  
  // IMPORTANTE: Dar um nome e tipo ao blob
  formData.append('file', blob, 'camera-photo.jpg');

  try {
    const response = await fetch('http://localhost:3000/upload/image/users', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('Erro no upload:', error);
  }
};

// Exemplo com getUserMedia (Web)
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    // Capturar frame
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Converter para blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        await uploadCameraImage(blob);
      }
    }, 'image/jpeg', 0.95);
  });
```

### 3. Upload de Imagem do Canvas (Design/Editor)

```typescript
// Exemplo com canvas (edição de imagem, cropping, etc)
const uploadCanvasImage = async (canvas: HTMLCanvasElement) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Falha ao converter canvas'));
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, 'edited-image.jpg');

      try {
        const response = await fetch('http://localhost:3000/upload/image/dishes', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        resolve(data.data.url);
      } catch (error) {
        reject(error);
      }
    }, 'image/jpeg', 0.9); // Qualidade 90%
  });
};
```

### 4. Upload de Imagem Baixada (URL → Blob)

```typescript
// Baixar imagem de URL e fazer upload
const uploadFromUrl = async (imageUrl: string) => {
  try {
    // Converter URL em blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Upload do blob
    const formData = new FormData();
    formData.append('file', blob, 'downloaded-image.jpg');

    const uploadResponse = await fetch('http://localhost:3000/upload/image/dishes', {
      method: 'POST',
      body: formData
    });

    const data = await uploadResponse.json();
    return data.data.url;
  } catch (error) {
    console.error('Erro:', error);
  }
};

// Uso
await uploadFromUrl('https://example.com/pizza.jpg');
```

### 5. Upload com Crop/Resize usando Canvas

```typescript
// Redimensionar imagem antes do upload
const resizeAndUpload = async (file: File, maxWidth: number = 800) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calcular dimensões
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Criar canvas com novo tamanho
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para blob e fazer upload
        canvas.toBlob(async (blob) => {
          if (!blob) {
            reject(new Error('Erro ao converter'));
            return;
          }

          const formData = new FormData();
          formData.append('file', blob, file.name);

          try {
            const response = await fetch('http://localhost:3000/upload/image/dishes', {
              method: 'POST',
              body: formData
            });

            const data = await response.json();
            resolve(data.data.url);
          } catch (error) {
            reject(error);
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.src = e.target.result as string;
    };
    
    reader.readAsDataURL(file);
  });
};

// Uso
const imageUrl = await resizeAndUpload(file, 1024);
```

### 6. Upload em React Native (Expo)

```typescript
import * as ImagePicker from 'expo-image-picker';

const uploadImageReactNative = async () => {
  // Pedir permissão
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Permissão necessária!');
    return;
  }

  // Selecionar imagem
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled) {
    // Criar FormData
    const formData = new FormData();
    
    // React Native precisa de formato específico
    formData.append('file', {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    try {
      const response = await fetch('http://localhost:3000/upload/image/users', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      console.log('Upload success:', data.data.url);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }
};
```

### 7. Upload com Axios (Alternativa ao Fetch)

```typescript
import axios from 'axios';

const uploadWithAxios = async (blob: Blob) => {
  const formData = new FormData();
  formData.append('file', blob, 'image.jpg');

  try {
    const response = await axios.post(
      'http://localhost:3000/upload/image/dishes',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload: ${percentCompleted}%`);
        },
      }
    );

    return response.data.data.url;
  } catch (error) {
    console.error('Erro no upload:', error);
  }
};
```

### 8. Upload Múltiplo de Blobs

```typescript
const uploadMultipleImages = async (blobs: Blob[]) => {
  const uploadPromises = blobs.map(async (blob, index) => {
    const formData = new FormData();
    formData.append('file', blob, `image-${index}.jpg`);

    const response = await fetch('http://localhost:3000/upload/image/dishes', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    return data.data.url;
  });

  try {
    const urls = await Promise.all(uploadPromises);
    console.log('Todas as imagens foram enviadas:', urls);
    return urls;
  } catch (error) {
    console.error('Erro no upload múltiplo:', error);
  }
};
```

### 9. Upload com Progress Bar

```typescript
const uploadWithProgress = async (blob: Blob, onProgress: (percent: number) => void) => {
  const formData = new FormData();
  formData.append('file', blob, 'image.jpg');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Monitorar progresso
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.data.url);
      } else {
        reject(new Error('Upload falhou'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Erro de rede')));

    xhr.open('POST', 'http://localhost:3000/upload/image/dishes');
    xhr.send(formData);
  });
};

// Uso
await uploadWithProgress(blob, (percent) => {
  console.log(`Upload: ${percent.toFixed(2)}%`);
  // Atualizar UI com progresso
});
```

## 🔧 Validações Importantes

### Verificar Tipo de Blob no Frontend

```typescript
const validateBlob = (blob: Blob): boolean => {
  // Verificar tipo MIME
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(blob.type)) {
    alert('Tipo de arquivo inválido. Use JPEG, PNG, GIF ou WebP');
    return false;
  }

  // Verificar tamanho (5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB em bytes
  if (blob.size > maxSize) {
    alert('Arquivo muito grande. Máximo 5MB');
    return false;
  }

  return true;
};

// Uso
if (validateBlob(blob)) {
  await uploadImage(blob);
}
```

## ⚠️ Problemas Comuns e Soluções

### Erro: "Nenhum arquivo foi enviado"

```typescript
// ❌ ERRADO - Falta o nome do arquivo
formData.append('file', blob);

// ✅ CORRETO - Com nome
formData.append('file', blob, 'image.jpg');
```

### Erro: CORS no navegador

```typescript
// Backend já está configurado, mas se precisar:
// Adicionar headers no controller ou usar CORS global no main.ts
app.enableCors({
  origin: '*', // Em produção, especificar domínios
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
```

### Blob sem tipo MIME

```typescript
// ❌ Blob sem tipo
const blob = new Blob([data]);

// ✅ Blob com tipo
const blob = new Blob([data], { type: 'image/jpeg' });
```

## 📱 Exemplos Específicos por Plataforma

### Vue.js 3

```typescript
<template>
  <input type="file" @change="handleUpload" accept="image/*" />
</template>

<script setup>
const handleUpload = async (event) => {
  const file = event.target.files[0];
  
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/upload/image/dishes', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  console.log(data.data.url);
};
</script>
```

### Angular

```typescript
uploadFile(event: any) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append('file', file);

  this.http.post('http://localhost:3000/upload/image/dishes', formData)
    .subscribe(
      (response: any) => {
        console.log('Upload success:', response.data.url);
      },
      (error) => {
        console.error('Upload error:', error);
      }
    );
}
```

## 🎯 Resumo

✅ **Sim, blob é suportado!**
✅ **Qualquer biblioteca que envie FormData funciona**
✅ **Web, Mobile, React Native - todos suportados**
✅ **Canvas, Câmera, Arquivos - todos funcionam**

O backend já está 100% preparado para receber blobs! 🚀
