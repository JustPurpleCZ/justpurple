const name = "ADAM ZAHOR";
let activeCard = null;
let cardsVisible = false;
let cardSlotPositions = [0, 0, 0, 0, 0];

// Interface state variables
let interfaceExpanded = false;
let horizontalCardsVisible = false;
let cardsAnimating = false;

// Letter definitions using triangle types (0: none, 1: top-left, 2: top-right, 3: bottom-left, 4: bottom-right)
const letterDefinitions = {
    'A': [4, 3, 1, 2, 1, 2],
    'B': [1, 3, 1, 3, 3, 1],
    'C': [1, 2, 1, 0, 3, 4],
    'D': [0, 0, 2, 2, 4, 4],
    'E': [1, 2, 1, 0, 3, 0],
    'F': [1, 2, 1, 0, 0, 0],
    'G': [1, 2, 1, 0, 3, 2],
    'H': [3, 4, 3, 4, 1, 2],
    'I': [1, 0, 3, 0, 1, 0],
    'J': [0, 2, 0, 0, 3, 4],
    'K': [1, 4, 3, 1, 1, 3],
    'L': [1, 0, 0, 0, 3, 4],
    'M': [3, 4, 2, 1, 3, 4],
    'N': [1, 0, 2, 1, 0, 1],
    'O': [4, 3, 1, 4, 2, 1],
    'P': [1, 2, 1, 2, 0, 0],
    'Q': [1, 2, 1, 0, 3, 2],
    'R': [1, 3, 3, 1, 1, 3],
    'S': [4, 3, 2, 3, 2, 1],
    'T': [1, 1, 0, 0, 0, 0],
    'U': [1, 0, 1, 0, 3, 4],
    'V': [1, 0, 1, 0, 0, 4],
    'W': [1, 0, 1, 1, 0, 1],
    'X': [1, 2, 3, 4, 0, 0],
    'Y': [1, 2, 0, 0, 0, 0],
    'Z': [1, 1, 4, 1, 4, 4]
};

// Triangle classes mapping
const triangleClasses = [
    "",
    "triangle-top-left",
    "triangle-top-right",
    "triangle-bottom-left",
    "triangle-bottom-right"
];

// Variables for parallax effect
let mouseX = 0;
let mouseY = 0;
let centerX = window.innerWidth / 2;
let centerY = window.innerHeight / 2;
let parallaxEnabled = false;
let animationComplete = false;
let rhythmGameActive = false;
let rhythmAudio = null;
let rhythmNotes = [];
let rhythmActiveNotes = [];
let rhythmScore = 0;
let rhythmCombo = 0;
let rhythmMaxCombo = 0;
let rhythmHits = { perfect: 0, great: 0, good: 0, miss: 0, total: 0 };
let rhythmFallSpeed = 200; // pixels per second
let rhythmStartTime = 0;
let rhythmAnimationFrame = null;
let rhythmPressedKeys = { 'd': false, 'f': false, 'j': false, 'k': false };
let rhythmHoldNotes = []; // Track active hold notes
let rhythmHeldKeys = { 'd': false, 'f': false, 'j': false, 'k': false }; // Track currently held keys


// Song data for each card - maps to party/music/
const cardSongs = {
    1: {
        title: "Medicine",
        audio: "party/music/medicine.mp3",
        map: "party/music/medicine.json"
    },
    2: {
        title: "Ellen Joe theme", 
        audio: "party/music/ellen.mp3",
        map: "party/music/ellen.json"
    },
    3: {
        title: "Polumnia Omnia",
        audio: "party/music/Polumnia Omnia.mp3",
        map: "party/music/Polumnia.json"
    },
    4: {
        title: "Ambient",
        audio: "party/music/ambient.mp3", 
        map: "party/music/ambient.json"
    },
    5: {
        title: "Jazz Fusion",
        audio: "party/music/jazz.mp3",
        map: "party/music/jazz.json"
    }
};

// Create additional styles for rhythm game animations
function createRhythmGameElements() {
    // Check if elements already exist
    if (document.getElementById('rhythmLaneContainer')) return;
    
    // Create song title
    const songTitle = document.createElement('div');
    songTitle.id = 'rhythmSongTitle';
    songTitle.className = 'rhythm-song-title';
    songTitle.textContent = 'Song Title';
    document.body.appendChild(songTitle);
    
    // Create score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'rhythm-score-display';
    scoreDisplay.innerHTML = `
        <div class="rhythm-score-item">
            <span class="label">Score</span>
            <span class="value" id="rhythmScoreValue">0</span>
        </div>
        <div class="rhythm-score-item">
            <span class="label">Combo</span>
            <span class="value" id="rhythmComboValue">0</span>
        </div>
        <div class="rhythm-score-item">
            <span class="label">Accuracy</span>
            <span class="value" id="rhythmAccuracyValue">100%</span>
        </div>
    `;
    document.body.appendChild(scoreDisplay);
    
    // Create lane container
    const laneContainer = document.createElement('div');
    laneContainer.id = 'rhythmLaneContainer';
    laneContainer.className = 'rhythm-lane-container';
    
    // Create lanes
    ['d', 'f', 'j', 'k'].forEach(lane => {
        const laneDiv = document.createElement('div');
        laneDiv.className = 'rhythm-game-lane';
        laneDiv.id = `rhythm-lane-${lane}`;
        
        const noteArea = document.createElement('div');
        noteArea.className = 'rhythm-note-area';
        noteArea.id = `rhythm-note-area-${lane}`;
        
        const hitLine = document.createElement('div');
        hitLine.className = 'rhythm-hit-line';
        
        const hitArea = document.createElement('div');
        hitArea.className = `rhythm-hit-area rhythm-hit-area-${lane}`;
        hitArea.textContent = lane.toUpperCase();
        
        laneDiv.appendChild(noteArea);
        laneDiv.appendChild(hitLine); // Add hit line
        laneDiv.appendChild(hitArea);
        laneContainer.appendChild(laneDiv);
    });
    
    document.body.appendChild(laneContainer);
    
    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'rhythm-progress-container';
    progressContainer.innerHTML = `
        <div class="rhythm-progress-bar">
            <div class="rhythm-progress-fill" id="rhythmProgressFill"></div>
        </div>
    `;
    document.body.appendChild(progressContainer);
    
    // Create end game overlay
    const endOverlay = document.createElement('div');
    endOverlay.className = 'rhythm-game-end';
    endOverlay.id = 'rhythmGameEnd';
    endOverlay.innerHTML = `
        <div class="rhythm-end-content">
            <h3>Game Complete!</h3>
            <div class="rhythm-end-stats">
                <div class="rhythm-end-stat">
                    <div class="stat-label">Final Score</div>
                    <div class="stat-value" id="endScore">0</div>
                </div>
                <div class="rhythm-end-stat">
                    <div class="stat-label">Max Combo</div>
                    <div class="stat-value" id="endCombo">0</div>
                </div>
                <div class="rhythm-end-stat">
                    <div class="stat-label">Accuracy</div>
                    <div class="stat-value" id="endAccuracy">0%</div>
                </div>
                <div class="rhythm-end-stat">
                    <div class="stat-label">Perfect</div>
                    <div class="stat-value" id="endPerfect">0</div>
                </div>
            </div>
            <button class="rhythm-end-button" onclick="closeRhythmGame()">Continue</button>
        </div>
    `;
    document.body.appendChild(endOverlay);
    document.addEventListener('keydown', handleRhythmKeyDown);
    document.addEventListener('keyup', handleRhythmKeyUp);
}

// Start rhythm game with slide-in animation
async function startRhythmGame(cardId) {
    const songData = cardSongs[cardId];
    if (!songData) {
        console.error('Song data not found for card', cardId);
        return;
    }
    
    // Create rhythm game elements if they don't exist
    createRhythmGameElements();
    
    // Show loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'rhythm-loading';
    loadingDiv.innerHTML = `
        <div class="rhythm-loading-spinner"></div>
        <p>Loading ${songData.title}...</p>
    `;
    document.body.appendChild(loadingDiv);
    
    try {
        // Reset game state
        resetRhythmGame();
        
        // Load the note map
        const mapResponse = await fetch(songData.map);
        const noteMap = await mapResponse.json();
        
        // Set up game data
        rhythmNotes = [...noteMap.notes];
        rhythmNotes.forEach(note => {
            note.spawned = false;
            note.hit = false;
            note.missed = false;
            note.element = null;
        });
        
        // Load audio
        rhythmAudio = new Audio();
        rhythmAudio.src = songData.audio;
        rhythmAudio.volume = 0.7;
        
        // Update UI
        document.getElementById('rhythmSongTitle').textContent = songData.title;
        updateRhythmScoreDisplay();
        
        // Wait for audio to load
        await new Promise((resolve, reject) => {
            rhythmAudio.addEventListener('loadeddata', resolve);
            rhythmAudio.addEventListener('error', reject);
        });
        
        // Remove loading indicator
        loadingDiv.remove();
        
        // Slide in game elements
        slideInRhythmGame();
        
        // Start countdown after slide-in
        setTimeout(async () => {
            await startGameCountdown();
            
            // Start the actual game
            rhythmGameActive = true;
            rhythmStartTime = Date.now();
            rhythmAudio.play();
            startRhythmGameLoop();
        }, 800);
        
    } catch (error) {
        console.error('Error loading rhythm game:', error);
        loadingDiv.remove();
        closeRhythmGame();
    }
}

