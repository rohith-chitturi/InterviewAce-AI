import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

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

    // 1. Process Resume if uploaded
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

      // Create Resume Record
      resumeRecord = await prisma.resume.create({
        data: {
          userId,
          fileUrl,
          textContent,
        }
      });
    }

    // 2. Ensure User exists (Sync from Clerk)
    // In production, you'd use Clerk Webhooks. For now, we upsert based on userId from frontend.
    await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email: `${userId}@placeholder.com`, // We don't have the real email here yet
      }
    });

    const userRecord = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!userRecord) {
        return res.status(500).json({ error: "Failed to sync user." });
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

export default router;
