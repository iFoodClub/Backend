// FoodClub Backend Infrastructure as Code (Bicep)
// Deploys all resources needed for the application

metadata description = 'FoodClub Backend Infrastructure'
metadata version = '1.0.0'

@description('Environment name (dev, hml, prod)')
param environment string = 'dev'

@description('Region where resources will be deployed')
param location string = 'eastus'

@description('Project name')
param projectName string = 'foodclub'

@description('Owner/Team name for tagging')
param owner string = 'foodclub-team'

// Generate unique suffix for globally unique resources
var uniqueSuffix = uniqueString(resourceGroup().id)
var resourcePrefix = '${projectName}-${environment}'
var tags = {
  project: projectName
  environment: environment
  owner: owner
  managedBy: 'bicep'
  createdDate: utcNow('u')
}

// Variables
var containerRegistryName = 'acr${projectName}${environment}${uniqueSuffix}'
var keyVaultName = 'kv-${projectName}-${environment}-${uniqueSuffix}'
var lawName = 'law-${resourcePrefix}-${uniqueSuffix}'
var appInsightsName = 'appi-${resourcePrefix}-${uniqueSuffix}'
var postgresServerName = 'pg-${resourcePrefix}-${uniqueSuffix}'
var containerAppEnvName = 'cae-${resourcePrefix}-${uniqueSuffix}'
var containerAppHmlName = 'app-${projectName}-hml'
var containerAppProdName = 'app-${projectName}-prod'
var storageAccountName = 'st${projectName}${environment}${uniqueSuffix}'

// Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2021-12-01-preview' = {
  name: lawName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
  tags: tags
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    RetentionInDays: 30
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
  tags: tags
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2021-11-01-preview' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: []
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: true
  }
  tags: tags
}

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2021-09-01' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
  tags: tags
}

// Storage Account (para uploads)
resource storageAccount 'Microsoft.Storage/storageAccounts@2021-08-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowBlobPublicAccess: false
  }
  tags: tags
}

// Storage Account Blob Service
resource blobServices 'Microsoft.Storage/storageAccounts/blobServices@2021-08-01' = {
  name: '${storageAccount.name}/default'
  properties: {
    changeFeed: {
      enabled: false
    }
  }
}

// Storage Container (uploads)
resource uploadsContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2021-08-01' = {
  name: '${blobServices.name}/uploads'
  properties: {
    publicAccess: 'None'
  }
}

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2021-06-01' = {
  name: postgresServerName
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'postgres'
    administratorLoginPassword: 'ChangeMe@12345!' // DEVE ser trocado em produção
    storage: {
      storageSizeGB: 32
    }
    version: '14'
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    network: {
      delegatedSubnetResourceId: ''
      privateDnsZoneArmResourceId: ''
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
  tags: tags
}

// PostgreSQL Database
resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2021-06-01' = {
  name: '${postgresServer.name}/foodclub'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Container App Environment
resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2022-03-01' = {
  name: containerAppEnvName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: listKeys(logAnalyticsWorkspace.id, '2021-12-01-preview').primarySharedKey
      }
    }
  }
  tags: tags
}

// Outputs
output containerRegistryLoginServer string = containerRegistry.properties.loginServer
output containerRegistryId string = containerRegistry.id
output keyVaultUri string = keyVault.properties.vaultUri
output logAnalyticsId string = logAnalyticsWorkspace.id
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
output postgresServerId string = postgresServer.id
output postgresHostname string = postgresServer.properties.fullyQualifiedDomainName
