const mongoose = require('mongoose');

/**
 * Cache global da conexão para evitar múltiplas conexões em ambientes Serverless (Vercel)
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Conecta ao MongoDB utilizando Mongoose com suporte a reutilização de conexão
 * @param {string} [uri] - URI customizada ou variável MONGODB_URI
 * @returns {Promise<mongoose.Connection>}
 */
async function connectDB(uri) {
  const connectionUri = uri || process.env.MONGODB_URI;

  if (!connectionUri) {
    throw new Error('A variável de ambiente MONGODB_URI não foi definida.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(connectionUri, opts).then((m) => {
      console.log(' Conectado com sucesso ao MongoDB');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(' Erro ao conectar ao MongoDB:', error.message);
    throw error;
  }

  return cached.conn;
}

module.exports = connectDB;
