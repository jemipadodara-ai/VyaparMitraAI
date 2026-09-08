import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Loader2, Sparkles, Volume2, Globe, AlertCircle, RefreshCw, AudioWaveform as Waveform, Radio, Zap } from 'lucide-react';
import { ExtractedTaskData } from '../types';

interface AudioRecorderProps {
  onTaskParsed: (task: ExtractedTaskData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTaskParsed,
  isLoading,
  setIsLoading,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API availability
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // Timer for audio recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Start Voice Recording
  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          await processAudioBlob(audioBlob);
        }
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'gu-IN';
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript) {
              setTextInput(transcript);
            }
          };

          recognition.onerror = () => {};
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('SpeechRecognition init error:', e);
        }
      }
    } catch (err: any) {
      console.error('Microphone permission or audio recording error:', err);
      setErrorMsg('Microphone access denied or unsupported. You can type or paste your Gujarati / Gujlish instruction below.');
      setIsRecording(false);
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  // Process recorded audio Blob
  const processAudioBlob = async (blob: Blob) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const response = await fetch('/api/parse-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: blob.type || 'audio/webm',
          }),
        });

        const data = await response.json();
        setIsLoading(false);

        if (data.success && data.data) {
          onTaskParsed(data.data);
        } else {
          setErrorMsg(data.error || 'Failed to process audio instruction. Please try again or type the text.');
        }
      };
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Failed to read recorded audio file.');
    }
  };

  // Process typed or transcribed text instruction
  const handleTextSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/parse-instruction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textInput }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (data.success && data.data) {
        onTaskParsed(data.data);
      } else {
        setErrorMsg(data.error || 'Could not interpret instruction. Please check the text and try again.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg('Server connection error. Please try again.');
    }
  };

  const formatSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-[#0F1422]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-5">
      {/* Background Neon Aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-white flex items-center gap-2">
              <span>AI Voice & Natural Language Copilot</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Speak or type Gujarati / Gujlish instructions. Synora AI auto-structures tasks, amounts & WhatsApp messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gujarati / Gujlish Auto-Detect</span>
          </span>
        </div>
      </div>

      {/* Voice Record Control Panel (Synora Cyber Wave Style) */}
      <div className="relative z-10 bg-[#141B2D]/80 border border-white/[0.06] rounded-2xl p-5 flex flex-col items-center justify-center shadow-inner">
        {isRecording ? (
          <div className="flex flex-col items-center py-3 w-full">
            <div className="relative mb-4 flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-rose-500 opacity-40"></span>
              <button
                id="btn-stop-recording"
                onClick={stopRecording}
                className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all scale-105"
                title="Click to Stop Recording"
              >
                <MicOff className="w-7 h-7" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Recording Spoken Voice</span>
              </div>
              <div className="text-3xl font-mono font-black text-white tracking-wider">
                {formatSeconds(recordingSeconds)}
              </div>
              <p className="text-xs text-slate-400">
                Click stop when finished speaking your Gujarati business instruction
              </p>
            </div>

            {/* Cyber Animated Equalizer */}
            <div className="flex items-center gap-1.5 mt-4 h-8 px-4 py-1 bg-black/40 rounded-full border border-white/[0.05]">
              {[35, 65, 25, 95, 55, 100, 45, 80, 40, 70, 90, 50, 85, 30, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i % 5) * 0.15}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 w-full py-1">
            <button
              id="btn-start-recording"
              onClick={startRecording}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black flex items-center justify-center gap-3.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 group active:scale-95 shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-950 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs uppercase tracking-wider font-extrabold text-slate-950">Tap to Record Voice</div>
                <div className="text-[11px] text-slate-900 font-medium">
                  બોલીને ઓર્ડર / નોંધ આપો
                </div>
              </div>
            </button>

            <div className="text-center sm:text-left text-xs text-slate-400 flex-1 border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-3 sm:pt-0 sm:pl-5">
              <span className="text-slate-200 font-bold block mb-0.5">
                Microphone or Typed Input
              </span>
              <span className="text-slate-400 text-[11px]">
                Try saying: <span className="text-emerald-400 italic">“કાલે મનોજભાઈને 25 box મોકલવાના છે, ₹12,500 payment pending છે”</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Synora Prompt Textarea Form */}
      <form onSubmit={handleTextSubmit} className="relative z-10 space-y-3">
        <div className="relative">
          <textarea
            id="input-instruction-text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="અહીં લખો અથવા બોલો (Type or paste instruction in Gujarati or Gujlish)..."
            rows={3}
            disabled={isLoading || isRecording}
            className="w-full bg-[#141B2D]/70 border border-white/[0.08] focus:border-emerald-500/60 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none leading-relaxed font-medium"
          />
          {textInput && (
            <button
              type="button"
              onClick={() => setTextInput('')}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] transition"
            >
              Clear
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-400 font-medium hidden sm:flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Extracts Customer, Items, Due Date, Amounts & Gujarati WhatsApp message</span>
          </div>

          <button
            id="btn-process-instruction"
            type="submit"
            disabled={isLoading || isRecording || !textInput.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 border border-emerald-400/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Extracting with Gemma AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Extract Structured Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
