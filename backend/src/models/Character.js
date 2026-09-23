const mongoose = require('mongoose');

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];

const characterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'O nome do personagem é obrigatório.'],
      trim: true,
      minlength: [2, 'O nome deve ter no mínimo 2 caracteres.'],
      maxlength: [100, 'O nome deve ter no máximo 100 caracteres.'],
    },
    game: {
      type: String,
      required: [true, 'O nome do jogo é obrigatório.'],
      trim: true,
      minlength: [2, 'O jogo deve ter no mínimo 2 caracteres.'],
      maxlength: [100, 'O jogo deve ter no máximo 100 caracteres.'],
    },
    releaseDate: {
      type: String,
      required: [true, 'A data de lançamento é obrigatória.'],
      trim: true,
      validate: {
        validator: function (v) {
          // Permite formatos como YYYY-MM-DD ou YYYY
          return /^\d{4}(-\d{2}-\d{2})?$/.test(v);
        },
        message: 'A data de lançamento deve estar no formato AAAA-MM-DD ou AAAA.',
      },
    },
    image: {
      type: String,
      required: [true, 'O identificador da imagem/placeholder é obrigatório.'],
      trim: true,
    },
    rarity: {
      type: String,
      required: [true, 'A raridade é obrigatória.'],
      enum: {
        values: RARITIES,
        message: `Raridade inválida. As opções são: ${RARITIES.join(', ')}`,
      },
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'O preço é obrigatório.'],
      min: [0, 'O preço não pode ser negativo.'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Índice composto para otimizar buscas por jogo e raridade
characterSchema.index({ game: 1, rarity: 1 });
characterSchema.index({ name: 'text', game: 'text' });

const Character = mongoose.models.Character || mongoose.model('Character', characterSchema);

module.exports = {
  Character,
  RARITIES,
};
