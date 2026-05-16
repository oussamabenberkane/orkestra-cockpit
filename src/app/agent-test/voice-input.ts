// Minimal wrapper around the browser's Web Speech API. Used by the
// Composer's mic button to dictate questions in French. Pure browser API,
// no backend or network round-trip — works as long as Chrome / Edge /
// Safari is available.
//
// Note on locale: `fr-CH` is not consistently supported across browsers
// (Chrome's implementation tends to accept it but fall back to `fr-FR`
// recognition under the hood). We default to `fr-FR`, which is reliably
// supported and indistinguishable for written transcripts of common
// brokerage vocabulary.

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechWindow {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
}

export function isVoiceInputSupported(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as SpeechWindow;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export interface VoiceSession {
  /** Stop listening and finalise. Idempotent. */
  stop(): void;
}

export interface VoiceCallbacks {
  /** Called for every interim or final transcript. The receiver is expected
   * to replace the textarea content with `transcript` each time (the API
   * returns the cumulative recognised text, not deltas). */
  onTranscript(transcript: string, isFinal: boolean): void;
  /** Called when recognition stops for any reason (user, timeout, error). */
  onEnd(): void;
  /** Called on recoverable errors — typically "no-speech" or "aborted". The
   * receiver should surface this to the user only when meaningful. */
  onError?(error: string): void;
}

/**
 * Start a voice recognition session. Returns a handle the caller uses to
 * stop the session early. Throws if the API isn't available — callers
 * should gate the UI on `isVoiceInputSupported()` first.
 */
export function startVoiceInput(cb: VoiceCallbacks): VoiceSession {
  const w = window as unknown as SpeechWindow;
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) throw new Error("SpeechRecognition is not available in this browser.");

  const rec = new Ctor();
  rec.lang = "fr-FR";
  // continuous=true: keep listening across natural speech pauses until the
  // caller explicitly stops the session. With continuous=false the engine
  // ends after the first detected end-of-utterance (and fires a no-speech
  // error within ~5-8s if the user hesitates after clicking), which surfaces
  // as "the mic stops on its own". The onresult handler below already
  // accumulates multiple isFinal=true results, so the cumulative transcript
  // stays correct.
  rec.continuous = true;
  rec.interimResults = true;

  rec.onresult = (ev) => {
    // Aggregate all alternatives into the final cumulative transcript. The
    // Web Speech API returns a list of `SpeechRecognitionResult` items,
    // each with one or more alternatives; we take alternative 0 of each
    // and join them.
    let final = "";
    let interim = "";
    for (let i = 0; i < ev.results.length; i++) {
      const r = ev.results[i];
      const alt = r[0];
      if (!alt) continue;
      if (r.isFinal) final += alt.transcript;
      else interim += alt.transcript;
    }
    const combined = (final + interim).trim();
    if (combined) {
      cb.onTranscript(combined, Boolean(final && !interim));
    }
  };

  rec.onerror = (ev) => {
    cb.onError?.(ev.error ?? "unknown");
  };

  rec.onend = () => {
    cb.onEnd();
  };

  try {
    rec.start();
  } catch (err) {
    // Some browsers throw if start() is called while another session is
    // running. We let the caller treat this as an immediate end.
    cb.onError?.(err instanceof Error ? err.message : "start-failed");
    cb.onEnd();
  }

  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        // ignore — recognizer may already be stopped
      }
    },
  };
}