// Slide in rhythm game elements
function slideInRhythmGame() {
    const songTitle = document.getElementById('rhythmSongTitle');
    const scoreDisplay = document.querySelector('.rhythm-score-display');
    const laneContainer = document.getElementById('rhythmLaneContainer');
    const progressContainer = document.querySelector('.rhythm-progress-container');
    
    // Slide in with staggered timing
    setTimeout(() => songTitle.classList.add('active'), 0);
    setTimeout(() => scoreDisplay.classList.add('active'), 200);
    setTimeout(() => laneContainer.classList.add('active'), 400);
    setTimeout(() => progressContainer.classList.add('active'), 600);
}

// Enhanced close function with slide-out animation
function closeRhythmGame() {
    resetRhythmGame();
    
    // Slide out game elements
    const songTitle = document.getElementById('rhythmSongTitle');
    const scoreDisplay = document.querySelector('.rhythm-score-display');
    const laneContainer = document.getElementById('rhythmLaneContainer');
    const progressContainer = document.querySelector('.rhythm-progress-container');
    const endOverlay = document.getElementById('rhythmGameEnd');

    if (songTitle) songTitle.classList.remove('active');
    if (scoreDisplay) scoreDisplay.classList.remove('active');
    if (laneContainer) laneContainer.classList.remove('active');
    if (progressContainer) progressContainer.classList.remove('active');
    if (endOverlay) endOverlay.classList.remove('show');
}

// Reset rhythm game state
function resetRhythmGame() {
    rhythmGameActive = false;
    rhythmActiveNotes = [];
    rhythmHoldNotes = []; // Clear hold notes
    rhythmScore = 0;
    rhythmCombo = 0;
    rhythmMaxCombo = 0;
    rhythmHits = { perfect: 0, great: 0, good: 0, miss: 0, total: 0 };
    rhythmPressedKeys = { 'd': false, 'f': false, 'j': false, 'k': false };
    rhythmHeldKeys = { 'd': false, 'f': false, 'j': false, 'k': false }; // Reset held keys
    
    // Clear all note elements
    ['d', 'f', 'j', 'k'].forEach(lane => {
        const noteArea = document.getElementById(`rhythm-note-area-${lane}`);
        if (noteArea) noteArea.innerHTML = '';
    });
    
    // Stop audio if playing
    if (rhythmAudio) {
        rhythmAudio.pause();
        rhythmAudio.currentTime = 0;
        rhythmAudio = null;
    }
    
    // Stop animation
    if (rhythmAnimationFrame) {
        cancelAnimationFrame(rhythmAnimationFrame);
        rhythmAnimationFrame = null;
    }
}

// Start rhythm game loop
function startRhythmGameLoop() {
    if (!rhythmGameActive) return;
    
    const currentTime = (Date.now() - rhythmStartTime);
    const audioCurrentTime = rhythmAudio.currentTime * 1000;
    
    // Update progress bar
    const duration = rhythmAudio.duration * 1000;
    const progressPercent = (audioCurrentTime / duration) * 100;
    const progressFill = document.getElementById('rhythmProgressFill');
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
    
    // Update notes
    updateRhythmNotes(audioCurrentTime);
    
    // Check if song ended
    if (rhythmAudio.ended) {
        endRhythmGame();
        return;
    }
    
    // Continue loop
    rhythmAnimationFrame = requestAnimationFrame(startRhythmGameLoop);
}

// Update rhythm notes position
function updateRhythmNotes(currentTime) {
    // Spawn window
    const spawnWindow = 2000;
    
    // Spawn new notes
    const notesToSpawn = rhythmNotes.filter(note => 
        note.time > currentTime && 
        note.time <= currentTime + spawnWindow && 
        !note.spawned
    );
    
    notesToSpawn.forEach(note => {
        spawnRhythmNote(note);
        note.spawned = true;
        rhythmActiveNotes.push(note);
    });
    
    // Update positions of active notes
    rhythmActiveNotes.forEach(note => {
        if (note.element) {
            const timeDiff = note.time - currentTime;
            const noteArea = document.getElementById(`rhythm-note-area-${note.lane}`);
            const laneHeight = noteArea.clientHeight;
            const hitAreaHeight = 50;
            const playableHeight = laneHeight - hitAreaHeight;
            
            // Calculate progress (0 to 1)
            let progress = 1 - (timeDiff / spawnWindow);
            progress = Math.max(0, Math.min(1, progress));
            
            // For hold notes, we need to position based on the BOTTOM of the note
            if (note.type === 'hold' && note.duration) {
                // Calculate where the bottom of the note should be
                // At progress = 0: note bottom should be at 100% (completely off-screen above)
                // At progress = 1: note bottom should be at hit area top (playable height)
                
                const bottomPosition = (1 - progress) * 100; // Inverted because bottom: 0% means at bottom
                const hitAreaPercentage = (hitAreaHeight / laneHeight) * 100; // Convert hit area to percentage
                
                // Adjust so that at progress = 1, the bottom aligns with hit area
                const adjustedBottomPercentage = bottomPosition + hitAreaPercentage;
                
                note.element.style.bottom = `${Math.max(0, Math.min(100, adjustedBottomPercentage))}%`;
                note.element.style.top = 'auto'; // Clear any top positioning
            } else {
                // For regular tap notes, use the original logic
                const topPosition = (progress * (playableHeight + 30)) - 30;
                const topPercentage = (topPosition / laneHeight) * 100;
                note.element.style.top = `${Math.max(0, Math.min(100, topPercentage))}%`;
                note.element.style.bottom = 'auto'; // Clear any bottom positioning
            }
            
            // Check if note is missed
            if (timeDiff < -200 && !note.hit && !note.missed) {
                rhythmNoteMissed(note);
            }
        }
    });
    
    // Remove notes that are far past
    const notesToRemove = rhythmActiveNotes.filter(note => 
        note.time < currentTime - 500
    );
    
    notesToRemove.forEach(note => {
        if (note.element) note.element.remove();
    });
    rhythmActiveNotes = rhythmActiveNotes.filter(note => !notesToRemove.includes(note));
}
function updateHoldNotes(currentTime) {
    // Check hold notes that are being held but key is released
    rhythmHoldNotes.forEach(note => {
        if (note.holding && !rhythmHeldKeys[note.lane]) {
            // Key was released during hold
            note.holding = false;
            note.holdReleased = true;
            note.missed = true;
            
            rhythmCombo = 0;
            rhythmHits.miss++;
            
            if (note.element) {
                note.element.classList.add('hold-failed');
            }
            
            showRhythmJudgment(note.lane, 'DROPPED');
            updateRhythmScoreDisplay();
        }
    });
    
    // Check for hold notes that have passed their end time
    rhythmHoldNotes.forEach(note => {
        // Calculate timing for the end of the hold
        const endTimeDiff = note.endTime - currentTime;
        
        // Check if the hold note's end has passed and the player is still holding
        if (endTimeDiff < -200 && note.holding) {
            // Successfully held until the end
            note.holding = false;
            note.holdReleased = true;
            note.hit = true;
            
            // Give points for completing the hold
            let bonusPoints = 50; // Base points for completing hold
            
            rhythmScore += bonusPoints;
            rhythmCombo++;
            rhythmMaxCombo = Math.max(rhythmMaxCombo, rhythmCombo);
            rhythmHits.perfect++; // Count as perfect when held properly
            
            // Visual feedback for successful hold completion
            if (note.element) {
                note.element.classList.add('hold-completed');
                const holdEnd = note.element.querySelector('.rhythm-hold-end');
                if (holdEnd) holdEnd.classList.add('hit');
                
                setTimeout(() => {
                    if (note.element && note.element.parentNode) {
                        note.element.remove();
                    }
                }, 200);
            }
            
            showRhythmJudgment(note.lane, 'PERFECT HOLD');
            updateRhythmScoreDisplay();
        }
        // If player is still holding after a grace period, consider the hold finished
        else if (endTimeDiff < -350 && note.holding) {
            // Player held too long - but still complete it successfully
            note.holding = false;
            note.holdReleased = true;
            note.hit = true;
            
            // Give reduced points
            let bonusPoints = 30;
            
            rhythmScore += bonusPoints;
            rhythmCombo++;
            
            // Visual feedback
            if (note.element) {
                note.element.classList.add('hold-completed');
                setTimeout(() => {
                    if (note.element && note.element.parentNode) {
                        note.element.remove();
                    }
                }, 200);
            }
            
            showRhythmJudgment(note.lane, 'GOOD HOLD');
            updateRhythmScoreDisplay();
        }
    });
    
    // Update visual feedback for active holds
    ['d', 'f', 'j', 'k'].forEach(lane => {
        const hitArea = document.querySelector(`.rhythm-hit-area-${lane}`);
        if (!hitArea) return;
        
        const hasActiveHold = rhythmHoldNotes.some(note => 
            note.lane === lane && note.holding
        );
        
        if (hasActiveHold && rhythmHeldKeys[lane]) {
            if (!hitArea.classList.contains('holding')) {
                hitArea.classList.add('holding');
            }
        } else {
            hitArea.classList.remove('holding');
        }
    });
    
    // Clean up completed hold notes
    rhythmHoldNotes = rhythmHoldNotes.filter(note => note.holding);
}
function spawnRhythmNote(note) {
    const noteArea = document.getElementById(`rhythm-note-area-${note.lane}`);
    if (!noteArea) return;
    
    const noteElement = document.createElement('div');
    noteElement.className = `rhythm-game-note rhythm-game-note-${note.lane}`;
    
    // Handle hold notes differently
    if (note.type === 'hold' && note.duration) {
        noteElement.classList.add('rhythm-hold-note');
        
        // Calculate hold note height based on duration
        const holdHeight = (note.duration / 1000) * rhythmFallSpeed;
        noteElement.style.height = `${holdHeight}px`;
        
        // Add visual elements for hold note
        noteElement.innerHTML = `
            <div class="hold-note-head"></div>
            <div class="hold-note-body"></div>
            <div class="hold-note-tail"></div>
        `;
        
        // Position at bottom initially (off-screen above) - using percentage
        noteElement.style.bottom = '100%';
        noteElement.style.top = 'auto';
    } else {
        // Regular tap note
        noteElement.style.height = '30px';
        noteElement.style.top = '0%';  // Start at top (off-screen above)
        noteElement.style.bottom = 'auto';
    }
    
    noteArea.appendChild(noteElement);
    note.element = noteElement;
}

