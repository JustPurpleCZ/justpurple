const name = "ADAM ZAHOR"; // Change me!
// Parallax
let mouseX = 0;
let mouseY = 0;
let centerX = window.innerWidth / 2;
let centerY = window.innerHeight / 2;
let parallaxEnabled = false;
let animationComplete = false;
// Rhythm
let rhythmGameActive = false;
let rhythmAudio = null;
let rhythmNotes = [];
let rhythmActiveNotes = [];
let rhythmScore = 0;
let rhythmCombo = 0;
let rhythmMaxCombo = 0;
let rhythmHits = { perfect: 0, great: 0, good: 0, miss: 0, total: 0 };
let rhythmFallSpeed = 200;
let rhythmStartTime = 0;
let rhythmAnimationFrame = null;
let rhythmPressedKeys = { 'd': false, 'f': false, 'j': false, 'k': false };
let rhythmHoldNotes = []; // Track active hold notes
let rhythmHeldKeys = { 'd': false, 'f': false, 'j': false, 'k': false }; // Track currently held keys
// Cards
let activeCard = null;
let cardsVisible = false;
let cardsAnimating = false;
// Scrolling
let currentSection = 0; // 0 = intro, 1 = home, 2 = projects, 3 = creations, 4 = contact, 5 = void
let isScrolling = false;
let scrollTimeout;
let interfaceExpanded = false;
let horizontalCardsVisible = false;

let projectsVisible = false;
let currentProject = 0;
const totalProjects = 4;

