const express = require('express');
const router = express.Router();

const {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  getGames,
  seedCharacters,
} = require('../controllers/characterController');

// Rota de listagem de jogos (deve vir antes de :id)
router.get('/games', getGames);

// Rota de seed/população inicial
router.post('/seed', seedCharacters);

// Rotas raiz /api/characters
router.route('/')
  .get(getCharacters)
  .post(createCharacter);

// Rotas por ID /api/characters/:id
router.route('/:id')
  .get(getCharacterById)
  .put(updateCharacter)
  .delete(deleteCharacter);

module.exports = router;
