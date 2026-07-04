// ==========================================
// QUIZVERSE - FULL-STACK CLIENT (public/app.js)
// ==========================================

const API_BASE = ''; // Same host (since backend serves static files)

// --- 1. STATE MANAGEMENT ---
const state = {
    currentUser: null,
    currentView: "home-view",
    selectedTopic: null,
    
    // Playing state
    activeQuiz: null,
    quizProgress: {
        currentIndex: 0,
        selectedAnswers: [], // Array matching question indices
        startTime: null,
        timerInterval: null,
        timeLeft: 0
    },
    
    // Editing state (for custom creations)
    tempQuestions: []
};

// --- 2. API REQUEST HEADERS HELPERS ---
function getAuthHeaders() {
    const token = localStorage.getItem('qv_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// --- 3. VIEW ROUTER (SPA ROUTER) ---
const viewList = ["home-view", "browse-view", "create-view", "quiz-runner-view", "results-view", "profile-view"];

function navigateTo(viewId) {
    // Hide all views
    viewList.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add("hidden");
    });

    // Remove active class from navbar buttons
    document.querySelectorAll(".nav-link").forEach(btn => btn.classList.remove("active"));

    // Show destination view
    const target = document.getElementById(viewId);
    if (target) {
        target.classList.remove("hidden");
        state.currentView = viewId;
    }

    // Highlight navbar buttons based on active view
    let navButtonId = "";
    if (viewId === "home-view") navButtonId = "nav-home-btn";
    else if (viewId === "browse-view") navButtonId = "nav-browse-btn";
    else if (viewId === "create-view") navButtonId = "nav-create-btn";
    else if (viewId === "profile-view") navButtonId = "nav-profile-btn";

    const navBtn = document.getElementById(navButtonId);
    if (navBtn) navBtn.classList.add("active");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Initializer calls for specific views
    if (viewId === "home-view") {
        updateStatsCounters();
        renderTopics();
        renderFeaturedQuizzes();
        if (state.selectedTopic) {
            triggerTopicFilter(state.selectedTopic);
        }
    } else if (viewId === "browse-view") {
        populateBrowseFilters();
        applyBrowseFilters();
    } else if (viewId === "create-view") {
        initCreateQuizForm();
    } else if (viewId === "profile-view") {
        renderProfile();
    }
}

// --- 4. TOPIC DEFINITIONS ---
const TOPICS = [
    { name: "Technology", icon: "code-2", desc: "Software, hardware, languages, and web engineering.", class: "topic-tech" },
    { name: "Science", icon: "atom", desc: "Physics, biology, space, and earth science discoveries.", class: "topic-science" },
    { name: "History", icon: "landmark", desc: "Ancient worlds, historical wars, landmarks, and timeline events.", class: "topic-history" },
    { name: "Geography", icon: "globe", desc: "Capitals, maps, continents, oceans, and natural wonders.", class: "topic-geo" },
    { name: "Pop Culture", icon: "popcorn", desc: "Cinema, music, celebrity culture, and entertainment facts.", class: "topic-pop" },
    { name: "Literature", icon: "book-open", desc: "Classic books, authors, poems, and reading comprehension.", class: "topic-lit" },
    { name: "Other", icon: "help-circle", desc: "Miscellany, general knowledge, and specialized trivia.", class: "topic-other" }
];

// --- 5. RENDERERS & LAYOUT BUILDERS ---

// --- 5a. Navbar Auth status
function renderHeaderAuth() {
    const authContainer = document.getElementById("nav-auth-container");
    const dashboardLink = document.getElementById("nav-profile-btn");
    
    if (state.currentUser) {
        dashboardLink.classList.remove("hidden");
        
        authContainer.innerHTML = `
            <div class="user-menu" id="user-menu-trigger">
                <div class="user-menu-avatar">
                    ${state.currentUser.username.substring(0, 1).toUpperCase()}
                </div>
                <div class="user-menu-info">
                    <span class="user-menu-name">${state.currentUser.username}</span>
                    <span class="user-menu-xp">${state.currentUser.xp || 0} XP • Lvl ${state.currentUser.level || 1}</span>
                </div>
            </div>
            <button class="user-logout-btn" id="logout-btn" title="Sign Out">
                <i data-lucide="log-out"></i>
            </button>
        `;
        
        document.getElementById("logout-btn").addEventListener("click", () => {
            handleLogout();
        });
        
        document.getElementById("user-menu-trigger").addEventListener("click", () => {
            navigateTo("profile-view");
        });
        
    } else {
        dashboardLink.classList.add("hidden");
        
        authContainer.innerHTML = `
            <button class="btn btn-primary" id="header-login-btn">
                <i data-lucide="log-in"></i> Sign In
            </button>
        `;
        
        document.getElementById("header-login-btn").addEventListener("click", () => {
            openAuthModal();
        });
    }
    
    lucide.createIcons();
}

// --- 5b. Home Stats counters
async function updateStatsCounters() {
    try {
        const response = await fetch(`${API_BASE}/api/quizzes`);
        if (!response.ok) return;
        const quizzes = await response.json();
        
        document.getElementById("stat-quizzes-created").textContent = quizzes.length;
        // Mock active completed counters for demo aesthetic
        document.getElementById("stat-quizzes-taken").textContent = quizzes.length * 6 + 14;
        document.getElementById("stat-active-users").textContent = Math.round(quizzes.length * 1.5) + 3;
    } catch (err) {
        console.error('Stats load error:', err);
    }
}

// --- 5c. Topic Category Cards (Home Page)
function renderTopics() {
    const container = document.getElementById("topics-grid-container");
    container.innerHTML = "";
    
    TOPICS.forEach(topic => {
        const card = document.createElement("div");
        card.className = `topic-card glass ${topic.class}`;
        card.innerHTML = `
            <div class="topic-icon">
                <i data-lucide="${topic.icon}"></i>
            </div>
            <div class="topic-info">
                <h3>${topic.name}</h3>
                <p>${topic.desc}</p>
            </div>
        `;
        
        card.addEventListener("click", () => {
            triggerTopicFilter(topic.name);
        });
        
        container.appendChild(card);
    });
    
    lucide.createIcons();
}

