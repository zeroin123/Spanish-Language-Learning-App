/**
 * Speak text using the best available Spanish voice.
 *
 * The Web Speech API loads voices asynchronously on first use.
 * If no voices are ready yet, we wait for `voiceschanged` then speak.
 * We prefer `es-ES` (Castilian), then any `es-*` variant.
 *
 * Returns a cleanup function that cancels speech when called.
 */
export function speakSpanish(
  text: string,
  rate = 0.85,
  callbacks?: { onstart?: () => void; onend?: () => void; onerror?: () => void },
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return () => {};
  }

  window.speechSynthesis.cancel();

  function buildAndSpeak() {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'es-ES';
    utt.rate = rate;

    // Explicitly pick a Spanish voice so the browser doesn't fall back to English
    const voices = window.speechSynthesis.getVoices();
    const spanish =
      voices.find(v => v.lang === 'es-ES') ||
      voices.find(v => v.lang === 'es-MX') ||
      voices.find(v => v.lang.startsWith('es'));
    if (spanish) utt.voice = spanish;

    if (callbacks?.onstart) utt.onstart = callbacks.onstart;
    if (callbacks?.onend)   utt.onend   = callbacks.onend;
    if (callbacks?.onerror) utt.onerror  = callbacks.onerror;

    window.speechSynthesis.speak(utt);
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    buildAndSpeak();
  } else {
    // Voices haven't loaded yet — wait for the event (fires once on first page load)
    window.speechSynthesis.addEventListener('voiceschanged', buildAndSpeak, { once: true });
  }

  return () => window.speechSynthesis.cancel();
}

/** Returns a list of installed Spanish voices (useful for diagnostics). */
export function getSpanishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
}
