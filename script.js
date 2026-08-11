let authorsData = [];

async function loadAuthors() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Failed to load');
        const data = await response.json();
        authorsData = data.authors;
        authorsData.sort((a, b) => a.name.localeCompare(b.name));
        displayAuthors(authorsData);
        setupSearch();
    } catch (error) {
        const grid = document.getElementById('authorsGrid');
        if (grid) grid.innerHTML = '<div class="no-results">Unable to load authors. Please refresh.</div>';
    }
}

function displayAuthors(authors) {
    const grid = document.getElementById('authorsGrid');
    if (!grid) return;
    if (authors.length === 0) {
        grid.innerHTML = '<div class="no-results">No authors found.</div>';
        return;
    }
    grid.innerHTML = authors.map(author => {
        const yearsText = author.deathYear ? `${author.birthYear}–${author.deathYear}` : `b. ${author.birthYear}`;
        const imageUrl = author.imageUrl || 'images/placeholder.png';
        return `<a href="author.html?slug=${encodeURIComponent(author.slug)}" class="author-card">
            <div class="author-image">
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(author.name)}"
                     onerror="this.parentElement.innerHTML='<div class=\\'placeholder-img\\'><i class=\\'fas fa-user\\'></i></div>'">
            </div>
            <div class="author-info">
                <div class="author-name">${escapeHtml(author.name)}</div>
                <div class="author-years">${yearsText}</div>
            </div>
        </a>`;
    }).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('clearSearchBtn');
    if (!input) return;
    input.addEventListener('input', e => {
        const term = e.target.value.toLowerCase().trim();
        if (btn) btn.style.display = term ? 'flex' : 'none';
        displayAuthors(term ? authorsData.filter(a => a.name.toLowerCase().includes(term)) : authorsData);
    });
    if (btn) btn.addEventListener('click', () => {
        input.value = ''; displayAuthors(authorsData);
        btn.style.display = 'none'; input.focus();
    });
}

document.addEventListener('DOMContentLoaded', loadAuthors);

function getUrlParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}

/* ── AUTHOR DETAIL ── */

async function loadAuthorDetail() {
    const slug = getUrlParameter('slug');
    if (!slug) { showError('No author specified'); return; }
    try {
        const data = await fetch('data.json').then(r => r.json());
        const author = data.authors.find(a => a.slug === slug);
        if (!author) { showError('Author not found'); return; }
        displayAuthorDetail(author, data.authors);
    } catch (e) { showError('Unable to load. Please try again.'); }
}

