# Use official Node.js image
FROM node:20

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
