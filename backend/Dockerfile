// backend/Dockerfile
FROM node:18-alpine

# Instalar dependências do sistema para mysqldump e outras ferramentas
RUN apk add --no-cache mysql-client gzip

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json e package-lock.json (se disponível)
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretórios necessários
RUN mkdir -p logs uploads backups

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Alterar propriedade dos diretórios
RUN chown -R nodejs:nodejs /app

# Mudar para usuário não-root
USER nodejs

# Expor a porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"]