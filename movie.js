let sliderMovies = [];
let continueMovies = [];
let currentIndex = 0;

const sliderTrack = document.getElementById('sliderTrack');
const continueGrid = document.getElementById('continueGrid');
const backgroundOverlay = document.getElementById('backgroundOverlay');
const themeToggle = document.getElementById('themeToggle');

// Load movies data from JSON
fetch('movies.json')
    .then(res => res.json())
    .then(data => {
        sliderMovies = data.sliderMovies;
        continueMovies = data.continueMovies;
        renderAll();
    })
    .catch(err => console.error('JSON load error:', err));

// Create movie slide element
function createMovieSlide(movie, index) {
    const slide = document.createElement('div');
    slide.className = 'movie-slide';
    slide.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}" class="movie-poster-img">
        <div class="movie-overlay">
            <h2 class="movie-title">${movie.title}</h2>
            <div class="movie-info">
                <div class="movie-rating">⭐ ${movie.rating}</div>
                <span>${movie.year || ''}</span>
                <span>${movie.genre || ''}</span>
            </div>
            <button class="book-btn" onclick="bookMovie('${movie.title}')">Book Now</button>
        </div>
    `;
    slide.dataset.index = index;

    slide.addEventListener('click', () => {
        currentIndex = index;
        updateSlider();
    });

    return slide;
}

// Update background with active movie
function updateBackground(movie) {
    backgroundOverlay.style.backgroundImage = `url('${movie.image}')`;
}

// Create movie card for grid
function createMovieCard(movie) {
    const languageBadges = movie.languages
        ? movie.languages.map(lang => `<span class="badge">${lang}</span>`).join('')
        : '';

    return `
        <div class="movie-card">
            <div class="movie-card-poster" style="background-image: url('${movie.image}')">
                <span class="card-rating">⭐ ${movie.rating}</span>
            </div>
            <div class="movie-card-info">
                <h3 class="movie-card-title">${movie.title}</h3>
                <div class="movie-card-date">${movie.date || ''}</div>
                <div class="movie-card-badges">
                    ${movie.ageRating ? `<span class="badge">${movie.ageRating}</span>` : ''}
                    ${languageBadges}
                </div>
            </div>
        </div>
    `;
}

// Render all sections
function renderAll() {
    sliderTrack.innerHTML = '';
    sliderMovies.forEach((movie, index) => {
        sliderTrack.appendChild(createMovieSlide(movie, index));
    });

    continueGrid.innerHTML = continueMovies.map(createMovieCard).join('');

    updateSlider();

    setInterval(() => {
        currentIndex = (currentIndex + 1) % sliderMovies.length;
        updateSlider();
    }, 4000);
}

// Update slider active state
function updateSlider() {
    const slides = document.querySelectorAll('.movie-slide');
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'dimmed');
        if (index === currentIndex) {
            slide.classList.add('active');
        } else {
            slide.classList.add('dimmed');
        }
    });

    updateBackground(sliderMovies[currentIndex]);
}

// ✅ Book Now → booking.html (movie title გადადის)
function bookMovie(title) {
    window.location.href = `booking/booking.html?movie=${encodeURIComponent(title)}`;
}

// Theme toggle
themeToggle.addEventListener('click', () => {
    const theme = document.body.getAttribute('data-theme');
    document.body.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark');
});