// Letter definitions using triangle types (0: none, 1: top-left, 2: top-right, 3: bottom-left, 4: bottom-right)
const letterDefinitions = {
    'A': [4, 3, 1, 2, 1, 2],
    'B': [1, 3, 1, 3, 3, 1],
    'C': [0, 0, 1, 0, 3, 4],
    'D': [0, 0, 2, 2, 4, 4],
    'E': [1, 2, 1, 0, 3, 4],
    'F': [1, 1, 3, 0, 1, 0],
    'G': [1, 2, 1, 0, 3, 2],
    'H': [3, 4, 3, 4, 1, 2],
    'I': [1, 0, 3, 0, 1, 0],
    'J': [0, 2, 0, 0, 3, 4],
    'K': [1, 4, 3, 1, 1, 3],
    'L': [1, 0, 0, 0, 3, 4],
    'M': [3, 4, 2, 1, 3, 4],
    'N': [3, 4, 2, 3, 3, 2],
    'O': [4, 3, 1, 4, 2, 1],
    'P': [1, 2, 3, 4, 1, 0],
    'Q': [4, 3, 1, 4, 2, 2],
    'R': [1, 3, 3, 1, 1, 3],
    'S': [4, 3, 2, 3, 2, 1],
    'T': [1, 1, 0, 1, 4, 0],
    'U': [0, 0, 3, 4, 3, 4],
    'V': [0, 0, 3, 4, 2, 1],
    'W': [3, 4, 3, 4, 2, 1],
    'X': [0, 0, 3, 4, 1, 2],
    'Y': [3, 4, 2, 1, 4, 0],
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



// Song data for each card - maps to party/music/
const cardSongs = {
    1: {
        title: "Medicine",
        audio: "party/music/medicine.mp3",
        map: "party/music/medicine.json"
    },
    2: {
        title: "Ellen Joe theme", 
        audio: "party/music/ellentheme.mp3",
        map: "party/music/ellen.json"
    },
    3: {
        title: "Polumnia Omnia",
        audio: "party/music/Polumnia Omnia.mp3",
        map: "party/music/polumnia.json"
    },
    4: {
        title: "Tenebre Rosso Sangue",
        audio: "party/music/church.mp3", 
        map: "party/music/pain.json"
    },
    5: {
        title: "Lustre",
        audio: "party/music/lustre.mp3",
        map: "party/music/painpremium.json"
    }
};

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
            <button class="rhythm-end-button" onclick="closeRhythmGame(); showHorizontalCards();">Continue</button>
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
        await new Promise((resolve, reject) => {
            rhythmAudio.addEventListener('loadeddata', resolve);
            rhythmAudio.addEventListener('error', reject);
        });
        loadingDiv.remove();
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
    rhythmHoldNotes = [];
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
            const noteArea = document.getElementById(`rhythm-note-area-${note.lane}`);
            if (!noteArea) return;
            
            const laneHeight = noteArea.clientHeight;
            const playableHeight = laneHeight;
            
            if (note.isHold) {
                if (!note.holdStarted) {
                    const timeDiff = note.time - currentTime;
                    let progress = 1 - (timeDiff / spawnWindow);
                    progress = Math.max(0, Math.min(1, progress));
                    
                    const topPosition = progress * playableHeight;
                    let topPercentage = (topPosition / laneHeight) * 100;
                    
                    // Adjust position so HEAD reaches the hit line at the correct god forsaken time 
                    const holdHeight = parseFloat(note.element.style.height) || 100;
                    const holdHeightPercentage = (holdHeight / laneHeight) * 100;
                    const adjustedTopPercentage = topPercentage - holdHeightPercentage;
                    
                    note.element.style.top = `${Math.max(-holdHeightPercentage, Math.min(100, adjustedTopPercentage))}%`;
                    
                    // Check if hold head has passed the hit line
                    if (timeDiff < -150 && !note.missed) {
                        rhythmNoteMissed(note);
                    }
                } else if (note.holding) {
                    // During hold: continue moving based on END timing
                    const endTimeDiff = note.endTime - currentTime;
                    let endProgress = 1 - (endTimeDiff / spawnWindow);
                    endProgress = Math.max(0, Math.min(1, endProgress));
                    
                    // Position so the END (top of hold note) reaches hit line when hold should end
                    const endTopPosition = endProgress * playableHeight;
                    const endTopPercentage = (endTopPosition / laneHeight) * 100;
                    
                    note.element.style.top = `${Math.max(-20, Math.min(100, endTopPercentage))}%`;
                    
                    // Visual feedback for active hold
                    if (!note.element.classList.contains('hold-active')) {
                        note.element.classList.add('hold-active');
                    }
                }
            } else {
                // Regular notes - same as before
                const timeDiff = note.time - currentTime;
                let progress = 1 - (timeDiff / spawnWindow);
                progress = Math.max(0, Math.min(1, progress));
                
                const topPosition = progress * playableHeight;
                let topPercentage = (topPosition / laneHeight) * 100;
                
                note.element.style.top = `${Math.max(0, Math.min(100, topPercentage))}%`;
                
                // Check if note is missed
                if (timeDiff < -150 && !note.hit && !note.missed) {
                    rhythmNoteMissed(note);
                }
            }
        }
    });
    
    updateHoldNotes(currentTime);
    
    // Remove notes that are far past
    const notesToRemove = rhythmActiveNotes.filter(note => {
        if (note.isHold) {
            return (note.hit || note.missed) && !note.holding;
        } else {
            return note.time < currentTime - 500;
        }
    });
    
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
            
            let bonusPoints = 50;
            
            rhythmScore += bonusPoints;
            rhythmCombo++;
            rhythmMaxCombo = Math.max(rhythmMaxCombo, rhythmCombo);
            rhythmHits.perfect++;
            
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
            note.holding = false;
            note.holdReleased = true;
            note.hit = true;

            let bonusPoints = 30;
            
            rhythmScore += bonusPoints;
            rhythmCombo++;
            
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
    
    // Check if it's a hold note
    if (note.type === 'hold' && note.duration) {
        // Create hold note with proper structure
        noteElement.className = `rhythm-game-note rhythm-game-note-${note.lane} rhythm-hold-note`;
        
        // Calculate hold note length based on duration and fall speed
        const spawnWindow = 2000; // Same as in updateRhythmNotes
        const laneHeight = noteArea.clientHeight;
        const playableHeight = laneHeight;
        
        // Calculate how long the hold note should be in pixels
        const holdLengthInPixels = (note.duration / spawnWindow) * playableHeight;
        
        noteElement.innerHTML = `
            <div class="rhythm-hold-end"></div>
            <div class="rhythm-hold-tail" style="height: ${holdLengthInPixels}px;"></div>
            <div class="rhythm-hold-head"></div>
        `;
        
        // Calculate total height: end + tail + head
        const totalHeight = 35 + holdLengthInPixels + 35; // end(35px) + tail + head(35px)
        noteElement.style.height = `${totalHeight}px`;
        
        // Store additional properties for hold notes
        note.isHold = true;
        note.holdStarted = false;
        note.holding = false;
        note.holdReleased = false;
        note.endTime = note.time + note.duration;
    } else {
        // Regular note
        noteElement.className = `rhythm-game-note rhythm-game-note-${note.lane}`;
        noteElement.style.height = '35px';
        note.isHold = false;
    }
    
    noteElement.style.top = '0%';
    noteArea.appendChild(noteElement);
    note.element = noteElement;
}

