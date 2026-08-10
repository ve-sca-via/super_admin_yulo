import { useCallback, useRef, useState } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

// Every mic button in the app (home, the search screen, the menu index sheet)
// wraps the platform recognizer the same way: ask for the mic once, stream
// interim transcripts back to whatever query state the caller owns, and hand
// back the final phrase when the speaker stops. `no-speech` is swallowed
// rather than surfaced — tapping the mic and staying quiet isn't an error a
// customer needs telling about, it's just a search they changed their mind on.
export default function useVoiceSearch({ onResult, lang = "en-US" } = {}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => setListening(false));

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript;
    if (transcript) onResultRef.current?.(transcript, { isFinal: event.isFinal });
  });

  useSpeechRecognitionEvent("error", (event) => {
    setListening(false);
    if (event.error === "no-speech") return;
    setError("Couldn't hear that — try again.");
  });

  const start = useCallback(async () => {
    setError(null);

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      setError("Microphone access is needed for voice search.");
      return;
    }

    ExpoSpeechRecognitionModule.start({ lang, interimResults: true, continuous: false });
  }, [lang]);

  const stop = useCallback(() => ExpoSpeechRecognitionModule.stop(), []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { listening, error, start, stop, toggle };
}