// Enhanced keyboard handling with ripple effects
function handleRhythmKeyDown(event) {
    if (!rhythmGameActive) return;
    
    const key = event.key.toLowerCase();
    if (!['d', 'f', 'j', 'k'].includes(key)) return;
    
    event.preventDefault();
    
    if (rhythmPressedKeys[key]) return;
    rhythmPressedKeys[key] = true;
    rhythmHeldKeys[key] = true;
    
    // Add enhanced visual feedback
    const hitArea = document.querySelector(`.rhythm-hit-area-${key}`);
    if (hitArea) {
        hitArea.classList.add('active');
        
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.borderRadius = '50%';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.animation = 'keyRipple 0.4s ease-out';
        ripple.style.pointerEvents = 'none';
        
        hitArea.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 400);
    }
    
    // Check for note hit (both regular and hold notes)
    checkRhythmNoteHit(key);
}
function checkRhythmNoteHit(key) {
    const currentTime = rhythmAudio.currentTime * 1000;
    
    const notesInLane = rhythmActiveNotes.filter(note => 
        note.lane === key && !note.hit && !note.missed
    );
    
    if (notesInLane.length === 0) return;
    
    // Sort notes by how close they are to the hit point
    notesInLane.sort((a, b) => {
        // Calculate how close each note is to the hit time
        // For regular notes, we use currentTime
        // For hold notes, we use the start time (note.time)
        const aTimeDiff = Math.abs(a.time - currentTime);
        const bTimeDiff = Math.abs(b.time - currentTime);
        return aTimeDiff - bTimeDiff;
    });
    
    const closestNote = notesInLane[0];
    const timeDiff = Math.abs(closestNote.time - currentTime);
    
    // Wider hit window (350ms) for better playability
    if (timeDiff <= 350) {
        console.log(`Hit note with accuracy: ${timeDiff}ms`);
        rhythmNoteHit(closestNote, timeDiff);
    }
}
function handleRhythmKeyUp(event) {
    if (!rhythmGameActive) return;
    
    const key = event.key.toLowerCase();
    if (!['d', 'f', 'j', 'k'].includes(key)) return;
    
    rhythmPressedKeys[key] = false;
    rhythmHeldKeys[key] = false;
    
    // Remove visual feedback
    const hitArea = document.querySelector(`.rhythm-hit-area-${key}`);
    if (hitArea) hitArea.classList.remove('active');
    
    // Handle hold note release
    handleHoldNoteRelease(key);
}
function handleHoldNoteRelease(key) {
    const currentTime = rhythmAudio.currentTime * 1000;
    
    // Find active hold notes in this lane
    const holdNotesInLane = rhythmHoldNotes.filter(note => 
        note.lane === key && note.holding && !note.holdReleased
    );
    
    holdNotesInLane.forEach(note => {
        // Calculate timing for the end of the hold
        const endTimeDiff = note.endTime - currentTime;
        
        // Check if release was close to the end time (manual release)
        if (Math.abs(endTimeDiff) <= 200) {
            // Successful hold completion with good timing
            note.holdReleased = true;
            note.holding = false;
            note.hit = true;
            
            // Give bonus points based on accuracy
            let releaseJudgment = '';
            let bonusPoints = 0;
            
            if (Math.abs(endTimeDiff) <= 50) {
                releaseJudgment = 'PERFECT';
                bonusPoints = 100;
            } else if (Math.abs(endTimeDiff) <= 100) {
                releaseJudgment = 'GREAT';
                bonusPoints = 80;
            } else {
                releaseJudgment = 'GOOD';
                bonusPoints = 50;
            }
            
            rhythmScore += bonusPoints;
            rhythmCombo++;
            rhythmMaxCombo = Math.max(rhythmMaxCombo, rhythmCombo);
            
            // Visual feedback for successful hold completion
            if (note.element) {
                note.element.classList.add('hold-completed');
                const holdEnd = note.element.querySelector('.rhythm-hold-end');
                if (holdEnd) holdEnd.classList.add('hit');
                
                setTimeout(() => {
                    if (note.element && note.element.parentNode) {
                        note.element.remove();
                    }
                }, 200);
            }
            
            showRhythmJudgment(note.lane, `${releaseJudgment} RELEASE`);
        } 
        // Released too early
        else if (endTimeDiff > 200) {
            // Released too early
            note.holdReleased = true;
            note.holding = false;
            note.missed = true;
            
            rhythmCombo = 0;
            rhythmHits.miss++;
            
            if (note.element) {
                note.element.classList.add('hold-failed');
                setTimeout(() => {
                    if (note.element && note.element.parentNode) {
                        note.element.remove();
                    }
                }, 200);
            }
            
            showRhythmJudgment(note.lane, 'EARLY RELEASE');
        }
        // Released too late (shouldn't happen often due to auto-completion logic)
        else if (endTimeDiff < -200) {
            // Released too late
            note.holdReleased = true;
            note.holding = false;
            note.hit = true; // Still count as hit but with reduced score
            
            // Reduced points for late release
            rhythmScore += 30;
            rhythmCombo++;
            
            if (note.element) {
                note.element.classList.add('hold-completed');
                setTimeout(() => {
                    if (note.element && note.element.parentNode) {
                        note.element.remove();
                    }
                }, 200);
            }
            
            showRhythmJudgment(note.lane, 'LATE RELEASE');
        }
        
        updateRhythmScoreDisplay();
    });
    
    // Remove completed/failed hold notes from tracking
    rhythmHoldNotes = rhythmHoldNotes.filter(note => note.holding);
}