function displayAuthorDetail(author, allAuthors) {
    updatePageMetadata(author.name, `${author.name} — Ethiopian author. ${author.bio.substring(0,160)}`,
        `https://ethiopianliteraryarchive.com/author.html?slug=${author.slug}`, author.imageUrl || 'images/placeholder.png', 'profile');
    addAuthorStructuredData(author, author.books);

    const container = document.getElementById('authorContent');
    if (!container) return;

    const yearsText = author.deathYear ? `${author.birthYear}–${author.deathYear}` : `Born ${author.birthYear}`;
    const bookCount = author.books ? author.books.length : 0;
    const bookCountText = bookCount === 1 ? '1 book' : `${bookCount} books`;
    const sortedBooks = [...author.books].sort((a, b) => a.title.localeCompare(b.title));
    const featuredBook = author.books.find(b => b.id === author.featuredBook);
    const relatedAuthors = allAuthors.filter(a => a.id !== author.id).sort(() => 0.5 - Math.random()).slice(0, 4);

    const externalLinksHTML = author.externalLinks && Object.keys(author.externalLinks).length > 0 ? `
        <div class="external-links">
            <h3>Learn More</h3>
            <div class="links-container">
                ${author.externalLinks.wikipedia ? `<a href="${author.externalLinks.wikipedia}" target="_blank" rel="noopener noreferrer" class="external-link"><i class="fab fa-wikipedia-w"></i> Wikipedia</a>` : ''}
                ${author.externalLinks.goodreads ? `<a href="${author.externalLinks.goodreads}" target="_blank" rel="noopener noreferrer" class="external-link"><i class="fab fa-goodreads-g"></i> Goodreads</a>` : ''}
                ${author.externalLinks.personal ? `<a href="${author.externalLinks.personal}" target="_blank" rel="noopener noreferrer" class="external-link"><i class="fas fa-globe"></i> Website</a>` : ''}
            </div>
        </div>` : '';

    const featuredBookHTML = featuredBook ? `
        <div class="featured-book">
            <div class="featured-label"><i class="fas fa-star"></i> Featured Work</div>
            <h4>${escapeHtml(featuredBook.title)}</h4>
            <p>${escapeHtml(featuredBook.genre)} · ${featuredBook.year}</p>
            <a href="book.html?slug=${encodeURIComponent(featuredBook.slug)}" class="featured-book-link">
                Explore this book <i class="fas fa-arrow-right"></i>
            </a>
        </div>` : '';

    container.innerHTML = `<div class="author-detail">

        <div class="author-hero">
            <img src="${author.imageUrl || 'images/placeholder.png'}" alt="${escapeHtml(author.name)}"
                 onerror="this.parentElement.innerHTML='<div class=\\'author-hero-placeholder\\'><i class=\\'fas fa-user\\'></i></div>'">
            <div class="author-hero-overlay"></div>
            <div class="author-hero-title">
                <h1 class="author-hero-name">${escapeHtml(author.name)}</h1>
                <div class="author-hero-chips">
                    <span class="author-chip">${yearsText}</span>
                    <span class="author-chip">${bookCountText}</span>
                </div>
            </div>
        </div>

        <div class="author-body">
            <aside class="author-sidebar">
                <div class="breadcrumb" style="margin-bottom:2rem">
                    <a href="index.html">Home</a>
                    <span class="separator">/</span>
                    <span class="current">${escapeHtml(author.name)}</span>
                </div>
                <div class="sidebar-label">Years</div>
                <div class="sidebar-value">${yearsText}</div>
                <div class="sidebar-label">Books</div>
                <div class="sidebar-value">${bookCountText}</div>
                ${externalLinksHTML}
            </aside>
            <main class="author-main">
                <p class="author-bio">${escapeHtml(author.bio)}</p>
                ${featuredBookHTML}
            </main>
        </div>

        <div class="books-section">
            <div class="section-header"><h2>Books by ${escapeHtml(author.name)}</h2></div>
            <div class="books-grid">
                ${sortedBooks.map(book => `
                    <a href="book.html?slug=${encodeURIComponent(book.slug)}" class="book-card">
                        <div class="book-image">
                            <img src="${book.coverUrl || 'images/placeholder.png'}" alt="${escapeHtml(book.title)}"
                                 onerror="this.parentElement.innerHTML='<div class=\\'book-placeholder\\'><i class=\\'fas fa-book\\'></i></div>'">
                        </div>
                        <div class="book-info">
                            <div class="book-title">${escapeHtml(book.title)}</div>
                            <div class="book-year">${book.year}</div>
                            ${book.genre ? `<div class="book-genre">${escapeHtml(book.genre)}</div>` : ''}
                            ${book.series ? `<div class="book-series">${escapeHtml(book.series)}</div>` : ''}
                        </div>
                    </a>`).join('')}
            </div>
        </div>

        ${relatedAuthors.length > 0 ? `
        <div class="related-authors-section">
            <h2>More Authors</h2>
            <div class="related-authors-grid">
                ${relatedAuthors.map(r => {
                    const ry = r.deathYear ? `${r.birthYear}–${r.deathYear}` : `b. ${r.birthYear}`;
                    return `<a href="author.html?slug=${encodeURIComponent(r.slug)}" class="related-author-card">
                        <div class="related-author-image">
                            <img src="${r.imageUrl || 'images/placeholder.png'}" alt="${escapeHtml(r.name)}"
                                 onerror="this.parentElement.innerHTML='<div class=\\'related-author-placeholder\\'><i class=\\'fas fa-user\\'></i></div>'">
                        </div>
                        <div class="related-author-info">
                            <div class="related-author-name">${escapeHtml(r.name)}</div>
                            <div class="related-author-years">${ry}</div>
                        </div>
                    </a>`;
                }).join('')}
            </div>
        </div>` : ''}

    </div>`;
}