// --- 5d. Topic quizzes list (revealed when category clicked)
async function triggerTopicFilter(topicName) {
    state.selectedTopic = topicName;
    
    const topicSection = document.getElementById("topic-quizzes-section");
    const topicTitle = document.getElementById("selected-topic-title");
    const topicDesc = document.getElementById("selected-topic-desc");
    const grid = document.getElementById("topic-quizzes-grid");
    
    topicTitle.innerHTML = `Quizzes in <span class="text-gradient">${topicName}</span>`;
    
    const topicMeta = TOPICS.find(t => t.name === topicName);
    topicDesc.textContent = topicMeta ? topicMeta.desc : "Explore custom categories.";
    
    grid.innerHTML = "<p class='text-center span-2' style='grid-column: 1 / -1;'>Loading topic quizzes...</p>";
    topicSection.classList.remove("hidden");
    topicSection.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
        const response = await fetch(`${API_BASE}/api/quizzes?topic=${encodeURIComponent(topicName)}`);
        if (!response.ok) throw new Error();
        const quizzes = await response.json();
        
        grid.innerHTML = "";
        
        if (quizzes.length === 0) {
            grid.innerHTML = `
                <div class="span-2 text-center" style="padding: 20px 0; grid-column: 1 / -1;">
                    <p>No quizzes available in this topic yet. Be the first to create one!</p>
                </div>
            `;
        } else {
            quizzes.forEach(quiz => {
                grid.appendChild(createQuizCardElement(quiz));
            });
        }
    } catch (err) {
        grid.innerHTML = "<p class='text-center span-2' style='color: var(--danger); grid-column: 1 / -1;'>Failed to load quizzes.</p>";
    }
    
    lucide.createIcons();
}

// --- 5e. Helper to build reusable quiz card HTML
function createQuizCardElement(quiz) {
    const card = document.createElement("div");
    card.className = "quiz-card glass";
    
    const diffClass = quiz.difficulty === "Easy" ? "tag-easy" : (quiz.difficulty === "Medium" ? "tag-medium" : "tag-hard");
    const initialChar = quiz.author ? quiz.author.substring(0, 1).toUpperCase() : "Q";
    
    card.innerHTML = `
        <div class="card-meta">
            <span class="card-tag topic-tag">${quiz.topic}</span>
            <span class="card-tag difficulty-tag ${diffClass}">${quiz.difficulty}</span>
        </div>
        <div>
            <h3 class="card-title">${quiz.title}</h3>
            <p class="card-desc">${quiz.description || "Challenge yourself with this quiz."}</p>
        </div>
        <div class="card-stats">
            <span class="stat-item"><i data-lucide="help-circle"></i> ${quiz.questions.length} Questions</span>
            <span class="stat-item"><i data-lucide="clock"></i> ${quiz.duration} mins</span>
        </div>
        <div class="card-footer">
            <div class="card-author">
                <div class="author-avatar">${initialChar}</div>
                <span>By ${quiz.author || "Community"}</span>
            </div>
            <button class="btn btn-primary btn-sm start-quiz-btn" data-id="${quiz.id}">
                Take Quiz
            </button>
        </div>
    `;
    
    card.querySelector(".start-quiz-btn").addEventListener("click", () => {
        loadQuizLobby(quiz.id);
    });
    
    return card;
}

// --- 5f. Featured Quizzes list
async function renderFeaturedQuizzes() {
    const grid = document.getElementById("featured-quizzes-grid");
    grid.innerHTML = "<p>Loading featured quizzes...</p>";
    
    try {
        const response = await fetch(`${API_BASE}/api/quizzes`);
        if (!response.ok) throw new Error();
        const quizzes = await response.json();
        
        grid.innerHTML = "";
        
        // Take the 3 most recently created quizzes as featured
        const featured = quizzes.slice(-3).reverse();
        
        featured.forEach(quiz => {
            grid.appendChild(createQuizCardElement(quiz));
        });
    } catch (err) {
        grid.innerHTML = "<p style='color: var(--danger);'>Failed to load quizzes.</p>";
    }
    
    lucide.createIcons();
}

// --- 6. EXPLORE/BROWSE VIEW LOGIC ---

