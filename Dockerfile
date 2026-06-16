# Estágio de build
FROM node:26-alpine AS builder

WORKDIR /app

# Instala dependências necessárias para compilação nativa (bcrypt, etc)
RUN apk add --no-cache python3 make g++

# Copia os arquivos de configuração
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies) para build
RUN npm ci || npm install

# Copia os arquivos de configuração do TypeScript
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY .sequelizerc ./

# Copia o código fonte
COPY src ./src

# Compila o projeto
RUN npm run build

# Remove devDependencies após build
RUN npm prune --production

# Estágio de produção
FROM node:26-alpine

WORKDIR /app

# Instala apenas dumb-init para melhor gerenciamento de processos
RUN apk add --no-cache dumb-init

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copia apenas os arquivos necessários do estágio de build
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/.sequelizerc ./
COPY --from=builder --chown=nodejs:nodejs /app/src/infrastructure/database ./src/infrastructure/database

# Muda para usuário não-root
USER nodejs

ENV NODE_ENV=production

# Expõe a porta da aplicação
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health-check', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usa dumb-init para melhor gerenciamento de sinais
# Roda migrations e seeders antes de iniciar
CMD ["dumb-init", "sh", "-c", "npm run start:prod"] 
