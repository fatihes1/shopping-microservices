const express = require('express');

const app = express();

app.use(express.json());

app.use('/', (req, res, next) => {
    return res.status(200).json({
        message: 'Shopping API'
    })
})

app.listen(8007, () => {
    console.log('Shopping API running on port 8007');
})

