// ==========================================
// QUIZVERSE - APP LOGIC (VANILLA JS)
// ==========================================

// --- 1. INITIAL MOCK DATABASE AND PREPOPULATION ---
const INITIAL_QUIZZES = [
    {
        id: "quiz-1",
        title: "JavaScript Core Principles",
        description: "Test your understanding of closures, promises, event loop, hoisting, and modern ES6+ features.",
        topic: "Technology",
        difficulty: "Medium",
        duration: 10,
        author: "TechGuru",
        authorId: "user-admin",
        questions: [
            {
                text: "What is the correct way to declare a block-scoped variable in modern JavaScript?",
                options: ["var", "let", "define", "global"],
                correctAnswer: 1,
                explanation: "'let' and 'const' are block-scoped declarations introduced in ES6, whereas 'var' is function-scoped."
            },
            {
                text: "Which of the following creates a shallow copy of an array filtered by a condition?",
                options: ["array.map()", "array.forEach()", "array.filter()", "array.reduce()"],
                correctAnswer: 2,
                explanation: "The filter() method creates a new array with all elements that pass the test implemented by the provided function."
            },
            {
                text: "What is the result of evaluates typeof null in JavaScript?",
                options: ["'null'", "'undefined'", "'object'", "'boolean'"],
                correctAnswer: 2,
                explanation: "This is a historical bug in JavaScript. typeof null evaluates to 'object' because of the binary representation of values in initial versions."
            },
            {
                text: "Which function executes a callback after a specified duration (in milliseconds)?",
                options: ["setInterval()", "setTimeout()", "delay()", "wait()"],
                correctAnswer: 1,
                explanation: "setTimeout(callback, duration) schedules a single execution of the callback after the elapsed time."
            },
            {
                text: "What is the state of a Promise when it is initialized and pending resolution?",
                options: ["fulfilled", "rejected", "pending", "resolved"],
                correctAnswer: 2,
                explanation: "A Promise starts in the 'pending' state and later transitions to either 'fulfilled' or 'rejected'."
            }
        ]
    },
    {
        id: "quiz-2",
        title: "Astronomy & Solar System",
        description: "Embark on a celestial voyage. Test your facts about planetary bodies, stars, and space exploration.",
        topic: "Science",
        difficulty: "Easy",
        duration: 8,
        author: "CosmoNovice",
        authorId: "user-admin",
        questions: [
            {
                text: "Which planet is famously known as the 'Red Planet'?",
                options: ["Venus", "Mars", "Jupiter", "Mercury"],
                correctAnswer: 1,
                explanation: "Mars has a reddish tint due to the iron oxide (rust) covering its surface."
            },
            {
                text: "What is the hottest planet in our solar system?",
                options: ["Mercury", "Venus", "Mars", "Saturn"],
                correctAnswer: 1,
                explanation: "Venus is the hottest planet because its thick carbon dioxide atmosphere traps heat in a runaway greenhouse effect."
            },
            {
                text: "Which galaxy is closest to our Milky Way galaxy?",
                options: ["Andromeda", "Triangulum", "Sombrero", "Centaurus A"],
                correctAnswer: 0,
                explanation: "The Andromeda Galaxy (M31) is the nearest major galaxy to the Milky Way, located about 2.5 million light-years away."
            },
            {
                text: "How long does it take for light from the Sun to reach Earth?",
                options: ["8 seconds", "8 minutes", "8 hours", "8 days"],
                correctAnswer: 1,
                explanation: "Light travels at approx 300,000 km/s, and since the Earth is 150 million km away, it takes roughly 8 minutes and 20 seconds."
            }
        ]
    },
    {
        id: "quiz-3",
        title: "Major Events of World War II",
        description: "Evaluate your memory of historical battles, key dates, turning points, and political leaders during WWII.",
        topic: "History",
        difficulty: "Hard",
        duration: 12,
        author: "Chronos",
        authorId: "user-admin",
        questions: [
            {
                text: "In which year did World War II officially conclude?",
                options: ["1943", "1944", "1945", "1946"],
                correctAnswer: 2,
                explanation: "WWII ended on September 2, 1945, when Japan signed surrender documents onboard the USS Missouri."
            },
            {
                text: "Who was the British Prime Minister during the majority of World War II?",
                options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Anthony Eden"],
                correctAnswer: 1,
                explanation: "Winston Churchill served as UK Prime Minister from 1940 to 1945, steering the country through its wartime crisis."
            },
            {
                text: "What code name was assigned to the Allied invasion of Normandy (D-Day)?",
                options: ["Operation Barbarossa", "Operation Overlord", "Operation Sea Lion", "Operation Torch"],
                correctAnswer: 1,
                explanation: "Operation Overlord was the official code name for the D-Day landings in France on June 6, 1944."
            }
        ]
    },
    {
        id: "quiz-4",
        title: "Global Geography Masterclass",
        description: "Locate capitals, identify landmarks, and prove your geographic mastery of our world's layout.",
        topic: "Geography",
        difficulty: "Medium",
        duration: 10,
        author: "Atlas",
        authorId: "user-admin",
        questions: [
            {
                text: "What is the capital city of Australia?",
                options: ["Sydney", "Melbourne", "Brisbane", "Canberra"],
                correctAnswer: 3,
                explanation: "Canberra was selected as a compromise capital between rivals Sydney and Melbourne in 1908."
            },
            {
                text: "Which river is recognized as the longest in the entire world?",
                options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
                correctAnswer: 1,
                explanation: "Historically, the Nile is classified as the longest at 6,650 km, though some recent studies argue the Amazon holds the title."
            },
            {
                text: "Which country is bordered by both the Atlantic Ocean and the Indian Ocean?",
                options: ["Australia", "India", "South Africa", "Brazil"],
                correctAnswer: 2,
                explanation: "South Africa sits at the southern tip of the African continent, bordering both oceans near Cape Agulhas."
            }
        ]
    }
];