// Check rhythm note hit
function rhythmNoteHit(note, accuracy) {
    if (note.hit || note.missed) return;
    
    if (note.isHold) {
        // Handle hold note start
        if (!note.holdStarted) {
            note.holdStarted = true;
            note.holding = true;
            rhythmHoldNotes.push(note);
            
            // Visual feedback for hold start
            if (note.element) {
                note.element.classList.add('hold-active');
                const holdHead = note.element.querySelector('.rhythm-hold-head');
                if (holdHead) holdHead.classList.add('hit');
            }
            
            // Give points for starting the hold
            let judgment = getJudgmentFromAccuracy(accuracy);
            let points = getPointsFromJudgment(judgment);
            
            rhythmCombo++;
            rhythmMaxCombo = Math.max(rhythmMaxCombo, rhythmCombo);
            rhythmScore += points;
            rhythmHits.total++;
            rhythmHits[judgment.toLowerCase()]++;
            
            updateRhythmScoreDisplay();
            showRhythmJudgment(note.lane, judgment);
            
            // Add screen shake for perfect hold starts
            if (judgment === 'MISS') {
                addScreenShake();
            }
        }
    } else {
        // Handle regular note
        note.hit = true;
        
        let judgment = getJudgmentFromAccuracy(accuracy);
        let points = getPointsFromJudgment(judgment);
        
        rhythmCombo++;
        rhythmMaxCombo = Math.max(rhythmMaxCombo, rhythmCombo);
        rhythmScore += points;
        rhythmHits.total++;
        rhythmHits[judgment.toLowerCase()]++;
        
        updateRhythmScoreDisplay();
        showRhythmJudgment(note.lane, judgment);
        
        if (judgment === 'MISS') {
            addScreenShake();
        }
        
        if (note.element) {
            note.element.classList.add('hit');
            setTimeout(() => {
                if (note.element && note.element.parentNode) {
                    note.element.remove();
                }
            }, 100);
        }
    }
}
function addScreenShake() {
    const laneContainer = document.getElementById('rhythmLaneContainer');
    if (laneContainer) {
        laneContainer.style.animation = 'screenShake 0.2s ease-out';
        setTimeout(() => {
            laneContainer.style.animation = '';
        }, 200);
    }
}
// Helper function to get judgment from accuracy
function getJudgmentFromAccuracy(accuracy) {
    if (accuracy <= 50) return 'PERFECT';
    if (accuracy <= 120) return 'GREAT';
    if (accuracy <= 200) return 'GOOD';
    return 'BAD';
}

// Helper function to get points from judgment
function getPointsFromJudgment(judgment) {
    switch (judgment) {
        case 'PERFECT': return 100;
        case 'GREAT': return 80;
        case 'GOOD': return 50;
        case 'BAD': return 20;
        default: return 0;
    }
}

// Handle rhythm note missed
function rhythmNoteMissed(note) {
    if (note.hit || note.missed) return;
    
    note.missed = true;
    rhythmCombo = 0;
    rhythmHits.miss++;
    rhythmHits.total++;
    
    updateRhythmScoreDisplay();
    showRhythmJudgment(note.lane, 'MISS');
    
    if (note.element) {
        note.element.classList.add('missed');
        setTimeout(() => {
            if (note.element && note.element.parentNode) {
                note.element.remove();
            }
        }, 200);
    }
}

// Enhanced judgment display with particle effects
function showRhythmJudgment(lane, judgment) {
    const hitArea = document.querySelector(`.rhythm-hit-area-${lane}`);
    const judgmentElement = document.createElement('div');
    judgmentElement.className = `rhythm-judgment-text rhythm-judgment-${judgment.toLowerCase()}`;
    judgmentElement.textContent = judgment;
    
    const hitAreaRect = hitArea.getBoundingClientRect();
    judgmentElement.style.position = 'fixed';
    judgmentElement.style.left = `${hitAreaRect.left + hitAreaRect.width / 2}px`;
    judgmentElement.style.top = `${hitAreaRect.top - 20}px`;
    judgmentElement.style.transform = 'translateX(-50%)';
    judgmentElement.style.zIndex = '1001';
    
    document.body.appendChild(judgmentElement);
    
    // Create floating particles effect for perfect hits
    if (judgment === 'PERFECT') {
        createJudgmentParticles(hitAreaRect);
    }
    
    setTimeout(() => {
        if (judgmentElement.parentNode) {
            judgmentElement.remove();
        }
    }, 1200);
}

// Create particle effect for perfect hits
function createJudgmentParticles(hitAreaRect) {
    const particles = 8;
    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#ffeb3b';
        particle.style.borderRadius = '50%';
        particle.style.left = `${hitAreaRect.left + hitAreaRect.width / 2}px`;
        particle.style.top = `${hitAreaRect.top + hitAreaRect.height / 2}px`;
        particle.style.zIndex = '1000';
        particle.style.pointerEvents = 'none';
        particle.style.animation = `particleFloat${i} 1s ease-out forwards`;
        
        document.body.appendChild(particle);
        
        // Create unique animation for each particle
        const angle = (i / particles) * Math.PI * 2;
        const distance = 50;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat${i} {
                0% { 
                    opacity: 1; 
                    transform: translate(0, 0) scale(1);
                }
                100% { 
                    opacity: 0; 
                    transform: translate(${endX}px, ${endY}px) scale(0);
                }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            particle.remove();
            style.remove();
        }, 1000);
    }
}

// Enhanced score display with animations
function updateRhythmScoreDisplay() {
    const scoreElement = document.getElementById('rhythmScoreValue');
    const comboElement = document.getElementById('rhythmComboValue');
    const accuracyElement = document.getElementById('rhythmAccuracyValue');
    
    if (!scoreElement) return;
    
    // Animate score change
    if (scoreElement.textContent !== rhythmScore.toString()) {
        scoreElement.style.animation = 'scoreUpdate 0.3s ease';
        setTimeout(() => {
            scoreElement.style.animation = '';
        }, 300);
    }
    
    scoreElement.textContent = rhythmScore;
    comboElement.textContent = rhythmCombo;
    
    let accuracy = 0;
    if (rhythmHits.total > 0) {
        accuracy = ((rhythmHits.perfect * 100) + (rhythmHits.great * 80) + (rhythmHits.good * 50)) / (rhythmHits.total * 100) * 100;
    }
    accuracyElement.textContent = `${Math.round(accuracy)}%`;
    
    // Add combo milestone effects
    if (rhythmCombo > 0 && rhythmCombo % 25 === 0) {
        comboElement.style.animation = 'comboMilestone 0.5s ease';
        setTimeout(() => {
            comboElement.style.animation = '';
        }, 500);
    }
}

// Enhanced end game with slide-in results
function endRhythmGame() {
    rhythmGameActive = false;
    
    // Calculate final stats
    const finalScore = {
        score: rhythmScore,
        maxCombo: rhythmMaxCombo,
        accuracy: rhythmHits.total > 0 ? 
            Math.round(((rhythmHits.perfect * 100) + (rhythmHits.great * 80) + (rhythmHits.good * 50)) / (rhythmHits.total * 100) * 100) : 0,
        perfect: rhythmHits.perfect,
        great: rhythmHits.great,
        good: rhythmHits.good,
        miss: rhythmHits.miss
    };
    
    // Update end screen
    document.getElementById('endScore').textContent = finalScore.score;
    document.getElementById('endCombo').textContent = finalScore.maxCombo;
    document.getElementById('endAccuracy').textContent = `${finalScore.accuracy}%`;
    document.getElementById('endPerfect').textContent = finalScore.perfect;
    
    // Hide game elements first
    const laneContainer = document.getElementById('rhythmLaneContainer');
    const progressContainer = document.querySelector('.rhythm-progress-container');
    if (laneContainer) laneContainer.classList.remove('active');
    if (progressContainer) progressContainer.classList.remove('active');
    
    // Show end overlay with delay
    setTimeout(() => {
        const endOverlay = document.getElementById('rhythmGameEnd');
        if (endOverlay) {
            endOverlay.classList.add('show');
        }
    }, 1000);
}

// Updated countdown function for center display
function startGameCountdown() {
    return new Promise(resolve => {
        const countdownDiv = document.createElement('div');
        countdownDiv.className = 'rhythm-loading';
        countdownDiv.style.fontSize = '4em';
        countdownDiv.style.fontFamily = 'monospace';
        
        document.body.appendChild(countdownDiv);
        
        let count = 3;
        const updateCountdown = () => {
            if (count > 0) {
                countdownDiv.innerHTML = `<div style="animation: countdownPulse 1s ease">${count}</div>`;
                count--;
                setTimeout(updateCountdown, 1000);
            } else {
                countdownDiv.innerHTML = `<div style="animation: countdownPulse 1s ease; color: #4caf50;">GO!</div>`;
                setTimeout(() => {
                    countdownDiv.remove();
                    resolve();
                }, 500);
            }
        };
        
        updateCountdown();
    });
}

