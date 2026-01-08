
/**
 * Simple client for Microsoft Edge Read Aloud TTS (WebSocket)
 */
export class EdgeTTS {
    constructor() {
        this.endpoint = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";
    }

    /**
     * Synthesize text to audio buffer
     * @param {string} text - Text to speak
     * @param {string} voice - Voice key (e.g., 'en-US-AriaNeural')
     * @returns {Promise<ArrayBuffer>}
     */
    async synthesize(text, voice = 'en-US-AriaNeural') {
        console.log(`[EdgeTTS] Requesting: "${text.substring(0, 15)}...", Voice: ${voice}`);
        return new Promise((resolve, reject) => {
            console.log('[EdgeTTS] Connecting to WebSocket...');
            const ws = new WebSocket(
                `${this.endpoint}&ConnectionId=${this._uuid()}`
            );

            const audioChunks = [];
            const requestId = this._uuid().replace(/-/g, '');

            ws.onopen = () => {
                // 1. Send Configuration
                const configMsg = {
                    context: {
                        synthesis: {
                            audio: {
                                metadataoptions: {
                                    sentenceBoundaryEnabled: "false",
                                    wordBoundaryEnabled: "false"
                                },
                                outputFormat: "audio-24khz-48kbitrate-mono-mp3"
                            }
                        }
                    }
                };
                this._send(ws, configMsg, "speech.config");

                // 2. Send SSML
                const ssml = `
          <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
            <voice name='Microsoft Server Speech Text to Speech Voice (${voice})'>
              ${this._escape(text)}
            </voice>
          </speak>
        `;
                this._send(ws, ssml, "ssml", requestId);
            };

            ws.onmessage = async (event) => {
                const data = event.data;

                if (typeof data === 'string') {
                    // Text metadata (turn.start, turn.end, response, etc.)
                    if (data.includes("turn.end")) {
                        ws.close();
                        // Combine chunks
                        const totalLength = audioChunks.reduce((acc, val) => acc + val.length, 0);
                        const result = new Uint8Array(totalLength);
                        let offset = 0;
                        for (let chunk of audioChunks) {
                            result.set(chunk, offset);
                            offset += chunk.length;
                        }
                        resolve(result.buffer);
                    }
                } else if (data instanceof Blob) {
                    // Binary audio data
                    // Format: header (2 bytes length) + content
                    // We need to strip the textual header from the binary packet to get pure MP3
                    // However, Edge protocol usually sends text line headers followed by binary. 
                    // In browser WebSocket, Blob/ArrayBuffer handling might be slightly different than Node.

                    const arrayBuffer = await data.arrayBuffer();
                    const view = new DataView(arrayBuffer);

                    // Search for the binary start. 
                    // Protocol: "Path:audio\r\n" ... headers ... \r\n\r\n [BINARY]
                    const headerEnd = this._findHeaderEnd(new Uint8Array(arrayBuffer));
                    if (headerEnd > 0) {
                        audioChunks.push(new Uint8Array(arrayBuffer.slice(headerEnd)));
                    }
                }
            };

            ws.onerror = (e) => reject(e);
            // ws.onclose = () => { if chunks empty, reject? }
        });
    }

    _send(ws, data, path, requestId) {
        const msg =
            `X-Timestamp:${new Date().toString()}\r\n` +
            `Content-Type:application/json; charset=utf-8\r\n` +
            `Path:${path}\r\n` +
            (requestId ? `X-RequestId:${requestId}\r\n` : ``) +
            `\r\n` +
            (typeof data === 'string' ? data : JSON.stringify(data));

        ws.send(msg);
    }

    _uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    _escape(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    _findHeaderEnd(uint8Array) {
        // Look for \r\n\r\n in ASCII (0x0D 0x0A 0x0D 0x0A)
        for (let i = 0; i < uint8Array.length - 3; i++) {
            if (uint8Array[i] === 0x0D &&
                uint8Array[i + 1] === 0x0A &&
                uint8Array[i + 2] === 0x0D &&
                uint8Array[i + 3] === 0x0A) {
                return i + 4;
            }
        }
        return -1;
    }
}
