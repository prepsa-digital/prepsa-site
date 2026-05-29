/* Main JavaScript for PREPSA Platform */

// ============================================
// MODAL FUNCTIONS
// ============================================

// Open Login Modal
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('hidden');
    modal.classList.add('modal-enter');
}

// Close Login Modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('hidden');
}

// Open Signup Modal
function openSignupModal() {
    const modal = document.getElementById('signupModal');
    modal.classList.remove('hidden');
    modal.classList.add('modal-enter');
    closeLoginModal(); // Close login modal if open
}

// Close Signup Modal
function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    modal.classList.add('hidden');
}

// Close modals when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');

    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });

    signupModal.addEventListener('click', function(e) {
        if (e.target === signupModal) {
            closeSignupModal();
        }
    });
});

// ============================================
// MOBILE MENU TOGGLE
// ============================================

document.getElementById('menuToggle')?.addEventListener('click', function() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when a link is clicked
const mobileLinks = document.querySelectorAll('#mobileMenu a');
mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
        document.getElementById('mobileMenu').classList.add('hidden');
    });
});

// ============================================
// FORM HANDLERS
// ============================================

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const userType = document.getElementById('userType').value;
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Validation
    if (!userType || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Get stored user data
    const users = JSON.parse(localStorage.getItem('prepsaUsers')) || [];
    const user = users.find(u => u.email === email && u.userType === userType);

    if (!user) {
        showToast('Invalid credentials', 'error');
        return;
    }

    // Verify password (basic check - in production use proper authentication)
    if (user.password !== password) {
        showToast('Invalid password', 'error');
        return;
    }

    // Store logged-in user
    localStorage.setItem('currentUser', JSON.stringify({
        name: user.name,
        email: user.email,
        userType: userType,
        id: user.id
    }));

    showToast(`Welcome back, ${user.name}!`, 'success');
    closeLoginModal();
    
    // Redirect based on user type
    setTimeout(() => {
        redirectToDashboard(userType);
    }, 1500);
}

// Handle Signup
function handleSignup(event) {
    event.preventDefault();

    const form = event.target;
    const name = form.querySelector('input[placeholder="Full Name"]').value;
    const email = form.querySelector('input[placeholder="Email"]').value;
    const userType = form.querySelector('select').value;
    const password = form.querySelector('input[type="password"]').value;
    const confirmPassword = form.querySelectorAll('input[type="password"]')[1].value;

    // Validation
    if (!name || !email || !userType || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('prepsaUsers')) || [];
    if (users.find(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        userType: userType,
        password: password, // In production, NEVER store plain passwords!
        createdAt: new Date().toISOString()
    };

    // Save to localStorage
    users.push(newUser);
    localStorage.setItem('prepsaUsers', JSON.stringify(users));

    showToast('Account created successfully! Please login.', 'success');
    closeSignupModal();
    form.reset();

    // Open login modal after 1.5 seconds
    setTimeout(() => {
        openLoginModal();
    }, 1500);
}

// Handle Contact Form
function handleContactSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Store contact message
    const contacts = JSON.parse(localStorage.getItem('prepsaContacts')) || [];
    const message = {
        id: Date.now(),
        name: form.querySelector('input[placeholder="Your Name"]').value,
        email: form.querySelector('input[placeholder="Your Email"]').value,
        subject: form.querySelector('input[placeholder="Subject"]').value,
        message: form.querySelector('textarea').value,
        timestamp: new Date().toISOString()
    };

    contacts.push(message);
    localStorage.setItem('prepsaContacts', JSON.stringify(contacts));

    showToast('Message sent successfully! We will contact you soon.', 'success');
    form.reset();
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 4000);
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================

function redirectToDashboard(userType) {
    const dashboards = {
        admin: 'admin-dashboard.html',
        teacher: 'teacher-dashboard.html',
        learner: 'learner-dashboard.html',
        parent: 'parent-dashboard.html'
    };

    window.location.href = dashboards[userType] || 'index.html';
}

// Get current logged-in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Logout user
function logout() {
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Check if user is logged in
function checkUserLogin() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
    return user;
}

// ============================================
// DASHBOARD SIDEBAR FUNCTIONALITY
// ============================================

function setActiveSidebarItem(itemName) {
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.classList.remove('active');
        if (item.textContent.includes(itemName)) {
            item.classList.add('active');
        }
    });
}

// ============================================
// CBT QUIZ FUNCTIONS
// ============================================

class QuizManager {
    constructor(quizData) {
        this.quizData = quizData;
        this.currentQuestion = 0;
        this.score = 0;
        this.answers = [];
        this.timeLeft = quizData.duration * 60; // Convert to seconds
        this.timerInterval = null;
    }