// Updated handleImageClick to create rhythm game elements
const originalHandleImageClick = window.handleImageClick;
window.handleImageClick = function() {
    // Call the original function
    if (originalHandleImageClick) {
        originalHandleImageClick.call(this);
    }
    
    // Create the rhythm game elements if they don't exist
    setTimeout(() => {
        createRhythmGameElements();
        attachCardClickListeners();
    }, 1200);
};

// Enhanced attachment of card click listeners
function attachCardClickListeners() {
    // Wait for cards to be fully animated
    setTimeout(() => {
        const horizontalCards = document.querySelectorAll('.horizontal-card');
        horizontalCards.forEach((card, index) => {
            // Remove any existing listeners to prevent duplicates
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            // Add new click listener with enhanced feedback
            newCard.addEventListener('click', (e) => {
                // Add click animation
                newCard.style.transform = 'scale(0.95)';
                hideHorizontalCards();
                // Start rhythm game
                startRhythmGame(index + 1);
            });
        });
    }, 600);
}

// Add keyboard shortcuts for ESC to close
document.addEventListener('keydown', function(event) {
    // ESC to close rhythm game
    if (event.key === 'Escape' && rhythmGameActive) {
        event.preventDefault();
        closeRhythmGame();
        showHorizontalCards();
    }
    
    // Space to pause/resume rhythm game
    if (event.key === ' ' && rhythmGameActive && rhythmAudio) {
        event.preventDefault();
        if (rhythmAudio.paused) {
            rhythmAudio.play();
            rhythmStartTime = Date.now() - (rhythmAudio.currentTime * 1000);
            startRhythmGameLoop();
        } else {
            rhythmAudio.pause();
            if (rhythmAnimationFrame) {
                cancelAnimationFrame(rhythmAnimationFrame);
                rhythmAnimationFrame = null;
            }
        }
    }
});
function addHitLinesToLanes() {
    const lanes = document.querySelectorAll('.rhythm-game-lane');
    
    lanes.forEach(lane => {
        // Check if hit line already exists
        if (!lane.querySelector('.rhythm-hit-line')) {
            const hitLine = document.createElement('div');
            hitLine.className = 'rhythm-hit-line';
            lane.appendChild(hitLine);
        }
    });
}
// Create the letters
const animationContainer = document.getElementById('animation-container');

// Create a wrapper div to ensure all letters stay together
const nameWrapper = document.createElement('div');
nameWrapper.style.display = 'flex';
nameWrapper.style.flexWrap = 'nowrap';
nameWrapper.style.whiteSpace = 'nowrap';
animationContainer.appendChild(nameWrapper);

name.split('').forEach(char => {
    if (char === ' ') {
        const spaceDiv = document.createElement('div');
        spaceDiv.style.width = 'calc(2vw + 15px)';
        spaceDiv.classList.add('space');
        nameWrapper.appendChild(spaceDiv);
        return;
    }
    
    const letterDef = letterDefinitions[char.toUpperCase()];
    if (!letterDef) return;
    
    const letterDiv = document.createElement('div');
    letterDiv.className = 'letter';
    
    for (let i = 0; i < 6; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        
        if (letterDef[i] > 0) {
            const triangle = document.createElement('div');
            triangle.className = `triangle ${triangleClasses[letterDef[i]]}`;
            triangle.dataset.index = i;
            cell.appendChild(triangle);
        }
        
        letterDiv.appendChild(cell);
    }
    
    nameWrapper.appendChild(letterDiv);
});

// Adjust space width based on screen size
function adjustSpaceWidth() {
    const spaces = document.querySelectorAll('.space');
    let width = 'calc(2vw + 15px)';
    
    if (window.innerWidth <= 768) {
        width = 'calc(3vw + 10px)';
    }
    
    if (window.innerWidth <= 480) {
        width = 'calc(4vw + 5px)';
    }
    
    spaces.forEach(space => {
        space.style.width = width;
    });
    
    // Update center coordinates when window is resized
    centerX = window.innerWidth / 2;
    centerY = window.innerHeight / 2;
}

// Function to update parallax effect based on mouse position
function updateParallax(e) {
    if (!parallaxEnabled) return;
    
    // Calculate mouse position relative to center (normalized from -1 to 1)
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const normalizedX = (mouseX - centerX) / centerX; // -1 to 1
    const normalizedY = (mouseY - centerY) / centerY; // -1 to 1
    
    // Apply different movement speeds to each layer
    const frontLayer = document.getElementById('bubble-layer-front');
    const middleLayer = document.getElementById('bubble-layer-middle');
    const backLayer = document.getElementById('bubble-layer-back');
    
    // More movement for front layer
    frontLayer.style.transform = `translate(${-normalizedX * 40}px, ${-normalizedY * 40}px)`;
    
    // Medium movement for middle layer
    middleLayer.style.transform = `translate(${-normalizedX * 20}px, ${-normalizedY * 20}px)`;
    
    // Subtle movement for back layer
    backLayer.style.transform = `translate(${-normalizedX * 10}px, ${-normalizedY * 10}px)`;
}

// Add mouse move event listener for parallax
document.addEventListener('mousemove', updateParallax);

// Handle touch movement for mobile
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    updateParallax({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
    });
}, { passive: false });

// Animation function
function animateLetters() {
    const letters = document.querySelectorAll('.letter');
    let allTriangles = [];
    
    // For each row
    for (let row = 0; row < 3; row++) {
        // Go through each letter, collecting left then right triangles
        for (let letterIndex = 0; letterIndex < letters.length; letterIndex++) {
            // First get the left triangle (col=0)
            const leftCellIndex = row * 2 + 0;
            const leftTriangle = letters[letterIndex].querySelector(`.triangle[data-index="${leftCellIndex}"]`);
            if (leftTriangle) allTriangles.push(leftTriangle);
            
            // Then get the right triangle (col=1)
            const rightCellIndex = row * 2 + 1;
            const rightTriangle = letters[letterIndex].querySelector(`.triangle[data-index="${rightCellIndex}"]`);
            if (rightTriangle) allTriangles.push(rightTriangle);
        }
    }
    
    // Process triangles
    const rotationSteps = ['rotate-0', 'rotate-90', 'rotate-180', 'rotate-270', 'rotate-0', 'rotate-90', 'rotate-180', 'rotate-270', 'rotate-360'];
    
    // Get total animation time to know when to start the tagline
    const lastTriangleVisibleTime = (allTriangles.length - 1) * 30; // Time until last triangle appears
    
    // Start all triangles with a staggered delay
    allTriangles.forEach((triangle, index) => {
        setTimeout(() => {
            // Make triangle visible immediately
            triangle.classList.add('visible');
            
            // Rotate through all positions
            let rotationIndex = 0;
            
            function rotateTriangle() {
                // Clear previous rotation classes
                triangle.classList.remove('rotate-0', 'rotate-90', 'rotate-180', 'rotate-270', 'rotate-360');
                
                // Apply current rotation
                triangle.classList.add(rotationSteps[rotationIndex]);
                
                rotationIndex++;
                
                if (rotationIndex < rotationSteps.length) {
                    // Continue to next rotation after delay
                    setTimeout(rotateTriangle, 200);
                }
            }
            
            // Start rotation sequence
            rotateTriangle();
            
        }, index * 30); // Staggered delay between triangles
    });
    
    // After last triangle is visible, start the tagline animation with a small delay
    setTimeout(animateTagline, lastTriangleVisibleTime + 200);
}