function checkRhythmNoteHit(key) {
    const currentTime = rhythmAudio.currentTime * 1000;
    
    const notesInLane = rhythmActiveNotes.filter(note => 
        note.lane === key && !note.hit && !note.missed
    );
    
    if (notesInLane.length === 0) return;
    
    // Sort notes by how close they are to the hit point
    notesInLane.sort((a, b) => {
        const aTimeDiff = Math.abs(a.time - currentTime);
        const bTimeDiff = Math.abs(b.time - currentTime);
        return aTimeDiff - bTimeDiff;
    });
    
    const closestNote = notesInLane[0];
    const timeDiff = Math.abs(closestNote.time - currentTime);
    
    // Wider hit window (350ms) for better playability - may change
    if (timeDiff <= 350) {
        console.log(`Hit note with accuracy: ${timeDiff}ms`);
        rhythmNoteHit(closestNote, timeDiff);
    }
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
        
        // Add ripple effect but without classes because I dont feel like it
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
function handleRhythmKeyUp(event) {
    if (!rhythmGameActive) return;
    
    const key = event.key.toLowerCase();
    if (!['d', 'f', 'j', 'k'].includes(key)) return;
    
    rhythmPressedKeys[key] = false;
    rhythmHeldKeys[key] = false;
    
    // Remove visual feedback
    const hitArea = document.querySelector(`.rhythm-hit-area-${key}`);
    if (hitArea) hitArea.classList.remove('active');
    
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
        // Released too late (doesn't happen but who cares better have it than not)
        else if (endTimeDiff < -200) {
            note.holdReleased = true;
            note.holding = false;
            note.hit = true;
            
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
// Helper function to get judgment from accuracy
function getJudgmentFromAccuracy(accuracy) {
    if (accuracy <= 50) return 'PERFECT';
    if (accuracy <= 120) return 'GREAT';
    if (accuracy <= 200) return 'GOOD';
    return 'BAD'; // You better not get these too often you hear
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
        // Classes? never heard of em
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

function endRhythmGame() {
    rhythmGameActive = false;
    
    // Calculate final stats yippie
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

const originalHandleImageClick = window.handleImageClick;
window.handleImageClick = function() {
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
                newCard.style.transform = 'scale(0.95)';
                hideHorizontalCards();
                // Start rhythm game
                startRhythmGame(index + 1);
            });
        });
    }, 600);
}

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
    
    const normalizedX = (mouseX - centerX) / centerX; 
    const normalizedY = (mouseY - centerY) / centerY; 
    
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

document.addEventListener('touchmove', (e) => {
    // Check if this is a vertical scroll gesture
    const touch = e.touches[0];
    const startY = touch.clientY;
    
    // Store the initial touch position
    if (!window.touchStartY) {
        window.touchStartY = startY;
    }
    
    const deltaY = Math.abs(startY - window.touchStartY);
    const deltaX = Math.abs(touch.clientX - (window.touchStartX || touch.clientX));
    
    if (deltaY > deltaX && deltaY > 10) {
        // This is a scroll gesture, I'll allow it
        return;
    }
    
    // Only prevent default and apply parallax for horizontal/small movements
    if (deltaY <= 10) {
        e.preventDefault();
        updateParallax({
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }
});

// Track touch start for better gesture detection
document.addEventListener('touchstart', (e) => {
    window.touchStartY = e.touches[0].clientY;
    window.touchStartX = e.touches[0].clientX;
});

// Clean up touch tracking
document.addEventListener('touchend', () => {
    window.touchStartY = null;
    window.touchStartX = null;
});
// Animation function
function animateLetters() {
    const letters = document.querySelectorAll('.letter');
    let allTriangles = [];
    
    // For each row
    for (let row = 0; row < 3; row++) {
        // Go through each letter, collecting left then right triangles
        for (let letterIndex = 0; letterIndex < letters.length; letterIndex++) {
            // First get the left 
            const leftCellIndex = row * 2 + 0;
            const leftTriangle = letters[letterIndex].querySelector(`.triangle[data-index="${leftCellIndex}"]`);
            if (leftTriangle) allTriangles.push(leftTriangle);
            
            // Then get the right
            const rightCellIndex = row * 2 + 1;
            const rightTriangle = letters[letterIndex].querySelector(`.triangle[data-index="${rightCellIndex}"]`);
            if (rightTriangle) allTriangles.push(rightTriangle);
        }
    }
    
    // Process triangles
    const rotationSteps = ['rotate-0', 'rotate-90', 'rotate-180', 'rotate-270', 'rotate-0', 'rotate-90', 'rotate-180', 'rotate-270', 'rotate-360'];
    
    // Get total animation time to know when to start the tagline
    const lastTriangleVisibleTime = (allTriangles.length - 1) * 30
    
    allTriangles.forEach((triangle, index) => {
        setTimeout(() => {
            triangle.classList.add('visible');
            
            // Rotate through all positions
            let rotationIndex = 0;
            
            function rotateTriangle() {
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
            
        }, index * 30);
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
    
    // Random character set and a silly
    const randomChars = '!@#$%^&*()_+-=[]{}|;:,./<>?`~𒀱ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
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
                    
                    // Check if it really showed the final character
                    if (index === charSlots.length - 1) {
                        setTimeout(finalAnimation, 300);
                    }
                }
                iterations++;
            }, 50);
            
        }, index * 100);
    });
}

function createBubbles() {
    createLayerBubbles('bubble-layer-back', 20);
    createLayerBubbles('bubble-layer-middle', 15);
    createLayerBubbles('bubble-layer-front', 15);
    
    // Enable parallax effect once bubbles are created
    setTimeout(() => {
        parallaxEnabled = true;
    }, 2500);
}

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
        // Big bubbles in front
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
        layerEl.appendChild(bubble);
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
        }, 200 + (i * 50));
    }
}