    startQuiz() {
        this.renderQuestion();
        this.startTimer();
    }

    renderQuestion() {
        const question = this.quizData.questions[this.currentQuestion];
        const container = document.getElementById('quizContainer');

        // Progress bar
        const progress = ((this.currentQuestion + 1) / this.quizData.questions.length) * 100;

        let html = `
            <div class="quiz-container">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">${this.quizData.title}</h2>
                    <div class="timer" id="timer">${this.formatTime(this.timeLeft)}</div>
                </div>
                <div class="progress-bar mb-4">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="question-number">Question ${this.currentQuestion + 1} of ${this.quizData.questions.length}</div>
                <div class="question-text">${question.question}</div>
                <div class="options-container">
        `;

        question.options.forEach((option, index) => {
            html += `
                <label class="option">
                    <input type="radio" name="answer" value="${index}" class="cursor-pointer">
                    <span>${option}</span>
                </label>
            `;
        });

        html += `
                </div>
                <div class="flex justify-between mt-8">
                    <button onclick="quizManager.previousQuestion()" class="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400" ${this.currentQuestion === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-left mr-2"></i>Previous
                    </button>
                    <button onclick="quizManager.nextQuestion()" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                        ${this.currentQuestion === this.quizData.questions.length - 1 ? 'Submit' : 'Next'} <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Re-add event listeners
        const options = document.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                const answerIndex = parseInt(option.querySelector('input').value);
                this.answers[this.currentQuestion] = answerIndex;
            });
        });

        // Check if there's a previously selected answer
        if (this.answers[this.currentQuestion] !== undefined) {
            options[this.answers[this.currentQuestion]].classList.add('selected');
            options[this.answers[this.currentQuestion]].querySelector('input').checked = true;
        }
    }

    nextQuestion() {
        const selected = document.querySelector('input[name="answer"]:checked');
        
        if (!selected) {
            showToast('Please select an answer', 'error');
            return;
        }

        if (this.currentQuestion === this.quizData.questions.length - 1) {
            this.submitQuiz();
        } else {
            this.currentQuestion++;
            this.renderQuestion();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderQuestion();
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const timerEl = document.getElementById('timer');
            
            if (timerEl) {
                timerEl.textContent = this.formatTime(this.timeLeft);
                
                // Change color based on time left
                if (this.timeLeft <= 60) {
                    timerEl.classList.add('danger');
                } else if (this.timeLeft <= 300) {
                    timerEl.classList.add('warning');
                }
            }

            if (this.timeLeft <= 0) {
                this.submitQuiz();
            }
        }, 1000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    submitQuiz() {
        clearInterval(this.timerInterval);

        // Calculate score
        this.score = 0;
        this.answers.forEach((answer, index) => {
            if (answer === this.quizData.questions[index].correct) {
                this.score++;
            }
        });

        // Store result
        const results = JSON.parse(localStorage.getItem('quizResults')) || [];
        const user = getCurrentUser();
        
        results.push({
            id: Date.now(),
            userId: user?.id || 'anonymous',
            quizTitle: this.quizData.title,
            score: this.score,
            totalQuestions: this.quizData.questions.length,
            percentage: (this.score / this.quizData.questions.length) * 100,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('quizResults', JSON.stringify(results));

        // Show results
        this.showResults();
    }

    showResults() {
        const percentage = (this.score / this.quizData.questions.length) * 100;
        const container = document.getElementById('quizContainer');

        let resultColor = 'text-red-600';
        let resultMessage = 'Keep practicing!';

        if (percentage >= 80) {
            resultColor = 'text-green-600';
            resultMessage = 'Excellent performance!';
        } else if (percentage >= 60) {
            resultColor = 'text-blue-600';
            resultMessage = 'Good job!';
        } else if (percentage >= 40) {
            resultColor = 'text-yellow-600';
            resultMessage = 'You can do better!';
        }

        const html = `
            <div class="quiz-container text-center">
                <i class="fas fa-check-circle text-6xl text-blue-600 mb-4"></i>
                <h2 class="text-4xl font-bold mb-4">Quiz Complete!</h2>
                <div class="text-5xl font-bold ${resultColor} mb-2">${this.score}/${this.quizData.questions.length}</div>
                <div class="text-3xl font-bold text-gray-600 mb-6">${percentage.toFixed(1)}%</div>
                <p class="text-xl text-gray-600 mb-8">${resultMessage}</p>
                <button onclick="window.location.href='learner-dashboard.html'" class="px-8 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">
                    Back to Dashboard
                </button>
            </div>
        `;

        container.innerHTML = html;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Capitalize string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate random ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize any page-specific functionality
    console.log('PREPSA Platform loaded successfully');
});
