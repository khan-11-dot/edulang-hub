document.addEventListener('DOMContentLoaded', () => {
    const textDisplay = document.getElementById('textDisplay');
    const textInput = document.getElementById('textInput');
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');
    const keystrokesDisplay = document.getElementById('keystrokes');
    const timerDisplay = document.getElementById('timer');
    const newTextBtn = document.getElementById('newTextBtn');
    const resetBtn = document.getElementById('resetBtn');
    const shareBtn = document.getElementById('shareBtn');
    const difficultyLevel = document.getElementById('difficultyLevel');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const resultModal = document.getElementById('resultModal');
    const finalWpm = document.getElementById('finalWpm');
    const finalAccuracy = document.getElementById('finalAccuracy');
    const finalTime = document.getElementById('finalTime');
    const retryBtn = document.getElementById('retryBtn');
    const shareResultBtn = document.getElementById('shareResultBtn');

    let startTime;
    let timer;
    let timerInterval;
    let keystrokes = 0;
    let currentMode = 'words';
    let timeLimit = 60;

    const wordLists = {
        easy: [
            "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
            "it", "for", "not", "on", "with", "he", "as", "you", "do", "at"
        ],
        medium: [
            "computer", "keyboard", "monitor", "software", "program", "internet",
            "website", "database", "network", "system", "digital", "technology",
            "application", "developer", "coding", "testing", "design", "project"
        ],
        hard: [
            "implementation", "functionality", "architecture", "development",
            "infrastructure", "authentication", "optimization", "integration",
            "configuration", "deployment", "maintenance", "performance"
        ],
        expert: [
            "function calculateAverage()", "const handleSubmit = (event) => {",
            "class DatabaseConnection {", "import tensorflow as tf",
            "SELECT * FROM users WHERE", "git commit -m 'Update'",
            "npm install --save-dev", "docker-compose up -d"
        ]
    };

    function getRandomText() {
        const difficulty = difficultyLevel.value;
        const words = wordLists[difficulty];
        const wordCount = currentMode === 'words' ? 25 : 50;
        let text = '';
        
        for (let i = 0; i < wordCount; i++) {
            text += words[Math.floor(Math.random() * words.length)] + ' ';
        }
        
        return text.trim();
    }

    function startNewText() {
        textInput.value = '';
        currentText = getRandomText();
        textDisplay.textContent = currentText;
        startTime = null;
        keystrokes = 0;
        keystrokesDisplay.textContent = '0';
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '0%';
        
        if (currentMode === 'time') {
            timer = timeLimit;
            timerDisplay.textContent = timeLimit;
        }
        
        clearInterval(timerInterval);
    }

    function calculateWPM(timeElapsed, words) {
        const minutes = timeElapsed / 60000;
        return Math.round(words / minutes);
    }

    function calculateAccuracy(input, original) {
        if (input.length === 0) return 0;
        let correct = 0;
        const inputLength = Math.min(input.length, original.length);
        
        for (let i = 0; i < inputLength; i++) {
            if (input[i] === original[i]) correct++;
        }
        
        return Math.round((correct / inputLength) * 100);
    }

    function showResult(wpm, accuracy, time) {
        finalWpm.textContent = wpm + ' WPM';
        finalAccuracy.textContent = accuracy + '%';
        finalTime.textContent = time + 's';
        resultModal.style.display = 'flex';
    }

    textInput.addEventListener('input', () => {
        if (!startTime && textInput.value.length > 0) {
            startTime = Date.now();
            if (currentMode === 'time') {
                timerInterval = setInterval(() => {
                    timer--;
                    timerDisplay.textContent = timer;
                    
                    if (timer <= 0) {
                        clearInterval(timerInterval);
                        textInput.disabled = true;
                        const finalWpm = parseInt(wpmDisplay.textContent);
                        const finalAcc = parseInt(accuracyDisplay.textContent);
                        showResult(finalWpm, finalAcc, timeLimit);
                    }
                }, 1000);
            }
        }

        keystrokes++;
        keystrokesDisplay.textContent = keystrokes;

        const timeElapsed = Date.now() - startTime;
        const words = textInput.value.trim().split(/\s+/).length;
        const wpm = calculateWPM(timeElapsed, words);
        const accuracy = calculateAccuracy(textInput.value, currentText);
        
        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = accuracy + '%';

        if (textInput.value === currentText) {
            clearInterval(timerInterval);
            showResult(wpm, accuracy, Math.round(timeElapsed / 1000));
        }
    });

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-mode');
            startNewText();
        });
    });

    difficultyLevel.addEventListener('change', startNewText);
    newTextBtn.addEventListener('click', startNewText);
    resetBtn.addEventListener('click', startNewText);
    
    retryBtn.addEventListener('click', () => {
        resultModal.style.display = 'none';
        textInput.disabled = false;
        startNewText();
    });

    shareBtn.addEventListener('click', () => {
        const text = `I achieved ${wpmDisplay.textContent} WPM with ${accuracyDisplay.textContent} accuracy on EduLang Hub Typing Test!`;
        if (navigator.share) {
            navigator.share({
                title: 'My Typing Test Result',
                text: text,
                url: window.location.href
            });
        } else {
            alert('Share this result:\n\n' + text);
        }
    });

    shareResultBtn.addEventListener('click', () => {
        const text = `I achieved ${finalWpm.textContent} with ${finalAccuracy.textContent} accuracy on EduLang Hub Typing Test!`;
        if (navigator.share) {
            navigator.share({
                title: 'My Typing Test Result',
                text: text,
                url: window.location.href
            });
        } else {
            alert('Share this result:\n\n' + text);
        }
    });

    // Initialize
    startNewText();
});
