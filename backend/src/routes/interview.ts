import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize Supabase Client for Storage
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

router.post('/setup', upload.single('resume'), async (req, res) => {
  try {
    const { role, difficulty, duration, userId } = req.body;
    let textContent = '';
    let fileUrl = '';
    let resumeRecord = null;

    // 1. Ensure User exists (Sync from Clerk)
    const userRecord = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: `${userId}@placeholder.com`, // Sync proper email via Clerk webhooks later
      }
    });

    if (!userRecord) {
        return res.status(500).json({ error: "Failed to sync user." });
    }

    // 2. Process Resume if uploaded
    if (req.file) {
      // Extract text
      const pdfData = await pdfParse(req.file.buffer);
      textContent = pdfData.text;

      // Upload to Supabase Storage
      const fileName = `${userId}-${Date.now()}.pdf`;
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, req.file.buffer, {
          contentType: 'application/pdf',
        });

      if (error) {
        console.error("Supabase Upload Error:", error);
      } else {
        fileUrl = `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`;
      }

      // Create Resume Record using the Database User UUID, not the Clerk ID
      resumeRecord = await prisma.resume.create({
        data: {
          userId: userRecord.id,
          fileUrl,
          textContent,
        }
      });
    }

    // 3. Create Interview Record
    const interview = await prisma.interview.create({
      data: {
        userId: userRecord.id,
        resumeId: resumeRecord?.id || null,
        role,
        difficulty,
        type: 'Technical',
        duration: parseInt(duration),
        status: 'PENDING'
      }
    });

    res.json({ success: true, interviewId: interview.id });
  } catch (error) {
    console.error("Setup Error:", error);
    res.status(500).json({ error: 'Failed to setup interview' });
  }
});

router.post('/:id/message', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, text } = req.body;

    // Save User Message
    await prisma.transcript.create({
      data: {
        interviewId: id,
        role: 'USER',
        text
      }
    });

    // Fetch Context
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        resume: true,
        transcripts: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // Build Prompt
    const systemInstruction = `You are an expert technical interviewer conducting a mock interview for the role of ${interview.role}. The difficulty is ${interview.difficulty}. 
    Ask ONE question at a time. Do not provide feedback yet. Keep your responses conversational, spoken, and natural. 
    Here is the candidate's resume text for context: ${interview.resume?.textContent || 'No resume provided.'}`;

    const history = interview.transcripts.map(t => `${t.role}: ${t.text}`).join('\n');
    const prompt = `${systemInstruction}\n\nInterview History:\n${history}\n\nAI:`;

    // Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const aiReply = response.text || "I didn't quite catch that. Could you elaborate?";

    // Save AI Message
    await prisma.transcript.create({
      data: {
        interviewId: id,
        role: 'AI',
        text: aiReply
      }
    });

    res.json({ success: true, reply: aiReply });
  } catch (error) {
    console.error("Message Error:", error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
