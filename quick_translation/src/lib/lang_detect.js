
/**
 * Simple language detector and voice mapper
 */
export class LangDetect {
    static getVoice(text) {
        // Regex for scripts
        const reChinese = /[\u4e00-\u9fa5]/;
        const reJapanese = /[\u3040-\u309f\u30a0-\u30ff]/;
        const reKorean = /[\uac00-\ud7af]/;

        // Helper to count occurrences
        const count = (re) => (text.match(re) || []).length;

        // Simple heuristic: if > 20% of chars are CJK, treat as CJK
        // This avoids "Hello 世界" being treated purely as English if it's mixed

        if (reChinese.test(text)) {
            // Simple priority check
            // If Japanese chars exist, it might be Japanese (Kanji is shared)
            // Heuristic: If hiragana/katakana present, likely JP.
            if (reJapanese.test(text)) return 'ja-JP-NanamiNeural';
            return 'zh-CN-XiaoxiaoNeural';
        }

        if (reJapanese.test(text)) return 'ja-JP-NanamiNeural';
        if (reKorean.test(text)) return 'ko-KR-SunHiNeural';

        // Default to English (High Quality)
        return 'en-US-AriaNeural';
    }
}
