FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app/nestjs 

COPY nest-app ./

RUN npm install

RUN npm run build

EXPOSE 3434

CMD ["npm", "run", "start:prod"]
