const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/customer', proxy('http://localhost:8005'))
app.use('/shopping', proxy('http://localhost:8007'))
app.use('/', proxy('http://localhost:8006')) // the products API


app.listen(8004, () => {
    console.log('API Gateway running on port 8004');
})

