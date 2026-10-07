const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
    }
  } catch (error) {
    console.error('Erro de conexão ao MongoDB no handler da Vercel:', error);
  }
  return app(req, res);
};
