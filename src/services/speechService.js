// Web Speech & Free External TTS Audio Service

let currentAudioElement = null;

// Stop any active speech (both HTML5 audio stream and Web Speech)
export function stopSpeech() {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {}
    currentAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

// Play Text-To-Speech with dual engine (Universal Audio stream + Web Speech fallback)
export function speakText(text, lang = 'hi-IN') {
  if (!text) return;
  stopSpeech();

  const langCode = lang.startsWith('hi') ? 'hi' : 'en';
  // Strip parenthetical text like (Gehu), (Tamatar), (Dhan) so crop names are NEVER doubled
  const cleanText = text
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[*_#`]/g, '')
    .trim()
    .substring(0, 250);

  // Primary Engine: High-fidelity audio stream from /api/tts (works across all browsers, OS, Linux, Android)
  try {
    const audioUrl = `/api/tts?tl=${langCode}&q=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(audioUrl);
    currentAudioElement = audio;

    audio.onended = () => {
      currentAudioElement = null;
    };

    audio.onerror = () => {
      console.warn('TTS streaming audio load error, fallback to browser synthesis');
      speakWithBrowserSynthesis(cleanText, lang);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((audioErr) => {
        console.warn('Audio stream auto-play restricted, falling back to Web Speech Synthesis', audioErr);
        speakWithBrowserSynthesis(cleanText, lang);
      });
    }
  } catch (err) {
    console.warn('TTS streaming initialization error, fallback to synthesis', err);
    speakWithBrowserSynthesis(cleanText, lang);
  }
}

// Fallback Browser SpeechSynthesis
function speakWithBrowserSynthesis(text, lang) {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find(v => 
      lang.startsWith('hi') ? v.lang.includes('hi') : (v.lang.includes('en-IN') || v.lang.includes('en'))
    );
    if (matched) utterance.voice = matched;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('SpeechSynthesis error:', e);
  }
}

// Request real microphone permission
export async function requestMicrophoneAccess() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Microphone mediaDevices API not available in this browser');
  }
  return await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });
}

// Get optimal supported audio MIME type across Brave, Chrome, Safari iOS, Android
export function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus'
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return 'audio/webm';
}

// Create Web Audio Volume / Decibel Monitor with Silence Auto-Stop
export function createAudioLevelMeter(stream, onVolume, onSilence) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    const audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.4;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId = null;

    let hasSpoken = false;
    let spokenStartTime = 0;
    let lastLoudTime = 0;
    let silenceTriggered = false;

    const checkVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      // Volume normalized 0 to 100
      const volume = Math.min(100, Math.round((avg / 128) * 100));
      if (onVolume) onVolume(volume);

      const now = Date.now();
      // Threshold: volume > 8 means user is actively speaking into mic
      if (volume > 8) {
        if (!hasSpoken) {
          hasSpoken = true;
          spokenStartTime = now;
        }
        lastLoudTime = now;
      } else if (hasSpoken && !silenceTriggered && onSilence) {
        // Natural pause: user spoke for at least 800ms, and now silence has lasted for 2200ms
        const spokeDuration = lastLoudTime - spokenStartTime;
        const silenceDuration = now - lastLoudTime;
        if (spokeDuration >= 800 && silenceDuration >= 2200) {
          silenceTriggered = true;
          onSilence();
        }
      }

      animationFrameId = requestAnimationFrame(checkVolume);
    };

    checkVolume();

    return {
      stop: () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        try { source.disconnect(); } catch (e) {}
        try { audioCtx.close(); } catch (e) {}
      }
    };
  } catch (err) {
    console.warn('AudioLevelMeter error:', err);
    return null;
  }
}


// Robust Speech Recognizer with resilience against premature auto-stop
export function createSpeechRecognizer(onResult, onError, onEnd, lang = 'hi-IN') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('SpeechRecognition API not supported natively');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true; // Stay listening while farmer speaks
  recognition.interimResults = true;
  recognition.lang = lang;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = 0; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) onResult(transcript.trim(), true);
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition warning:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}

