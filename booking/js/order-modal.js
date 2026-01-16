// Order Modal Handler
const orderModal = document.getElementById('orderModal');
const closeModal = document.getElementById('closeModal');
const orderForm = document.getElementById('orderForm');
const paymentMethod = document.getElementById('paymentMethod');
const cardDetails = document.getElementById('cardDetails');

// Show/Hide card details based on payment method
paymentMethod.addEventListener('change', () => {
    if (paymentMethod.value === 'cash') {
        cardDetails.style.display = 'none';
    } else {
        cardDetails.style.display = 'flex';
    }
});

// Close modal
closeModal.addEventListener('click', () => {
    orderModal.classList.remove('show');
});

// Close modal on outside click
orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.classList.remove('show');
    }
});

// Open modal from Purchase button in selected panel
document.getElementById('purchaseBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (selectedSeats.length === 0) return;
    
    openOrderModal();
});

// Open modal from Book Now button
document.getElementById('bookBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (selectedSeats.length === 0) return;
    
    openOrderModal();
});

function openOrderModal() {
    // Update total in modal dynamically
    const total = selectedSeats.length * ticketPrice;
    document.getElementById('modalTotal').textContent = total;
    
    // Update button text
    document.getElementById('purchaseModalBtn').innerHTML = `Purchase (${total}₾)`;
    
    // Show modal
    orderModal.classList.add('show');
    
    // Reset form
    orderForm.reset();
    clearErrors();
    
    // Set default payment method
    paymentMethod.value = 'visa';
    cardDetails.style.display = 'flex';
}

// Promo code handler
document.getElementById('applyPromo').addEventListener('click', () => {
    const promoCode = document.getElementById('promo').value.trim();
    
    if (promoCode === '') {
        alert('Please enter a promo code');
        return;
    }
    
    // Simulate promo validation
    if (promoCode.toUpperCase() === 'NIZAMI10') {
        const currentTotal = selectedSeats.length * ticketPrice;
        const discount = currentTotal * 0.1;
        const newTotal = currentTotal - discount;
        
        document.getElementById('modalTotal').textContent = Math.round(newTotal);
        alert(`✅ Promo applied! 10% discount: -${Math.round(discount)}₾`);
    } else {
        alert('❌ Invalid promo code');
    }
});

// Card number formatting
document.getElementById('cardNumber').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formattedValue;
});

// Exp date formatting
document.getElementById('expDate').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
});

// CVV only numbers
document.getElementById('cvv').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Phone only numbers
document.getElementById('phoneNumber').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Form submission
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (validateForm()) {
        processPayment();
    }
});

// Direct button click handler (backup)
document.getElementById('purchaseModalBtn').addEventListener('click', (e) => {
    // Button is inside form, so form submit event will handle it
    // This is just a backup to ensure it works
    if (e.target.type !== 'submit') {
        e.preventDefault();
        if (validateForm()) {
            processPayment();
        }
    }
});

// Validation
function validateForm() {
    clearErrors();
    let isValid = true;
    
    // Name validation
    const fullName = document.getElementById('fullName').value.trim();
    if (fullName === '') {
        showError('nameError', 'Name is required');
        isValid = false;
    } else if (fullName.length < 3) {
        showError('nameError', 'Name must be at least 3 characters');
        isValid = false;
    }
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === '') {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!emailRegex.test(email)) {
        showError('emailError', 'Invalid email format');
        isValid = false;
    }
    
    // Phone validation
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    if (phoneNumber === '') {
        showError('phoneError', 'Phone number is required');
        isValid = false;
    } else if (phoneNumber.length !== 7) {
        showError('phoneError', 'Phone must be 7 digits');
        isValid = false;
    }
    
    // Card validation (if not cash)
    if (paymentMethod.value !== 'cash') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expDate = document.getElementById('expDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value.trim();
        
        // Card number validation (16 digits)
        if (cardNumber === '') {
            showError('cardError', 'Card number is required');
            isValid = false;
        } else if (cardNumber.length !== 16) {
            showError('cardError', 'Card number must be 16 digits');
            isValid = false;
        } else if (!/^\d{16}$/.test(cardNumber)) {
            showError('cardError', 'Card number must contain only digits');
            isValid = false;
        }
        
        // Exp date validation (MM/YY)
        if (expDate === '') {
            showError('cardDetailsError', 'Expiry date is required');
            isValid = false;
        } else if (!/^\d{2}\/\d{2}$/.test(expDate)) {
            showError('cardDetailsError', 'Invalid format (MM/YY)');
            isValid = false;
        } else {
            const [month, year] = expDate.split('/').map(Number);
            if (month < 1 || month > 12) {
                showError('cardDetailsError', 'Invalid month');
                isValid = false;
            }
        }
        
        // CVV validation (3 digits)
        if (cvv === '') {
            showError('cardDetailsError', 'CVV is required');
            isValid = false;
        } else if (cvv.length !== 3) {
            showError('cardDetailsError', 'CVV must be 3 digits');
            isValid = false;
        } else if (!/^\d{3}$/.test(cvv)) {
            showError('cardDetailsError', 'CVV must contain only digits');
            isValid = false;
        }
        
        // Card name validation
        if (cardName === '') {
            showError('cardNameError', 'Name on card is required');
            isValid = false;
        } else if (cardName.length < 3) {
            showError('cardNameError', 'Name must be at least 3 characters');
            isValid = false;
        }
    }
    
    return isValid;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
    errorElement.parentElement.classList.add('error');
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
    document.querySelectorAll('.form-group').forEach(el => {
        el.classList.remove('error');
    });
}

