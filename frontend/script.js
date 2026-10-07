/**
 * ==========================================================================
 * GAME CARDS ARCHIVE — LÓGICA JAVASCRIPT VANILLA (SEM FRAMEWORKS)
 * ==========================================================================
 */

// Estado da Aplicação
const state = {
  characters: [],
  filteredCharacters: [],
  games: [],
  selectedGame: '',
  selectedRarity: '',
  searchQuery: '',
  carouselIndex: 0,
  autoplayActive: true,
  autoplayInterval: null,
  touchStartX: 0,
  touchEndX: 0,
};

// Dados de Fallback (para visualização imediata se a API estiver desconectada)
const FALLBACK_CHARACTERS = [
  {
    id: '1',
    name: 'Connor',
    game: 'Detroit: Become Human',
    releaseDate: '2018-05-25',
    image: 'ConnorDetroitBecomeHuman.jpg',
    rarity: 'Legendary',
    price: 150.00,
  },
  {
    id: '2',
    name: 'Arthur Morgan',
    game: 'Red Dead Redemption 2',
    releaseDate: '2018-10-26',
    image: 'ArthurMorganRedDeadRedemption2.jpg',
    rarity: 'Mythic',
    price: 250.00,
  },
  {
    id: '3',
    name: 'Veigar',
    game: 'Legends Of Runeterra',
    releaseDate: '2021-08-25',
    image: 'VeigarMecha.jpg',
    rarity: 'Mythic',
    price: 250.00,
  },
  {
    id: '4',
    name: 'Bayonetta',
    game: 'Bayonetta',
    releaseDate: '2009-10-29',
    image: 'Bayonetta.jpg',
    rarity: 'Legendary',
    price: 200.00,
  },
  {
    id: '5',
    name: 'Leon S. Kennedy',
    game: 'Resident Evil',
    releaseDate: '1998-01-21',
    image: 'ResidentLeon.jpg',
    rarity: 'Rare',
    price: 190.00,
  },
];