function showError(message) {
    const c = document.getElementById('authorContent');
    if (c) c.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>${escapeHtml(message)}</p><a href="index.html">← Return home</a></div>`;
}

if (window.location.pathname.includes('author.html')) document.addEventListener('DOMContentLoaded', loadAuthorDetail);

/* ── BOOK DETAIL ── */

async function loadBookDetail() {
    const slug = getUrlParameter('slug');
    if (!slug) { showBookError('No book specified'); return; }
    try {
        const data = await fetch('data.json').then(r => r.json());
        let foundAuthor = null, foundBook = null;
        for (const author of data.authors) {
            const book = author.books.find(b => b.slug === slug);
            if (book) { foundAuthor = author; foundBook = book; break; }
        }
        if (!foundBook) { showBookError('Book not found'); return; }
        displayBookDetail(foundBook, foundAuthor, data.authors);
    } catch (e) { showBookError('Unable to load. Please try again.'); }
}

function displayBookDetail(book, author, allAuthors) {
    updatePageMetadata(book.title, `${book.title} by ${author.name}. ${book.description.substring(0,160)}`,
        `https://ethiopianliteraryarchive.com/book.html?slug=${book.slug}`, book.coverUrl || 'images/placeholder.png', 'book');
    addBookStructuredData(book, author);

    const container = document.getElementById('bookContent');
    if (!container) return;

    const otherBooks = author.books.filter(b => b.id !== book.id).sort((a, b) => a.title.localeCompare(b.title));
    const seriesBooks = book.series ? author.books.filter(b => b.series === book.series && b.id !== book.id) : [];

    container.innerHTML = `<div class="book-detail">

        <div class="book-hero">
            <div class="book-hero-cover">
                <img src="${book.coverUrl || 'images/placeholder.png'}" alt="${escapeHtml(book.title)}"
                     onerror="this.parentElement.innerHTML='<div class=\\'cover-placeholder\\'><i class=\\'fas fa-book\\'></i></div>'">
            </div>
            <div class="book-hero-info">
                <div class="book-hero-genre">${escapeHtml(book.genre)}</div>
                <h1 class="book-title-large">${escapeHtml(book.title)}</h1>
                <a href="author.html?slug=${encodeURIComponent(author.slug)}" class="book-author-link">
                    <i class="fas fa-user"></i> ${escapeHtml(author.name)}
                </a>
                ${book.series ? `<div class="book-series-large"><i class="fas fa-layer-group"></i> ${escapeHtml(book.series)}</div>` : ''}
                <div class="book-hero-stats">
                    <div class="book-stat"><span class="book-stat-label">Published</span><span class="book-stat-value">${book.year}</span></div>
                    <div class="book-stat"><span class="book-stat-label">Pages</span><span class="book-stat-value">${book.pages}</span></div>
                    <div class="book-stat"><span class="book-stat-label">Publisher</span><span class="book-stat-value">${escapeHtml(book.publisher)}</span></div>
                    <div class="book-stat"><span class="book-stat-label">Genre</span><span class="book-stat-value">${escapeHtml(book.genre)}</span></div>
                </div>
            </div>
        </div>

        <div class="book-body">
            <div class="book-main">
                <div class="breadcrumb" style="margin-bottom:1.5rem">
                    <a href="index.html">Home</a>
                    <span class="separator">/</span>
                    <a href="author.html?slug=${encodeURIComponent(author.slug)}">${escapeHtml(author.name)}</a>
                    <span class="separator">/</span>
                    <span class="current">${escapeHtml(book.title)}</span>
                </div>
                <div class="book-description-label">About this book</div>
                <div class="book-description">${escapeHtml(book.description)}</div>
                ${seriesBooks.length > 0 ? `
                    <div class="series-info" style="margin-top:2rem">
                        <p>Part of the <strong>${escapeHtml(book.series)}</strong> series</p>
                        <a href="#other-books" class="series-books-link"
                           onclick="document.querySelector('.other-books-section').scrollIntoView({behavior:'smooth'});return false;">
                            ${seriesBooks.length} more in series <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>` : ''}
            </div>
            <aside class="book-aside">
                <div class="author-bio-snippet">
                    <h3>About ${escapeHtml(author.name)}</h3>
                    <p>${escapeHtml(author.bio.substring(0, 260))}${author.bio.length > 260 ? '…' : ''}</p>
                    <a href="author.html?slug=${encodeURIComponent(author.slug)}" class="read-more-link">
                        Full profile <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </aside>
        </div>

        ${otherBooks.length > 0 ? `
        <div class="other-books-section" id="other-books">
            <h2>More by ${escapeHtml(author.name)}</h2>
            <div class="other-books-grid">
                ${otherBooks.map(b => `
                    <a href="book.html?slug=${encodeURIComponent(b.slug)}" class="book-card">
                        <div class="book-image">
                            <img src="${b.coverUrl || 'images/placeholder.png'}" alt="${escapeHtml(b.title)}"
                                 onerror="this.parentElement.innerHTML='<div class=\\'book-placeholder\\'><i class=\\'fas fa-book\\'></i></div>'">
                        </div>
                        <div class="book-info">
                            <div class="book-title">${escapeHtml(b.title)}</div>
                            <div class="book-year">${b.year}</div>
                            ${b.genre ? `<div class="book-genre">${escapeHtml(b.genre)}</div>` : ''}
                            ${b.series ? `<div class="book-series">${escapeHtml(b.series)}</div>` : ''}
                        </div>
                    </a>`).join('')}
            </div>
        </div>` : ''}

    </div>`;
}

