document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const textDisplay = document.getElementById('textDisplay');
    const textInput = document.getElementById('textInput');
    const handsDisplay = document.querySelector('.hands-display');
    const wpmDisplay = document.getElementById('wpm');
    const accuracyDisplay = document.getElementById('accuracy');
    const progressDisplay = document.getElementById('progress');
    const progressBar = document.querySelector('.progress');
    const lessonCompleteModal = document.getElementById('lessonCompleteModal');
    const keys = document.querySelectorAll('.key');
    const highlights = document.querySelectorAll('.highlight');

    // State variables
    let startTime;
    let totalKeystrokes = 0;
    let correctKeystrokes = 0;
    let isLessonComplete = false;
    let currentPosition = 0;
    let errors = 0;
    let targetText;

    // Key to finger mapping
    const keyToFingerMap = {
        'a': 'left-pinky',
        'q': 'left-pinky',
        'z': 'left-pinky',
        's': 'left-ring',
        'w': 'left-ring',
        'x': 'left-ring',
        'd': 'left-middle',
        'e': 'left-middle',
        'c': 'left-middle',
        'f': 'left-index',
        'r': 'left-index',
        'v': 'left-index',
        'g': 'left-index',
        't': 'left-index',
        'b': 'left-index',
        'h': 'right-index',
        'y': 'right-index',
        'n': 'right-index',
        'j': 'right-index',
        'u': 'right-index',
        'm': 'right-index',
        'k': 'right-middle',
        'i': 'right-middle',
        ',': 'right-middle',
        'l': 'right-ring',
        'o': 'right-ring',
        '.': 'right-ring',
        ';': 'right-pinky',
        'p': 'right-pinky',
        '/': 'right-pinky',
        ' ': 'thumbs'
    };

    // Initialize
    function init() {
        targetText = textDisplay.querySelector('.current-text').textContent.trim().replace(/\r\n/g, '\n');
        updateDisplay();
        textInput.value = '';
        textInput.focus();
    }

    // Update the display of text
    function updateDisplay() {
        const displayText = targetText.split('').map((char, index) => {
            let displayChar = char;
            if (char === '\n') {
                displayChar = '↵\n';
            } else if (char === ' ') {
                displayChar = '␣';
            }

            if (index < currentPosition) {
                return `<span class="typed">${displayChar}</span>`;
            } else if (index === currentPosition) {
                return `<span class="current">${displayChar}</span>`;
                showNextKeyHighlight(char);
            } else {
                return `<span class="untyped">${displayChar}</span>`;
            }
        }).join('');
        textDisplay.innerHTML = displayText;
    }

    function showNextKeyHighlight(nextChar) {
        // Remove all active highlights
        keys.forEach(key => key.classList.remove('active', 'next-key'));
        highlights.forEach(highlight => highlight.classList.remove('active'));

        // Find the next key and highlight it
        const fingerType = keyToFingerMap[nextChar.toLowerCase()];
        if (fingerType) {
            // Highlight the key
            keys.forEach(key => {
                if (key.textContent.toLowerCase() === nextChar.toLowerCase()) {
                    key.classList.add('next-key');
                }
            });

            // Highlight the finger
            highlights.forEach(highlight => {
                if (highlight.dataset.finger === fingerType) {
                    highlight.classList.add('active');
                }
            });
        }
    }

    // Update progress bar
    function updateProgress() {
        const progress = (currentPosition / targetText.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressDisplay.textContent = `${currentPosition}/${targetText.length}`;
    }

    // Calculate WPM
    function calculateWPM() {
        if (!startTime) return 0;
        const timeElapsed = (new Date() - startTime) / 1000 / 60; // in minutes
        const wordsTyped = correctKeystrokes / 5; // assume average word length of 5
        return Math.round(wordsTyped / timeElapsed);
    }

    // Calculate accuracy
    function calculateAccuracy() {
        if (currentPosition === 0) return 100;
        return Math.round(((correctKeystrokes) / currentPosition) * 100);
    }

    // Update hands position
    function updateHandsPosition(key) {
        handsDisplay.dataset.key = key.toLowerCase();

        // Reset position after animation
        setTimeout(() => {
            handsDisplay.dataset.key = '';
        }, 300);
    }

    // Update keyboard visual
    function updateKeyboard(key) {
        // Remove previous highlights
        document.querySelectorAll('.key.active').forEach(k => k.classList.remove('active'));
        document.querySelectorAll('.key.next-key').forEach(k => k.classList.remove('next-key'));

        // Highlight current key
        const currentKey = document.querySelector(`.key:not(.spacebar):contains('${key.toUpperCase()}')`);
        if (currentKey) currentKey.classList.add('active');

        // Highlight next key
        const nextChar = targetText[currentPosition + 1];
        if (nextChar) {
            const nextKey = document.querySelector(`.key:not(.spacebar):contains('${nextChar.toUpperCase()}')`);
            if (nextKey) nextKey.classList.add('next-key');
        }
    }

    // Handle key press events
    textInput.addEventListener('keydown', (e) => {
        if (isLessonComplete) return;

        const key = e.key;
        const fingerType = keyToFingerMap[key.toLowerCase()];

        // Prevent default behavior for Tab and other control keys
        if (e.key === 'Tab' || e.ctrlKey || e.altKey) {
            e.preventDefault();
            return;
        }

        // Highlight pressed key
        keys.forEach(keyElement => {
            if (keyElement.textContent.toLowerCase() === key.toLowerCase() ||
                (key === ' ' && keyElement.classList.contains('spacebar'))) {
                keyElement.classList.add('active');
            }
        });

        // Highlight pressed finger
        if (fingerType) {
            highlights.forEach(highlight => {
                if (highlight.dataset.finger === fingerType) {
                    highlight.classList.add('active');
                }
            });
        }
    });

    // Handle key release events
    textInput.addEventListener('keyup', (e) => {
        const key = e.key;
        const fingerType = keyToFingerMap[key.toLowerCase()];

        // Remove key highlight
        keys.forEach(keyElement => {
            if (keyElement.textContent.toLowerCase() === key.toLowerCase() ||
                (key === ' ' && keyElement.classList.contains('spacebar'))) {
                keyElement.classList.remove('active');
            }
        });

        // Remove finger highlight for the pressed key
        if (fingerType) {
            highlights.forEach(highlight => {
                if (highlight.dataset.finger === fingerType) {
                    highlight.classList.remove('active');
                }
            });
        }

        // Show highlight for the next key
        const nextChar = targetText[currentPosition];
        if (nextChar) {
            showNextKeyHighlight(nextChar);
        }
    });

    // Handle typing input
    textInput.addEventListener('input', (e) => {
        if (isLessonComplete) return;

        if (!startTime) {
            startTime = new Date();
        }

        const inputChar = e.target.value.slice(-1);
        const expectedChar = targetText[currentPosition];

        if (inputChar === expectedChar ||
            (inputChar === ' ' && expectedChar === 'Space') ||
            (inputChar.toUpperCase() === expectedChar)) {
            currentPosition++;
            correctKeystrokes++;
            updateHandsPosition(expectedChar);
            updateKeyboard(expectedChar);
            updateDisplay();

            // Update displays
            wpmDisplay.textContent = `${calculateWPM()} WPM`;
            accuracyDisplay.textContent = `${calculateAccuracy()}%`;
            updateProgress();
        } else {
            errors++;
            accuracyDisplay.textContent = `${calculateAccuracy()}%`;
        }

        totalKeystrokes++;
        textInput.value = '';

        if (currentPosition >= targetText.length) {
            completeLessonEarly();
        }
    });

    function completeLessonEarly() {
        if (!isLessonComplete) {
            isLessonComplete = true;
            showCompletionModal();
        }
    }

    function showCompletionModal() {
        lessonCompleteModal.style.display = 'flex';
    }

    // Initialize the lesson
    init();
});

// Helper function to find element by text content
Element.prototype.contains = function(text) {
    return this.textContent.trim() === text;
};