// Elementos do DOM
const elements = {
  carouselTrack: document.getElementById('carouselTrack'),
  carouselViewport: document.getElementById('carouselViewport'),
  carouselPrevBtn: document.getElementById('carouselPrevBtn'),
  carouselNextBtn: document.getElementById('carouselNextBtn'),
  carouselDots: document.getElementById('carouselDots'),
  btnAutoPlayToggle: document.getElementById('btnAutoPlayToggle'),
  autoplayStatusIcon: document.getElementById('autoplayStatusIcon'),
  cardsGrid: document.getElementById('cardsGrid'),
  searchInput: document.getElementById('searchInput'),
  gameSelect: document.getElementById('gameSelect'),
  raritySelect: document.getElementById('raritySelect'),
  btnResetFilters: document.getElementById('btnResetFilters'),
  resultsCounter: document.getElementById('resultsCounter'),
  emptyState: document.getElementById('emptyState'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  apiErrorBanner: document.getElementById('apiErrorBanner'),
  apiErrorMessage: document.getElementById('apiErrorMessage'),
  btnRetryApi: document.getElementById('btnRetryApi'),
  btnReload: document.getElementById('btnReload'),
  cardModal: document.getElementById('cardModal'),
  characterForm: document.getElementById('characterForm'),
  btnOpenAddModal: document.getElementById('btnOpenAddModal'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnCancelModal: document.getElementById('btnCancelModal'),
  toastContainer: document.getElementById('toastContainer'),
};

/**
 * Utilitário: Formatar valor monetário para o padrão brasileiro (R$ 1.500,00)
 */
function formatCurrencyBRL(value) {
  const number = typeof value === 'number' ? value : parseFloat(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
}

/**
 * Utilitário: Extrair ano de lançamento e formatar conforme requisito: "LANÇAMENTO: YYYY"
 */
function formatReleaseYear(dateStr) {
  if (!dateStr) return 'LANÇAMENTO: DESCONHECIDO';
  const match = dateStr.match(/\d{4}/);
  const year = match ? match[0] : dateStr;
  return `LANÇAMENTO: ${year}`;
}

/**
 * Utilitário: Obter caminho relativo da imagem do personagem
 * Garante resolução correta de arquivos .jpg na pasta images/ ou URLs externas
 */
function getImagePath(imageName) {
  if (!imageName) return 'images/ConnorDetroitBecomeHuman.jpg';

  // Se já for uma URL externa (http/https/data/blob)
  if (/^(https?:|\/\/|data:|blob:)/i.test(imageName)) {
    return imageName;
  }

  // Se já contiver o prefixo 'images/' ou '/images/'
  if (imageName.startsWith('images/') || imageName.startsWith('/images/')) {
    return imageName;
  }

  // Se contiver outra barra de diretório
  if (imageName.includes('/')) {
    return imageName;
  }

  // Se contiver extensão de imagem válida (.jpg, .png, etc.), prefixa com 'images/'
  if (/\.(jpg|jpeg|png|webp|svg|gif|avif)$/i.test(imageName)) {
    return `images/${imageName}`;
  }

  // Se for apenas o identificador puro (ex: 'ConnorDetroitBecomeHuman'), assume arquivo .jpg
  return `images/${imageName}.jpg`;
}

/**
 * Exibir notificações Toast temporárias
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Criação do elemento HTML de um Card de Personagem
 * @param {Object} char - Dados do personagem
 * @param {boolean} isSlide - Se é exibido dentro do carrossel
 */
function createCardElement(char, isSlide = false) {
  const card = document.createElement('article');
  const rarityClass = `rarity-${(char.rarity || 'common').toLowerCase()}`;
  card.className = `card-item ${rarityClass}`;
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', `${char.name} de ${char.game}, Raridade ${char.rarity}`);

  const formattedPrice = formatCurrencyBRL(char.price);
  const formattedDate = formatReleaseYear(char.releaseDate);
  const imageSrc = getImagePath(char.image);

  card.innerHTML = `
    <div class="card-image-wrap">
      <!-- Imagem com blur forte inicial -->
      <img
        src="${imageSrc}"
        alt="${char.name}"
        class="card-image"
        loading="lazy"
        onerror="this.onerror=null; this.src='images/ConnorDetroitBecomeHuman.jpg';"
      />

      <!-- Badge de Bloqueado / Misterioso -->
      <div class="card-mystery-badge">
        <span>🔒</span>
        <span>BLOQUEADO</span>
      </div>

      <!-- Barra Superior: Raridade e Preço -->
      <div class="card-top-bar">
        <span class="badge-rarity">${char.rarity}</span>
        <span class="badge-price">${formattedPrice}</span>
      </div>

      <!-- Overlay com informações do personagem (surge no hover/toque) -->
      <div class="card-info-overlay">
        <h4 class="card-character-name">${char.name}</h4>
        <span class="card-game-title">${char.game}</span>
        <span class="card-release-date">${formattedDate}</span>
      </div>
    </div>
  `;

  // Interatividade Mobile e Teclado: Alternar revelação ao tocar ou pressionar Enter/Espaço
  card.addEventListener('click', () => {
    card.classList.toggle('revealed');
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('revealed');
    }
  });

  return card;
}

/**
 * Renderiza o Carrossel de Destaques
 */
function renderCarousel(characters) {
  elements.carouselTrack.innerHTML = '';
  elements.carouselDots.innerHTML = '';

  if (!characters || characters.length === 0) {
    elements.carouselTrack.innerHTML = '<p class="text-muted" style="padding: 20px;">Nenhum personagem em destaque.</p>';
    return;
  }

  characters.forEach((char, index) => {
    const slide = createCardElement(char, true);
    elements.carouselTrack.appendChild(slide);

    // Criar dot
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Ir para slide ${index + 1}`);
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoplayTimer();
    });
    elements.carouselDots.appendChild(dot);
  });

  updateCarouselPosition();
}

/**
 * Atualiza o deslocamento visual do Carrossel e ativa o dot correto
 */
function updateCarouselPosition() {
  const slides = elements.carouselTrack.querySelectorAll('.card-item');
  const dots = elements.carouselDots.querySelectorAll('.carousel-dot');

  if (slides.length === 0) return;

  // Limitar índice
  if (state.carouselIndex < 0) {
    state.carouselIndex = slides.length - 1;
  } else if (state.carouselIndex >= slides.length) {
    state.carouselIndex = 0;
  }

  const slideWidth = slides[0].offsetWidth + 24; // largura + gap
  const offset = -(state.carouselIndex * slideWidth);
  elements.carouselTrack.style.transform = `translateX(${offset}px)`;

  // Atualizar dots
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === state.carouselIndex);
  });
}

function nextSlide() {
  const slides = elements.carouselTrack.querySelectorAll('.card-item');
  if (slides.length <= 1) return;
  state.carouselIndex = (state.carouselIndex + 1) % slides.length;
  updateCarouselPosition();
}

function prevSlide() {
  const slides = elements.carouselTrack.querySelectorAll('.card-item');
  if (slides.length <= 1) return;
  state.carouselIndex = (state.carouselIndex - 1 + slides.length) % slides.length;
  updateCarouselPosition();
}

function goToSlide(index) {
  state.carouselIndex = index;
  updateCarouselPosition();
}

/**
 * Controle de Autoplay do Carrossel
 */
function startAutoplay() {
  stopAutoplay();
  if (!state.autoplayActive) return;
  state.autoplayInterval = setInterval(() => {
    nextSlide();
  }, 4000);
}

function stopAutoplay() {
  if (state.autoplayInterval) {
    clearInterval(state.autoplayInterval);
    state.autoplayInterval = null;
  }
}

function resetAutoplayTimer() {
  if (state.autoplayActive) {
    startAutoplay();
  }
}

function toggleAutoplay() {
  state.autoplayActive = !state.autoplayActive;
  elements.btnAutoPlayToggle.classList.toggle('active', state.autoplayActive);
  elements.autoplayStatusIcon.textContent = state.autoplayActive ? '⏸' : '▶';

  if (state.autoplayActive) {
    startAutoplay();
    showToast('Autoplay ativado');
  } else {
    stopAutoplay();
    showToast('Autoplay pausado');
  }
}

/**
 * Renderiza o Catálogo de Cartas na Grade Principal
 */
function renderCardsGrid(characters) {
  elements.cardsGrid.innerHTML = '';

  if (!characters || characters.length === 0) {
    elements.emptyState.classList.remove('hidden');
    elements.resultsCounter.textContent = '0 cartas encontradas';
    return;
  }

  elements.emptyState.classList.add('hidden');
  elements.resultsCounter.textContent = `${characters.length} carta(s) encontrada(s)`;

  characters.forEach((char) => {
    const card = createCardElement(char, false);
    elements.cardsGrid.appendChild(card);
  });
}

/**
 * Atualiza o dropdown com os jogos únicos existentes
 */
function populateGameFilter(games) {
  const currentVal = elements.gameSelect.value;
  elements.gameSelect.innerHTML = '<option value="">Todos os Jogos</option>';

  games.forEach((game) => {
    const opt = document.createElement('option');
    opt.value = game;
    opt.textContent = game;
    elements.gameSelect.appendChild(opt);
  });

  elements.gameSelect.value = currentVal;
}

/**
 * Aplica os filtros locais e atualiza a exibição
 */
function applyFilters() {
  let filtered = [...state.characters];

  // Filtro por Jogo
  if (state.selectedGame) {
    filtered = filtered.filter(
      (c) => c.game.toLowerCase() === state.selectedGame.toLowerCase()
    );
  }

  // Filtro por Raridade
  if (state.selectedRarity) {
    filtered = filtered.filter(
      (c) => c.rarity.toLowerCase() === state.selectedRarity.toLowerCase()
    );
  }

  // Filtro por Busca de Texto (Nome ou Jogo)
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (c) => c.name.toLowerCase().includes(q) || c.game.toLowerCase().includes(q)
    );
  }

  state.filteredCharacters = filtered;
  renderCardsGrid(filtered);
}

/**
 * Busca de personagens da API REST
 */
async function fetchCharacters() {
  elements.resultsCounter.textContent = 'Consultando API...';
  elements.apiErrorBanner.classList.add('hidden');

  try {
    const response = await fetch('/api/characters');
    if (!response.ok) {
      throw new Error(`Servidor retornou status HTTP ${response.status}`);
    }

    const json = await response.json();
    const data = json.data || [];

    if (data.length === 0) {
      // Se a coleção estiver vazia, acionar seed automático
      await seedDatabase();
      return;
    }

    state.characters = data;
    extractAndSetGames(data);
    renderCarousel(data);
    applyFilters();
    startAutoplay();
  } catch (error) {
    console.warn('API indisponível ou erro de conexão. Utilizando dados de demonstração:', error.message);
    elements.apiErrorBanner.classList.remove('hidden');
    elements.apiErrorMessage.textContent = `Aviso: API em modo offline (${error.message}). Exibindo cartas de demonstração.`;

    // Carregar personagens padrão para manter a aplicação 100% interativa
    state.characters = [...FALLBACK_CHARACTERS];
    extractAndSetGames(FALLBACK_CHARACTERS);
    renderCarousel(FALLBACK_CHARACTERS);
    applyFilters();
    startAutoplay();
  }
}

/**
 * Extrai lista única de jogos a partir dos personagens
 */
function extractAndSetGames(characters) {
  const gameSet = new Set(characters.map((c) => c.game));
  state.games = Array.from(gameSet).sort();
  populateGameFilter(state.games);
}

/**
 * Acionar endpoint de seed
 */
async function seedDatabase() {
  try {
    const res = await fetch('/api/characters/seed', { method: 'POST' });
    if (res.ok) {
      showToast('Personagens iniciais carregados!', 'success');
      fetchCharacters();
    }
  } catch (err) {
    console.error('Falha ao executar seed:', err);
  }
}

/**
 * Adicionar novo personagem via POST /api/characters
 */
async function handleFormSubmit(event) {
  event.preventDefault();

  const charData = {
    name: document.getElementById('charName').value.trim(),
    game: document.getElementById('charGame').value.trim(),
    releaseDate: document.getElementById('charReleaseDate').value,
    rarity: document.getElementById('charRarity').value,
    price: parseFloat(document.getElementById('charPrice').value),
    image: document.getElementById('charImage').value.trim(),
  };

  try {
    const response = await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(charData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Erro ao salvar personagem.');
    }

    showToast(`Carta de ${charData.name} cadastrada com sucesso!`, 'success');
    closeModal();
    elements.characterForm.reset();
    fetchCharacters();
  } catch (error) {
    // Se a API estiver offline, simula adição local no estado
    charData.id = Date.now().toString();
    state.characters.unshift(charData);
    extractAndSetGames(state.characters);
    renderCarousel(state.characters);
    applyFilters();
    closeModal();
    elements.characterForm.reset();
    showToast(`Carta adicionada localmente (${error.message})`, 'info');
  }
}

/**
 * Controle do Modal
 */
function openModal() {
  elements.cardModal.classList.remove('hidden');
  document.getElementById('charName').focus();
}

function closeModal() {
  elements.cardModal.classList.add('hidden');
}

/**
 * Configuração dos Event Listeners
 */
function setupEventListeners() {
  // Controles do Carrossel
  elements.carouselNextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoplayTimer();
  });

  elements.carouselPrevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoplayTimer();
  });

  elements.btnAutoPlayToggle.addEventListener('click', toggleAutoplay);

  // Pausar autoplay ao passar o mouse ou focar no carrossel
  elements.carouselViewport.addEventListener('mouseenter', stopAutoplay);
  elements.carouselViewport.addEventListener('mouseleave', () => {
    if (state.autoplayActive) startAutoplay();
  });

  // Navegação por teclado no carrossel
  elements.carouselViewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      nextSlide();
      resetAutoplayTimer();
    } else if (e.key === 'ArrowLeft') {
      prevSlide();
      resetAutoplayTimer();
    }
  });

  // Suporte a Toque / Swipe no Mobile
  elements.carouselViewport.addEventListener('touchstart', (e) => {
    state.touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  elements.carouselViewport.addEventListener('touchend', (e) => {
    state.touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    if (state.autoplayActive) startAutoplay();
  }, { passive: true });

  // Filtros
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    applyFilters();
  });

  elements.gameSelect.addEventListener('change', (e) => {
    state.selectedGame = e.target.value;
    applyFilters();
  });

  elements.raritySelect.addEventListener('change', (e) => {
    state.selectedRarity = e.target.value;
    applyFilters();
  });

  elements.btnResetFilters.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.gameSelect.value = '';
    elements.raritySelect.value = '';
    state.searchQuery = '';
    state.selectedGame = '';
    state.selectedRarity = '';
    applyFilters();
    showToast('Filtros redefinidos');
  });

  elements.btnClearSearch.addEventListener('click', () => {
    elements.btnResetFilters.click();
  });

  // Atualizar / Recarregar da API
  elements.btnReload.addEventListener('click', () => {
    fetchCharacters();
    showToast('Recarregando catálogo da API...');
  });

  elements.btnRetryApi.addEventListener('click', () => {
    fetchCharacters();
  });

  // Modal
  elements.btnOpenAddModal.addEventListener('click', openModal);
  elements.btnCloseModal.addEventListener('click', closeModal);
  elements.btnCancelModal.addEventListener('click', closeModal);
  elements.cardModal.addEventListener('click', (e) => {
    if (e.target === elements.cardModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !elements.cardModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  elements.characterForm.addEventListener('submit', handleFormSubmit);

  // Redimensionamento de Janela
  window.addEventListener('resize', () => {
    updateCarouselPosition();
  });
}

function handleSwipe() {
  const threshold = 40; // sensibilidade em pixels
  const diff = state.touchEndX - state.touchStartX;

  if (diff < -threshold) {
    nextSlide(); // Swipe para a esquerda -> Próximo slide
  } else if (diff > threshold) {
    prevSlide(); // Swipe para a direita -> Slide anterior
  }
}

/**
 * Inicialização
 */
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  fetchCharacters();
});
