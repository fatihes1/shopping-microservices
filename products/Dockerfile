FROM node
LABEL authors="fatihes1"

WORKDIR /app/products

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8006

CMD ["npm", "run", "start:prod"]
