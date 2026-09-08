/**
 * Speech Utility for Gujarati Audio Playback
 * Combines Web Speech API (SpeechSynthesis) and Gemini TTS API with Web Audio PCM Decoder.
 */

// Decode base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert raw 24kHz 16-bit PCM buffer to WAV ArrayBuffer
function pcmToWav(pcmBuffer: ArrayBuffer, sampleRate = 24000, numChannels = 1): ArrayBuffer {
  const pcmBytes = new Uint8Array(pcmBuffer);
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  /* RIFF identifier */
  view.setUint8(0, 0x52); // 'R'
  view.setUint8(1, 0x49); // 'I'
  view.setUint8(2, 0x46); // 'F'
  view.setUint8(3, 0x46); // 'F'
  /* file length */
  view.setUint32(4, 36 + pcmBytes.length, true);
  /* 'WAVE' type */
  view.setUint8(8, 0x57);  // 'W'
  view.setUint8(9, 0x41);  // 'A'
  view.setUint8(10, 0x56); // 'V'
  view.setUint8(11, 0x45); // 'E'
  /* format chunk identifier */
  view.setUint8(12, 0x66); // 'f'
  view.setUint8(13, 0x6d); // 'm'
  view.setUint8(14, 0x74); // 't'
  view.setUint8(15, 0x20); // ' '
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (pcm) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numChannels * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  view.setUint8(36, 0x64); // 'd'
  view.setUint8(37, 0x61); // 'a'
  view.setUint8(38, 0x74); // 't'
  view.setUint8(39, 0x61); // 'a'
  /* data chunk length */
  view.setUint32(40, pcmBytes.length, true);

  const wavBytes = new Uint8Array(wavHeader.byteLength + pcmBytes.byteLength);
  wavBytes.set(new Uint8Array(wavHeader), 0);
  wavBytes.set(pcmBytes, wavHeader.byteLength);

  return wavBytes.buffer;
}

/**
 * Play Gujarati text using Browser Native SpeechSynthesis
 */
export function playGujaratiWebSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find Gujarati or Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const gujVoice = voices.find(
      (v) => v.lang.includes('gu') || v.lang.includes('GU') || v.name.toLowerCase().includes('gujarati')
    ) || voices.find(
      (v) => v.lang.includes('hi') || v.lang.includes('HI') || v.name.toLowerCase().includes('hindi')
    );

    if (gujVoice) {
      utterance.voice = gujVoice;
    }
    utterance.lang = gujVoice ? gujVoice.lang : 'gu-IN';
    utterance.rate = 0.9; // Slightly slower for clear business understanding
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      if (onEnd) onEnd();
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Error initiating Web Speech:', err);
    if (onError) onError(err);
    return false;
  }
}

/**
 * Stop active audio or speech synthesis
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speak Gujarati message with automatic fallback between Gemini TTS and Web Speech API
 */
export async function speakGujaratiMessage(
  text: string,
  onStart: () => void,
  onEnd: () => void
): Promise<void> {
  onStart();

  // Try server TTS first
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName: 'Kore' }),
    });

    const data = await res.json();

    if (data.success && data.audioBase64) {
      const pcmArrayBuffer = base64ToArrayBuffer(data.audioBase64);
      const wavArrayBuffer = pcmToWav(pcmArrayBuffer, 24000, 1);
      const blob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
        onEnd();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        // Fallback to Web Speech if Audio element fails
        playGujaratiWebSpeech(text, undefined, onEnd, onEnd);
      };

      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Server TTS endpoint error, falling back to Web Speech API:', err);
  }

  // Fallback to Web Speech API
  const success = playGujaratiWebSpeech(text, undefined, onEnd, () => onEnd());
  if (!success) {
    onEnd();
  }
}