function showBookError(message) {
    const c = document.getElementById('bookContent');
    if (c) c.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>${escapeHtml(message)}</p><a href="index.html">← Return home</a></div>`;
}

if (window.location.pathname.includes('book.html')) document.addEventListener('DOMContentLoaded', loadBookDetail);

/* ── SEO ── */
function updatePageMetadata(title, desc, url, img, type) {
    document.title = `Ethiopian Literary Archive | ${title}`;
    const s = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    s('meta[name="description"]','content',desc);
    s('meta[property="og:title"]','content',`Ethiopian Literary Archive | ${title}`);
    s('meta[property="og:description"]','content',desc);
    if (url) s('meta[property="og:url"]','content',url);
    if (type) s('meta[property="og:type"]','content',type);
    if (url) s('link[rel="canonical"]','href',url);
}
function addAuthorStructuredData(author, books) {
    const s = document.createElement('script'); s.type = 'application/ld+json';
    const d = {"@context":"https://schema.org","@type":"Person","name":author.name,
        "birthDate":author.birthYear?.toString(),"deathDate":author.deathYear?.toString(),
        "description":author.bio,"works":books.map(b=>({
            "@type":"Book","name":b.title,"datePublished":b.year.toString(),"numberOfPages":b.pages,"genre":b.genre}))};
    Object.keys(d).forEach(k=>d[k]===undefined&&delete d[k]);
    s.textContent = JSON.stringify(d,null,2); document.head.appendChild(s);
}
function addBookStructuredData(book, author) {
    const s = document.createElement('script'); s.type = 'application/ld+json';
    s.textContent = JSON.stringify({"@context":"https://schema.org","@type":"Book","name":book.title,
        "author":{"@type":"Person","name":author.name},"datePublished":book.year.toString(),
        "numberOfPages":book.pages,"genre":book.genre,"publisher":{"@type":"Organization","name":book.publisher},
        "description":book.description},null,2);
    document.head.appendChild(s);
}