// Process payment and create booking
function processPayment() {
    // Generate unique booking ID
    const bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // Get form data
    const formData = {
        bookingId: bookingId,
        movie: movieData.title,
        date: selectedDate,
        time: selectedTime,
        seats: selectedSeats,
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('countryCode').value + 
               document.getElementById('operator').value + 
               document.getElementById('phoneNumber').value,
        paymentMethod: paymentMethod.value,
        totalPrice: selectedSeats.length * ticketPrice,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    saveBookingToLocalStorage(formData);
    
    // Mark seats as taken
    markSeatsAsTaken(selectedDate, selectedTime, selectedSeats);
    
    // Close order modal
    orderModal.classList.remove('show');
    
    // Clear timer
    clearInterval(timerInterval);
    
    // Show success modal
    showSuccessModal(formData);
}

// Show success modal
function showSuccessModal(bookingData) {
    const successModal = document.getElementById('successModal');
    const closeSuccess = document.getElementById('closeSuccess');
    const saveTicketsBtn = document.getElementById('saveTicketsBtn');
    
    // Update message with actual ticket count
    const successMessage = successModal.querySelector('.success-message');
    const ticketCount = bookingData.seats.length;
    const ticketWord = ticketCount === 1 ? 'ticket' : 'tickets';
    successMessage.textContent = `You've bought ${ticketCount} ${ticketWord}. Please save it on your device and show before the entering to the theatre`;
    
    // Show modal
    successModal.classList.add('show');
    
    // Close button
    closeSuccess.addEventListener('click', () => {
        successModal.classList.remove('show');
        redirectToHome();
    });
    
       // Save tickets button
    saveTicketsBtn.addEventListener('click', () => {
        downloadTicket(bookingData);
        successModal.classList.remove('show');
        redirectToHome();
    });

    
    // Auto redirect after 10 seconds
    setTimeout(() => {
        if (successModal.classList.contains('show')) {
            successModal.classList.remove('show');
            redirectToHome();
        }
    }, 3000);
}

// Download ticket as text file
function downloadTicket(bookingData) {
    const ticketText = `

Booking ID: ${bookingData.bookingId}

Movie: ${bookingData.movie}
Date: ${formatDate(bookingData.date)}
Time: ${bookingData.time}

Seats: ${bookingData.seats.join(', ')}
Total Price: ${bookingData.totalPrice}₾

Customer: ${bookingData.fullName}
Email: ${bookingData.email}
Phone: ${bookingData.phone}

Payment Method: ${bookingData.paymentMethod.toUpperCase()}


Booking Time: ${new Date(bookingData.timestamp).toLocaleString()}
    `.trim();
    
    // Create blob and download
    const blob = new Blob([ticketText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NIZAMI_Ticket_${bookingData.bookingId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Ticket downloaded:', bookingData.bookingId);
}

// Redirect to home
function redirectToHome() {
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1000);
}

// Save booking to localStorage
function saveBookingToLocalStorage(bookingData) {
    // Get existing bookings
    let bookings = JSON.parse(localStorage.getItem('cinemaBookings') || '[]');
    
    // Add new booking
    bookings.push(bookingData);
    
    // Save back to localStorage
    localStorage.setItem('cinemaBookings', JSON.stringify(bookings));
    
    console.log('Booking saved:', bookingData);
}

// Mark seats as taken for this session
function markSeatsAsTaken(date, time, seats) {
    const sessionKey = `takenSeats_${date}_${time}`;
    
    // Get existing taken seats for this session
    let takenSeats = JSON.parse(localStorage.getItem(sessionKey) || '[]');
    
    // Add new seats
    seats.forEach(seat => {
        if (!takenSeats.includes(seat)) {
            takenSeats.push(seat);
        }
    });
    
    // Save to localStorage
    localStorage.setItem(sessionKey, JSON.stringify(takenSeats));
    
    console.log(`Seats marked as taken for ${date} ${time}:`, seats);
}

// Format date helper
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}