// Final animation with gradient background and rhomboids
function finalAnimation() {
    // Get the gradient overlay and activate it
    const gradientOverlay = document.querySelector('.gradient-overlay');
    gradientOverlay.classList.add('active');
    
    // Bubbles!
    createBubbles();
    
    // Animate rhomboids in a wave-like motion using a class because I learnt this time
    const rhomboids = document.querySelectorAll('.rhomboid:not(#return-button)');
    
    rhomboids.forEach((rhomboid, index) => {
        // Set initial transform explicitly to ensure they start off-screen
        rhomboid.style.transform = 'translateX(400px)';
        rhomboid.classList.remove('active', 'wave');
        
        setTimeout(() => {
            // Remove any inline transform and add active class
            rhomboid.style.transform = '';
            rhomboid.classList.add('active');
            
            // Add wave animation after the slide-in transition completes
            setTimeout(() => {
                rhomboid.classList.add('wave');
            }, 1500);
            
            // Home icon
            if (index === 0) {
                setTimeout(() => animatePath('home-outline-0'), 500);
            }
            
            // Rectangles
            if (index === 1) {
                setTimeout(() => {
                    animatePathGroup(['left-rectangle', 'middle-rectangle', 'right-rectangle'], 500, 100, 0);
                }, 500);
            }
            
            // Before time began there was the cube
            if (index === 2) {
                setTimeout(() => animatePath('cube-outline'), 500);
            }
            
            // Mail
            if (index === 3) {
                setTimeout(() => animatePath('mail-outline'), 500);
            }
        }, index * 400); 
    });
    
    animationComplete = true;
    document.querySelector('.scroll-indicator').style.opacity = '1';
}

// Handle scroll event to transition layout
window.addEventListener('scroll', () => {
    if (!animationComplete) return;
    
    // Clear previous timeout
    clearTimeout(scrollTimeout);
    
    // Determine which section we're in
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    
    let newSection; // I'm aware that this is not the nicest way to do it but it works and I dont care
    if (scrollTop < windowHeight * 0.5) {
        newSection = 0; // Intro
    } else if (scrollTop < windowHeight * 1.5) {
        newSection = 1; // Home
    } else if (scrollTop < windowHeight * 2.5){
        newSection = 2; // Projects
    } else if (scrollTop < windowHeight * 3.5){
        newSection = 3; // Creations
    } else {
        newSection = 4; // Contact
    }
    
    // Only update if section changed
    if (newSection !== currentSection) {
        currentSection = newSection;
        updateSectionDisplay();
    }
    
    // Set scrolling flag and clear it after scroll ends
    isScrolling = true;
    scrollTimeout = setTimeout(() => {
        isScrolling = false;
        snapToSection();
    }, 150);
});

// Ahh maths, scary
function handleTouchParallax() {
    if ('ontouchstart' in window) {
        // Gyroscope-based parallax
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

function initializeCards() {
    const cards = document.querySelectorAll('.card');
    
    // Set initial order for each card
    cards.forEach((card, index) => {
        card.setAttribute('data-original-order', index);
        card.setAttribute('data-current-order', index);
        card.addEventListener('click', () => {
            handleCardClick(card);
        });
    });
}

// Calculate the actual pixel positions for each card slot
function calculateCardSlotPositions() {
    const cardsContainer = document.querySelector('.cards-container');
    const containerWidth = cardsContainer.offsetWidth;
    const cardWidth = 180;
    const cardGap = 20;

    const containerCenter = containerWidth / 2;
    const totalCardsWidth = (5 * cardWidth) + (4 * cardGap);
    const startX = containerCenter - (totalCardsWidth / 2);

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

function handleCardClick(card) {
    // Prevent spamming NEEDS A FIX THIS NEEDS A FIX
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

function activateCard(card) {
    const currentOrder = parseInt(card.getAttribute('data-current-order'));
    
    card.classList.add('active');
    shuffleCardsLeft(currentOrder);
    
    // Flip card after it reaches destination
    setTimeout(() => {
        card.querySelector('.card-inner').style.transform = 'rotateY(180deg)';
    }, 500);
    
    // Set as active card
    activeCard = card;
}

// Shift cards after a card has been activated
function shiftCardsAfterActivation(activatedSlot) {
    const cards = document.querySelectorAll('.card');
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
function shuffleCardsLeft(activatedOrder) {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        if (card === activeCard) return;
        
        const currentOrder = parseInt(card.getAttribute('data-current-order'));
        
        // If card is to the right of activated card, move it left
        if (currentOrder > activatedOrder) {
            const newOrder = currentOrder - 1;
            card.setAttribute('data-current-order', newOrder);
            
            // Stagger
            setTimeout(() => {
                updateCardOrder(card, newOrder);
            }, index * 50);
        }
    });
}
function deactivateCard() {
    if (!activeCard) return;
    
    // Reset the flip
    activeCard.querySelector('.card-inner').style.transform = '';
    
    // Remove active class
    activeCard.classList.remove('active');
    
    // Move deactivated card to rightmost position
    moveCardToRightmost(activeCard);
    
    // Clear active card reference
    activeCard = null;
}
function moveCardToRightmost(card) {
    const cards = document.querySelectorAll('.card');
    const totalCards = cards.length;
    
    // Add moving class to all affected cards
    cards.forEach(c => c.classList.add('moving'));
    
    // Update the deactivated card's order
    card.setAttribute('data-current-order', totalCards - 1);
    updateCardOrder(card, totalCards - 1);
    
    // Animate other cards that need to shift
    cards.forEach((otherCard, index) => {
        if (otherCard === card) return;
        
        const currentOrder = parseInt(otherCard.getAttribute('data-current-order'));
        
        if (currentOrder >= totalCards - 1) {
            const newOrder = currentOrder - 1;
            otherCard.setAttribute('data-current-order', newOrder);
            
            setTimeout(() => {
                updateCardOrder(otherCard, newOrder);
            }, index * 50);
        }
    });
    
    // Remove moving classes after animation
    setTimeout(() => {
        cards.forEach(c => c.classList.remove('moving'));
    }, 1000);
}
function updateCardOrder(card, order) {
    // Add moving class for mowing grass
    card.classList.add('moving');
    
    // Set the new (world) order
    card.style.order = order;
    
    // Remove moving class after animation completes
    setTimeout(() => {
        card.classList.remove('moving');
    }, 800);
}

function handleImageClick() {
    if (interfaceExpanded) return;
    
    interfaceExpanded = true;
    
    // 1. Make cards go down out of frame
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('scrolled')
        }, index * 50);
    });
    
    // 2. Move content box out of frame to the left
    const contentBox = document.querySelector('.content-box');
    contentBox.style.transform = 'translateX(-100vw)';
    
    // 3. Hide rhomboids
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
    
    // 5. Show horizontal cards
    setTimeout(showHorizontalCards, 600);
    
    // 6. Show return button
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.classList.remove('active');
        setTimeout(() => {
            returnButton.style.transform = '';
            returnButton.classList.add('active');
        }, 800);
        setTimeout(() => {
            returnButton.classList.add('wave');      
        }, 2400);
    }
    
    // 7. Reattach rhythm game listeners
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
// I don't remember this, resets stuff probably
function resetInterface() {
    if (!interfaceExpanded) return;
    
    hideHorizontalCards();
    closeRhythmGame();
    
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
            card.classList.add('scrolled')
        }, 600 + (index * 50));
    });
    
    setTimeout(() => {
        interfaceExpanded = false;
        horizontalCardsVisible = false;
    }, 1200);
}

