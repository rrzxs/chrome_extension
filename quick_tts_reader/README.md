# Vibe TTS Reader (Chrome Extension)

Use AI-powered voices to read selected text aloud with a simple keyboard shortcut.

## ✨ Features
- **High-Quality AI Voices**: Uses AI neural TTS engine for natural, human-like pronunciation.
- **Smart Language Detection**: Automatically detects language (Chinese, Japanese, Korean, English, etc.) and picks the best voice.
- **No UI Clutter**: Works in the background. Simply select text and press the shortcut.
- **Instant Feedback**: Plays a subtle "tick" sound when processing starts.

## 🚀 Installation
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in top right).
3. Click **Load unpacked**.
4. Select the `quick_tts_reader` folder in this directory.

## 📖 Usage
1. Open any webpage (refresh existing pages after installation).
2. **Select any text** you want to hear.
3. Press **`Alt + S`** (Windows/Linux) or **`Option + S`** (Mac).
   *(Note: Shortcuts can be customized in `chrome://extensions/shortcuts`)*
4. Listen! 🎧

## ⚙️ Configuration (Shortcuts)
By default, the shortcut is **`Alt + S`** (Mac: `Option + S`). 

To change this:
1. Copy and paste this URL into your address bar: 
   `chrome://extensions/shortcuts`
2. Find **"Quick Translation & Pronunciation"**.
3. Click the pen icon regarding "Read selected text aloud" and press your desired key combo (e.g., `Cmd+E`).

  - Some protected pages (like `chrome://` URLs or Chrome Web Store) do not allow script injection. Try on a normal website (e.g., Wikipedia, GitHub).

## 📂 Structure
- `src/background`: Service Worker (Main logic)
- `src/offscreen`: Audio playback handler (Offscreen Document)
- `src/lib`: Edge TTS client and Language Detector
