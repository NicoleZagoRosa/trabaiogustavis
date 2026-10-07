const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const { Character } = require('../src/models/Character');
const initialCharacters = require('../src/seed/seedData');

let mongoServer;

describe('API de Personagens de Jogos - Testes de Integração', () => {
  before(async () => {
    // Inicia o MongoDB em memória
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  after(async () => {
    // Encerra a conexão e o servidor em memória
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Reseta e popula com os 5 personagens iniciais antes de cada teste
    await Character.deleteMany({});
    await Character.insertMany(initialCharacters);
  });

  // 1. Health Check
  test('GET /api/health deve retornar status 200 e status ok', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  // 2. Listagem de personagens
  test('GET /api/characters deve listar os 5 personagens cadastrados', async () => {
    const res = await request(app).get('/api/characters');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 5);
    assert.equal(Array.isArray(res.body.data), true);
  });

  // 3. Filtro por jogo
  test('GET /api/characters?game=DOOM deve filtrar corretamente por jogo', async () => {
    const res = await request(app).get('/api/characters?game=DOOM');
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].name, 'Doom Slayer');
    assert.equal(res.body.data[0].game, 'DOOM');
  });

  // 4. Filtro por raridade
  test('GET /api/characters?rarity=Legendary deve filtrar por raridade', async () => {
    const res = await request(app).get('/api/characters?rarity=Legendary');
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 2); // Connor e Leon
    const names = res.body.data.map((c) => c.name);
    assert.ok(names.includes('Connor'));
    assert.ok(names.includes('Leon S. Kennedy'));
  });

  // 5. Filtro combinado por jogo e raridade
  test('GET /api/characters?game=Detroit&rarity=Legendary deve retornar Connor', async () => {
    const res = await request(app).get('/api/characters?game=Detroit&rarity=Legendary');
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].name, 'Connor');
  });

  // 6. Listagem de jogos distintos
  test('GET /api/characters/games deve retornar lista ordenada de jogos', async () => {
    const res = await request(app).get('/api/characters/games');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 5);
    assert.ok(res.body.data.includes('Red Dead Redemption 2'));
    assert.ok(res.body.data.includes('Resident Evil'));
  });

  // 7. Obter por ID existente
  test('GET /api/characters/:id deve retornar o personagem correspondente', async () => {
    const existing = await Character.findOne({ name: 'Arthur Morgan' });
    const res = await request(app).get(`/api/characters/${existing._id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Arthur Morgan');
    assert.equal(res.body.data.rarity, 'Mythic');
    assert.equal(res.body.data.price, 250.0);
  });

  // 8. Obter por ID com formato inválido (400)
  test('GET /api/characters/:id com ID malformado deve retornar 400', async () => {
    const res = await request(app).get('/api/characters/id-invalido-123');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Formato de ID inválido/);
  });

  // 9. Obter por ID inexistente (404)
  test('GET /api/characters/:id com ObjectId inexistente deve retornar 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/characters/${fakeId}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /não foi encontrado/);
  });

  // 10. Criação de personagem com sucesso (201)
  test('POST /api/characters deve criar um novo personagem válido', async () => {
    const newChar = {
      name: 'Geralt of Rivia',
      game: 'The Witcher 3',
      releaseDate: '2015-05-19',
      image: 'GeraltTheWitcher',
      rarity: 'Mythic',
      price: 280.0,
    };

    const res = await request(app).post('/api/characters').send(newChar);
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Geralt of Rivia');
    assert.equal(res.body.data.price, 280.0);

    // Valida persistência no banco
    const found = await Character.findById(res.body.data.id);
    assert.ok(found);
    assert.equal(found.name, 'Geralt of Rivia');
  });

  // 11. Criação com campos obrigatórios ausentes (400)
  test('POST /api/characters com dados incompletos deve retornar 400', async () => {
    const invalidChar = {
      name: 'Sem Jogo',
    };

    const res = await request(app).post('/api/characters').send(invalidChar);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Campos obrigatórios ausentes/);
  });

  // 12. Criação com raridade inválida (400)
  test('POST /api/characters com raridade inexistente deve retornar 400', async () => {
    const invalidRarityChar = {
      name: 'Kratos',
      game: 'God of War',
      releaseDate: '2018-04-20',
      image: 'KratosGodOfWar',
      rarity: 'SuperUltraRare', // Raridade inválida
      price: 200.0,
    };

    const res = await request(app).post('/api/characters').send(invalidRarityChar);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Raridade inválida/);
  });

  // 13. Criação com preço negativo (400)
  test('POST /api/characters com preço negativo deve retornar 400', async () => {
    const negativePriceChar = {
      name: 'Kratos',
      game: 'God of War',
      releaseDate: '2018-04-20',
      image: 'KratosGodOfWar',
      rarity: 'Legendary',
      price: -50.0,
    };

    const res = await request(app).post('/api/characters').send(negativePriceChar);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /preço/i);
  });

  // 14. Atualização de personagem existente (200)
  test('PUT /api/characters/:id deve atualizar campos do personagem', async () => {
    const existing = await Character.findOne({ name: 'Bayonetta' });
    const res = await request(app)
      .put(`/api/characters/${existing._id}`)
      .send({ price: 110.0, rarity: 'Epic' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.price, 110.0);
    assert.equal(res.body.data.rarity, 'Epic');

    const updated = await Character.findById(existing._id);
    assert.equal(updated.price, 110.0);
    assert.equal(updated.rarity, 'Epic');
  });

  // 15. Atualização de personagem inexistente (404)
  test('PUT /api/characters/:id com ID inexistente deve retornar 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/characters/${fakeId}`)
      .send({ price: 99.0 });

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  // 16. Exclusão de personagem existente (200)
  test('DELETE /api/characters/:id deve excluir o personagem', async () => {
    const existing = await Character.findOne({ name: 'Connor' });
    const res = await request(app).delete(`/api/characters/${existing._id}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /excluído com sucesso/);

    const check = await Character.findById(existing._id);
    assert.equal(check, null);
  });

  // 17. Exclusão com ID inexistente (404)
  test('DELETE /api/characters/:id com ID inexistente deve retornar 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/characters/${fakeId}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  // 18. Rota inexistente (404)
  test('GET /api/rota-que-nao-existe deve retornar 404 JSON', async () => {
    const res = await request(app).get('/api/rota-que-nao-existe');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.error, /Endpoint não encontrado/);
  });
});
