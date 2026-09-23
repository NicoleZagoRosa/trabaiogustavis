const mongoose = require('mongoose');
const { Character, RARITIES } = require('../models/Character');
const initialCharacters = require('../seed/seedData');

/**
 * Validador auxiliar de ID do MongoDB
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc   Listar todos os personagens com suporte a filtros
 * @route  GET /api/characters
 * @access Public
 */
const getCharacters = async (req, res, next) => {
  try {
    const { game, rarity, search, sort } = req.query;
    const filter = {};

    if (game) {
      filter.game = { $regex: new RegExp(game.trim(), 'i') };
    }

    if (rarity) {
      filter.rarity = { $regex: new RegExp(`^${rarity.trim()}$`, 'i') };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { game: searchRegex }];
    }

    let query = Character.find(filter);

    // Ordenação
    if (sort) {
      const sortFields = sort.split(',').join(' ');
      query = query.sort(sortFields);
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const characters = await query.exec();

    res.status(200).json({
      success: true,
      count: characters.length,
      data: characters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Obter um personagem por ID
 * @route  GET /api/characters/:id
 * @access Public
 */
const getCharacterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de ID inválido. Deve ser um ObjectId válido do MongoDB.',
      });
    }

    const character = await Character.findById(id);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: `Personagem com ID ${id} não foi encontrado.`,
      });
    }

    res.status(200).json({
      success: true,
      data: character,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Criar um novo personagem
 * @route  POST /api/characters
 * @access Public
 */
const createCharacter = async (req, res, next) => {
  try {
    const { name, game, releaseDate, image, rarity, price } = req.body;

    // Validações básicas de presença
    if (!name || !game || !releaseDate || !image || !rarity || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios ausentes: name, game, releaseDate, image, rarity, price.',
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        error: 'O preço deve ser um valor numérico positivo ou zero.',
      });
    }

    const character = await Character.create({
      name,
      game,
      releaseDate,
      image,
      rarity,
      price,
    });

    res.status(201).json({
      success: true,
      message: 'Personagem criado com sucesso.',
      data: character,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(' '),
      });
    }
    next(error);
  }
};

/**
 * @desc   Atualizar um personagem existente
 * @route  PUT /api/characters/:id
 * @access Public
 */
const updateCharacter = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de ID inválido. Deve ser um ObjectId válido do MongoDB.',
      });
    }

    // Se a raridade foi enviada, validar antes
    if (req.body.rarity && !RARITIES.includes(req.body.rarity)) {
      return res.status(400).json({
        success: false,
        error: `Raridade inválida. As opções válidas são: ${RARITIES.join(', ')}`,
      });
    }

    // Se o preço foi enviado, validar
    if (req.body.price !== undefined && (typeof req.body.price !== 'number' || req.body.price < 0)) {
      return res.status(400).json({
        success: false,
        error: 'O preço deve ser um número maior ou igual a zero.',
      });
    }

    const updated = await Character.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: `Personagem com ID ${id} não foi encontrado.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Personagem atualizado com sucesso.',
      data: updated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(' '),
      });
    }
    next(error);
  }
};

/**
 * @desc   Deletar um personagem por ID
 * @route  DELETE /api/characters/:id
 * @access Public
 */
const deleteCharacter = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de ID inválido. Deve ser um ObjectId válido do MongoDB.',
      });
    }

    const deleted = await Character.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Personagem com ID ${id} não foi encontrado.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Personagem excluído com sucesso.',
      data: { id: deleted.id, name: deleted.name },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Listar jogos distintos cadastrados para os filtros do frontend
 * @route  GET /api/characters/games
 * @access Public
 */
const getGames = async (req, res, next) => {
  try {
    const games = await Character.distinct('game');
    res.status(200).json({
      success: true,
      count: games.length,
      data: games.sort(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Popular/Reinicializar com os 5 personagens iniciais
 * @route  POST /api/characters/seed
 * @access Public
 */
const seedCharacters = async (req, res, next) => {
  try {
    const count = await Character.countDocuments();
    const force = req.query.force === 'true';

    if (count > 0 && !force) {
      const existing = await Character.find();
      return res.status(200).json({
        success: true,
        message: 'O banco de dados já contém personagens. Use ?force=true para redefinir.',
        count: existing.length,
        data: existing,
      });
    }

    if (force) {
      await Character.deleteMany({});
    }

    const seeded = await Character.insertMany(initialCharacters);

    res.status(201).json({
      success: true,
      message: `${seeded.length} personagens iniciais foram carregados com sucesso.`,
      count: seeded.length,
      data: seeded,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getGames,
  seedCharacters,
};
