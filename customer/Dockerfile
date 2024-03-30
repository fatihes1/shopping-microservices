FROM node
LABEL authors="fatihes1"

WORKDIR /app/customer

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8005

CMD ["npm", "run", "start"]