# Infra: Azure Blob Storage (Bicep)

Arquivos:

- `main.bicep` — cria `Storage Account`, `Blob Container` e `User Assigned Managed Identity`.
- `deploy.ps1` — script PowerShell para criar o `resource group`, aplicar o Bicep e atribuir a role `Storage Blob Data Contributor` à identity.

Observações importantes:
- Use um `storageAccountName` único, em lowercase (3-24 chars). Exemplo: `foodclubstore001`.
- Escolhi `Standard_LRS` (mais barato) e não ativei `private endpoints` para evitar custos extras.
- Para manter custos mínimos: não habilite features pagas e evite Private Endpoint/REPOSITORY que geram cobranças.

Como usar:

1. Login no Azure (se necessário):

```powershell
az login
```

2. Executar o deploy:

```powershell
.\infra\azure\deploy.ps1 -storageAccountName <nomeUnicoDaStorage>
```

3. O script fará a role assignment automaticamente. Se preferir, execute manualmente:

```powershell
$principalId = az identity show --name foodclub-identity --resource-group rg-foodclub --query principalId -o tsv
$scope = az storage account show --name <nomeUnicoDaStorage> --resource-group rg-foodclub --query id -o tsv
az role assignment create --assignee-object-id $principalId --role "Storage Blob Data Contributor" --scope $scope
```

4. No código (Node/Nest) — use `DefaultAzureCredential` e `@azure/storage-blob`. Em ambiente local você pode autenticar via `az login`; em produção, associe a User Assigned Identity ao App Service/VM.

Exemplo rápido (Node):

```ts
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  `https://${process.env.STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  credential
);

const containerClient = blobServiceClient.getContainerClient('app-uploads');
// upload example
```

Se quiser, eu gero agora um pipeline CI simples (GitHub Actions) para deployar esse Bicep automaticamente.
