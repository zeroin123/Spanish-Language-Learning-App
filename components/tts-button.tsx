'use client';

import { useState } from 'react';
import { speakSpanish } from '@/lib/tts';

export default function TtsButton({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);

  function speak() {
    speakSpanish(text, 0.85, {
      onstart: () => setPlaying(true),
      onend:   () => setPlaying(false),
      onerror: () => setPlaying(false),
    });
  }

  return (
    <button
      onClick={speak}
      aria-label="Play audio"
      className="p-1.5 rounded-lg transition-colors"
      style={playing
        ? { color: '#0D9488', background: '#CCFBF1' }
        : { color: '#A8A29E' }
      }
      onMouseEnter={e => { if (!playing) (e.currentTarget as HTMLButtonElement).style.color = '#44403C'; }}
      onMouseLeave={e => { if (!playing) (e.currentTarget as HTMLButtonElement).style.color = '#A8A29E'; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    </button>
  );
}
