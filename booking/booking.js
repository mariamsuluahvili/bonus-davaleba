// Configuration
let movieData = null;
let bookingConfig = null;
let selectedSeats = [];
let selectedDate = null;
let selectedTime = null;
let ticketPrice = 15;
const MAX_SEATS = 6; // Maximum seats per booking

// Load all data on page load
window.addEventListener('DOMContentLoaded', () => {
    loadMovieData();
    loadBookingConfig();
});

// Load movie from session storage
function loadMovieData() {
    const data = sessionStorage.getItem('selectedMovie');
    if (data) {
        movieData = JSON.parse(data);
        displayMovieData();
    } else {
        // Default movie if no data
        movieData = {
            title: 'Spirited Away',
            image: 'img/spirited-away.jpg'
        };
        displayMovieData();
    }
}

// Load booking configuration from JSONუ
function loadBookingConfig() {
    fetch('booking-config.json')
        .then(res => res.json())
        .then(data => {
            bookingConfig = data;
            ticketPrice = data.theater.ticketPrice;
            renderDates();
            renderTimes();
            renderSeats();
        })
        .catch(err => console.error('Booking config load error:', err));
}

// Display movie data
function displayMovieData() {
    const poster = document.getElementById('posterSide');
    if (!poster) return; // თუ ელემენტი DOM-ში ვერ იპოვება, აღარ ვაგრძელებთ

    // ტექსტი
    document.getElementById('movieTitle').textContent = movieData.title;

    // სურათის correct path, relative booking.html-დან
    let imagePath = movieData.image;

    // თუ სურათები index.html-ის გვერდზეა, და booking.html booking/ ფოლდერშია
    if (!imagePath.startsWith('../')) {
        imagePath = '../' + imagePath;
    }

    // background
    poster.style.backgroundImage = `url('${imagePath}')`;
    poster.style.backgroundSize = 'cover';
    poster.style.backgroundPosition = 'center';
    poster.style.backgroundRepeat = 'no-repeat';
}

// Render dates from JSON
function renderDates() {
    const dateSelector = document.getElementById('dateSelector');
    dateSelector.innerHTML = '';
    
    bookingConfig.schedule.dates.forEach((dateObj, index) => {
        const pill = document.createElement('div');
        pill.className = 'date-pill';
        pill.textContent = dateObj.day;
        pill.dataset.date = dateObj.date;
        
        if (index === 0) {
            pill.classList.add('active');
            selectedDate = dateObj.date;
        }
        
        pill.addEventListener('click', () => selectDate(pill));
        dateSelector.appendChild(pill);
    });
}

// Render times from JSON
function renderTimes() {
    const timeSelector = document.getElementById('timeSelector');
    timeSelector.innerHTML = '';
    
    bookingConfig.schedule.times.forEach((time, index) => {
        const pill = document.createElement('div');
        pill.className = 'time-pill';
        pill.textContent = time;
        pill.dataset.time = time;
        
        if (index === 0) {
            pill.classList.add('active');
            selectedTime = time;
        }
        
        pill.addEventListener('click', () => selectTime(pill));
        timeSelector.appendChild(pill);
    });
}

// Render seats from JSON configuration
function renderSeats() {
    const seatsGrid = document.getElementById('seatsGrid');
    seatsGrid.innerHTML = '';
    
    const rows = bookingConfig.theater.rows;
    const seatsPerRow = bookingConfig.theater.seatsPerRow;
    
    rows.forEach(row => {
        for (let i = 1; i <= seatsPerRow; i++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            seat.dataset.row = row;
            seat.dataset.number = i;
            seat.dataset.id = `${row}${i}`;
            
            // Check if seat is booked for selected date/time
            if (isSeatBooked(seat.dataset.id)) {
                seat.classList.add('booked');
            } else {
                seat.addEventListener('click', () => toggleSeat(seat));
            }
            
            seatsGrid.appendChild(seat);
        }
    });
}

