// Game Data
const countries = [
    { name: 'Indonesia', flag: 'bendera/id.png', region: 'Asia' },
    { name: 'Malaysia', flag: 'bendera/my.png', region: 'Asia' },
    { name: 'Singapura', flag: 'bendera/sg.png', region: 'Asia' },
    { name: 'Thailand', flag: 'bendera/th.png', region: 'Asia' },
    { name: 'Filipina', flag: 'bendera/ph.png', region: 'Asia' },
    { name: 'Vietnam', flag: 'bendera/vn.png', region: 'Asia' },
    { name: 'Jepang', flag: 'bendera/jp.png', region: 'Asia' },
    { name: 'Korea Selatan', flag: 'bendera/kr.png', region: 'Asia' },
    { name: 'China', flag: 'bendera/cn.png', region: 'Asia' },
    { name: 'India', flag: 'bendera/in.png', region: 'Asia' },
    { name: 'Amerika Serikat', flag: 'bendera/us.png', region: 'Amerika' },
    { name: 'Kanada', flag: 'bendera/ca.png', region: 'Amerika' },
    { name: 'Brazil', flag: 'bendera/br.png', region: 'Amerika' },
    { name: 'Argentina', flag: 'bendera/ar.png', region: 'Amerika' },
    { name: 'Meksiko', flag: 'bendera/mx.png', region: 'Amerika' },
    { name: 'Inggris', flag: 'bendera/gb.png', region: 'Eropa' },
    { name: 'Prancis', flag: 'bendera/fr.png', region: 'Eropa' },
    { name: 'Jerman', flag: 'bendera/de.png', region: 'Eropa' },
    { name: 'Italia', flag: 'bendera/it.png', region: 'Eropa' },
    { name: 'Spanyol', flag: 'bendera/es.png', region: 'Eropa' },
    { name: 'Belanda', flag: 'bendera/nl.png', region: 'Eropa' },
    { name: 'Rusia', flag: 'bendera/ru.png', region: 'Eropa' },
    { name: 'Turki', flag: 'bendera/tr.png', region: 'Eropa' },
    { name: 'Mesir', flag: 'bendera/eg.png', region: 'Afrika' },
    { name: 'Afrika Selatan', flag: 'bendera/za.png', region: 'Afrika' },
    { name: 'Nigeria', flag: 'bendera/ng.png', region: 'Afrika' },
    { name: 'Australia', flag: 'bendera/au.png', region: 'Oseania' },
    { name: 'Selandia Baru', flag: 'bendera/nz.png', region: 'Oseania' },
    { name: 'Arab Saudi', flag: 'bendera/sa.png', region: 'Asia' },
    { name: 'Uni Emirat Arab', flag: 'bendera/ae.png', region: 'Asia' }
];

// Game State
let score = 0;
let total = 0;
let streak = 0;
let bestStreak = 0;
let currentQuestion = null;
let isMuted = false;
let showingAnswer = false;
let lives = 3;
let isGameActive = false;
let bgmVolume = 0.3;        
let sfxVolume = 0.6;

// Audio Elements
let bgm, lobbyMusic, gameOverMusic, clickSound, correctSound, wrongSound, streakSound;

// Initialize Audio
function initAudio() {
    // Background music untuk gameplay
    bgm = new Audio('bgm/backsound.mp3');
    bgm.loop = true;
    bgm.volume = bgmVolume;

    // Lobby music
    lobbyMusic = new Audio('bgm/lobby.mp3');
    lobbyMusic.loop = true;
    lobbyMusic.volume = bgmVolume;

    // Game over music
    gameOverMusic = new Audio('bgm/kalah.mp3');
    gameOverMusic.loop = false;
    gameOverMusic.volume = bgmVolume;

    // Sound effects
    clickSound = new Audio('bgm/click.mp3');
    clickSound.volume = sfxVolume * 0.8;

    correctSound = new Audio('bgm/benar.mp3');
    correctSound.volume = sfxVolume;

    wrongSound = new Audio('bgm/salah.mp3');
    wrongSound.volume = sfxVolume * 0.8;

    streakSound = new Audio('bgm/strike.mp3');
    streakSound.volume = sfxVolume;
}

