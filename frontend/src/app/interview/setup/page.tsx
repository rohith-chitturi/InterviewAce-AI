"use client";

import { useState } from "react";
import { UploadCloud, ChevronRight, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function InterviewSetup() {
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState("15");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { userId } = useAuth();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleStartInterview = async () => {
    if (!userId) {
      console.error("Not authenticated");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("role", role);
      formData.append("difficulty", difficulty);
      formData.append("duration", duration);
      formData.append("userId", userId);
      
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await fetch("http://localhost:5000/api/interview/setup", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.interviewId) {
        router.push(`/interview/${data.interviewId}`);
      } else {
        console.error("Backend Error:", data.error);
        setIsUploading(false);
      }
    } catch (error) {
      console.error("Network Error:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Configure Your Interview</h1>
      <p className="text-gray-400 mb-8">Customize the role, difficulty, and upload your resume for tailored questions.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Interview Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Target Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Easy", "Medium", "Hard"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setDifficulty(lvl)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        difficulty === lvl 
                          ? "bg-indigo-600 text-white border-transparent" 
                          : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Duration</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="5">5 Minutes (Quick Practice)</option>
                  <option value="15">15 Minutes (Standard)</option>
                  <option value="30">30 Minutes (Deep Dive)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Resume Context</h2>
            <p className="text-sm text-gray-400 mb-6">
              Upload your resume (PDF). The AI will analyze it to ask project-specific and personalized questions.
            </p>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all relative group cursor-pointer">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {!resumeFile ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="font-medium mb-1">Click or drag to upload</h3>
                  <p className="text-xs text-gray-500">PDF up to 5MB</p>
                </>
              ) : (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 mx-auto">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="font-medium mb-1 text-indigo-300">{resumeFile.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> Ready to analyze
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleStartInterview}
          disabled={isUploading}
          className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Preparing AI Agent...
            </>
          ) : (
            <>
              Start Mock Interview <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
