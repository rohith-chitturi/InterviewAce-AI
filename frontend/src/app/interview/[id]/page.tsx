"use client";

import "regenerator-runtime/runtime";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, AlertCircle } from "lucide-react";

export default function InterviewRoom() {
  const { id } = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const [status, setStatus] = useState<"connecting" | "listening" | "thinking" | "speaking" | "error">("connecting");
  const [messages, setMessages] = useState<{ role: "USER" | "AI"; text: string }[]>([]);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const transcriptRef = useRef("");

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Initial connection
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setStatus("error");
      return;
    }
    
    // Welcome message simulation (in real app, we fetch from backend)
    setTimeout(() => {
      setStatus("speaking");
      const welcomeMsg = "Hello! I have reviewed your resume and the requirements for the Software Engineer role. Are you ready to begin the interview?";
      setMessages([{ role: "AI", text: welcomeMsg }]);
      speak(welcomeMsg);
    }, 1500);
  }, []);

  const speak = (text: string) => {
    setStatus("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.lang === "en-US");
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      setStatus("listening");
      SpeechRecognition.startListening({ continuous: true });
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = async () => {
    SpeechRecognition.stopListening();
    const finalTranscript = transcriptRef.current;
    
    if (!finalTranscript.trim()) {
      setStatus("listening");
      SpeechRecognition.startListening({ continuous: true });
      return;
    }

    setStatus("thinking");
    setMessages(prev => [...prev, { role: "USER", text: finalTranscript }]);
    resetTranscript();

    try {
      const response = await fetch(`http://localhost:8080/api/interview/${id}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text: finalTranscript })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: "AI", text: data.reply }]);
        speak(data.reply);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const endInterview = () => {
    window.speechSynthesis.cancel();
    SpeechRecognition.stopListening();
    router.push("/dashboard");
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Browser Not Supported</h2>
          <p className="text-gray-400">Please use Google Chrome or Microsoft Edge to use the Voice Interview Engine.</p>
        </div>
      </div>
    );
  }

  // Orb Animations based on status
  const orbVariants = {
    connecting: { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5], transition: { repeat: Infinity, duration: 2 } },
    listening: { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8], transition: { repeat: Infinity, duration: 3 } },
    thinking: { scale: [0.9, 1.1, 0.9], rotate: [0, 180, 360], opacity: 0.9, transition: { repeat: Infinity, duration: 1.5 } },
    speaking: { scale: [1, 1.2, 1], opacity: [0.9, 1, 0.9], transition: { repeat: Infinity, duration: 0.5, ease: "easeInOut" } },
    error: { scale: 1, opacity: 0.5, backgroundColor: "#ef4444" }
  };

  const getOrbColor = () => {
    switch (status) {
      case "connecting": return "bg-gray-500";
      case "listening": return "bg-indigo-500";
      case "thinking": return "bg-fuchsia-500";
      case "speaking": return "bg-blue-500";
      case "error": return "bg-red-500";
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />

      {/* Header */}
      <div className="z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${status === "listening" ? "bg-green-500" : "bg-gray-500"}`} />
          <span className="font-medium text-gray-300 uppercase tracking-widest text-sm">
            {status}
          </span>
        </div>
        <button onClick={endInterview} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors font-medium flex items-center gap-2 border border-red-500/20">
          <PhoneOff className="w-4 h-4" /> End Interview
        </button>
      </div>

      {/* Main UI */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        
        {/* The AI Orb */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-16">
          <motion.div
            variants={orbVariants}
            animate={status}
            className={`absolute inset-0 rounded-full blur-3xl opacity-50 ${getOrbColor()}`}
          />
          <motion.div
            variants={orbVariants}
            animate={status}
            className={`relative w-32 h-32 rounded-full shadow-[0_0_60px_rgba(255,255,255,0.2)] ${getOrbColor()} bg-gradient-to-br from-white/40 to-transparent backdrop-blur-md border border-white/20`}
          />
        </div>

        {/* Live Transcript Box */}
        <div className="w-full max-w-2xl h-48 relative">
          <AnimatePresence mode="wait">
            {status === "listening" ? (
              <motion.div
                key="listening"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex flex-col items-center text-center"
              >
                <Mic className="w-6 h-6 text-indigo-400 mb-4 animate-pulse" />
                <p className="text-2xl text-white font-medium min-h-[3rem]">
                  {transcript || <span className="text-gray-500">Listening...</span>}
                </p>
                {transcript && (
                  <button 
                    onClick={handleStopSpeaking}
                    className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors shadow-lg shadow-indigo-500/20"
                  >
                    Done Speaking
                  </button>
                )}
              </motion.div>
            ) : status === "speaking" ? (
              <motion.div
                key="speaking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex flex-col items-center text-center"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [8, 24, 8] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      className="w-1.5 bg-blue-400 rounded-full"
                    />
                  ))}
                </div>
                <p className="text-2xl text-blue-100 font-medium max-w-xl line-clamp-3">
                  {messages[messages.length - 1]?.text}
                </p>
              </motion.div>
            ) : status === "thinking" ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400"
              >
                <span className="text-xl animate-pulse">Analyzing response...</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