function playSound(sound) {
    if (!isMuted && sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio play failed:', e));
    }
}

function toggleMute() {
    isMuted = !isMuted;
    document.getElementById('muteBtn').textContent = isMuted ? '🔇' : '🔊';
    
    if (isMuted) {
        if (bgm) bgm.volume = 0;
        if (lobbyMusic) lobbyMusic.volume = 0;
        if (gameOverMusic) gameOverMusic.volume = 0;
    } else {
        if (bgm) bgm.volume = bgmVolume;
        if (lobbyMusic) lobbyMusic.volume = bgmVolume;
        if (gameOverMusic) gameOverMusic.volume = bgmVolume;
    }
}

function startGame() {
    playSound(clickSound);
    
    // Initialize audio jika belum diinisialisasi
    if (!bgm) {
        initAudio();
    }
    
    // Stop lobby music
    if (lobbyMusic) {
        lobbyMusic.pause();
        lobbyMusic.currentTime = 0;
    }
    
    // Sembunyikan semua screen
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.add('hidden');
    document.getElementById('aboutScreen').classList.add('hidden');
    document.getElementById('gameOverModal').classList.add('hidden');
    
    // Tampilkan game screen
    document.getElementById('gameScreen').classList.remove('hidden');
    
    // Reset game state
    score = 0;
    total = 0;
    streak = 0;
    lives = 3;
    showingAnswer = false;
    isGameActive = true;
    
    // Update tampilan stats
    updateStats();
    
    // Generate pertanyaan pertama
    generateQuestion();
    
    // Play background music (gameplay)
    if (bgm && !isMuted) {
        bgm.currentTime = 0;
        bgm.play().catch(e => console.log('BGM play failed:', e));
    }
}

function generateQuestion() {
    showingAnswer = false;
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('nextBtn').classList.add('hidden');
    
    // Select random correct answer
    currentQuestion = countries[Math.floor(Math.random() * countries.length)];
    
    // Select 3 wrong answers
    const wrongAnswers = countries
        .filter(c => c.name !== currentQuestion.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    // Combine and shuffle
    const options = [currentQuestion, ...wrongAnswers]
        .sort(() => Math.random() - 0.5);
    
    // Display question
    document.getElementById('flagImage').src = currentQuestion.flag;
    document.getElementById('region').textContent = currentQuestion.region;
    
    // Display options
    const optionsGrid = document.getElementById('optionsGrid');
    optionsGrid.innerHTML = '';
    
    options.forEach(country => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = country.name;
        btn.onclick = () => handleAnswer(country);
        optionsGrid.appendChild(btn);
    });
}

function handleAnswer(selectedCountry) {
    if (showingAnswer || !isGameActive) return;

    playSound(clickSound);
    showingAnswer = true;
    total++;

    const buttons = document.querySelectorAll('.option-btn');
    const feedback = document.getElementById('feedback');

    if (selectedCountry.name === currentQuestion.name) {
        // Jawaban benar
        score++;
        streak++;

        if (streak > bestStreak) {
            bestStreak = streak;
        }

        buttons.forEach(btn => {
            if (btn.textContent === currentQuestion.name) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('disabled');
            }
            btn.disabled = true;
        });

        if (streak >= 3) {
            if (streak % 3 === 0) {
                setTimeout(() => playSound(streakSound), 200);
            } else {
                setTimeout(() => playSound(correctSound), 200);
            }
            feedback.textContent = `🎉 Benar! Streak ${streak}x! Luar biasa!`;
        } else {
            setTimeout(() => playSound(correctSound), 200);
            feedback.textContent = '🎉 Benar! Luar biasa!';
        }
        feedback.className = 'feedback correct';
        
    } else {
        // Jawaban salah
        streak = 0;
        lives--;
        
        console.log('Lives remaining:', lives); // Debug log

        buttons.forEach(btn => {
            if (btn.textContent === currentQuestion.name) {
                btn.classList.add('correct');
            } else if (btn.textContent === selectedCountry.name) {
                btn.classList.add('wrong');
            } else {
                btn.classList.add('disabled');
            }
            btn.disabled = true;
        });

        setTimeout(() => playSound(wrongSound), 200);
        feedback.textContent = `❌ Salah! Ini adalah bendera ${currentQuestion.name} (${currentQuestion.region})`;
        feedback.className = 'feedback wrong';
    }

    feedback.classList.remove('hidden');

    // Update stats terlebih dahulu
    updateStats();

    // Cek game over
    if (lives <= 0) {
        console.log('Game Over! Lives:', lives); // Debug log
        isGameActive = false;
        setTimeout(() => {
            console.log('Calling showGameOver()'); // Debug log
            showGameOver();
        }, 1500);
    } else {
        document.getElementById('nextBtn').classList.remove('hidden');
    }
}

