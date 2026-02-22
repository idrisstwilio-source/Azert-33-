import { RequestHandler } from "express";
import Groq from "groq-sdk";
import PDFDocument from "pdfkit";
import { supabaseAdmin, ensureBucketExists } from "../lib/supabase";

export const handleGenerateSession: RequestHandler = async (req, res) => {
  if (!supabaseAdmin) {
    console.error("Supabase Admin client not initialized");
    res.status(500).json({ error: "Server configuration error: Supabase not configured" });
    return;
  }
  const {
    title, dateTime, targetAudience, objective, methodology, location
  } = req.body;

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    // 0. Ensure bucket exists
    await ensureBucketExists("shm-sessions");

    // 1. AI Reformulation
    const prompt = `
      أنت مساعد خبير في الكشافة الحسنية المغربية (SHM).
      قم بإعادة صياغة بطاقة الجلسة التالية بشكل احترافي وبيداغوجي.
      استخدم طريقة 5W لهيكلة المحتوى بشكل أمثل باللغة العربية.

      البيانات الأصلية:
      العنوان: ${title}
      متى: ${dateTime}
      أين: ${location}
      من (الفئة): ${targetAudience}
      لماذا (الهدف): ${objective}
      كيف (الطريقة): ${methodology}

      أجب فقط بالمحتوى المعاد صياغته والمنظم.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const reformulatedContent = chatCompletion.choices[0]?.message?.content || methodology;

    // 2. Generate PDF
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    
    return new Promise((resolve) => {
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(buffers);
        const fileName = `session_${Date.now()}.pdf`;

        // 3. Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabaseAdmin
          .storage
          .from("shm-sessions")
          .upload(fileName, pdfBuffer, { contentType: "application/pdf" });

        if (storageError) {
          console.error("Storage Error:", storageError);
          res.status(500).json({ error: "Failed to upload PDF" });
          return resolve(null);
        }

        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from("shm-sessions")
          .getPublicUrl(fileName);

        // 4. Save to Database
        const { error: dbError } = await supabaseAdmin
          .from("sessions")
          .insert({
            title,
            date_time: dateTime,
            location,
            target_audience: targetAudience,
            objective,
            methodology_original: methodology,
            methodology_reformulated: reformulatedContent,
            pdf_url: publicUrl,
          });

        if (dbError) {
          console.error("DB Error:", dbError);
          res.status(500).json({ error: "Failed to save session data" });
          return resolve(null);
        }

        res.json({ success: true, pdfUrl: publicUrl });
        resolve(null);
      });

      // PDF Content
      doc.fontSize(20).text("بطاقة جلسة - الكشافة الحسنية المغربية", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`العنوان: ${title}`);
      doc.text(`التاريخ/الوقت: ${dateTime}`);
      doc.text(`المكان: ${location}`);
      doc.text(`الفئة المستهدفة: ${targetAudience}`);
      doc.moveDown();
      doc.fontSize(16).text("الهدف (Why)", { underline: true });
      doc.fontSize(12).text(objective);
      doc.moveDown();
      doc.fontSize(16).text("طريقة السير / المحتوى (How)", { underline: true });
      doc.fontSize(12).text(reformulatedContent);
      
      doc.end();
    });

  } catch (error) {
    console.error("Error generating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