// Tagline animation function
function animateTagline() {
    const tagline = "Just_PurpleCZ";
    const taglineContainer = document.getElementById('tagline-container');
    taglineContainer.style.opacity = '1';
    
    // Create character slots
    for (let i = 0; i < tagline.length; i++) {
        const charSlot = document.createElement('span');
        charSlot.className = 'char-slot';
        charSlot.textContent = ' ';
        charSlot.dataset.finalChar = tagline[i];
        taglineContainer.appendChild(charSlot);
    }
    
    const charSlots = document.querySelectorAll('.char-slot');
    
    // Random character set
    const randomChars = '!@#$%^&*()_+-=[]{}|;:,./<>?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    // Calculate when tagline animation will finish
    const taglineFinishTime = (tagline.length - 1) * 100 + (12 * 50);
    
    // Animate each character slot with random characters
    charSlots.forEach((slot, index) => {
        setTimeout(() => {
            let iterations = 0;
            const finalChar = slot.dataset.finalChar;
            const interval = setInterval(() => {
                // Show random character
                if (iterations < 12) {
                    slot.textContent = randomChars[Math.floor(Math.random() * randomChars.length)];
                } else {
                    // Show final character
                    slot.textContent = finalChar;
                    clearInterval(interval);
                    
                    // If this is the last character, animate the background and rhomboids
                    if (index === charSlots.length - 1) {
                        setTimeout(finalAnimation, 300);
                    }
                }
                iterations++;
            }, 50); // 50ms per character change
            
        }, index * 100); // 100ms delay between characters
    });
}

// Function to create bubbles
function createBubbles() {
    // Clear existing bubbles
    document.getElementById('bubble-layer-back').innerHTML = '';
    document.getElementById('bubble-layer-middle').innerHTML = '';
    document.getElementById('bubble-layer-front').innerHTML = '';
    
    // Create bubbles in each layer
    createLayerBubbles('bubble-layer-back', 20);
    createLayerBubbles('bubble-layer-middle', 15);
    createLayerBubbles('bubble-layer-front', 15);
    
    // Enable parallax effect once bubbles are created
    setTimeout(() => {
        parallaxEnabled = true;
    }, 2500);
}

// Function to animate any SVG path
function animatePath(pathId, duration = 1500, delay = 0) {
    setTimeout(() => {
        const pathElement = document.getElementById(pathId);
        if (!pathElement) return;
        
        // Make the path visible
        pathElement.style.opacity = '1';
        
        // Get the total length of the path
        const pathLength = pathElement.getTotalLength();
        
        // Setup the initial state - dashed line with full length as the gap
        pathElement.style.strokeDasharray = pathLength;
        pathElement.style.strokeDashoffset = pathLength;
        
        // Animate the drawing of the path
        let startTime = null;
        
        function drawPath(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            
            if (elapsed < duration) {
                const progress = elapsed / duration;
                const drawLength = pathLength * progress;
                pathElement.style.strokeDashoffset = pathLength - drawLength;
                requestAnimationFrame(drawPath);
            } else {
                // Ensure path is fully drawn
                pathElement.style.strokeDashoffset = 0;
            }
        }
        
        requestAnimationFrame(drawPath);
    }, delay);
}

// Function to animate a group of paths in sequence
function animatePathGroup(pathIds, durationPerPath = 800, delayBetweenPaths = 0, initialDelay = 0) {
    pathIds.forEach((pathId, index) => {
        const delay = initialDelay + (index * (durationPerPath + delayBetweenPaths));
        animatePath(pathId, durationPerPath, delay);
    });
}

// Function to create bubbles for a specific layer
function createLayerBubbles(layerId, count) {
    const layerEl = document.getElementById(layerId);
    
    // Size ranges vary by layer to enhance depth perception
    let maxSize, minSize, moveDistance;
    
    if (layerId === 'bubble-layer-front') {
        // Largest bubbles in front
        maxSize = window.innerWidth <= 480 ? 40 : 
                  window.innerWidth <= 768 ? 60 : 160;
        minSize = window.innerWidth <= 480 ? 20 : 
                  window.innerWidth <= 768 ? 30 : 40;
        moveDistance = window.innerWidth <= 480 ? 15 : 
                       window.innerWidth <= 768 ? 25 : 200;
    } else if (layerId === 'bubble-layer-middle') {
        // Medium bubbles in middle
        maxSize = window.innerWidth <= 480 ? 30 : 
                  window.innerWidth <= 768 ? 45 : 120;
        minSize = window.innerWidth <= 480 ? 10 : 
                  window.innerWidth <= 768 ? 15 : 30;
        moveDistance = window.innerWidth <= 480 ? 10 : 
                       window.innerWidth <= 768 ? 20 : 150;
    } else {
        // Smallest bubbles in back
        maxSize = window.innerWidth <= 480 ? 20 : 
                  window.innerWidth <= 768 ? 30 : 80;
        minSize = window.innerWidth <= 480 ? 3 : 
                  window.innerWidth <= 768 ? 5 : 10;
        moveDistance = window.innerWidth <= 480 ? 5 : 
                       window.innerWidth <= 768 ? 15 : 100;
    }
    
    const sizeRange = maxSize - minSize;
    
    for (let i = 0; i < count; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size with responsive adjustment
        const size = Math.floor(Math.random() * sizeRange) + minSize;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Determine which side the bubble will come from (0=top, 1=right, 2=bottom, 3=left)
        const side = i % 4;
        
        // Starting positions outside the viewport
        if (side === 0) { // Top
            bubble.style.top = `-${size}px`;
            bubble.style.left = `${Math.random() * 100}%`;
        } else if (side === 1) { // Right
            bubble.style.top = `${Math.random() * 100}%`;
            bubble.style.right = `-${size}px`;
        } else if (side === 2) { // Bottom
            bubble.style.bottom = `-${size}px`;
            bubble.style.left = `${Math.random() * 100}%`;
        } else { // Left
            bubble.style.top = `${Math.random() * 100}%`;
            bubble.style.left = `-${size}px`;
        }
        
        // Add to container
        layerEl.appendChild(bubble);
        
        // Make bubble visible initially
        setTimeout(() => {
            bubble.style.opacity = '1';
        }, 100);
        
        // Calculate final position for the bubble to float to
        const finalX = (side === 1) ? `-${Math.random() * moveDistance + 10}px` : // Right side
                       (side === 3) ? `${Math.random() * moveDistance + 10}px` : '0px'; // Left side
                       
        const finalY = (side === 0) ? `${Math.random() * moveDistance + 10}px` : // Top
                       (side === 2) ? `-${Math.random() * moveDistance + 10}px` : '0px'; // Bottom
        
        // Store the final position for the floating animation
        bubble.style.setProperty('--float-x', finalX);
        bubble.style.setProperty('--float-y', finalY);
        
        // Add move-in class with a delay
        setTimeout(() => {
            bubble.classList.add('move-in');
            bubble.style.transform = `translate(${finalX}, ${finalY})`;
            
            // After moving in, start floating
            setTimeout(() => {
                bubble.classList.remove('move-in');
                bubble.classList.add('float');
            }, 2500); // Wait for move-in transition to complete
        }, 200 + (i * 50)); // Staggered start
    }
}

// Final animation with gradient background and rhomboids - UPDATED to use class system
function finalAnimation() {
    // Get the gradient overlay and activate it
    const gradientOverlay = document.querySelector('.gradient-overlay');
    gradientOverlay.classList.add('active');
    
    // Create and animate bubbles
    createBubbles();
    
    // Animate rhomboids in a wave-like motion using class system
    const rhomboids = document.querySelectorAll('.rhomboid:not(#return-button)');
    console.log('Found rhomboids:', rhomboids.length); // Debug log
    
    rhomboids.forEach((rhomboid, index) => {
        // Set initial transform explicitly to ensure they start off-screen
        rhomboid.style.transform = 'translateX(400px)';
        rhomboid.classList.remove('active', 'wave');
        
        setTimeout(() => {
            console.log(`Animating rhomboid ${index}`); // Debug log
            
            // Remove any inline transform and add active class
            rhomboid.style.transform = '';
            rhomboid.classList.add('active');
            
            // Add wave animation after the slide-in transition completes
            setTimeout(() => {
                rhomboid.classList.add('wave');
            }, 1500); // Wait for the slide-in to complete
            
            // Animate first rhomboid (home icon)
            if (index === 0) {
                setTimeout(() => animatePath('home-outline-0'), 500);
            }
            
            // Animate second rhomboid (rectangles)
            if (index === 1) {
                setTimeout(() => {
                    animatePathGroup(['left-rectangle', 'middle-rectangle', 'right-rectangle'], 500, 100, 0);
                }, 500);
            }
            
            // Animate third rhomboid
            if (index === 2) {
                setTimeout(() => animatePath('cube-outline'), 500);
            }
            
            // Animate fourth rhomboid 
            if (index === 3) {
                setTimeout(() => animatePath('mail-outline'), 500);
            }
        }, index * 400); // 400ms delay between each rhomboid
    });
    
    // Return button stays hidden (no active class by default)
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.style.transform = 'translateX(400px)';
        returnButton.classList.remove('active');
    }
    
    // Mark animation as complete so we can handle scroll
    animationComplete = true;
    
    // Show scroll indicator
    document.querySelector('.scroll-indicator').style.opacity = '1';
}