function nextQuestion() {
    playSound(clickSound);
    generateQuestion();
}

function resetGame() {
    playSound(clickSound);
    
    // Stop semua musik
    if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
    }
    if (gameOverMusic) {
        gameOverMusic.pause();
        gameOverMusic.currentTime = 0;
    }
    
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    
    // Reset semua state
    score = 0;
    total = 0;
    streak = 0;
    bestStreak = 0;
    lives = 3;
    showingAnswer = false;
    isGameActive = false;
    
    // Play lobby music
    if (lobbyMusic && !isMuted) {
        lobbyMusic.currentTime = 0;
        lobbyMusic.play().catch(e => console.log('Lobby music play failed:', e));
    }
}

function updateStats() {
    document.getElementById('score').textContent = score;
    document.getElementById('total').textContent = total;
    document.getElementById('streak').textContent = streak;
    document.getElementById('bestStreak').textContent = bestStreak;
    document.getElementById('lives').textContent = lives;
    
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
}

function showSettings() {
    playSound(clickSound);
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('settingsScreen').classList.remove('hidden');
}

function showAbout() {
    playSound(clickSound);
    document.getElementById('welcomeScreen').classList.add('hidden');
    document.getElementById('aboutScreen').classList.remove('hidden');
}

function backToMenu() {
    playSound(clickSound);
    document.getElementById('settingsScreen').classList.add('hidden');
    document.getElementById('aboutScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
}

function adjustBGMVolume(value) {
    bgmVolume = value / 100;
    document.getElementById('bgmVolumeValue').textContent = value + '%';
    if (!isMuted) {
        if (bgm) bgm.volume = bgmVolume;
        if (lobbyMusic) lobbyMusic.volume = bgmVolume;
        if (gameOverMusic) gameOverMusic.volume = bgmVolume;
    }
}

function adjustSFXVolume(value) {
    sfxVolume = value / 100;
    document.getElementById('sfxVolumeValue').textContent = value + '%';
    
    if (clickSound) clickSound.volume = sfxVolume * 0.8;
    if (correctSound) correctSound.volume = sfxVolume;
    if (wrongSound) wrongSound.volume = sfxVolume * 0.8;
    if (streakSound) streakSound.volume = sfxVolume;
}

function showGameOver() {
    // Hentikan background music gameplay
    if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
    }
    
    isGameActive = false;
    
    // Update final stats
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalTotal').textContent = total;
    document.getElementById('finalBestStreak').textContent = bestStreak;
    
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    
    // Tampilkan modal game over
    const gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.classList.remove('hidden');
    gameOverModal.style.display = 'flex';
    
    // Play game over music
    if (gameOverMusic && !isMuted) {
        gameOverMusic.currentTime = 0;
        gameOverMusic.play().catch(e => console.log('Game Over music play failed:', e));
    }
    
    console.log('Game Over Modal Shown'); // Debug log
}

