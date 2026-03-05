let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

export function playClickSound() {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.error("Audio playback failed", e);
    }
}

export function playFocusSound() {
    try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
        console.error("Audio playback failed", e);
    }
}

// Triggers haptic vibration if supported (Mobile devices primarily)
export function triggerVibration(pattern = 50) {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try {
            window.navigator.vibrate(pattern);
        } catch (e) {
            console.warn("Vibration failed", e);
        }
    }
}

// Uses SpeechSynthesis to read text out loud for visually impaired users
export function speakText(text) {
    if (!text) return;
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech so it feels responsively snapping to the new element
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = 1;
        utterance.rate = 1.1; // Slightly faster than default
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}
