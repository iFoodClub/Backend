@description('imagens')
param storageAccountName string

@description('Azure region to deploy to')
param location string = 'canadacentral'

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS' // Mais barato
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    accessTier: 'Hot'
  }
}

resource containerPratos 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  name: '${storageAccount.name}/default/pratos'
  properties: {
    publicAccess: 'None'
  }
}

resource containerPerfis 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  name: '${storageAccount.name}/default/perfis'
  properties: {
    publicAccess: 'None'
  }
}

resource containerFuncionarios 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  name: '${storageAccount.name}/default/funcionarios'
  properties: {
    publicAccess: 'None'
  }
}
