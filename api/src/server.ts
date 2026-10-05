import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'diatinf-api' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API disponível em http://localhost:${port}`);
});