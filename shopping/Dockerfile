FROM node
LABEL authors="fatihes1"

WORKDIR /app/shopping

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8007

CMD ["npm", "run", "start:prod"]