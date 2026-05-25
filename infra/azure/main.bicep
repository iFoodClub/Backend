@description('Nome da Storage Account (min 3, max 24, lowercase, alphanumeric)')
param storageAccountName string

@description('Azure region to deploy to')
param location string = 'canadacentral'

@description('Blob container name')
param containerName string = 'app-uploads'

@description('User-assigned managed identity name')
param identityName string = 'foodclub-identity'

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    accessTier: 'Hot'
  }
  tags: {
    project: 'foodclub'
    environment: 'dev'
  }
}

resource blobContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  name: '${storageAccount.name}/default/${containerName}'
  properties: {
    publicAccess: 'None'
  }
  dependsOn: [storageAccount]
}

resource userIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2018-11-30' = {
  name: identityName
  location: location
}

output storageAccountResourceId string = storageAccount.id
output blobEndpoint string = format('https://{0}.blob.core.windows.net', storageAccount.name)
output containerName string = containerName
output identityClientId string = userIdentity.properties.clientId
output identityPrincipalId string = userIdentity.properties.principalId