// Handle scroll event to transition layout
window.addEventListener('scroll', () => {
    if (!animationComplete) return;
    
    // Calculate scroll percentage (0 to 1)
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = Math.min(1, scrollTop / (scrollHeight / 4)); // Transition in first quarter of scroll
    
    // Apply transformation based on scroll percentage
    const animationContainer = document.getElementById('animation-container');
    const taglineContainer = document.getElementById('tagline-container');
    const contentContainer = document.querySelector('.content-container');
    const circularImage = document.querySelector('.circular-image');
    const contentBox = document.querySelector('.content-box');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const cards = document.querySelectorAll('.card');
    const cardc = document.querySelector('.cards-container');
    
    // For smooth shrinking before slide
    if (scrollPercentage <= 0.3) { // Adjusted threshold to hide tagline quicker
        // Only shrink during the first 30% of the scroll transition
        const scale = 1 - (scrollPercentage * 1.5); // Scale from 1 down to 0.4
        const scaleValue = Math.max(0.4, scale);
        
        // Keep in center but shrink
        animationContainer.style.transform = `translate(-50%, -50%) scale(${scaleValue})`;
        animationContainer.classList.remove('scrolled');
        
        // Tagline should be visible but fading out as we scroll
        taglineContainer.classList.remove('scrolled');
        // Fade out tagline more rapidly
        taglineContainer.style.opacity = Math.max(0, 1 - (scrollPercentage * 3.3));
        
        // Hide content elements
        contentContainer.classList.remove('visible');
        circularImage.classList.remove('scrolled');
        contentBox.classList.remove('scrolled');
        
        // Only remove scrolled class from cards if cards aren't currently animating
        if (!cardsAnimating && cardsVisible) {
            cardsAnimating = true;
            cardsVisible = false;
            cardc.classList.remove('visible');
            
            // Use a staggered removal with delay
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.remove('scrolled');
                    
                    // Only reset the animation flag after the last card
                    if (index === cards.length - 1) {
                        setTimeout(() => {
                            cardsAnimating = false;
                        }, 200); // Buffer time after last card
                    }
                }, index * 50);
            });
        }
        
        // Show scroll indicator
        scrollIndicator.style.opacity = '1';
    } 
    // When we've shrunk enough, slide to corner and show content
    else {
        // Add scrolled class to apply the corner position
        animationContainer.classList.add('scrolled');
        animationContainer.style.transform = ''; // Remove inline transform to use the CSS class
        
        // Force tagline to be completely hidden when scrolled
        taglineContainer.classList.add('scrolled');
        taglineContainer.style.opacity = '0';
        
        contentContainer.classList.add('visible');
        
        // Show the new content elements
        if (scrollPercentage > 0.5) { // Adjusted threshold for showing content
            circularImage.classList.add('scrolled');
            contentBox.classList.add('scrolled');
            
            // Only add scrolled class to cards if cards aren't currently animating
            if (!cardsAnimating && !cardsVisible) {
                cardsAnimating = true;
                cardsVisible = true;
                cardc.classList.add('visible');
                
                // Initialize cards first if needed
                if (!activeCard) {
                    initializeCards();
                }
                
                // Use a staggered application with delay
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('scrolled');
                        
                        // Only reset the animation flag after the last card
                        if (index === cards.length - 1) {
                            setTimeout(() => {
                                cardsAnimating = false;
                            }, 200); // Buffer time after last card
                        }
                    }, index * 100);
                });
            }
            
            // Hide scroll indicator
            scrollIndicator.style.opacity = '0';
        }
    }
});

// Function to handle parallax effect for touch devices
function handleTouchParallax() {
    if ('ontouchstart' in window) {
        // For mobile devices, create gyroscope-based parallax
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                if (!parallaxEnabled) return;
                
                // Use device tilt for parallax on mobile
                const tiltX = e.gamma / 45; // Normalize from -1 to 1 (gamma ranges from -90 to 90)
                const tiltY = e.beta / 45;  // Normalize from -1 to 1 (beta ranges from -90 to 90)
                
                // Apply different movement speeds to each layer
                const frontLayer = document.getElementById('bubble-layer-front');
                const middleLayer = document.getElementById('bubble-layer-middle');
                const backLayer = document.getElementById('bubble-layer-back');
                
                // Adjust movement based on device orientation
                frontLayer.style.transform = `translate(${-tiltX * 30}px, ${-tiltY * 30}px)`;
                middleLayer.style.transform = `translate(${-tiltX * 15}px, ${-tiltY * 15}px)`;
                backLayer.style.transform = `translate(${-tiltX * 7}px, ${-tiltY * 7}px)`;
            });
        }
    }
}

// Function to initialize the cards
function initializeCards() {
    const cards = document.querySelectorAll('.card');
    const cardsContainer = document.querySelector('.cards-container');
    
    // Calculate slot positions based on container width
    calculateCardSlotPositions();
    
    // Assign each card to its initial slot
    cards.forEach((card, index) => {
        // Set initial slot
        card.setAttribute('data-slot', index);
        
        // Position card in its slot
        positionCardInSlot(card, index);
        
        // Add click handler
        card.addEventListener('click', () => {
            handleCardClick(card);
        });
    });
    
    // Add window resize handler to recalculate positions when screen size changes
    window.addEventListener('resize', () => {
        calculateCardSlotPositions();
        
        // Reposition all cards in their current slots
        cards.forEach(card => {
            const currentSlot = parseInt(card.getAttribute('data-slot'));
            if (card !== activeCard) {
                positionCardInSlot(card, currentSlot);
            }
        });
    });
}

// Calculate the actual pixel positions for each card slot
function calculateCardSlotPositions() {
    const cardsContainer = document.querySelector('.cards-container');
    const containerWidth = cardsContainer.offsetWidth;
    const cardWidth = 180; // Base card width
    const cardGap = 20; // Gap between cards
    
    // Calculate center position of container
    const containerCenter = containerWidth / 2;
    
    // Calculate total width of all cards + gaps
    const totalCardsWidth = (5 * cardWidth) + (4 * cardGap);
    
    // Calculate starting position (left edge of first card)
    const startX = containerCenter - (totalCardsWidth / 2);
    
    // Calculate position for each slot
    for (let i = 0; i < 5; i++) {
        cardSlotPositions[i] = startX + (i * (cardWidth + cardGap));
    }
}

// Position a card in a specific slot
function positionCardInSlot(card, slotIndex) {
    // Update card's slot attribute
    card.setAttribute('data-slot', slotIndex);
    
    // Remove any inline styles from previous positioning
    card.style.removeProperty('transform');
    card.style.removeProperty('transition');
    
    // Apply new position
    const leftPosition = cardSlotPositions[slotIndex];
    card.style.position = 'absolute';
    card.style.left = `${leftPosition}px`;
    card.style.bottom = '0';
    card.style.transform = '';
    card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
}

// Handle card click
function handleCardClick(card) {
    // Prevent rapid clicks
    if (card.classList.contains('processing')) return;
    card.classList.add('processing');
    
    // Check if this card is already active
    if (card === activeCard) {
        deactivateCard();
        setTimeout(() => {
            card.classList.remove('processing');
        }, 1000);
        return;
    }
    
    // If there's already an active card, deactivate it first
    if (activeCard) {
        deactivateCard();
        setTimeout(() => {
            activateCard(card);
            setTimeout(() => {
                card.classList.remove('processing');
            }, 1000);
        }, 800);
    } else {
        activateCard(card);
        setTimeout(() => {
            card.classList.remove('processing');
        }, 1000);
    }
}

// Activate a card (move to content box and expand)
function activateCard(card) {
    // Store the current slot
    const currentSlot = parseInt(card.getAttribute('data-slot'));
    card.setAttribute('data-original-slot', currentSlot);
    
    // Get content box dimensions and position
    const contentBox = document.querySelector('.content-box');
    const contentBoxRect = contentBox.getBoundingClientRect();
    
    // Get card's current position
    const cardRect = card.getBoundingClientRect();
    
    // First, fix the card in its current position
    card.style.position = 'fixed';
    card.style.top = `${cardRect.top}px`;
    card.style.left = `${cardRect.left}px`;
    card.style.width = `${cardRect.width}px`;
    card.style.height = `${cardRect.height}px`;
    card.style.zIndex = '20';
    
    // Force reflow
    void card.offsetHeight;
    
    // Then animate to content box position
    card.classList.add('active');
    card.style.width = `${contentBoxRect.width}px`;
    card.style.height = `${contentBoxRect.height}px`;
    card.style.top = `${contentBoxRect.top}px`;
    card.style.left = `${contentBoxRect.left}px`;
    
    // Flip card after it reaches destination
    setTimeout(() => {
        card.querySelector('.card-inner').style.transform = 'rotateY(180deg)';
    }, 500);
    
    // Set as active card
    activeCard = card;
    
    // Move other cards to fill the gap
    shiftCardsAfterActivation(currentSlot);
}

