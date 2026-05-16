param(
  [string]$rgName = 'rg-foodclub',
  [string]$location = 'canadacentral',
  [string]$storageAccountName = '',
  [string]$containerName = 'app-uploads',
  [string]$identityName = 'foodclub-identity'
)

if (-not $storageAccountName) {
  Write-Error "Passe o nome da storage account com -storageAccountName. Deve ser único e em lowercase (3-24 chars)."
  exit 1
}

# Login if needed
# az login

# Create resource group (no cost)
az group create --name $rgName --location $location | Out-Null

# Deploy Bicep
az deployment group create `
  --resource-group $rgName `
  --template-file ./infra/azure/main.bicep `
  --parameters storageAccountName=$storageAccountName location=$location containerName=$containerName identityName=$identityName

Write-Host "Deployment concluído. Agora crie a role assignment para a Managed Identity:"

$principalId = az identity show --name $identityName --resource-group $rgName --query principalId -o tsv
$scope = az storage account show --name $storageAccountName --resource-group $rgName --query id -o tsv

Write-Host "PrincipalId: $principalId"
Write-Host "Storage scope: $scope"

Write-Host "Executando az role assignment create para 'Storage Blob Data Contributor'..."
az role assignment create --assignee-object-id $principalId --role "Storage Blob Data Contributor" --scope $scope

Write-Host "Role assignment criada. Para usar a identity em um App Service, associe a User Assigned Identity ao recurso do App Service e use DefaultAzureCredential no código."