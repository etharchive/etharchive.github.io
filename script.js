const SITE_URL = 'https://ethiopianliteraryarchive.com';
const SITE_TITLE = 'Ethiopian Literary Archive';
const DATA_URL = 'data.json';
const PLACEHOLDER_IMAGE = 'images/placeholder.png';
const BIO_SNIPPET_LENGTH = 260;
const RELATED_AUTHORS_COUNT = 4;

const EXTERNAL_LINK_TYPES = [
    { key: 'wikipedia', icon: 'fab fa-wikipedia-w', label: 'Wikipedia' },
    { key: 'goodreads', icon: 'fab fa-goodreads-g', label: 'Goodreads' },
    { key: 'personal', icon: 'fas fa-globe', label: 'Website' }
];

let authorsData = [];

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getUrlParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}

async function fetchData() {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error('Failed to load');
    return response.json();
}

function formatYears(author, bornLabel) {
    return author.deathYear
        ? `${author.birthYear}–${author.deathYear}`
        : `${bornLabel} ${author.birthYear}`;
}

function authorUrl(author) {
    return `author.html?slug=${encodeURIComponent(author.slug)}`;
}

function bookUrl(book) {
    return `book.html?slug=${encodeURIComponent(book.slug)}`;
}

function imageTag(src, alt, fallbackIcon) {
    return `<img src="${escapeHtml(src || PLACEHOLDER_IMAGE)}" alt="${escapeHtml(alt)}" data-fallback-icon="${fallbackIcon}">`;
}

function setupImageFallbacks() {
    document.addEventListener('error', event => {
        const img = event.target;
        if (!(img instanceof HTMLImageElement) || !img.dataset.fallbackIcon || !img.parentElement) return;
        img.parentElement.innerHTML = `<div class="img-placeholder"><i class="fas fa-${img.dataset.fallbackIcon}" aria-hidden="true"></i></div>`;
    }, true);
}

function setupBackLink() {
    const link = document.getElementById('backLink');
    if (!link) return;
    link.addEventListener('click', event => {
        const sameOrigin = document.referrer && new URL(document.referrer).origin === window.location.origin;
        if (sameOrigin && window.history.length > 1) {
            event.preventDefault();
            window.history.back();
        }
    });
}

function breadcrumbHTML(items) {
    const lastIndex = items.length - 1;
    const crumbs = items.map((item, index) => index === lastIndex
        ? `<li aria-current="page">${escapeHtml(item.label)}</li>`
        : `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`
    ).join('');
    return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${crumbs}</ol></nav>`;
}

function authorCardHTML(author) {
    return `<a href="${authorUrl(author)}" class="author-card">
        <div class="author-image">${imageTag(author.imageUrl, author.name, 'user')}</div>
        <div class="author-info">
            <div class="author-name">${escapeHtml(author.name)}</div>
            <div class="author-years">${formatYears(author, 'b.')}</div>
        </div>
    </a>`;
}

function bookCardHTML(book) {
    return `<a href="${bookUrl(book)}" class="book-card">
        <div class="book-image">${imageTag(book.coverUrl, book.title, 'book')}</div>
        <div class="book-info">
            <div class="book-title">${escapeHtml(book.title)}</div>
            <div class="book-year">${book.year}</div>
            ${book.genre ? `<div class="book-genre">${escapeHtml(book.genre)}</div>` : ''}
            ${book.series ? `<div class="book-series">${escapeHtml(book.series)}</div>` : ''}
        </div>
    </a>`;
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle" aria-hidden="true"></i><p>${escapeHtml(message)}</p><a href="index.html">← Return home</a></div>`;
}

async function loadAuthors() {
    try {
        const data = await fetchData();
        authorsData = data.authors;
        authorsData.sort((a, b) => a.name.localeCompare(b.name));
        displayAuthors(authorsData);
        document.getElementById('heroCount').textContent = `${authorsData.length} authors documented`;
        setupSearch();
    } catch (error) {
        const grid = document.getElementById('authorsGrid');
        if (grid) grid.innerHTML = '<div class="no-results">Unable to load authors. Please refresh.</div>';
    }
}

function displayAuthors(authors) {
    const grid = document.getElementById('authorsGrid');
    if (!grid) return;
    grid.innerHTML = authors.length === 0
        ? '<div class="no-results">No authors found.</div>'
        : authors.map(authorCardHTML).join('');
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearchBtn');
    if (!input) return;

    input.addEventListener('input', event => {
        const term = event.target.value.toLowerCase().trim();
        if (clearButton) clearButton.hidden = !term;
        displayAuthors(term ? authorsData.filter(author => author.name.toLowerCase().includes(term)) : authorsData);
    });

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            input.value = '';
            displayAuthors(authorsData);
            clearButton.hidden = true;
            input.focus();
        });
    }
}

