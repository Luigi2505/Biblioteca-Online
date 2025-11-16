/**
 * Catálogo de Livros - Biblioteca Online
 * Sistema de visualização e filtragem de livros
 */

// Estado global
let catalogBooks = [];
let filteredBooks = [];
let currentPage = 1;
let booksPerPage = 12;
let currentGenre = 'all';
let currentSort = 'title';

// Elementos DOM
const elements = {
    catalogBooks: document.getElementById('catalogBooks'),
    catalogLoading: document.getElementById('catalogLoading'),
    catalogError: document.getElementById('catalogError'),
    catalogEmpty: document.getElementById('catalogEmpty'),
    catalogSearch: document.getElementById('catalogSearch'),
    searchCatalogBtn: document.getElementById('searchCatalogBtn'),
    sortSelect: document.getElementById('sortSelect'),
    clearFilters: document.getElementById('clearFilters'),
    pagination: document.getElementById('pagination'),
    totalBooks: document.getElementById('totalBooks'),
    totalAuthors: document.getElementById('totalAuthors'),
    totalGenres: document.getElementById('totalGenres')
};

// Configuração da API
const API_BASE_URL = 'https://jsonplaceholder.typicode.com/posts';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadCatalogBooks();
    setupCatalogEventListeners();
});

/**
 * Configura os event listeners do catálogo
 */
function setupCatalogEventListeners() {
    // Busca
    elements.catalogSearch.addEventListener('input', handleCatalogSearch);
    elements.searchCatalogBtn.addEventListener('click', handleCatalogSearch);
    
    // Ordenação
    elements.sortSelect.addEventListener('change', handleSort);
    
    // Filtros de gênero
    document.querySelectorAll('.genre-filter').forEach(btn => {
        btn.addEventListener('click', handleGenreFilter);
    });
    
    // Limpar filtros
    elements.clearFilters.addEventListener('click', clearAllFilters);
}

/**
 * Carrega os livros do catálogo
 */
async function loadCatalogBooks() {
    showCatalogLoading(true);
    hideCatalogMessages();
    
    try {
        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar o catálogo');
        }
        
        const data = await response.json();
        
        // Transformar dados e expandir para mais variedade
        catalogBooks = data.slice(0, 50).map((item, index) => ({
            id: item.id,
            title: item.title,
            author: generateAuthor(index),
            year: 1990 + (index % 34),
            genre: ['ficcao', 'nao-ficcao', 'biografia', 'tecnico', 'infantil', 'poesia'][index % 6],
            description: item.body,
            rating: (3 + Math.random() * 2).toFixed(1),
            pages: 100 + Math.floor(Math.random() * 500)
        }));
        
        filteredBooks = [...catalogBooks];
        updateStats();
        renderCatalog();
        
    } catch (error) {
        console.error('Erro ao carregar catálogo:', error);
        showCatalogError('Erro ao carregar o catálogo. Tente novamente.');
    } finally {
        showCatalogLoading(false);
    }
}

/**
 * Gera nomes de autores variados
 */
function generateAuthor(index) {
    const authors = [
        'Machado de Assis', 'Clarice Lispector', 'Jorge Amado', 'Cecília Meireles',
        'Carlos Drummond de Andrade', 'Manuel Bandeira', 'Vinicius de Moraes',
        'José Saramago', 'Gabriel García Márquez', 'Pablo Neruda',
        'Julio Cortázar', 'Mario Vargas Llosa', 'Isabel Allende',
        'Stephen King', 'J.K. Rowling', 'George R.R. Martin',
        'Tolkien', 'C.S. Lewis', 'Umberto Eco', 'Italo Calvino'
    ];
    return authors[index % authors.length];
}

/**
 * Renderiza o catálogo
 */
function renderCatalog() {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const booksToShow = filteredBooks.slice(startIndex, endIndex);
    
    if (filteredBooks.length === 0) {
        elements.catalogBooks.style.display = 'none';
        elements.catalogEmpty.style.display = 'block';
        elements.pagination.style.display = 'none';
        return;
    }
    
    elements.catalogBooks.style.display = 'grid';
    elements.catalogEmpty.style.display = 'none';
    elements.pagination.style.display = 'flex';
    
    elements.catalogBooks.innerHTML = booksToShow.map(book => createCatalogCard(book)).join('');
    renderPagination();
}

/**
 * Cria o HTML de um card do catálogo
 */
function createCatalogCard(book) {
    const genreLabels = {
        'ficcao': 'Ficção',
        'nao-ficcao': 'Não-ficção',
        'biografia': 'Biografia',
        'tecnico': 'Técnico',
        'infantil': 'Infantil',
        'poesia': 'Poesia'
    };
    
    return `
        <div class="catalog-card">
            <div class="catalog-card-header">
                <h4 class="catalog-title">${escapeHtml(book.title)}</h4>
                <div class="catalog-rating">
                    ⭐ ${book.rating}
                </div>
            </div>
            
            <p class="catalog-author">por ${escapeHtml(book.author)}</p>
            
            <div class="catalog-meta">
                <span class="catalog-meta-item">${book.year}</span>
                <span class="catalog-meta-item">${book.pages} páginas</span>
                <span class="catalog-meta-item">${genreLabels[book.genre]}</span>
            </div>
            
            <p class="catalog-description">${escapeHtml(book.description.substring(0, 150))}...</p>
            
            <div class="catalog-actions">
                <button class="btn btn-primary btn-small" onclick="viewBookDetails(${book.id})">
                    📖 Ver Detalhes
                </button>
                <button class="btn btn-secondary btn-small" onclick="reserveBook(${book.id})">
                    📚 Reservar
                </button>
            </div>
        </div>
    `;
}

