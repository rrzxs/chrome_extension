import { GoogleTTS } from '../lib/google_tts.js';
import { LangDetect } from '../lib/lang_detect.js';

// --- Offscreen Management ---
let creating; // Promise keeper to prevent multiple creations

async function setupOffscreenDocument(path) {
    if (creating) {
        await creating;
    } else {
        creating = (async () => {
            try {
                const existingContexts = await chrome.runtime.getContexts({
                    contextTypes: ['OFFSCREEN_DOCUMENT']
                });
                if (existingContexts.length > 0) return;

                await chrome.offscreen.createDocument({
                    url: path,
                    reasons: ['AUDIO_PLAYBACK'],
                    justification: 'Playback of TTS audio',
                });
            } catch (err) {
                if (!err.message.startsWith('Only a single offscreen')) throw err;
            }
        })();

        try {
            await creating;
        } finally {
            creating = null;
        }
    }
}

async function sendToOffscreen(msg) {
    await setupOffscreenDocument('src/offscreen/offscreen.html');
    return chrome.runtime.sendMessage(msg);
}

// --- Main Logic ---

chrome.commands.onCommand.addListener(async (command) => {
    console.log('[QuickTran] Command received:', command);
    if (command === 'speak-selection') {
        handleSpeakCommand();
    }
});

// Also trigger on icon click
chrome.action.onClicked.addListener((tab) => {
    console.log('[QuickTran] Icon clicked');
    handleSpeakCommand();
});

async function handleSpeakCommand() {
    console.log('[QuickTran] handleSpeakCommand started');
    try {
        // 1. Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            console.warn('[QuickTran] No active tab found');
            return;
        }

        // 2. Initial feedback (Tick sound)
        // Fire and forget, don't await this blocking the TTS fetch
        sendToOffscreen({ type: 'PLAY_TICK', target: 'offscreen' }).catch(() => { });

        // 3. Get selection text
        let result;
        try {
            result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.getSelection().toString().trim()
            });
        } catch (scriptErr) {
            console.error('[QuickTran] Script injection failed:', scriptErr);
            // Play "Error" sound (Double tick)
            sendToOffscreen({ type: 'PLAY_ERROR', target: 'offscreen' }).catch(() => { });
            return;
        }

        // Result structure: [{result: "selected text", ...}]
        const text = result[0]?.result;

        if (!text) {
            console.log("No text selected");
            return;
        }

        // 4. Detect Language & Voice
        // Truncate text if too long (Edge TTS has limits, e.g. ~10min, but better safe for 'quick' selection)
        const safeText = text.substring(0, 2000);
        const voice = LangDetect.getVoice(safeText);
        console.log(`Speaking: "${safeText.substring(0, 20)}..." using ${voice}`);

        // 5. Fetch TTS Audio (Google)
        const tts = new GoogleTTS();
        const audioBuffer = await tts.synthesize(safeText, voice);

        // 6. Play Audio
        // We must transfer the buffer to offscreen
        // Note: Chrome messaging handles serialization of ArrayBuffer
        await sendToOffscreen({
            type: 'PLAY_AUDIO',
            target: 'offscreen',
            data: Array.from(new Uint8Array(audioBuffer)) // Serialize just in case
        });

    } catch (err) {
        console.error("Speak selection failed:", err);
    }
}
