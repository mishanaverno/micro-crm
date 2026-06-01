FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/ \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-timeout 300000 \
  && npm config set maxsockets 1 \
  && npm ci --no-audit --no-fund --verbose

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
