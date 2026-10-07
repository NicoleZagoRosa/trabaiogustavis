require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { Character } = require('./models/Character');
const initialCharacters = require('./seed/seedData');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Conectar ao MongoDB se configurado
    if (process.env.MONGODB_URI) {
      try {
        await connectDB();

        // Carga inicial automática caso o banco esteja vazio
        const count = await Character.countDocuments();
        if (count === 0) {
          console.log(' Banco vazio. Inserindo os 5 personagens iniciais...');
          await Character.insertMany(initialCharacters);
          console.log(' Personagens iniciais inseridos com sucesso.');
        }
      } catch (dbErr) {
        console.warn('  AVISO: Falha na conexão com MongoDB:', dbErr.message);
        console.warn('  O servidor continuará ativo servindo o Frontend e o modo offline/fallback.');
      }
    } else {
      console.warn('  AVISO: MONGODB_URI não foi configurada. Execute com MongoDB configurado ou defina no arquivo .env.');
    }

    app.listen(PORT, () => {
      console.log(` Servidor rodando com sucesso em http://localhost:${PORT}`);
      console.log(` Interface Frontend acessível em http://localhost:${PORT}`);
      console.log(` API Endpoint: http://localhost:${PORT}/api/characters`);
    });
  } catch (error) {
    console.error(' Falha ao inicializar o servidor:', error.message);
    process.exit(1);
  }
}

startServer();