const INITIAL_USERS = [
    {
        id: "user-admin",
        username: "QuizVerseTeam",
        email: "team@quizverse.com",
        password: "password123",
        xp: 1500,
        level: 3
    }
];

const INITIAL_ATTEMPTS = [
    {
        id: "att-1",
        userId: "user-admin",
        quizId: "quiz-2",
        quizTitle: "Astronomy & Solar System",
        topic: "Science",
        score: 4,
        totalQuestions: 4,
        date: "2026-06-25T14:32:00.000Z",
        timeTaken: "02:15"
    },
    {
        id: "att-2",
        userId: "user-admin",
        quizId: "quiz-1",
        quizTitle: "JavaScript Core Principles",
        topic: "Technology",
        score: 4,
        totalQuestions: 5,
        date: "2026-07-01T10:15:00.000Z",
        timeTaken: "03:40"
    }
];

// --- 2. LOCAL STORAGE WRAPPERS ---
function initDatabase() {
    if (!localStorage.getItem("qv_quizzes")) {
        localStorage.setItem("qv_quizzes", JSON.stringify(INITIAL_QUIZZES));
    }
    if (!localStorage.getItem("qv_users")) {
        localStorage.setItem("qv_users", JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem("qv_attempts")) {
        localStorage.setItem("qv_attempts", JSON.stringify(INITIAL_ATTEMPTS));
    }
}

function getQuizzes() {
    return JSON.parse(localStorage.getItem("qv_quizzes")) || [];
}

function saveQuizzes(quizzes) {
    localStorage.setItem("qv_quizzes", JSON.stringify(quizzes));
}

function getUsers() {
    return JSON.parse(localStorage.getItem("qv_users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("qv_users", JSON.stringify(users));
}

function getAttempts() {
    return JSON.parse(localStorage.getItem("qv_attempts")) || [];
}

function saveAttempts(attempts) {
    localStorage.setItem("qv_attempts", JSON.stringify(attempts));
}

// --- 3. STATE MANAGEMENT ---
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

// --- 4. VIEW CONTROLLER (SPA ROUTER) ---
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

// --- 5. TOPIC DEFINITIONS ---
const TOPICS = [
    { name: "Technology", icon: "code-2", desc: "Software, hardware, languages, and web engineering.", class: "topic-tech" },
    { name: "Science", icon: "atom", desc: "Physics, biology, space, and earth science discoveries.", class: "topic-science" },
    { name: "History", icon: "landmark", desc: "Ancient worlds, historical wars, landmarks, and timeline events.", class: "topic-history" },
    { name: "Geography", icon: "globe", desc: "Capitals, maps, continents, oceans, and natural wonders.", class: "topic-geo" },
    { name: "Pop Culture", icon: "popcorn", desc: "Cinema, music, celebrity culture, and entertainment facts.", class: "topic-pop" },
    { name: "Literature", icon: "book-open", desc: "Classic books, authors, poems, and reading comprehension.", class: "topic-lit" },
    { name: "Other", icon: "help-circle", desc: "Miscellany, general knowledge, and specialized trivia.", class: "topic-other" }
];

// --- 6. RENDERERS & LAYOUT BUILDERS ---

// --- 6a. Navbar Auth status
function renderHeaderAuth() {
    const authContainer = document.getElementById("nav-auth-container");
    const dashboardLink = document.getElementById("nav-profile-btn");
    
    if (state.currentUser) {
        // Show dashboard links
        dashboardLink.classList.remove("hidden");
        
        // Show user avatar dropdown / panel
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
        
        // Wire up logout action
        document.getElementById("logout-btn").addEventListener("click", () => {
            handleLogout();
        });
        
        document.getElementById("user-menu-trigger").addEventListener("click", () => {
            navigateTo("profile-view");
        });
        
    } else {
        // Hide dashboard links
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

// --- 6b. Home Stats counters
function updateStatsCounters() {
    const quizzes = getQuizzes();
    const attempts = getAttempts();
    const users = getUsers();
    
    document.getElementById("stat-quizzes-taken").textContent = attempts.length;
    document.getElementById("stat-quizzes-created").textContent = quizzes.length;
    document.getElementById("stat-active-users").textContent = users.length;
}

// --- 6c. Topic Category Cards (Home Page)
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

// --- 6d. Topic quizzes list (revealed when category clicked)
function triggerTopicFilter(topicName) {
    state.selectedTopic = topicName;
    
    const topicSection = document.getElementById("topic-quizzes-section");
    const topicTitle = document.getElementById("selected-topic-title");
    const topicDesc = document.getElementById("selected-topic-desc");
    const grid = document.getElementById("topic-quizzes-grid");
    
    topicTitle.innerHTML = `Quizzes in <span class="text-gradient">${topicName}</span>`;
    
    // Set appropriate description
    const topicMeta = TOPICS.find(t => t.name === topicName);
    topicDesc.textContent = topicMeta ? topicMeta.desc : "Explore custom categories.";
    
    // Fetch quizzes matching
    const quizzes = getQuizzes().filter(q => q.topic.toLowerCase() === topicName.toLowerCase());
    
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
    
    // Show topic section, scroll to it
    topicSection.classList.remove("hidden");
    topicSection.scrollIntoView({ behavior: "smooth", block: "start" });
    
    lucide.createIcons();
}

// --- 6e. Helper to build reusable quiz card HTML
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
    
    // Event listener for starting
    card.querySelector(".start-quiz-btn").addEventListener("click", () => {
        loadQuizLobby(quiz.id);
    });
    
    return card;
}

// --- 6f. Featured Quizzes list
function renderFeaturedQuizzes() {
    const grid = document.getElementById("featured-quizzes-grid");
    grid.innerHTML = "";
    
    // Take the 3 most recently created quizzes as featured
    const quizzes = getQuizzes().slice(-3).reverse();
    
    quizzes.forEach(quiz => {
        grid.appendChild(createQuizCardElement(quiz));
    });
    
    lucide.createIcons();
}

// --- 7. EXPLORE/BROWSE VIEW LOGIC ---

function populateBrowseFilters() {
    // Collect all topics (including custom user ones)
    const quizzes = getQuizzes();
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
}

function applyBrowseFilters() {
    const searchVal = document.getElementById("quiz-search-input").value.toLowerCase();
    const topicVal = document.getElementById("filter-topic-select").value;
    const diffVal = document.getElementById("filter-difficulty-select").value;
    
    const quizzes = getQuizzes();
    
    const filtered = quizzes.filter(quiz => {
        // Search filter
        const matchSearch = quiz.title.toLowerCase().includes(searchVal) || 
                            quiz.description.toLowerCase().includes(searchVal) ||
                            (quiz.author && quiz.author.toLowerCase().includes(searchVal));
                            
        // Topic filter
        const matchTopic = topicVal === "all" || quiz.topic.toLowerCase() === topicVal.toLowerCase();
        
        // Difficulty filter
        const matchDiff = diffVal === "all" || quiz.difficulty.toLowerCase() === diffVal.toLowerCase();
        
        return matchSearch && matchTopic && matchDiff;
    });
    
    const grid = document.getElementById("browse-quizzes-grid");
    const emptyState = document.getElementById("browse-empty-state");
    
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
    
    lucide.createIcons();
}

// --- 8. QUIZ RUNNER / TAKE QUIZ GAMEPLAY ---

function loadQuizLobby(quizId) {
    const quizzes = getQuizzes();
    const quiz = quizzes.find(q => q.id === quizId);
    
    if (!quiz) {
        alert("Quiz not found.");
        return;
    }
    
    state.activeQuiz = quiz;
    
    // Hide all views, display quiz-runner-view
    navigateTo("quiz-runner-view");
    
    // Set up lobby
    document.getElementById("quiz-lobby-container").classList.remove("hidden");
    document.getElementById("quiz-player-container").classList.add("hidden");
    
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
    
    lucide.createIcons();
}

function startQuiz() {
    if (!state.activeQuiz) return;
    
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
    
    // Alert styles for urgent timer (< 60 seconds)
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
    
    // Update footer buttons (Show "Finish Quiz" if last question)
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
    
    // Redraw selection highlighting
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
    
    // Validate selection
    if (state.quizProgress.selectedAnswers[qIndex] === null) {
        document.getElementById("player-warning-select").classList.remove("hidden");
        return;
    }
    
    if (qIndex < state.activeQuiz.questions.length - 1) {
        state.quizProgress.currentIndex++;
        renderActiveQuestion();
    } else {
        // End of quiz reached
        submitQuizResults();
    }
}

// --- 9. SUBMIT RESULTS AND ANALYTICS ---

function submitQuizResults() {
    clearInterval(state.quizProgress.timerInterval);
    
    const quiz = state.activeQuiz;
    const questions = quiz.questions;
    const answers = state.quizProgress.selectedAnswers;
    
    // Calculate correct tally
    let correctCount = 0;
    questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) {
            correctCount++;
        }
    });
    
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const scoreVal = correctCount;
    
    // Calculate elapsed time
    const timeSpentMs = new Date() - state.quizProgress.startTime;
    const timeSpentMins = Math.floor(timeSpentMs / 60000);
    const timeSpentSecs = Math.floor((timeSpentMs % 60000) / 1000);
    const timeSpentStr = `${timeSpentMins.toString().padStart(2, '0')}:${timeSpentSecs.toString().padStart(2, '0')}`;
    
    // XP Calculation: 20 XP per correct answer, bonus 50 XP if 100% correct
    let xpGain = correctCount * 20;
    if (correctCount === questions.length) xpGain += 50;
    
    // Log attempt details if a user is logged in
    let attemptId = null;
    if (state.currentUser) {
        const attempts = getAttempts();
        attemptId = "att-" + Date.now();
        const newAttempt = {
            id: attemptId,
            userId: state.currentUser.id,
            quizId: quiz.id,
            quizTitle: quiz.title,
            topic: quiz.topic,
            score: scoreVal,
            totalQuestions: questions.length,
            date: new Date().toISOString(),
            timeTaken: timeSpentStr
        };
        attempts.push(newAttempt);
        saveAttempts(attempts);
        
        // Update user XP & Level
        const users = getUsers();
        const userInDb = users.find(u => u.id === state.currentUser.id);
        if (userInDb) {
            userInDb.xp = (userInDb.xp || 0) + xpGain;
            
            // Calculate Level: every 500 XP is a level
            userInDb.level = Math.floor(userInDb.xp / 500) + 1;
            
            saveUsers(users);
            state.currentUser = userInDb; // sync local state
            renderHeaderAuth();
        }
    }
    
    // Show results view
    displayResultsView(quiz, correctCount, accuracy, xpGain, timeSpentStr);
}

function displayResultsView(quiz, correctCount, accuracy, xpGain, timeSpentStr) {
    navigateTo("results-view");
    
    // Score ring percentage animation setup
    document.getElementById("results-percentage").textContent = `${accuracy}%`;
    document.getElementById("results-score-text").textContent = `${correctCount} / ${quiz.questions.length} Correct`;
    
    // Animate stroke circle fill
    const circle = document.getElementById("results-ring-fill");
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    // Math logic: dashoffset mapping
    const offset = circumference - (accuracy / 100) * circumference;
    
    // Delay slightly to trigger visual transition
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
    
    // Rank evaluation badge
    let rank = "Novice";
    let badgeTitle = "Starter Mind";
    let badgeDesc = "A nice try. Keep practicing to boost your scores!";
    
    if (accuracy === 100) {
        rank = "Grandmaster";
        badgeTitle = "Perfect Brain";
        badgeDesc = "Flawless score! Unbeatable understanding of this topic.";
    } else if (accuracy >= 80) {
        rank = "Scholar";
        badgeTitle = "Quiz Guru";
        badgeDesc = "Excellent! You have a profound command of this topic.";
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
    
    // Render detailed review list
    const reviewContainer = document.getElementById("results-review-container");
    reviewContainer.innerHTML = "";
    
    quiz.questions.forEach((q, qIdx) => {
        const userAnswerIdx = state.quizProgress.selectedAnswers[qIdx];
        const isCorrect = userAnswerIdx === q.correctAnswer;
        
        const card = document.createElement("div");
        card.className = "review-card collapsed"; // default collapsed
        
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
                        else if (optIdx === userAnswerIdx && !isCorrect) optClass = "wrong-ans";
                        
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
        
        // Add collapse / expand click listener
        card.querySelector(".review-card-header").addEventListener("click", () => {
            card.classList.toggle("collapsed");
        });
        
        reviewContainer.appendChild(card);
    });
    
    lucide.createIcons();
}

// --- 10. DYNAMIC QUIZ CREATION FORM ENGINE ---

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
    
    // Append 1 initial question block
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
    
    // Wire up events for live updates
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
    
    // Wire up delete buttons
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
    // Delete from state array
    state.tempQuestions.splice(index, 1);
    
    // Redraw entire builder container based on updated state
    const container = document.getElementById("questions-builder-container");
    container.innerHTML = "";
    
    const oldTemp = [...state.tempQuestions];
    state.tempQuestions = [];
    
    oldTemp.forEach((q, idx) => {
        addQuestionBuilderBlock();
        
        // Restore values in elements
        const card = document.getElementById(`q-builder-${idx}`);
        card.querySelector(".q-text-input").value = q.text;
        
        const optInputs = card.querySelectorAll(".q-opt-input");
        q.options.forEach((optVal, optIdx) => {
            optInputs[optIdx].value = optVal;
        });
        
        const radios = card.querySelectorAll(`input[type="radio"]`);
        radios[q.correctAnswer].checked = true;
        
        card.querySelector(".q-explanation-input").value = q.explanation;
        
        // Save current values back
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
    
    // Topic tag
    const previewTopic = document.getElementById("preview-tag-topic");
    previewTopic.textContent = topicVal || "General";
    
    // Difficulty badge
    const diffTag = document.getElementById("preview-tag-difficulty");
    diffTag.textContent = diffVal;
    diffTag.className = "card-tag difficulty-tag " + 
        (diffVal === "Easy" ? "tag-easy" : (diffVal === "Medium" ? "tag-medium" : "tag-hard"));
        
    document.getElementById("preview-card-qcount").textContent = state.tempQuestions.length;
    document.getElementById("preview-card-duration").textContent = durationVal || 10;
}

function handlePublishQuiz(e) {
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
    
    const newQuiz = {
        id: "quiz-" + Date.now(),
        title: title,
        description: desc,
        topic: finalTopic,
        difficulty: difficulty,
        duration: duration,
        author: state.currentUser.username,
        authorId: state.currentUser.id,
        questions: [...state.tempQuestions]
    };
    
    // Add to LocalStorage Database
    const quizzes = getQuizzes();
    quizzes.push(newQuiz);
    saveQuizzes(quizzes);
    
    // Update user stats (give creator 100 XP)
    const users = getUsers();
    const userInDb = users.find(u => u.id === state.currentUser.id);
    if (userInDb) {
        userInDb.xp = (userInDb.xp || 0) + 100;
        userInDb.level = Math.floor(userInDb.xp / 500) + 1;
        saveUsers(users);
        state.currentUser = userInDb; // sync local
        renderHeaderAuth();
    }
    
    alert(`Successfully published "${title}"! You earned +100 XP.`);
    
    // Navigate to Browse
    navigateTo("browse-view");
}

// --- 11. DASHBOARD / USER PROFILE RENDERER ---

function renderProfile() {
    if (!state.currentUser) {
        navigateTo("home-view");
        return;
    }
    
    // Set Profile Header details
    document.getElementById("profile-avatar-placeholder").textContent = state.currentUser.username.substring(0, 1).toUpperCase();
    document.getElementById("profile-username").textContent = state.currentUser.username;
    document.getElementById("profile-email").textContent = state.currentUser.email;
    
    // Level & XP math
    const currentXp = state.currentUser.xp || 0;
    const currentLevel = state.currentUser.level || 1;
    const nextLevelXp = currentLevel * 500;
    const prevLevelXp = (currentLevel - 1) * 500;
    const progressInLevel = currentXp - prevLevelXp;
    const xpRequiredForLevel = 500;
    const progressPct = Math.min(100, (progressInLevel / xpRequiredForLevel) * 100);
    
    document.getElementById("profile-level-badge").textContent = `Level ${currentLevel} Scholar`;
    document.getElementById("profile-current-xp").textContent = `${currentXp} Total XP`;
    document.getElementById("profile-next-level-xp").textContent = `Level Up at ${nextLevelXp} XP`;
    document.getElementById("profile-xp-bar-fill").style.width = `${progressPct}%`;
    
    // Calculate stats
    const allAttempts = getAttempts();
    const userAttempts = allAttempts.filter(a => a.userId === state.currentUser.id);
    
    const allQuizzes = getQuizzes();
    const userCreatedQuizzes = allQuizzes.filter(q => q.authorId === state.currentUser.id);
    
    // Average accuracy
    let avgAccuracy = 0;
    if (userAttempts.length > 0) {
        let totalAccuracyPct = 0;
        userAttempts.forEach(att => {
            totalAccuracyPct += (att.score / att.totalQuestions) * 100;
        });
        avgAccuracy = Math.round(totalAccuracyPct / userAttempts.length);
    }
    
    document.getElementById("profile-stat-taken").textContent = userAttempts.length;
    document.getElementById("profile-stat-created").textContent = userCreatedQuizzes.length;
    document.getElementById("profile-stat-accuracy").textContent = `${avgAccuracy}%`;
    document.getElementById("profile-stat-xp").textContent = currentXp;
    
    // Render History Table
    const historyBody = document.getElementById("history-table-body");
    const historyEmpty = document.getElementById("history-empty-state");
    
    historyBody.innerHTML = "";
    
    if (userAttempts.length === 0) {
        historyEmpty.classList.remove("hidden");
        document.querySelector("#pane-history table").classList.add("hidden");
    } else {
        historyEmpty.classList.add("hidden");
        document.querySelector("#pane-history table").classList.remove("hidden");
        
        userAttempts.reverse().forEach(attempt => {
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
    const createdBody = document.getElementById("myquizzes-table-body");
    const createdEmpty = document.getElementById("myquizzes-empty-state");
    
    createdBody.innerHTML = "";
    
    if (userCreatedQuizzes.length === 0) {
        createdEmpty.classList.remove("hidden");
        document.querySelector("#pane-myquizzes table").classList.add("hidden");
    } else {
        createdEmpty.classList.add("hidden");
        document.querySelector("#pane-myquizzes table").classList.remove("hidden");
        
        userCreatedQuizzes.forEach(quiz => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${quiz.title}</strong></td>
                <td><span class="card-tag topic-tag">${quiz.topic}</span></td>
                <td>${quiz.difficulty}</td>
                <td>${quiz.questions.length} Qs</td>
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
    
    lucide.createIcons();
}

function handleDeleteQuiz(quizId) {
    if (!confirm("Are you sure you want to delete this quiz? This action is permanent.")) return;
    
    const quizzes = getQuizzes();
    const updated = quizzes.filter(q => q.id !== quizId);
    saveQuizzes(updated);
    
    alert("Quiz successfully deleted.");
    renderProfile();
}

// --- 12. USER AUTHENTICATION HANDLERS ---

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

function handleLoginSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error-msg");
    
    const users = getUsers();
    const matchedUser = users.find(u => u.email === email && u.password === password);
    
    if (!matchedUser) {
        errorEl.textContent = "Invalid email address or password combination.";
        errorEl.classList.remove("hidden");
        return;
    }
    
    // Auth Successful
    state.currentUser = matchedUser;
    sessionStorage.setItem("qv_logged_user", JSON.stringify(matchedUser));
    
    closeAuthModal();
    renderHeaderAuth();
    
    // Navigate to profile dashboard
    navigateTo("profile-view");
}

function handleRegisterSubmit(e) {
    e.preventDefault();
    
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim().toLowerCase();
    const password = document.getElementById("register-password").value;
    const errorEl = document.getElementById("register-error-msg");
    
    const users = getUsers();
    
    // Check if email taken
    if (users.some(u => u.email === email)) {
        errorEl.textContent = "This email is already registered.";
        errorEl.classList.remove("hidden");
        return;
    }
    
    // Check if username taken
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        errorEl.textContent = "This username is already taken.";
        errorEl.classList.remove("hidden");
        return;
    }
    
    // Create new user object
    const newUser = {
        id: "user-" + Date.now(),
        username: username,
        email: email,
        password: password,
        xp: 0,
        level: 1
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Log them in immediately
    state.currentUser = newUser;
    sessionStorage.setItem("qv_logged_user", JSON.stringify(newUser));
    
    closeAuthModal();
    renderHeaderAuth();
    
    alert(`Account created successfully! Welcome ${username}.`);
    
    // Navigate to Profile
    navigateTo("profile-view");
}

function handleLogout() {
    state.currentUser = null;
    sessionStorage.removeItem("qv_logged_user");
    renderHeaderAuth();
    navigateTo("home-view");
}

function checkActiveSession() {
    const sessionUser = sessionStorage.getItem("qv_logged_user");
    if (sessionUser) {
        state.currentUser = JSON.parse(sessionUser);
    }
}

// --- 13. DOM EVENTS HOOKUP ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize databases
    initDatabase();
    
    // 2. Check active logins
    checkActiveSession();
    
    // 3. Render header authentication panel state
    renderHeaderAuth();
    
    // 4. Default home navigation
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
    
    // --- Lobby gameplay launch events ---
    document.getElementById("lobby-cancel-btn").addEventListener("click", () => navigateTo("browse-view"));
    document.getElementById("lobby-start-btn").addEventListener("click", startQuiz);
    
    // --- Quiz Runner active gameplay navigation ---
    document.getElementById("player-next-btn").addEventListener("click", handleNextQuestion);
    
    document.getElementById("player-quit-btn").addEventListener("click", () => {
        if (confirm("Are you sure you want to quit? Your progress will not be saved.")) {
            clearInterval(state.quizProgress.timerInterval);
            navigateTo("browse-view");
        }
    });
    
    // --- Results screen options ---
    document.getElementById("results-retry-btn").addEventListener("click", () => {
        if (state.activeQuiz) {
            loadQuizLobby(state.activeQuiz.id);
        }
    });
    
    document.getElementById("results-browse-btn").addEventListener("click", () => {
        navigateTo("browse-view");
    });
    
    // --- Profile/Dashboard inner tabs toggling ---
    document.getElementById("tab-history-btn").addEventListener("click", (e) => {
        document.getElementById("tab-history-btn").classList.add("active");
        document.getElementById("tab-myquizzes-btn").classList.remove("active");
        document.getElementById("pane-history").classList.remove("hidden");
        document.getElementById("pane-myquizzes").classList.add("hidden");
    });
    
    document.getElementById("tab-myquizzes-btn").addEventListener("click", (e) => {
        document.getElementById("tab-myquizzes-btn").classList.add("active");
        document.getElementById("tab-history-btn").classList.remove("active");
        document.getElementById("pane-myquizzes").classList.remove("hidden");
        document.getElementById("pane-history").classList.add("hidden");
    });
    
    document.getElementById("dashboard-create-btn").addEventListener("click", () => {
        navigateTo("create-view");
    });
});