function externalLinksHTML(links) {
    const available = links ? EXTERNAL_LINK_TYPES.filter(type => links[type.key]) : [];
    if (available.length === 0) return '';
    return `<div class="external-links">
        <h3 class="eyebrow">Learn more</h3>
        ${available.map(type => `<a href="${escapeHtml(links[type.key])}" target="_blank" rel="noopener noreferrer" class="pill"><i class="${type.icon}" aria-hidden="true"></i>${type.label}</a>`).join('')}
    </div>`;
}

function featuredBookHTML(book) {
    if (!book) return '';
    const meta = [escapeHtml(book.genre), book.year].filter(Boolean).join(' · ');
    return `<a href="${bookUrl(book)}" class="featured-book">
        <div class="featured-cover">${imageTag(book.coverUrl, book.title, 'book')}</div>
        <div class="featured-body">
            <div class="eyebrow">Featured work</div>
            <h3 class="featured-title">${escapeHtml(book.title)}</h3>
            <p class="featured-meta">${meta}</p>
            <p class="featured-desc">${escapeHtml(book.description)}</p>
            <span class="text-link">Explore this book<i class="fas fa-arrow-right arrow" aria-hidden="true"></i></span>
        </div>
    </a>`;
}

async function loadAuthorDetail() {
    const slug = getUrlParameter('slug');
    if (!slug) { showError('authorContent', 'No author specified'); return; }
    try {
        const data = await fetchData();
        const author = data.authors.find(a => a.slug === slug);
        if (!author) { showError('authorContent', 'Author not found'); return; }
        displayAuthorDetail(author, data.authors);
    } catch (error) {
        showError('authorContent', 'Unable to load. Please try again.');
    }
}

function displayAuthorDetail(author, allAuthors) {
    const books = author.books || [];

    updatePageMetadata(
        author.name,
        `${author.name} — Ethiopian author. ${author.bio.substring(0, 160)}`,
        `${SITE_URL}/author.html?slug=${author.slug}`,
        author.imageUrl || PLACEHOLDER_IMAGE,
        'profile'
    );
    addAuthorStructuredData(author, books);

    const container = document.getElementById('authorContent');
    if (!container) return;

    const sortedBooks = [...books].sort((a, b) => a.title.localeCompare(b.title));
    const featuredBook = books.find(b => b.id === author.featuredBook);
    const relatedAuthors = allAuthors
        .filter(a => a.id !== author.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, RELATED_AUTHORS_COUNT);
    const bookCountText = books.length === 1 ? '1 book' : `${books.length} books`;

    container.innerHTML = `<div class="author-detail">
        ${breadcrumbHTML([{ label: 'Home', href: 'index.html' }, { label: author.name }])}

        <section class="author-hero">
            <div class="author-hero-media">${imageTag(author.imageUrl, author.name, 'user')}</div>
            <div class="author-hero-title">
                <h1 class="author-hero-name">${escapeHtml(author.name)}</h1>
                <div class="author-hero-chips">
                    <span class="author-chip">${formatYears(author, 'Born')}</span>
                    <span class="author-chip">${bookCountText}</span>
                </div>
            </div>
        </section>

        <section class="author-about${featuredBook ? ' has-featured' : ''}">
            <div class="author-about-text">
                <p class="author-bio">${escapeHtml(author.bio)}</p>
                ${externalLinksHTML(author.externalLinks)}
            </div>
            ${featuredBookHTML(featuredBook)}
        </section>

        <section class="section">
            <h2 class="eyebrow section-title">Books by ${escapeHtml(author.name)}</h2>
            <div class="books-grid">${sortedBooks.map(bookCardHTML).join('')}</div>
        </section>

        ${relatedAuthors.length > 0 ? `
        <section class="section">
            <h2 class="eyebrow section-title">More authors</h2>
            <div class="authors-grid">${relatedAuthors.map(authorCardHTML).join('')}</div>
        </section>` : ''}
    </div>`;
}

async function loadBookDetail() {
    const slug = getUrlParameter('slug');
    if (!slug) { showError('bookContent', 'No book specified'); return; }
    try {
        const data = await fetchData();
        let foundAuthor = null;
        let foundBook = null;
        for (const author of data.authors) {
            const book = author.books.find(b => b.slug === slug);
            if (book) {
                foundAuthor = author;
                foundBook = book;
                break;
            }
        }
        if (!foundBook) { showError('bookContent', 'Book not found'); return; }
        displayBookDetail(foundBook, foundAuthor);
    } catch (error) {
        showError('bookContent', 'Unable to load. Please try again.');
    }
}

