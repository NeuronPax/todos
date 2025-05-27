FROM node:23-alpine AS build
WORKDIR /app
COPY package.json .
COPY client/package.json ./client/
RUN npm install && cd client && npm install
COPY . .
RUN npm run build
FROM node:16-alpine
WORKDIR /todos
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/.env.production ./
CMD ["npm", "run", "start"]