// Check if seat is booked for current date/time
function isSeatBooked(seatId) {
    if (!bookingConfig.bookedSeats[selectedDate]) return false;
    if (!bookingConfig.bookedSeats[selectedDate][selectedTime]) return false;
    
    return bookingConfig.bookedSeats[selectedDate][selectedTime].includes(seatId);
}

// Select date
function selectDate(pill) {
    document.querySelectorAll('.date-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    selectedDate = pill.dataset.date;
    
    // Reset and re-render seats for new date
    resetSeats();
    renderSeats();
}

// Select time
function selectTime(pill) {
    document.querySelectorAll('.time-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    selectedTime = pill.dataset.time;
    
    // Reset and re-render seats for new time
    resetSeats();
    renderSeats();
}

// Toggle seat selection
function toggleSeat(seat) {
    if (seat.classList.contains('booked')) return;
    
    const seatId = seat.dataset.id;
    
    if (seat.classList.contains('selected')) {
        // Deselect seat
        seat.classList.remove('selected');
        selectedSeats = selectedSeats.filter(id => id !== seatId);
    } else {
        // Check if max seats reached
        if (selectedSeats.length >= MAX_SEATS) {
            alert(`⚠️ Maximum ${MAX_SEATS} seats allowed per booking!`);
            return;
        }
        
        // Select seat
        seat.classList.add('selected');
        selectedSeats.push(seatId);
    }
    
    updateBookingInfo();
    updateSelectedPanel();
}

// Reset all seat selections
function resetSeats() {
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
    selectedSeats = [];
    updateBookingInfo();
    updateSelectedPanel();
}

// Update selected seats panel
function updateSelectedPanel() {
    const panel = document.getElementById('selectedPanel');
    const list = document.getElementById('selectedList');
    const purchaseTotal = document.getElementById('purchaseTotal');
    const seatsCounter = document.getElementById('seatsCounter');
    
    // Update counter
    seatsCounter.textContent = `(${selectedSeats.length}/${MAX_SEATS})`;
    
    if (selectedSeats.length > 0) {
        panel.classList.add('show');
        
        // Update list
        list.innerHTML = selectedSeats.map(seatId => `
            <div class="seat-item">
                <div class="seat-item-left">
                    <div class="seat-indicator"></div>
                    <span>A row / ${seatId} seat</span>
                </div>
                <div class="seat-item-right">
                    <span>$${ticketPrice}</span>
                    <span class="remove-seat" onclick="removeSeat('${seatId}')">×</span>
                </div>
            </div>
        `).join('');
        
        // Update total
        const total = selectedSeats.length * ticketPrice;
        purchaseTotal.textContent = `${total}₾`;
        
        // Start timer
        startTimer();
    } else {
        panel.classList.remove('show');
    }
}

// Remove individual seat
function removeSeat(seatId) {
    const seat = document.querySelector(`[data-id="${seatId}"]`);
    if (seat) {
        seat.classList.remove('selected');
        selectedSeats = selectedSeats.filter(id => id !== seatId);
        updateBookingInfo();
        updateSelectedPanel();
    }
}

// Update booking information (bottom section)
function updateBookingInfo() {
    const totalPrice = selectedSeats.length * ticketPrice;
    document.getElementById('totalPrice').textContent = `${totalPrice}₾`;
    
    const bookBtn = document.getElementById('bookBtn');
    if (selectedSeats.length > 0) {
        bookBtn.disabled = false;
    } else {
        bookBtn.disabled = true;
    }
}

// Timer countdown
let timerInterval;
function startTimer() {
    clearInterval(timerInterval);
    let timeLeft = 615; // 10:15 in seconds
    
    const timerElement = document.getElementById('timer');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Time expired! Please select seats again.');
            resetSeats();
            renderSeats();
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `Time left to purchase: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Book tickets (from purchase button in panel)
document.getElementById('purchaseBtn').addEventListener('click', () => {
    if (selectedSeats.length === 0) return;

    
    // Redirect back to home
    setTimeout(() => {
        window.location.href = '../confirm/confirm.html';
    }, 1500000000000000000000000);
});



// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
