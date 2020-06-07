import express from 'express';

const app = express();

app.get('/users', (request, response) => {
  return response.json([
    'Roberto',
    'Ribeiro',
    'Rocha',
    'Junior'
  ]);
});

app.listen(3333);