// Project navigation functions
function nextProject() {
    if (currentProject < totalProjects - 1) {
        goToProject(currentProject + 1);
    }
}

function previousProject() {
    if (currentProject > 0) {
        goToProject(currentProject - 1);
    }
}

function goToProject(index) {
    if (index === currentProject) return;
    
    currentProject = index;
    
    // Update folder visibility
    const folders = document.querySelectorAll('.folder');
    folders.forEach((folder, i) => {
        folder.classList.toggle('active', i === currentProject);
    });
    
    // Update dot indicators
    const dots = document.querySelectorAll('.project-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentProject);
    });
    
    // Update corner images with staggered animation
    updateCornerImages();
}


function updateCornerImages() {
    const cornerImages = document.querySelectorAll('.corner-image');
    const imageUrls = [
        `projects/sidepics/${currentProject * 4 + 1}.gif`,
        `projects/sidepics/${currentProject * 4 + 2}.gif`,
        `projects/sidepics/${currentProject * 4 + 3}.gif`,
        `projects/sidepics/${currentProject * 4 + 4}.gif`
    ];
        
    cornerImages.forEach((img, index) => {
        setTimeout(() => {
            img.classList.remove('animate');
            setTimeout(() => {
                // Create a new image element to preload
                const newImg = new Image();
                
                // Set up the load event handler before setting src
                newImg.onload = function() {
                    img.src = imageUrls[index];
                    img.classList.add('animate');
                };
                newImg.src = imageUrls[index];
            }, 350);
        }, index * 80);
    });
}

window.addEventListener('resize', adjustSpaceWidth);
adjustSpaceWidth();
handleTouchParallax();
function snapToSection() {
    const windowHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    let targetScroll = windowHeight * currentSection;
    
    // Only snap if we're not already close to the target
    if (Math.abs(scrollTop - targetScroll) > 50) {
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }
}

