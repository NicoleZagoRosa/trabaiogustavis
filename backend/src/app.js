const express = require('express');
const cors = require('cors');
const path = require('path');
const characterRoutes = require('./routes/characterRoutes');

const app = express();

// Middlewares essenciais
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (para desenvolvimento local integrado)
const frontendPath = path.resolve(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Rota de Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API do Mini Sistema de Cartas de Personagens está operacional.',
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API de Personagens
app.use('/api/characters', characterRoutes);

// Rota 404 para endpoints de API inexistentes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware centralizado de tratamento de erros
app.use((err, req, res, next) => {
  console.error(' Erro interno capturado:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno no servidor.';

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

module.exports = app;
