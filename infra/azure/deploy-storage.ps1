param(
    [string]$resourceGroupName = 'rg-foodclub',
    [string]$storageAccountName
)

if (-not $storageAccountName) {
    $storageAccountName = Read-Host 'Digite o nome desejado para a Storage Account (3-24, lowercase, alphanumeric)'
}

Write-Host "Usando resource group: $resourceGroupName"
Write-Host "Storage account: $storageAccountName"

# Verifica se o resource group existe
$rg = az group show --name $resourceGroupName --only-show-errors 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Resource group '$resourceGroupName' não encontrado. Criando..."
    az group create --name $resourceGroupName --location canadacentral
}

# Faz o deploy do Bicep
$deployArgs = @(
    'deployment', 'group', 'create',
    '--resource-group', $resourceGroupName,
    '--template-file', './storage.multicontainer.bicep',
    '--parameters', "storageAccountName=$storageAccountName"
)

az @deployArgs

if ($LASTEXITCODE -ne 0) {
    Write-Error 'Deploy falhou. Verifique mensagens acima.'
    exit 1
}

Write-Host 'Deploy concluído. Recuperando connection string...'
$conn = az storage account show-connection-string --name $storageAccountName --resource-group $resourceGroupName -o tsv

if ($LASTEXITCODE -ne 0) {
    Write-Error 'Falha ao obter connection string.'
    exit 1
}

Write-Host "Connection string (copie e armazene em lugar seguro):`n$conn"

Write-Host 'Containers criados: pratos, perfis, funcionarios'
Write-Host "Para usar localmente com DefaultAzureCredential (Azure CLI), rode:"
Write-Host "  setx AZURE_STORAGE_ACCOUNT_NAME $storageAccountName"
Write-Host "Ou no PowerShell atual:"
Write-Host "  $env:AZURE_STORAGE_ACCOUNT_NAME = '$storageAccountName'"

Write-Host 'Próximo passo: definir AZURE_STORAGE_ACCOUNT_NAME no seu ambiente e testar endpoints de upload.'