// Shift cards after a card has been activated
function shiftCardsAfterActivation(activatedSlot) {
    const cards = document.querySelectorAll('.card');
    
    // The activated card is now conceptually in slot 4 (rightmost)
    // Move all other cards to slots 0-3
    
    cards.forEach(card => {
        if (card !== activeCard) {
            const currentSlot = parseInt(card.getAttribute('data-slot'));
            
            // If the card is to the right of the activated card, move it left
            if (currentSlot > activatedSlot) {
                positionCardInSlot(card, currentSlot - 1);
            }
        }
    });
}

// Deactivate the currently active card
function deactivateCard() {
    if (!activeCard) return;
    
    // First, reset the flip animation
    activeCard.querySelector('.card-inner').style.transform = '';
    const originalCard = activeCard;
   
    // Move the card to slot 4 (rightmost)
    moveCardToRightmost(originalCard);
    
    // Clear active card reference
    activeCard = null;
    
    // Remove active class and reset styles after movement
    originalCard.classList.remove('active');
    originalCard.style.position = 'absolute';
    originalCard.style.zIndex = '1';
    originalCard.style.top = '';
    originalCard.style.bottom = '0';
    originalCard.style.width = '180px'; // Reset to original width
    originalCard.style.height = '240px'; // Reset to original height
    
    // Also apply responsive sizing if needed
    if (window.innerWidth <= 992 && window.innerWidth > 600) {
        originalCard.style.width = '150px';
        originalCard.style.height = '200px';
    } else if (window.innerWidth <= 600) {
        originalCard.style.width = '120px';
        originalCard.style.height = '170px';
    }
}

// Move a card to the rightmost position (slot 4)
function moveCardToRightmost(card) {
    const cards = document.querySelectorAll('.card');
    
    // First, find any card that's in slot 4
    let cardInLastSlot = null;
    cards.forEach(c => {
        if (parseInt(c.getAttribute('data-slot')) === 4 && c !== card) {
            cardInLastSlot = c;
        }
    });
    
    // Move all cards one slot to the left to make room
    // but only if our card isn't already in the last slot
    if (parseInt(card.getAttribute('data-slot')) !== 4) {
        // Shift all cards in slots 3 and below left by one
        cards.forEach(c => {
            if (c !== card) {
                const currentSlot = parseInt(c.getAttribute('data-slot'));
                if (currentSlot < 4) {
                    // Move left
                    positionCardInSlot(c, currentSlot);
                }
            }
        });
        
        // If there was a card in slot 4, move it to slot 3
        if (cardInLastSlot) {
            positionCardInSlot(cardInLastSlot, 3);
        }
        
        // Position our card in slot 4
        card.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        positionCardInSlot(card, 4);
    }
}

// UPDATED handleImageClick function using class system
function handleImageClick() {
    if (interfaceExpanded) return; // Prevent multiple activations
    
    interfaceExpanded = true;
    
    // 1. Make cards go down out of frame
    const cards = document.querySelectorAll('.card');
    const cardsContainer = document.querySelector('.cards-container');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(300px)';
            card.style.opacity = '0';
        }, index * 50);
    });
    
    // 2. Move content box out of frame to the left
    const contentBox = document.querySelector('.content-box');
    contentBox.style.transform = 'translateX(-100vw)';
    
    // 3. Hide rhomboids by removing active class (except the return button)
    const rhomboids = document.querySelectorAll('.rhomboid:not(#return-button)');
    rhomboids.forEach((rhomboid) => {
        rhomboid.classList.remove('wave');
    });
    rhomboids.forEach((rhomboid, index) => {
        setTimeout(() => {
            rhomboid.classList.remove('active');
        }, index * 100);
    });
    
    // 4. Enlarge and move the circular image to the left
    const circularImage = document.querySelector('.circular-image');
    circularImage.classList.add('expanded');
    
    // 5. Show existing horizontal cards coming from the right
    setTimeout(showHorizontalCards, 600);
    
    // 6. Show return button by adding active class
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.classList.remove('active');
        setTimeout(() => {
            // Clear inline transform and add active class
            returnButton.style.transform = '';
            returnButton.classList.add('active');
        }, 800);
        setTimeout(() => {
            returnButton.classList.add('wave');      
        }, 2400);
    } else {
        console.log('Return button not found!'); // Debug log
    }
    
    // 7. Reattach rhythm game listeners after interface expansion
    setTimeout(attachCardClickListeners, 1200);
}

// Function to show existing horizontal cards
function showHorizontalCards() {
    if (horizontalCardsVisible) return;
    console.log("tried")
    horizontalCardsVisible = true;
    
    // Get the existing horizontal cards container
    const horizontalCardsContainer = document.querySelector('.horizontal-cards-container');
    const horizontalCards = document.querySelectorAll('.horizontal-card');
    
    if (!horizontalCardsContainer || horizontalCards.length === 0) return;
    
    // Make container visible
    horizontalCardsContainer.style.display = 'flex';
    
    // Force reflow before animations
    void horizontalCardsContainer.offsetHeight;
    
    // Animate each existing card
    horizontalCards.forEach((card, index) => {
        // Set initial position (fully off-screen to the right)
        card.style.transform = 'translateX(100%)';
        card.style.transitionDelay = '';
        void card.offsetHeight;
        
        // Set the delay before applying the transform
        card.style.transitionDelay = `${index * 100}ms`;
        
        // Apply the transform after a slight delay for DOM to update
        setTimeout(() => {
            card.style.transform = 'translateX(0)';
        }, 10);
    });
}

// Function to hide existing horizontal cards
function hideHorizontalCards() {
    const horizontalCards = document.querySelectorAll('.horizontal-card');
    const horizontalCardsContainer = document.querySelector('.horizontal-cards-container');
    
    horizontalCards.forEach((card, index) => {
        // Clear any existing transition delay
        card.style.transitionDelay = `${index * 50}ms`;
        
        // Move cards off screen to the right
        card.style.transform = 'translateX(150%)';
    });
    
    // Hide container after animation completes
    const maxDelay = horizontalCards.length * 50 + 500;
    setTimeout(() => {
        if (horizontalCardsContainer) {
            horizontalCardsContainer.style.display = 'none';
            
            // Reset all cards for next time
            horizontalCards.forEach(card => {
                card.style.transitionDelay = '';
            });
        }
    }, maxDelay);
    horizontalCardsVisible = false;
}

// UPDATED resetInterface function using class system
function resetInterface() {
    if (!interfaceExpanded) return;
    hideHorizontalCards();
    closeRhythmGame()
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.classList.remove('wave'); 
        returnButton.classList.remove('active');
    }
    const circularImage = document.querySelector('.circular-image');
    circularImage.classList.remove('expanded');
    const contentBox = document.querySelector('.content-box');
    contentBox.style.transform = 'translateY(0)';
    const rhomboids = document.querySelectorAll('.rhomboid:not(#return-button)');
    rhomboids.forEach((rhomboid, index) => {
        rhomboid.style.transform = 'translateX(400px)';
        rhomboid.classList.remove('active', 'wave');
        setTimeout(() => {
            rhomboid.style.transform = '';
            rhomboid.classList.add('active');
            setTimeout(() => {
                rhomboid.classList.add('wave');
            }, 1500);
        }, 300 + (index * 100));
    });
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
        }, 600 + (index * 50));
    });
    setTimeout(() => {
        interfaceExpanded = false;
        horizontalCardsVisible = false;
    }, 1200);
}

// Initialize everything
window.addEventListener('resize', adjustSpaceWidth);
adjustSpaceWidth();
handleTouchParallax();

// Add click event to circular image
document.addEventListener('DOMContentLoaded', function() {
    const circularImage = document.querySelector('.circular-image');
    if (circularImage) {
        circularImage.addEventListener('click', handleImageClick);
    }
    
    // Add click event to return button
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.addEventListener('click', resetInterface);
        console.log('Return button click listener added');
    } else {
        console.log('Return button not found during initialization');
    }
});

// Start the animation
setTimeout(animateLetters, 1000);