/**
 * Renderiza a paginação
 */
function renderPagination() {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    
    if (totalPages <= 1) {
        elements.pagination.style.display = 'none';
        return;
    }
    
    let paginationHTML = '';
    
    // Botão anterior
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            ← Anterior
        </button>
    `;
    
    // Números de página
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                        onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<span class="pagination-dots">...</span>';
        }
    }
    
    // Botão próximo
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            Próximo →
        </button>
    `;
    
    elements.pagination.innerHTML = paginationHTML;
}

/**
 * Manipula a busca no catálogo
 */
function handleCatalogSearch() {
    const searchTerm = elements.catalogSearch.value.toLowerCase().trim();
    
    if (!searchTerm && currentGenre === 'all') {
        filteredBooks = [...catalogBooks];
    } else {
        filteredBooks = catalogBooks.filter(book => {
            const matchesSearch = !searchTerm || 
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                (book.description && book.description.toLowerCase().includes(searchTerm));
            
            const matchesGenre = currentGenre === 'all' || book.genre === currentGenre;
            
            return matchesSearch && matchesGenre;
        });
    }
    
    applySorting();
    currentPage = 1;
    renderCatalog();
    updateStats();
}

/**
 * Manipula a ordenação
 */
function handleSort() {
    currentSort = elements.sortSelect.value;
    applySorting();
    renderCatalog();
}

/**
 * Aplica a ordenação atual
 */
function applySorting() {
    switch (currentSort) {
        case 'title':
            filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'author':
            filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'year':
            filteredBooks.sort((a, b) => b.year - a.year);
            break;
        case 'year-desc':
            filteredBooks.sort((a, b) => a.year - b.year);
            break;
    }
}

/**
 * Manipula o filtro de gênero
 */
function handleGenreFilter(event) {
    // Remove classe active de todos os botões
    document.querySelectorAll('.genre-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adiciona classe active ao botão clicado
    event.target.classList.add('active');
    
    currentGenre = event.target.dataset.genre;
    handleCatalogSearch();
}

/**
 * Limpa todos os filtros
 */
function clearAllFilters() {
    elements.catalogSearch.value = '';
    elements.sortSelect.value = 'title';
    currentGenre = 'all';
    currentSort = 'title';
    
    document.querySelectorAll('.genre-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.genre-filter[data-genre="all"]').classList.add('active');
    
    filteredBooks = [...catalogBooks];
    currentPage = 1;
    renderCatalog();
    updateStats();
}

/**
 * Muda a página atual
 */
function changePage(page) {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    
    if (page < 1 || page > totalPages) {
        return;
    }
    
    currentPage = page;
    renderCatalog();
    
    // Rola para o topo da lista
    elements.catalogBooks.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Atualiza as estatísticas
 */
function updateStats() {
    elements.totalBooks.textContent = filteredBooks.length;
    
    const uniqueAuthors = new Set(filteredBooks.map(book => book.author));
    elements.totalAuthors.textContent = uniqueAuthors.size;
    
    const uniqueGenres = new Set(filteredBooks.map(book => book.genre));
    elements.totalGenres.textContent = uniqueGenres.size;
}

/**
 * Ver detalhes do livro
 */
function viewBookDetails(bookId) {
    const book = catalogBooks.find(b => b.id === bookId);
    if (book) {
        alert(`Detalhes do livro:\n\nTítulo: ${book.title}\nAutor: ${book.author}\nAno: ${book.year}\nGênero: ${book.genre}\nAvaliação: ${book.rating}⭐\nPáginas: ${book.pages}\n\nDescrição: ${book.description}`);
    }
}

/**
 * Reservar livro
 */
function reserveBook(bookId) {
    const book = catalogBooks.find(b => b.id === bookId);
    if (book) {
        alert(`Livro "${book.title}" reservado com sucesso!\n\nVocê será notificado quando estiver disponível para retirada.`);
    }
}

/**
 * Mostra/esconde loading do catálogo
 */
function showCatalogLoading(show) {
    if (show) {
        elements.catalogLoading.style.display = 'block';
        elements.catalogBooks.style.display = 'none';
    } else {
        elements.catalogLoading.style.display = 'none';
    }
}

/**
 * Mostra mensagem de erro do catálogo
 */
function showCatalogError(message) {
    elements.catalogError.innerHTML = `<p>${message}</p>`;
    elements.catalogError.style.display = 'block';
    elements.catalogBooks.style.display = 'none';
}

/**
 * Esconde mensagens do catálogo
 */
function hideCatalogMessages() {
    elements.catalogError.style.display = 'none';
    elements.catalogEmpty.style.display = 'none';
}

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