async function populateBrowseFilters() {
    try {
        const response = await fetch(`${API_BASE}/api/quizzes`);
        if (!response.ok) return;
        const quizzes = await response.json();
        
        const uniqueTopics = new Set(["Technology", "Science", "History", "Geography", "Pop Culture", "Literature"]);
        quizzes.forEach(q => {
            if (q.topic) uniqueTopics.add(q.topic);
        });
        
        const select = document.getElementById("filter-topic-select");
        select.innerHTML = '<option value="all">All Topics</option>';
        
        uniqueTopics.forEach(topic => {
            const option = document.createElement("option");
            option.value = topic;
            option.textContent = topic;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to populate filters:', err);
    }
}

async function applyBrowseFilters() {
    const searchVal = document.getElementById("quiz-search-input").value;
    const topicVal = document.getElementById("filter-topic-select").value;
    const diffVal = document.getElementById("filter-difficulty-select").value;
    
    const grid = document.getElementById("browse-quizzes-grid");
    const emptyState = document.getElementById("browse-empty-state");
    
    grid.innerHTML = "<p class='text-center span-2' style='grid-column: 1 / -1;'>Searching quizzes...</p>";
    emptyState.classList.add("hidden");
    
    try {
        // Query server using URL parameters
        let url = `${API_BASE}/api/quizzes?topic=${encodeURIComponent(topicVal)}&difficulty=${encodeURIComponent(diffVal)}`;
        if (searchVal) {
            url += `&search=${encodeURIComponent(searchVal)}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error();
        const filtered = await response.json();
        
        grid.innerHTML = "";
        
        if (filtered.length === 0) {
            grid.classList.add("hidden");
            emptyState.classList.remove("hidden");
        } else {
            emptyState.classList.add("hidden");
            grid.classList.remove("hidden");
            
            filtered.forEach(quiz => {
                grid.appendChild(createQuizCardElement(quiz));
            });
        }
    } catch (err) {
        grid.innerHTML = "<p class='text-center span-2' style='color: var(--danger); grid-column: 1 / -1;'>Search failed. Please try again.</p>";
    }
    
    lucide.createIcons();
}

// --- 7. QUIZ RUNNER / TAKE QUIZ GAMEPLAY ---

async function loadQuizLobby(quizId) {
    navigateTo("quiz-runner-view");
    
    // Setup temporary loading message
    const lobbyCard = document.getElementById("quiz-lobby-container");
    lobbyCard.classList.remove("hidden");
    document.getElementById("quiz-player-container").classList.add("hidden");
    
    const originalContent = lobbyCard.innerHTML;
    lobbyCard.innerHTML = "<div class='text-center'><p>Loading quiz details from server...</p></div>";
    
    try {
        // Get details (Stripped of answers for security)
        const response = await fetch(`${API_BASE}/api/quizzes/${quizId}`);
        if (!response.ok) throw new Error();
        const quiz = await response.json();
        
        state.activeQuiz = quiz;
        
        // Restore original HTML skeleton
        lobbyCard.innerHTML = originalContent;
        
        const diffClass = quiz.difficulty === "Easy" ? "tag-easy" : (quiz.difficulty === "Medium" ? "tag-medium" : "tag-hard");
        
        const lobbyTopic = document.getElementById("lobby-topic");
        lobbyTopic.textContent = quiz.topic;
        
        const lobbyDiff = document.getElementById("lobby-difficulty");
        lobbyDiff.className = `card-tag difficulty-tag ${diffClass}`;
        lobbyDiff.textContent = quiz.difficulty;
        
        document.getElementById("lobby-quiz-title").textContent = quiz.title;
        document.getElementById("lobby-quiz-desc").textContent = quiz.description || "No description provided.";
        document.getElementById("lobby-questions-count").textContent = `${quiz.questions.length} Qs`;
        document.getElementById("lobby-duration").textContent = `${quiz.duration} Mins`;
        document.getElementById("lobby-points").textContent = `${quiz.questions.length * 20} XP`;
        document.getElementById("lobby-author").textContent = quiz.author || "Community";
        
        // Rebind buttons since innerHTML was reset
        document.getElementById("lobby-cancel-btn").addEventListener("click", () => navigateTo("browse-view"));
        document.getElementById("lobby-start-btn").addEventListener("click", startQuiz);
        
    } catch (err) {
        lobbyCard.innerHTML = `
            <div class='text-center'>
                <p style='color: var(--danger); margin-bottom: 20px;'>Failed to load quiz details from server.</p>
                <button class='btn btn-outline' onclick='navigateTo("browse-view")'>Back to Explore</button>
            </div>
        `;
    }
    
    lucide.createIcons();
}

function startQuiz() {
    if (!state.activeQuiz) return;
    
    if (!state.currentUser) {
        alert("You must be logged in to take a quiz and record scores.");
        openAuthModal();
        return;
    }
    
    // Transition to gameplay layout
    document.getElementById("quiz-lobby-container").classList.add("hidden");
    document.getElementById("quiz-player-container").classList.remove("hidden");
    
    // Setup state
    state.quizProgress.currentIndex = 0;
    state.quizProgress.selectedAnswers = new Array(state.activeQuiz.questions.length).fill(null);
    state.quizProgress.startTime = new Date();
    
    // Setup countdown timer
    const totalSeconds = state.activeQuiz.duration * 60;
    state.quizProgress.timeLeft = totalSeconds;
    
    updateTimerDisplay();
    clearInterval(state.quizProgress.timerInterval);
    
    state.quizProgress.timerInterval = setInterval(() => {
        state.quizProgress.timeLeft--;
        updateTimerDisplay();
        
        if (state.quizProgress.timeLeft <= 0) {
            clearInterval(state.quizProgress.timerInterval);
            alert("Time's up! Submitting your answers automatically.");
            submitQuizResults();
        }
    }, 1000);
    
    // Render first question
    renderActiveQuestion();
}

function updateTimerDisplay() {
    const mins = Math.floor(state.quizProgress.timeLeft / 60);
    const secs = state.quizProgress.timeLeft % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const timerBadge = document.getElementById("player-timer-badge");
    const timerText = document.getElementById("player-timer");
    
    timerText.textContent = formatted;
    
    if (state.quizProgress.timeLeft < 60) {
        timerBadge.classList.add("timer-urgent");
    } else {
        timerBadge.classList.remove("timer-urgent");
    }
}

function renderActiveQuestion() {
    const quiz = state.activeQuiz;
    const qIndex = state.quizProgress.currentIndex;
    const question = quiz.questions[qIndex];
    
    // Update progress texts
    document.getElementById("player-current-index").textContent = qIndex + 1;
    document.getElementById("player-total-count").textContent = quiz.questions.length;
    
    // Fill progress bar
    const progressPct = ((qIndex + 1) / quiz.questions.length) * 100;
    document.getElementById("player-progress-bar").style.width = `${progressPct}%`;
    
    // Question Text
    document.getElementById("player-question-text").textContent = question.text;
    
    // Render Options
    const optionsContainer = document.getElementById("player-options-container");
    optionsContainer.innerHTML = "";
    
    question.options.forEach((optText, optIdx) => {
        const optLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
        const button = document.createElement("button");
        button.className = "option-btn";
        if (state.quizProgress.selectedAnswers[qIndex] === optIdx) {
            button.classList.add("selected");
        }
        
        button.innerHTML = `
            <div class="option-indicator">${optLetter}</div>
            <span>${optText}</span>
        `;
        
        button.addEventListener("click", () => {
            selectOption(optIdx);
        });
        
        optionsContainer.appendChild(button);
    });
    
    // Update footer buttons
    const nextBtn = document.getElementById("player-next-btn");
    const nextBtnText = nextBtn.querySelector("span");
    
    if (qIndex === quiz.questions.length - 1) {
        nextBtnText.textContent = "Finish & Submit";
        nextBtn.querySelector("i").setAttribute("data-lucide", "check-circle");
    } else {
        nextBtnText.textContent = "Next Question";
        nextBtn.querySelector("i").setAttribute("data-lucide", "chevron-right");
    }
    
    // Hide warning text
    document.getElementById("player-warning-select").classList.add("hidden");
    
    lucide.createIcons();
}

function selectOption(optionIndex) {
    const qIndex = state.quizProgress.currentIndex;
    state.quizProgress.selectedAnswers[qIndex] = optionIndex;
    
    const buttons = document.querySelectorAll("#player-options-container .option-btn");
    buttons.forEach((btn, idx) => {
        if (idx === optionIndex) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });
}

function handleNextQuestion() {
    const qIndex = state.quizProgress.currentIndex;
    
    if (state.quizProgress.selectedAnswers[qIndex] === null) {
        document.getElementById("player-warning-select").classList.remove("hidden");
        return;
    }
    
    if (qIndex < state.activeQuiz.questions.length - 1) {
        state.quizProgress.currentIndex++;
        renderActiveQuestion();
    } else {
        submitQuizResults();
    }
}

// --- 8. SUBMIT RESULTS AND ANALYTICS TO BACKEND ---

async function submitQuizResults() {
    clearInterval(state.quizProgress.timerInterval);
    
    const quiz = state.activeQuiz;
    const answers = state.quizProgress.selectedAnswers;
    
    // Calculate elapsed time
    const timeSpentMs = new Date() - state.quizProgress.startTime;
    const timeSpentMins = Math.floor(timeSpentMs / 60000);
    const timeSpentSecs = Math.floor((timeSpentMs % 60000) / 1000);
    const timeSpentStr = `${timeSpentMins.toString().padStart(2, '0')}:${timeSpentSecs.toString().padStart(2, '0')}`;
    
    // Display intermediate loading screen
    navigateTo("results-view");
    document.querySelector(".results-score-card").innerHTML = "<div class='text-center'><p>Submitting answers and grading on server...</p></div>";
    
    try {
        // Secure Grading Request
        const response = await fetch(`${API_BASE}/api/quizzes/${quiz.id}/attempt`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                answersSelected: answers,
                timeTaken: timeSpentStr
            })
        });
        
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        // Sync user state with updated XP/Level
        if (data.user) {
            state.currentUser = data.user;
            sessionStorage.setItem("qv_logged_user", JSON.stringify(data.user));
            renderHeaderAuth();
        }
        
        // Restore results card structural layout
        displayResultsView(quiz, data.correctCount, data.accuracy, data.xpGain, data.timeTaken, data.reviews);
        
    } catch (err) {
        document.querySelector(".results-score-card").innerHTML = `
            <div class='text-center'>
                <p style='color: var(--danger); margin-bottom: 20px;'>Failed to submit answers to server.</p>
                <button class='btn btn-primary' onclick='navigateTo("browse-view")'>Back to Explore</button>
            </div>
        `;
    }
}

function displayResultsView(quiz, correctCount, accuracy, xpGain, timeSpentStr, reviews) {
    const scoreCardContainer = document.querySelector(".results-score-card");
    
    // Setup Score Card HTML
    scoreCardContainer.innerHTML = `
        <div class="results-score-layout">
            <div class="svg-progress-wrapper">
                <svg class="progress-ring" width="200" height="200">
                    <circle class="progress-ring-circle-bg" stroke="rgba(255, 255, 255, 0.05)" stroke-width="12" fill="transparent" r="84" cx="100" cy="100"/>
                    <circle class="progress-ring-circle-fill" id="results-ring-fill" stroke="url(#results-gradient)" stroke-width="12" stroke-dasharray="527.7" stroke-dashoffset="527.7" stroke-linecap="round" fill="transparent" r="84" cx="100" cy="100"/>
                    <defs>
                        <linearGradient id="results-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="var(--primary)"/>
                            <stop offset="100%" stop-color="var(--secondary)"/>
                        </linearGradient>
                    </defs>
                </svg>
                <div class="svg-progress-text">
                    <span id="results-percentage">${accuracy}%</span>
                    <small id="results-score-text">${correctCount} / ${quiz.questions.length} Correct</small>
                </div>
            </div>

            <div class="results-stats-panel">
                <div class="results-badge-unlocked" id="results-badge-card">
                    <i data-lucide="award"></i>
                    <div>
                        <h4 id="results-badge-title">Loading Rank...</h4>
                        <p id="results-badge-desc">Evaluating performance badge.</p>
                    </div>
                </div>

                <div class="results-grid-stats">
                    <div class="stat-mini glass-inset">
                        <span class="stat-mini-label">Points Gained</span>
                        <span class="stat-mini-val text-gradient" id="results-xp-gain">+0 XP</span>
                    </div>
                    <div class="stat-mini glass-inset">
                        <span class="stat-mini-label">Time Spent</span>
                        <span class="stat-mini-val" id="results-time-taken">--:--</span>
                    </div>
                    <div class="stat-mini glass-inset">
                        <span class="stat-mini-label">Accuracy</span>
                        <span class="stat-mini-val" id="results-accuracy">0%</span>
                    </div>
                    <div class="stat-mini glass-inset">
                        <span class="stat-mini-label">Rank</span>
                        <span class="stat-mini-val" id="results-rank">Novice</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="results-actions">
            <button class="btn btn-outline" id="results-retry-btn">
                <i data-lucide="rotate-ccw"></i> Try Again
            </button>
            <button class="btn btn-primary" id="results-browse-btn">
                Explore Other Quizzes <i data-lucide="arrow-right"></i>
            </button>
        </div>
    `;

    // Rebind Results actions
    document.getElementById("results-retry-btn").addEventListener("click", () => {
        if (state.activeQuiz) {
            loadQuizLobby(state.activeQuiz.id);
        }
    });
    
    document.getElementById("results-browse-btn").addEventListener("click", () => {
        navigateTo("browse-view");
    });
    
    // Animate stroke circle fill
    const circle = document.getElementById("results-ring-fill");
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (accuracy / 100) * circumference;
    
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
    
    let rank = "Novice";
    let badgeTitle = "Starter Mind";
    let badgeDesc = "Keep practicing to boost your scores!";
    
    if (accuracy === 100) {
        rank = "Grandmaster";
        badgeTitle = "Perfect Brain";
        badgeDesc = "Flawless score! Unbeatable understanding of this topic.";
    } else if (accuracy >= 80) {
        rank = "Scholar";
        badgeTitle = "Quiz Guru";
        badgeDesc = "Excellent! Profound command of this topic.";
    } else if (accuracy >= 50) {
        rank = "Explorer";
        badgeTitle = "Knowledge Seeker";
        badgeDesc = "Passed! Good foundation, keep stretching your intellect.";
    }
    
    document.getElementById("results-badge-title").textContent = badgeTitle;
    document.getElementById("results-badge-desc").textContent = badgeDesc;
    document.getElementById("results-xp-gain").textContent = `+${xpGain} XP`;
    document.getElementById("results-time-taken").textContent = timeSpentStr;
    document.getElementById("results-accuracy").textContent = `${accuracy}%`;
    document.getElementById("results-rank").textContent = rank;
    
    // Render detailed review list (Correct Answer Keys fetched from database grading payload!)
    const reviewContainer = document.getElementById("results-review-container");
    reviewContainer.innerHTML = "";
    
    reviews.forEach((q, qIdx) => {
        const isCorrect = q.userAnswer === q.correctAnswer;
        
        const card = document.createElement("div");
        card.className = "review-card collapsed";
        
        card.innerHTML = `
            <div class="review-card-header" data-idx="${qIdx}">
                <div class="review-header-left">
                    <div class="status-badge ${isCorrect ? 'status-correct' : 'status-incorrect'}">
                        <i data-lucide="${isCorrect ? 'check' : 'x'}"></i>
                    </div>
                    <span class="review-q-text">Q${qIdx + 1}: ${q.text}</span>
                </div>
                <i data-lucide="chevron-down" class="arrow-icon-rotate"></i>
            </div>
            <div class="review-card-body">
                <div class="review-options-list">
                    ${q.options.map((opt, optIdx) => {
                        let optClass = "";
                        if (optIdx === q.correctAnswer) optClass = "correct-ans";
                        else if (optIdx === q.userAnswer && !isCorrect) optClass = "wrong-ans";
                        
                        const optLetter = String.fromCharCode(65 + optIdx);
                        return `<div class="review-option-item ${optClass}"><strong>${optLetter}.</strong> ${opt}</div>`;
                    }).join('')}
                </div>
                ${q.explanation ? `
                    <div class="explanation-box">
                        <strong>Explanation:</strong>
                        <p>${q.explanation}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        card.querySelector(".review-card-header").addEventListener("click", () => {
            card.classList.toggle("collapsed");
        });
        
        reviewContainer.appendChild(card);
    });
    
    lucide.createIcons();
}

// --- 9. DYNAMIC QUIZ CREATION FORM ENGINE ---

function initCreateQuizForm() {
    if (!state.currentUser) {
        alert("You must be signed in to publish a quiz.");
        openAuthModal();
        navigateTo("home-view");
        return;
    }
    
    // Clear previous settings
    document.getElementById("quiz-title-input").value = "";
    document.getElementById("quiz-desc-input").value = "";
    document.getElementById("quiz-topic-input").selectedIndex = 0;
    document.getElementById("quiz-difficulty-input").value = "Medium";
    document.getElementById("quiz-duration-input").value = 10;
    document.getElementById("custom-topic-group").classList.add("hidden");
    document.getElementById("quiz-custom-topic-input").value = "";
    
    state.tempQuestions = [];
    
    document.getElementById("questions-builder-container").innerHTML = "";
    addQuestionBuilderBlock();
    updateLivePreviewCard();
}

function addQuestionBuilderBlock() {
    const container = document.getElementById("questions-builder-container");
    const qIdx = state.tempQuestions.length;
    
    const qObj = {
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: ""
    };
    
    state.tempQuestions.push(qObj);
    
    const card = document.createElement("div");
    card.className = "question-creator-card glass";
    card.id = `q-builder-${qIdx}`;
    
    card.innerHTML = `
        <div class="q-creator-header">
            <span class="q-index-label">Question ${qIdx + 1}</span>
            ${qIdx > 0 ? `
                <button type="button" class="delete-q-btn" data-idx="${qIdx}" title="Delete Question">
                    <i data-lucide="trash-2"></i>
                </button>
            ` : ''}
        </div>
        
        <div class="form-group">
            <label class="required-label">Question Text</label>
            <input type="text" class="form-input q-text-input" placeholder="What is the question to ask?" data-idx="${qIdx}" required>
        </div>
        
        <div class="form-group">
            <label class="required-label">Options (Check the radio button next to the correct answer)</label>
            <div class="options-builder-grid">
                <div class="option-builder-field">
                    <input type="radio" name="correct-ans-radio-${qIdx}" value="0" checked data-idx="${qIdx}">
                    <input type="text" class="q-opt-input" placeholder="Option A" data-idx="${qIdx}" data-opt="0" required>
                </div>
                <div class="option-builder-field">
                    <input type="radio" name="correct-ans-radio-${qIdx}" value="1" data-idx="${qIdx}">
                    <input type="text" class="q-opt-input" placeholder="Option B" data-idx="${qIdx}" data-opt="1" required>
                </div>
                <div class="option-builder-field">
                    <input type="radio" name="correct-ans-radio-${qIdx}" value="2" data-idx="${qIdx}">
                    <input type="text" class="q-opt-input" placeholder="Option C" data-idx="${qIdx}" data-opt="2" required>
                </div>
                <div class="option-builder-field">
                    <input type="radio" name="correct-ans-radio-${qIdx}" value="3" data-idx="${qIdx}">
                    <input type="text" class="q-opt-input" placeholder="Option D" data-idx="${qIdx}" data-opt="3" required>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label>Explanation / Rationale</label>
            <textarea class="form-input q-explanation-input" rows="2" placeholder="Explain why the marked option is correct..." data-idx="${qIdx}"></textarea>
        </div>
    `;
    
    container.appendChild(card);
    
    // Wire live listeners
    const qTextEl = card.querySelector(".q-text-input");
    qTextEl.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        state.tempQuestions[idx].text = e.target.value;
    });
    
    card.querySelectorAll(".q-opt-input").forEach(optEl => {
        optEl.addEventListener("input", (e) => {
            const idx = parseInt(e.target.dataset.idx);
            const optIdx = parseInt(e.target.dataset.opt);
            state.tempQuestions[idx].options[optIdx] = e.target.value;
        });
    });
    
    card.querySelectorAll(`input[type="radio"]`).forEach(radioEl => {
        radioEl.addEventListener("change", (e) => {
            const idx = parseInt(e.target.dataset.idx);
            state.tempQuestions[idx].correctAnswer = parseInt(e.target.value);
        });
    });
    
    const qExplainEl = card.querySelector(".q-explanation-input");
    qExplainEl.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        state.tempQuestions[idx].explanation = e.target.value;
    });
    
    if (qIdx > 0) {
        card.querySelector(".delete-q-btn").addEventListener("click", (e) => {
            const deleteIdx = parseInt(e.currentTarget.dataset.idx);
            removeQuestionBuilderBlock(deleteIdx);
        });
    }
    
    updateLivePreviewCard();
    lucide.createIcons();
}

function removeQuestionBuilderBlock(index) {
    state.tempQuestions.splice(index, 1);
    
    const container = document.getElementById("questions-builder-container");
    container.innerHTML = "";
    
    const oldTemp = [...state.tempQuestions];
    state.tempQuestions = [];
    
    oldTemp.forEach((q, idx) => {
        addQuestionBuilderBlock();
        
        const card = document.getElementById(`q-builder-${idx}`);
        card.querySelector(".q-text-input").value = q.text;
        
        const optInputs = card.querySelectorAll(".q-opt-input");
        q.options.forEach((optVal, optIdx) => {
            optInputs[optIdx].value = optVal;
        });
        
        const radios = card.querySelectorAll(`input[type="radio"]`);
        radios[q.correctAnswer].checked = true;
        
        card.querySelector(".q-explanation-input").value = q.explanation;
        
        state.tempQuestions[idx] = { ...q };
    });
    
    updateLivePreviewCard();
}

function updateLivePreviewCard() {
    const titleVal = document.getElementById("quiz-title-input").value;
    const descVal = document.getElementById("quiz-desc-input").value;
    const topicVal = document.getElementById("quiz-topic-input").value;
    const diffVal = document.getElementById("quiz-difficulty-input").value;
    const durationVal = document.getElementById("quiz-duration-input").value;
    
    document.getElementById("preview-card-title").textContent = titleVal || "My Awesome Quiz";
    document.getElementById("preview-card-desc").textContent = descVal || "Provide a summary of what the quiz covers in the settings form.";
    
    const previewTopic = document.getElementById("preview-tag-topic");
    previewTopic.textContent = topicVal || "General";
    
    const diffTag = document.getElementById("preview-tag-difficulty");
    diffTag.textContent = diffVal;
    diffTag.className = "card-tag difficulty-tag " + 
        (diffVal === "Easy" ? "tag-easy" : (diffVal === "Medium" ? "tag-medium" : "tag-hard"));
        
    document.getElementById("preview-card-qcount").textContent = state.tempQuestions.length;
    document.getElementById("preview-card-duration").textContent = durationVal || 10;
}

async function handlePublishQuiz(e) {
    e.preventDefault();
    
    if (!state.currentUser) {
        alert("Please log in to publish quizzes.");
        return;
    }
    
    const title = document.getElementById("quiz-title-input").value;
    const desc = document.getElementById("quiz-desc-input").value;
    const selectTopic = document.getElementById("quiz-topic-input").value;
    const customTopic = document.getElementById("quiz-custom-topic-input").value;
    
    const finalTopic = selectTopic === "Other" ? (customTopic || "Other") : selectTopic;
    const difficulty = document.getElementById("quiz-difficulty-input").value;
    const duration = parseInt(document.getElementById("quiz-duration-input").value);
    
    if (state.tempQuestions.length === 0) {
        alert("You must include at least 1 question to publish.");
        return;
    }
    
    // Save to Database API
    const saveBtn = document.getElementById("save-quiz-btn");
    const originalBtnHTML = saveBtn.innerHTML;
    saveBtn.innerHTML = "Publishing...";
    saveBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/api/quizzes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title,
                description: desc,
                topic: finalTopic,
                difficulty,
                duration,
                questions: state.tempQuestions
            })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Server error');
        }
        
        const data = await response.json();
        
        // Sync user state with updated XP/Level
        if (data.user) {
            state.currentUser = data.user;
            sessionStorage.setItem("qv_logged_user", JSON.stringify(data.user));
            renderHeaderAuth();
        }
        
        alert(`Successfully published "${title}"! You earned +100 XP.`);
        navigateTo("browse-view");
        
    } catch (err) {
        alert(`Failed to publish quiz: ${err.message}`);
    } finally {
        saveBtn.innerHTML = originalBtnHTML;
        saveBtn.disabled = false;
    }
}

// --- 10. DASHBOARD / USER PROFILE RENDERER ---

async function renderProfile() {
    if (!state.currentUser) {
        navigateTo("home-view");
        return;
    }
    
    // Profile Header details
    document.getElementById("profile-avatar-placeholder").textContent = state.currentUser.username.substring(0, 1).toUpperCase();
    document.getElementById("profile-username").textContent = state.currentUser.username;
    document.getElementById("profile-email").textContent = state.currentUser.email;
    
    // History Table targets
    const historyBody = document.getElementById("history-table-body");
    const historyEmpty = document.getElementById("history-empty-state");
    
    // Created Quizzes Table targets
    const createdBody = document.getElementById("myquizzes-table-body");
    const createdEmpty = document.getElementById("myquizzes-empty-state");
    
    historyBody.innerHTML = "<tr><td colspan='5' class='text-center'>Loading details...</td></tr>";
    createdBody.innerHTML = "<tr><td colspan='5' class='text-center'>Loading details...</td></tr>";
    
    try {
        // Fetch dashboard statistics from Server API
        const response = await fetch(`${API_BASE}/api/users/stats`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        // Sync user values if needed
        state.currentUser = data.user;
        sessionStorage.setItem("qv_logged_user", JSON.stringify(data.user));
        renderHeaderAuth();
        
        // Level & XP calculations
        const currentXp = data.user.xp || 0;
        const currentLevel = data.user.level || 1;
        const nextLevelXp = currentLevel * 500;
        const prevLevelXp = (currentLevel - 1) * 500;
        const progressInLevel = currentXp - prevLevelXp;
        const xpRequiredForLevel = 500;
        const progressPct = Math.min(100, (progressInLevel / xpRequiredForLevel) * 100);
        
        document.getElementById("profile-level-badge").textContent = `Level ${currentLevel} Scholar`;
        document.getElementById("profile-current-xp").textContent = `${currentXp} Total XP`;
        document.getElementById("profile-next-level-xp").textContent = `Level Up at ${nextLevelXp} XP`;
        document.getElementById("profile-xp-bar-fill").style.width = `${progressPct}%`;
        
        // Populate stats counts
        document.getElementById("profile-stat-taken").textContent = data.stats.takenCount;
        document.getElementById("profile-stat-created").textContent = data.stats.createdCount;
        document.getElementById("profile-stat-accuracy").textContent = `${data.stats.avgAccuracy}%`;
        document.getElementById("profile-stat-xp").textContent = data.stats.totalXp;
        
        // Render History Table
        historyBody.innerHTML = "";
        
        if (data.attempts.length === 0) {
            historyEmpty.classList.remove("hidden");
            document.querySelector("#pane-history table").classList.add("hidden");
        } else {
            historyEmpty.classList.add("hidden");
            document.querySelector("#pane-history table").classList.remove("hidden");
            
            data.attempts.forEach(attempt => {
                const tr = document.createElement("tr");
                const dateObj = new Date(attempt.date);
                const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                const scorePct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                
                tr.innerHTML = `
                    <td><strong>${attempt.quizTitle}</strong></td>
                    <td><span class="card-tag topic-tag">${attempt.topic}</span></td>
                    <td><span class="stat-mini-val" style="font-size: 1rem;">${attempt.score}/${attempt.totalQuestions} (${scorePct}%)</span></td>
                    <td>${formattedDate}</td>
                    <td>${attempt.timeTaken}</td>
                `;
                historyBody.appendChild(tr);
            });
        }
        
        // Render Created Quizzes Table
        createdBody.innerHTML = "";
        
        if (data.createdQuizzes.length === 0) {
            createdEmpty.classList.remove("hidden");
            document.querySelector("#pane-myquizzes table").classList.add("hidden");
        } else {
            createdEmpty.classList.add("hidden");
            document.querySelector("#pane-myquizzes table").classList.remove("hidden");
            
            data.createdQuizzes.forEach(quiz => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${quiz.title}</strong></td>
                    <td><span class="card-tag topic-tag">${quiz.topic}</span></td>
                    <td>${quiz.difficulty}</td>
                    <td>${quiz.questionsCount} Qs</td>
                    <td>
                        <div class="actions-cell-btns">
                            <button class="btn btn-sm btn-danger delete-quiz-btn" data-id="${quiz.id}">
                                <i data-lucide="trash-2"></i> Delete
                            </button>
                        </div>
                    </td>
                `;
                
                tr.querySelector(".delete-quiz-btn").addEventListener("click", (e) => {
                    const deleteId = e.currentTarget.dataset.id;
                    handleDeleteQuiz(deleteId);
                });
                
                createdBody.appendChild(tr);
            });
        }
    } catch (err) {
        historyBody.innerHTML = "<tr><td colspan='5' class='text-center' style='color: var(--danger);'>Failed to load history data.</td></tr>";
        createdBody.innerHTML = "<tr><td colspan='5' class='text-center' style='color: var(--danger);'>Failed to load created data.</td></tr>";
    }
    
    lucide.createIcons();
}

async function handleDeleteQuiz(quizId) {
    if (!confirm("Are you sure you want to delete this quiz? This action is permanent.")) return;
    
    try {
        const response = await fetch(`${API_BASE}/api/quizzes/${quizId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error();
        alert("Quiz successfully deleted.");
        renderProfile();
    } catch (err) {
        alert("Failed to delete quiz. Please try again.");
    }
}

// --- 11. USER AUTHENTICATION HANDLERS ---

function openAuthModal() {
    document.getElementById("auth-modal").classList.remove("hidden");
    toggleAuthTab("login");
}

function closeAuthModal() {
    document.getElementById("auth-modal").classList.add("hidden");
    document.getElementById("login-error-msg").classList.add("hidden");
    document.getElementById("register-error-msg").classList.add("hidden");
}

function toggleAuthTab(mode) {
    const tabLogin = document.getElementById("auth-tab-login");
    const tabRegister = document.getElementById("auth-tab-register");
    const formLogin = document.getElementById("login-form");
    const formRegister = document.getElementById("register-form");
    
    if (mode === "login") {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        formLogin.classList.remove("hidden");
        formRegister.classList.add("hidden");
    } else {
        tabLogin.classList.remove("active");
        tabRegister.classList.add("active");
        formLogin.classList.add("hidden");
        formRegister.classList.remove("hidden");
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error-msg");
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Invalid credentials');
        }
        
        const data = await response.json();
        
        // Save JWT & User
        localStorage.setItem("qv_auth_token", data.token);
        state.currentUser = data.user;
        sessionStorage.setItem("qv_logged_user", JSON.stringify(data.user));
        
        closeAuthModal();
        renderHeaderAuth();
        navigateTo("profile-view");
        
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const errorEl = document.getElementById("register-error-msg");
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Registration failed');
        }
        
        const data = await response.json();
        
        // Save JWT & User
        localStorage.setItem("qv_auth_token", data.token);
        state.currentUser = data.user;
        sessionStorage.setItem("qv_logged_user", JSON.stringify(data.user));
        
        closeAuthModal();
        renderHeaderAuth();
        alert(`Account created successfully! Welcome ${username}.`);
        navigateTo("profile-view");
        
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
    }
}

function handleLogout() {
    state.currentUser = null;
    localStorage.removeItem("qv_auth_token");
    sessionStorage.removeItem("qv_logged_user");
    renderHeaderAuth();
    navigateTo("home-view");
}

async function checkActiveSession() {
    const token = localStorage.getItem("qv_auth_token");
    if (!token) return;
    
    try {
        // Query server to verify token and retrieve latest stats
        const response = await fetch(`${API_BASE}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            state.currentUser = user;
            sessionStorage.setItem("qv_logged_user", JSON.stringify(user));
            renderHeaderAuth();
        } else {
            // Token expired/invalid
            handleLogout();
        }
    } catch (err) {
        console.error('Session verify failed:', err);
    }
}

// --- 12. DOM EVENTS HOOKUP ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Check active sessions (fetches from server profile api)
    checkActiveSession();
    
    // 2. Default home navigation
    navigateTo("home-view");
    
    // --- Header Nav links events ---
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", (e) => {
            const viewId = e.currentTarget.dataset.view;
            if (viewId === "create-view" && !state.currentUser) {
                alert("You need to sign in to create a quiz!");
                openAuthModal();
            } else {
                navigateTo(viewId);
            }
        });
    });
    
    document.getElementById("nav-logo-btn").addEventListener("click", (e) => {
        e.preventDefault();
        navigateTo("home-view");
    });
    
    // --- Hero buttons (Home page) ---
    document.getElementById("hero-explore-btn").addEventListener("click", () => {
        navigateTo("browse-view");
    });
    
    document.getElementById("hero-create-btn").addEventListener("click", () => {
        if (!state.currentUser) {
            alert("You need to sign in to create a quiz!");
            openAuthModal();
        } else {
            navigateTo("create-view");
        }
    });
    
    document.getElementById("home-view-all-quizzes-btn").addEventListener("click", () => {
        navigateTo("browse-view");
    });
    
    // --- Topic selector cleanups ---
    document.getElementById("clear-topic-filter-btn").addEventListener("click", () => {
        state.selectedTopic = null;
        document.getElementById("topic-quizzes-section").classList.add("hidden");
    });
    
    // --- Browse / Explore filtering events ---
    document.getElementById("quiz-search-input").addEventListener("input", applyBrowseFilters);
    document.getElementById("filter-topic-select").addEventListener("change", applyBrowseFilters);
    document.getElementById("filter-difficulty-select").addEventListener("change", applyBrowseFilters);
    document.getElementById("empty-state-create-btn").addEventListener("click", () => {
        if (!state.currentUser) {
            openAuthModal();
        } else {
            navigateTo("create-view");
        }
    });
    
    // --- Auth modal toggle / action events ---
    document.getElementById("auth-modal-close-btn").addEventListener("click", closeAuthModal);
    document.getElementById("auth-tab-login").addEventListener("click", () => toggleAuthTab("login"));
    document.getElementById("auth-tab-register").addEventListener("click", () => toggleAuthTab("register"));
    document.getElementById("login-form").addEventListener("submit", handleLoginSubmit);
    document.getElementById("register-form").addEventListener("submit", handleRegisterSubmit);
    
    // --- Quiz creation dynamic builder events ---
    document.getElementById("quiz-title-input").addEventListener("input", updateLivePreviewCard);
    document.getElementById("quiz-desc-input").addEventListener("input", updateLivePreviewCard);
    document.getElementById("quiz-difficulty-input").addEventListener("change", updateLivePreviewCard);
    document.getElementById("quiz-duration-input").addEventListener("input", updateLivePreviewCard);
    
    document.getElementById("quiz-topic-input").addEventListener("change", (e) => {
        const customGrp = document.getElementById("custom-topic-group");
        if (e.target.value === "Other") {
            customGrp.classList.remove("hidden");
            document.getElementById("quiz-custom-topic-input").setAttribute("required", "true");
        } else {
            customGrp.classList.add("hidden");
            document.getElementById("quiz-custom-topic-input").removeAttribute("required");
        }
        updateLivePreviewCard();
    });
    
    document.getElementById("quiz-custom-topic-input").addEventListener("input", () => {
        const val = document.getElementById("quiz-custom-topic-input").value;
        document.getElementById("preview-tag-topic").textContent = val || "Other";
    });
    
    document.getElementById("add-question-btn").addEventListener("click", addQuestionBuilderBlock);
    document.getElementById("create-quiz-form").addEventListener("submit", handlePublishQuiz);
    
    // --- Quiz Runner gameplay handlers ---
    document.getElementById("player-next-btn").addEventListener("click", handleNextQuestion);
    
    document.getElementById("player-quit-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to quit? Your progress will not be saved.")) {
            clearInterval(state.quizProgress.timerInterval);
            navigateTo("browse-view");
        }
    });
    
    // --- Profile tabs switching ---
    document.getElementById("tab-history-btn").addEventListener("click", () => {
        document.getElementById("tab-history-btn").classList.add("active");
        document.getElementById("tab-myquizzes-btn").classList.remove("active");
        document.getElementById("pane-history").classList.remove("hidden");
        document.getElementById("pane-myquizzes").classList.add("hidden");
    });
    
    document.getElementById("tab-myquizzes-btn").addEventListener("click", () => {
        document.getElementById("tab-myquizzes-btn").classList.add("active");
        document.getElementById("tab-history-btn").classList.remove("active");
        document.getElementById("pane-myquizzes").classList.remove("hidden");
        document.getElementById("pane-history").classList.add("hidden");
    });
    
    document.getElementById("dashboard-create-btn").addEventListener("click", () => {
        navigateTo("create-view");
    });
});
