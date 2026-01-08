// Listen for messages from the background script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.target !== 'offscreen') return;

    try {
        switch (message.type) {
            case 'PLAY_AUDIO':
                await playAudio(message.data);
                sendResponse({ success: true });
                break;
            case 'PLAY_TICK':
                await playTick();
                sendResponse({ success: true });
                break;
            case 'PLAY_ERROR':
                await playError();
                sendResponse({ success: true });
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    } catch (error) {
        console.error('Error in offscreen:', error);
        sendResponse({ success: false, error: error.message });
    }
    // Return true to indicate async response
    return true;
});

async function playAudio(data) {
    // Ensure we have a typed array for the Blob constructor
    const u8Buffer = new Uint8Array(data);
    const blob = new Blob([u8Buffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    await audio.play();

    // Cleanup after playback matches duration or error
    audio.onended = () => URL.revokeObjectURL(url);
    audio.onerror = () => URL.revokeObjectURL(url);
}

async function playTick() {
    // Simple short beep using Web Audio API for zero-latency feedback
    // No external assets needed
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
}

async function playError() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const beep = (startTime) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, startTime);
        osc.frequency.linearRampToValueAtTime(100, startTime + 0.1);

        gain.gain.setValueAtTime(0.5, startTime);
        gain.gain.linearRampToValueAtTime(0.01, startTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.15);
    };

    beep(ctx.currentTime);
    beep(ctx.currentTime + 0.2);
}
