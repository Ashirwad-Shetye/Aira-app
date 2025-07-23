import { useState, useEffect, useRef } from "react";

type UseVoiceTypingOptions = {
  onText: (text: string) => void;
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export const useVoiceTyping = ({ onText }: UseVoiceTypingOptions) => {
  const recognitionRef = useRef<{
    instance: any | null;
    isRunning: boolean;
  }>({ instance: null, isRunning: false });
  const streamRef = useRef<MediaStream | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      return true;
    } catch (err) {
      setError("Microphone access denied. Please enable it in your browser settings.");
      return false;
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice typing is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.resultIndex];
      const transcript = lastResult[0].transcript;
      if (lastResult.isFinal) {
        onText(transcript);
      }
    };

    recognition.onerror = (e: any) => {
      const errorMessage = e.error;
      let userMessage = "An error occurred during voice typing.";
      switch (errorMessage) {
        case "aborted":
          userMessage = "Voice typing was interrupted. Please try again.";
          break;
        case "no-speech":
          userMessage = "No speech detected. Please speak clearly and try again.";
          break;
        case "audio-capture":
          userMessage = "Microphone access denied or unavailable.";
          break;
        case "not-allowed":
          userMessage = "Microphone permission denied. Please enable it in your browser settings.";
          break;
        default:
          userMessage = `Voice typing error: ${errorMessage}`;
      }
      setError(userMessage);
      setIsListening(false);
      recognitionRef.current.isRunning = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current.isRunning = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      const canvas = document.getElementById("waveform") as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    recognitionRef.current.instance = recognition;

    return () => {
      if (recognitionRef.current.instance && recognitionRef.current.isRunning) {
        recognitionRef.current.instance.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      recognitionRef.current = { instance: null, isRunning: false };
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      const canvas = document.getElementById("waveform") as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    };
  }, [onText]);

  const start = async () => {
    if (recognitionRef.current.instance && !recognitionRef.current.isRunning) {
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) return;
      try {
        recognitionRef.current.instance.start();
        recognitionRef.current.isRunning = true;
        setIsListening(true);
        setError(null);

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(streamRef.current!);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        source.connect(analyser);

        const canvas = document.getElementById("waveform") as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const draw = () => {
                animationIdRef.current = requestAnimationFrame(draw);
                analyser.getByteTimeDomainData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "#00ff99";
                ctx.lineJoin = "round";
                ctx.lineCap = "round";

                const barWidth = 2.5;
                const gap = 2;
                const totalBars = Math.floor(canvas.width / (barWidth + gap));
                const step = Math.floor(dataArray.length / totalBars);
                const centerY = canvas.height / 2;

                for (let i = 0; i < totalBars; i++) {
                    const v = dataArray[i * step] / 128.0; // Normalize around center (128)
                    const amplitude = (v - 1) * centerY; // [-1, 1] * centerY
                    const barHeight = Math.abs(amplitude);
                    const x = i * (barWidth + gap);
                    const radius = Math.min(barWidth / 2, barHeight / 2);

                    // Draw upper bar
                    ctx.beginPath();
                    ctx.moveTo(x + radius, centerY - barHeight);
                    ctx.arcTo(x + barWidth, centerY - barHeight, x + barWidth, centerY, radius);
                    ctx.arcTo(x + barWidth, centerY, x, centerY, radius);
                    ctx.arcTo(x, centerY, x, centerY - barHeight, radius);
                    ctx.arcTo(x, centerY - barHeight, x + barWidth, centerY - barHeight, radius);
                    ctx.closePath();
                    ctx.fill();

                    // Draw lower bar (mirrored)
                    ctx.beginPath();
                    ctx.moveTo(x + radius, centerY + barHeight);
                    ctx.arcTo(x + barWidth, centerY + barHeight, x + barWidth, centerY, radius);
                    ctx.arcTo(x + barWidth, centerY, x, centerY, radius);
                    ctx.arcTo(x, centerY, x, centerY + barHeight, radius);
                    ctx.arcTo(x, centerY + barHeight, x + barWidth, centerY + barHeight, radius);
                    ctx.closePath();
                    ctx.fill();
                }
            };

            draw();
          }
        }
      } catch (err) {
        setError("Failed to start voice typing: " + (err as Error).message);
      }
    }
  };

  const stop = () => {
    if (recognitionRef.current.instance && recognitionRef.current.isRunning) {
      recognitionRef.current.instance.stop();
      recognitionRef.current.isRunning = false;
      setIsListening(false);
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      const canvas = document.getElementById("waveform") as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  };

  return { isListening, start, stop, error, stream: streamRef.current };
};