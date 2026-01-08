
/**
 * Simple client for Google Translate TTS
 * Extremely stable, no WebSocket handshake required.
 */
export class GoogleTTS {
    /**
     * Synthesize text to audio buffer
     * @param {string} text - Text to speak
     * @param {string} lang - Language code (e.g., 'en-US', 'zh-CN')
     * @returns {Promise<ArrayBuffer>}
     */
    async synthesize(text, lang = 'en-US') {
        // Map Edge-style voice/lang codes to Google style if needed
        // Simple mapping: 'zh-CN-XiaoxiaoNeural' -> 'zh-CN'
        const cleanLang = lang.split('-').slice(0, 2).join('-');

        // Google TTS API (unofficial but widely used 'tw-ob' client)
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${cleanLang}&total=1&idx=0&textlen=${text.length}&client=tw-ob&prev=input&ttsspeed=1`;

        console.log(`[GoogleTTS] Fetching: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google TTS failed: ${response.status} ${response.statusText}`);
        }

        return await response.arrayBuffer();
    }
}