function updateSectionDisplay() {
    // Cache DOM elements to avoid repeated queries cuz that sucks
    const elements = {
        animationContainer: document.getElementById('animation-container'),
        taglineContainer: document.getElementById('tagline-container'),
        contentContainer: document.querySelector('.content-container'),
        circularImage: document.querySelector('.circular-image'),
        contentBox: document.querySelector('.content-box'),
        scrollIndicator: document.querySelector('.scroll-indicator'),
        cards: document.querySelectorAll('.card'),
        cardsContainer: document.querySelector('.cards-container'),
        projectsSection: document.querySelector('.projects-section'),
        galleryContainer: document.querySelector('.gallery-container'),
        galleryItems: document.querySelectorAll('.gallery-item'), 
        sliderContainer: document.querySelector('.gallery-slider-container'), 
        contactSection: document.getElementById('contact-section')
    };

    const sectionConfigs = {
        0: { // Intro Section
            animationContainer: { className: '', transform: 'translate(-50%, -50%) scale(1)' },
            taglineContainer: { className: '', opacity: '1' },
            contentContainer: { className: '' },
            circularImage: { className: '' },
            contentBox: { className: '' },
            projectsSection: { className: '' },
            galleryContainer: { className: '' },
            scrollIndicator: { opacity: '1' },
            cards: { action: 'hide' },
            gallery: { action: 'hide' },
            projects: { action: 'hide' },
            contact: { action: 'hide' }
        },
        1: { // Home Section
            animationContainer: { className: 'scrolled', transform: '' },
            taglineContainer: { className: 'scrolled', opacity: '0' },
            contentContainer: { className: 'visible' },
            circularImage: { className: 'scrolled' },
            contentBox: { className: 'scrolled' },
            projectsSection: { className: '' },
            galleryContainer: { className: '' },
            scrollIndicator: { opacity: '0' },
            cards: { action: 'show' },
            gallery: { action: 'hide' },
            projects: { action: 'hide' },
            contact: { action: 'hide' }
        },
        2: { // Projects Section
            animationContainer: { className: 'scrolled', transform: '' },
            taglineContainer: { className: 'scrolled', opacity: '0' },
            contentContainer: { className: '' },
            circularImage: { className: '' },
            contentBox: { className: '' },
            projectsSection: { className: 'visible' },
            galleryContainer: { className: '' },
            scrollIndicator: { opacity: '0' },
            cards: { action: 'hide' },
            gallery: { action: 'hide' },
            projects: { action: 'show' },
            contact: { action: 'hide' }
        },
        3: { // Gallery Section
            animationContainer: { className: 'scrolled', transform: '' },
            taglineContainer: { className: 'scrolled', opacity: '0' },
            contentContainer: { className: '' },
            circularImage: { className: '' },
            contentBox: { className: '' },
            projectsSection: { className: '' },
            galleryContainer: { className: 'visible' },
            scrollIndicator: { opacity: '0' },
            cards: { action: 'hide' },
            gallery: { action: 'show' },
            projects: { action: 'hide' },
            contact: { action: 'hide' }
        },
        4: { // Contact Section
            animationContainer: { className: 'scrolled', transform: '' },
            taglineContainer: { className: 'scrolled', opacity: '0' },
            contentContainer: { className: '' },
            circularImage: { className: '' },
            contentBox: { className: '' },
            projectsSection: { className: '' },
            galleryContainer: { className: '' },
            scrollIndicator: { opacity: '0' },
            cards: { action: 'hide' },
            gallery: { action: 'hide' },
            projects: { action: 'hide' },
            contact: { action: 'show' }
        }
    };

    const config = sectionConfigs[currentSection];
    if (!config) return;

    // Apply basic element states
    applyElementState(elements.animationContainer, config.animationContainer);
    applyElementState(elements.taglineContainer, config.taglineContainer);
    applyElementState(elements.contentContainer, config.contentContainer);
    applyElementState(elements.circularImage, config.circularImage);
    applyElementState(elements.contentBox, config.contentBox);
    applyElementState(elements.projectsSection, config.projectsSection);
    applyElementState(elements.scrollIndicator, config.scrollIndicator);

    // Handle complex animations
    handleCardsAnimation(elements, config.cards.action);
    handleProjectsAnimation(config.projects.action);
    handleGalleryAnimation(elements, config.gallery.action);
    handleContactAnimation(elements, config.contact?.action);
    // Update global state
    projectsVisible = config.projects.action === 'show';
}

// Helper function to apply element states
function applyElementState(element, state) {
    if (!element || !state) return;
    
    if (state.className !== undefined) {
        element.className = element.className.replace(/scrolled|visible/g, '').trim();
        if (state.className) element.classList.add(state.className);
    }
    
    if (state.transform !== undefined) {
        element.style.transform = state.transform;
    }
    
    if (state.opacity !== undefined) {
        element.style.opacity = state.opacity;
    }
}

// Handle cards animation logic
function handleCardsAnimation(elements, action) {
    if (action === 'show' && !cardsVisible) {
        cardsVisible = true;
        elements.cardsContainer.classList.add('visible');
        
        if (!activeCard) {
            initializeCards();
        }
        
        elements.cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('scrolled');
            }, index * 100);
        });
    } else if (action === 'hide' && cardsVisible) {
        cardsVisible = false;
        elements.cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.remove('scrolled');
            }, index * 50);
        });

    }
}

// Handle projects animation logic
function handleProjectsAnimation(action) {
    const cornerImages = document.querySelectorAll('.corner-image');
    const navArrows = document.querySelectorAll('.project-nav');
    const folderStack = document.querySelector('.folder-stack');

    if (action === 'show' && !projectsVisible) {
        // Animate folder stack
        setTimeout(() => folderStack.classList.add('animate'), 200);
        
        // Animate corner images
        setTimeout(() => {
            cornerImages.forEach((img, index) => {
                setTimeout(() => img.classList.add('animate'), index * 100);
            });
        }, 400);
        
        // Animate navigation arrows
        setTimeout(() => {
            navArrows.forEach((arrow, index) => {
                setTimeout(() => arrow.classList.add('animate'), index * 100);
            });
        }, 600);
    } else if (action === 'hide') {
        // Remove animations
        cornerImages.forEach(img => img.classList.remove('animate'));
        navArrows.forEach(arrow => arrow.classList.remove('animate'));
        folderStack.classList.remove('animate');
    }
}