function restartGame() {
    playSound(clickSound);
    
    const gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.classList.add('hidden');
    gameOverModal.style.display = 'none';
    
    // Stop game over music
    if (gameOverMusic) {
        gameOverMusic.pause();
        gameOverMusic.currentTime = 0;
    }
    
    // Reset game state
    score = 0;
    total = 0;
    streak = 0;
    lives = 3;
    showingAnswer = false;
    isGameActive = true;
    
    updateStats();
    generateQuestion();
    
    // Play gameplay music
    if (bgm && !isMuted) {
        bgm.currentTime = 0;
        bgm.play().catch(e => console.log('BGM play failed:', e));
    }
}

function backToMenuFromGame() {
    playSound(clickSound);
    
    // Stop semua musik
    if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
    }
    if (gameOverMusic) {
        gameOverMusic.pause();
        gameOverMusic.currentTime = 0;
    }
    
    const gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.classList.add('hidden');
    gameOverModal.style.display = 'none';
    
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('welcomeScreen').classList.remove('hidden');
    
    // Reset semua state
    score = 0;
    total = 0;
    streak = 0;
    bestStreak = 0;
    lives = 3;
    showingAnswer = false;
    isGameActive = false;
    
    // Play lobby music
    if (lobbyMusic && !isMuted) {
        lobbyMusic.currentTime = 0;
        lobbyMusic.play().catch(e => console.log('Lobby music play failed:', e));
    }
}

// Event Listeners
window.addEventListener('DOMContentLoaded', function() {
    // Initialize audio
    initAudio();
    
    // Pastikan semua screen tersembunyi kecuali welcome screen
    const gameOverModal = document.getElementById('gameOverModal');
    const gameScreen = document.getElementById('gameScreen');
    const settingsScreen = document.getElementById('settingsScreen');
    const aboutScreen = document.getElementById('aboutScreen');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    if (gameOverModal) {
        gameOverModal.classList.add('hidden');
        gameOverModal.style.display = 'none';
    }
    if (gameScreen) gameScreen.classList.add('hidden');
    if (settingsScreen) settingsScreen.classList.add('hidden');
    if (aboutScreen) aboutScreen.classList.add('hidden');
    if (welcomeScreen) welcomeScreen.classList.remove('hidden');
    
    // Play lobby music saat halaman load
    if (lobbyMusic && !isMuted) {
        lobbyMusic.play().catch(e => {
            console.log('Lobby music play failed:', e);
            // Jika autoplay diblok, coba play saat user interact
            document.body.addEventListener('click', function playOnFirstClick() {
                lobbyMusic.play().catch(err => console.log('Still failed:', err));
                document.body.removeEventListener('click', playOnFirstClick);
            }, { once: true });
        });
    }
    
    // Button event listeners
    const muteBtn = document.getElementById('muteBtn');
    const startBtn = document.getElementById('startBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const nextBtn = document.getElementById('nextBtn');
    const resetBtn = document.getElementById('resetBtn');
    const backFromSettings = document.getElementById('backFromSettings');
    const backFromAbout = document.getElementById('backFromAbout');
    const restartBtn = document.getElementById('restartBtn');
    const backToLobby = document.getElementById('backToLobby');
    const bgmVolumeSlider = document.getElementById('bgmVolume');
    const sfxVolumeSlider = document.getElementById('sfxVolume');
    
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);
    if (startBtn) startBtn.addEventListener('click', startGame);
    if (settingsBtn) settingsBtn.addEventListener('click', showSettings);
    if (aboutBtn) aboutBtn.addEventListener('click', showAbout);
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (resetBtn) resetBtn.addEventListener('click', resetGame);
    if (backFromSettings) backFromSettings.addEventListener('click', backToMenu);
    if (backFromAbout) backFromAbout.addEventListener('click', backToMenu);
    if (restartBtn) restartBtn.addEventListener('click', restartGame);
    if (backToLobby) backToLobby.addEventListener('click', backToMenuFromGame);
    
    // Volume sliders
    if (bgmVolumeSlider) {
        bgmVolumeSlider.addEventListener('input', function() {
            adjustBGMVolume(this.value);
        });
    }
    
    if (sfxVolumeSlider) {
        sfxVolumeSlider.addEventListener('input', function() {
            adjustSFXVolume(this.value);
        });
    }
    
    console.log('Game initialized'); // Debug log
});