const express = require('express');

const app = express();

app.use(express.json());

app.use('/', (req, res, next) => {
  return res.status(200).json({
    message: 'Products API',
  });
});

app.listen(8006, () => {
  console.log('Products API running on port 8006');
});