// Handle gallery animation logic
function handleGalleryAnimation(elements, action) {

    if (action === 'show' && !elements.galleryContainer.classList.contains('visible')) {
        elements.galleryContainer.classList.add('visible');
        // Animate gallery items with staggered timing
        setTimeout(() => {
            elements.galleryItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate');
                }, index * 100);
            });
        }, 200);
        
        // Animate slider last
        setTimeout(() => {
            elements.sliderContainer.classList.add('animate');
        }, 800);
    } else if (action === 'hide' && elements.galleryContainer.classList.contains('visible')) {
        elements.galleryContainer.classList.remove('visible');
        elements.galleryItems.forEach(item => item.classList.remove('animate'));
        elements.sliderContainer.classList.remove('animate');
    }
}
function handleContactAnimation(elements, action) {
    if (!elements.contactSection) return;

    if (action === 'show' && !elements.contactSection.classList.contains('visible')) {
        elements.contactSection.classList.add('visible');
    } else if (action === 'hide' && elements.contactSection.classList.contains('visible')) {
        elements.contactSection.classList.remove('visible');
    }
}
function goToSection(section) {
    const windowHeight = window.innerHeight;
    let targetScroll = windowHeight * section;
    window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
    });
}

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
document.addEventListener('DOMContentLoaded', () => {
    // --- Minecraft yay ---
    const imagesData = [
        { src: 'creations/barn.png', title: 'Little Countryside', date: '2025-02-29' },
        { src: 'creations/metro.png', title: 'A metro station', date: '2025-04-30' },
        { src: 'creations/panel.png', title: 'Colorful building', date: '2025-05-16' },
        { src: 'creations/central.png', title: 'The Central', date: '2025-04-21' },
        { src: 'creations/grove.png', title: 'Grove', date: '2023-06-29' },
        { src: 'creations/dock.png', title: 'Nelvenian docks', date: '2023-04-17' },
        { src: 'creations/street.png', title: 'SF type street', date: '2023-04-08' },
        { src: 'creations/gym.png', title: 'Pokemon Gym', date: '2023-03-12' },
        { src: 'creations/boat.png', title: 'Ship of the new world', date: '2023-01-29' },
        { src: 'creations/home.png', title: 'Home', date: '2022-12-09' },
        { src: 'creations/ship.png', title: 'The first boat', date: '2022-12-09' }
    ];

    const itemBaseWidthVW = 60;
    const itemGapVW = 5;

    // DOM Elements
    const galleryTrack = document.querySelector('.gallery-track');
    const slider = document.getElementById('gallery-slider');
    const galleryViewport = document.querySelector('.gallery-viewport');

    let isSliderDragging = false;
    let rafId = null;

    // Some functions
    function initializeGallery() {
        galleryTrack.innerHTML = '';

        imagesData.forEach((imgData, index) => {
            const item = document.createElement('div');
            item.classList.add('gallery-item');
            item.dataset.index = index;

            const imgElement = document.createElement('img');
            imgElement.src = imgData.src;
            imgElement.alt = imgData.title;
            if (index < 3) imgElement.loading = 'eager'; else imgElement.loading = 'lazy';

            const titleDiv = document.createElement('div');
            titleDiv.classList.add('image-title');
            titleDiv.textContent = imgData.title;

            const dateDiv = document.createElement('div');
            dateDiv.classList.add('image-date');
            dateDiv.textContent = imgData.date;

            item.appendChild(imgElement);
            item.appendChild(titleDiv);
            item.appendChild(dateDiv);
            galleryTrack.appendChild(item);

            item.addEventListener('click', function() {
                const clickedIndex = parseInt(this.dataset.index);
                if (Math.abs(parseFloat(slider.value) - clickedIndex) > 0.001) {
                    slider.value = clickedIndex;
                    updateGalleryView(true);
                }
            });
        });

        if (imagesData.length > 0) {
            slider.min = 0;
            slider.max = imagesData.length > 1 ? imagesData.length - 1 : 0;
            slider.value = 0;
            slider.step = 0.01;
        } else {
            slider.disabled = true;
        }

        galleryTrack.style.transition = 'none';
        updateGalleryView(false);
    }

    function updateGalleryView(enableItemTransitions = false) {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
            const galleryItems = galleryTrack.querySelectorAll('.gallery-item');
            if (galleryItems.length === 0) return;

            const targetCenterIndex = parseFloat(slider.value);
            const viewportWidthPx = galleryViewport.offsetWidth;
            const itemWidthPx = (itemBaseWidthVW / 100) * window.innerWidth;
            const itemGapPx = (itemGapVW / 100) * window.innerWidth;
            const trackTranslateX = (viewportWidthPx / 2) - (targetCenterIndex * (itemWidthPx + itemGapPx) + (itemWidthPx / 2));

            if (!isSliderDragging && galleryTrack.style.transition !== 'none') {
                galleryTrack.style.transform = `translateX(${trackTranslateX}px)`;
            } else {
                galleryTrack.style.transition = 'none';
                galleryTrack.style.transform = `translateX(${trackTranslateX}px)`;
            }

            galleryItems.forEach((item, index) => {
                const distance = index - targetCenterIndex;
                let scale = 1, blur = 0, itemOpacity = 1;
                let zIndex = imagesData.length - Math.abs(Math.round(distance));
                let currentItemTransform = 'translateY(-50%)';

                if (enableItemTransitions) {
                    item.style.transition = 'transform 0.5s ease-out, filter 0.5s ease-out, opacity 0.5s ease-out';
                } else {
                    item.style.transition = 'none';
                }

                if (Math.abs(distance) < 0.5) {
                    scale = 1.0;
                    blur = 0;
                    itemOpacity = 1;
                    item.classList.add('active');
                } else {
                    const factor = Math.abs(distance);
                    scale = Math.max(0.55, 1 - factor * 0.25);
                    blur = Math.min(6, factor * 3.5);
                    itemOpacity = Math.max(0.45, 1 - factor * 0.3);
                    item.classList.remove('active');
                }

                currentItemTransform += ` scale(${scale})`;
                item.style.transform = currentItemTransform;
                item.style.filter = `blur(${blur}px)`;
                item.style.opacity = itemOpacity;
                item.style.zIndex = zIndex;
            });
        });
    }
    document.addEventListener('keydown', (e) => {
    if (!animationComplete) return;

    // Rhythm Game specific key handling
    if (rhythmGameActive) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeRhythmGame();
            showHorizontalCards();
            return;
        }
        if (e.key === ' ' && rhythmAudio) {
            e.preventDefault();
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
            return;
        }
    }

    let eventHandledInSection = false;

    if (currentSection === 2) { // Projects Section
        if (e.key === 'ArrowLeft') {
            previousProject();
            eventHandledInSection = true;
        } else if (e.key === 'ArrowRight') {
            nextProject();
            eventHandledInSection = true;
        }
    } else if (currentSection === 3) { // Gallery Section
        const slider = document.getElementById('gallery-slider');
        const galleryTrack = document.querySelector('.gallery-track');

        if (slider && galleryTrack) {
            let currentValue = parseFloat(slider.value);
            const maxSliderValue = parseFloat(slider.max);
            let targetValue = Math.round(currentValue);

            if (e.key === 'ArrowLeft') {
                targetValue -= 1;
                if (targetValue >= 0) {
                    // Apply transition for smooth track movement, similar to handleSliderSnap
                    galleryTrack.style.transition = 'transform 0.3s ease-out';
                    slider.value = targetValue;
                    updateGalleryView(false); // Update view with item animations
                }
                eventHandledInSection = true;
            } else if (e.key === 'ArrowRight') {
                targetValue += 1;
                if (targetValue <= maxSliderValue) {
                    galleryTrack.style.transition = 'transform 0.3s ease-out';
                    slider.value = targetValue;
                    updateGalleryView(true);
                }
                eventHandledInSection = true;
            }
        }
    }

    if (eventHandledInSection) {
        e.preventDefault();
        return;
    }
    // This part will only be reached if left/right arrows were not handled by something else
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentSection > 0) {
            goToSection(currentSection - 1);
        }
    } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        // 4 is the last section index, no more
        if (currentSection < 4) {
            goToSection(currentSection + 1);
        }
    }
});
    // --- Slider Snap Logic ---
    function handleSliderSnap() {
        const currentValue = parseFloat(slider.value);
        const nearestIndex = Math.round(currentValue);

        // Only snap if significantly off-integer
        if (Math.abs(currentValue - nearestIndex) > 0.01) {
            galleryTrack.style.transition = 'transform 0.3s ease-out'; // Snap animation for track
            slider.value = nearestIndex; // Set slider to the target
            updateGalleryView(true);     // Animate track and items to the snapped position
        } else {

            if (slider.value != nearestIndex) {
                 slider.value = nearestIndex;
            }
            updateGalleryView(galleryTrack.style.transition !== 'none');
        }
    }

    // Event Listeners
    slider.addEventListener('mousedown', () => {
        isSliderDragging = true;
        galleryTrack.style.transition = 'none';
    });

    slider.addEventListener('touchstart', () => {
        isSliderDragging = true;
        galleryTrack.style.transition = 'none';
    }, { passive: true });


    document.addEventListener('mouseup', () => {
        if (isSliderDragging) {
            isSliderDragging = false;
            handleSliderSnap();
        }
    });

    document.addEventListener('touchend', () => {
        if (isSliderDragging) {
            isSliderDragging = false;
            handleSliderSnap(); // Call snap logic for touch devices
        }
    }, { passive: true });

    slider.addEventListener('input', () => {
        if (isSliderDragging) {
            updateGalleryView(false); // Item transitions off for drag responsiveness
        }
    });

    window.addEventListener('resize', () => {
        galleryTrack.style.transition = 'none';
        updateGalleryView(false);
    });
    initializeGallery();
});
// Start the animation
setTimeout(animateLetters, 1000);