function displayBookDetail(book, author) {
    updatePageMetadata(
        book.title,
        `${book.title} by ${author.name}. ${book.description.substring(0, 160)}`,
        `${SITE_URL}/book.html?slug=${book.slug}`,
        book.coverUrl || PLACEHOLDER_IMAGE,
        'book'
    );
    addBookStructuredData(book, author);

    const backLink = document.getElementById('backLink');
    if (backLink) backLink.href = authorUrl(author);

    const container = document.getElementById('bookContent');
    if (!container) return;

    const otherBooks = author.books
        .filter(b => b.id !== book.id)
        .sort((a, b) => a.title.localeCompare(b.title));
    const seriesBooks = book.series
        ? author.books.filter(b => b.series === book.series && b.id !== book.id)
        : [];
    const stats = [
        { label: 'Published', value: book.year },
        { label: 'Pages', value: book.pages },
        { label: 'Publisher', value: escapeHtml(book.publisher) }
    ];
    const bioSnippet = escapeHtml(author.bio.substring(0, BIO_SNIPPET_LENGTH)) + (author.bio.length > BIO_SNIPPET_LENGTH ? '…' : '');

    container.innerHTML = `<div class="book-detail">
        ${breadcrumbHTML([
            { label: 'Home', href: 'index.html' },
            { label: author.name, href: authorUrl(author) },
            { label: book.title }
        ])}

        <section class="book-hero">
            <div class="book-hero-cover">${imageTag(book.coverUrl, book.title, 'book')}</div>
            <div class="book-hero-info">
                ${book.genre ? `<div class="eyebrow">${escapeHtml(book.genre)}</div>` : ''}
                <h1 class="book-title-large">${escapeHtml(book.title)}</h1>
                <a href="${authorUrl(author)}" class="text-link book-author-link">
                    <i class="fas fa-user" aria-hidden="true"></i>${escapeHtml(author.name)}
                </a>
                ${book.series ? `<div class="book-series-large"><i class="fas fa-layer-group" aria-hidden="true"></i>${escapeHtml(book.series)}</div>` : ''}
                <div class="book-hero-stats">
                    ${stats.map(stat => `<div class="book-stat"><span class="book-stat-label">${stat.label}</span><span class="book-stat-value">${stat.value}</span></div>`).join('')}
                </div>
            </div>
        </section>

        <section class="book-body">
            <div class="book-main">
                <h2 class="eyebrow">About this book</h2>
                <p class="book-description">${escapeHtml(book.description)}</p>
                ${seriesBooks.length > 0 ? `<a href="#other-books" class="text-link series-link">${seriesBooks.length} more in this series<i class="fas fa-arrow-right arrow" aria-hidden="true"></i></a>` : ''}
            </div>
            <aside class="book-aside">
                <h2 class="eyebrow">About the author</h2>
                <p class="author-bio-snippet">${bioSnippet}</p>
                <a href="${authorUrl(author)}" class="text-link">Full profile<i class="fas fa-arrow-right arrow" aria-hidden="true"></i></a>
            </aside>
        </section>

        ${otherBooks.length > 0 ? `
        <section class="section other-books-section" id="other-books">
            <h2 class="eyebrow section-title">More by ${escapeHtml(author.name)}</h2>
            <div class="books-grid">${otherBooks.map(bookCardHTML).join('')}</div>
        </section>` : ''}
    </div>`;

    const seriesLink = container.querySelector('.series-link');
    const otherBooksSection = container.querySelector('.other-books-section');
    if (seriesLink && otherBooksSection) {
        seriesLink.addEventListener('click', event => {
            event.preventDefault();
            otherBooksSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function updatePageMetadata(title, description, url, image, type) {
    const fullTitle = `${SITE_TITLE} | ${title}`;
    const setAttribute = (selector, attribute, value) => {
        const element = document.querySelector(selector);
        if (element) element.setAttribute(attribute, value);
    };
    document.title = fullTitle;
    setAttribute('meta[name="description"]', 'content', description);
    setAttribute('meta[property="og:title"]', 'content', fullTitle);
    setAttribute('meta[property="og:description"]', 'content', description);
    if (url) setAttribute('meta[property="og:url"]', 'content', url);
    if (type) setAttribute('meta[property="og:type"]', 'content', type);
    if (url) setAttribute('link[rel="canonical"]', 'href', url);
}

function appendStructuredData(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data, null, 2);
    document.head.appendChild(script);
}

function addAuthorStructuredData(author, books) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: author.name,
        birthDate: author.birthYear?.toString(),
        deathDate: author.deathYear?.toString(),
        description: author.bio,
        works: books.map(book => ({
            '@type': 'Book',
            name: book.title,
            datePublished: book.year.toString(),
            numberOfPages: book.pages,
            genre: book.genre
        }))
    };
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    appendStructuredData(data);
}

function addBookStructuredData(book, author) {
    appendStructuredData({
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: book.title,
        author: { '@type': 'Person', name: author.name },
        datePublished: book.year.toString(),
        numberOfPages: book.pages,
        genre: book.genre,
        publisher: { '@type': 'Organization', name: book.publisher },
        description: book.description
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupImageFallbacks();
    setupBackLink();
    if (document.getElementById('authorsGrid')) loadAuthors();
    if (document.getElementById('authorContent')) loadAuthorDetail();
    if (document.getElementById('bookContent')) loadBookDetail();
});