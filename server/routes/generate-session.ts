import { RequestHandler } from "express";
import Groq from "groq-sdk";
import PDFDocument from "pdfkit";
import { supabaseAdmin, ensureBucketExists } from "../lib/supabase";
import path from "path";
import arabicReshaper from 'arabic-reshaper';

// Helper to handle Arabic text for PDFKit
const prepareArabic = (text: string) => {
  if (!text) return "";
  const reshaped = arabicReshaper.reshape(text);
  // Basic reversal for RTL support in PDFKit's LTR renderer
  return reshaped.split('').reverse().join('');
};

export const handleGenerateSession: RequestHandler = async (req, res) => {
  const {
    title, dateTime, targetAudience, objective, methodology, location
  } = req.body;

  let reformulatedContent = methodology;

  if (process.env.GROQ_API_KEY) {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    try {
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

      reformulatedContent = chatCompletion.choices[0]?.message?.content || methodology;
    } catch (aiError) {
      console.error("AI Reformulation Error:", aiError);
    }
  }

  try {
    await ensureBucketExists("shm-sessions");

    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    
    return new Promise((resolve) => {
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(buffers);
        const fileName = `session_${Date.now()}.pdf`;

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

      // Fonts
      const regularFont = path.join(process.cwd(), "server/assets/Amiri-Regular.ttf");
      const boldFont = path.join(process.cwd(), "server/assets/Amiri-Bold.ttf");

      doc.font(boldFont).fontSize(22).text(prepareArabic("بطاقة جلسة - الكشافة الحسنية المغربية"), { align: "center" });
      doc.font(regularFont).fontSize(10).text(prepareArabic("فوج الفاروق - آسفي"), { align: "center" });
      doc.moveDown(2);

      const addDetail = (label: string, value: string) => {
        doc.font(boldFont).fontSize(12).text(prepareArabic(label) + ":", { align: "right", continued: true });
        doc.font(regularFont).fontSize(12).text(" " + prepareArabic(value), { align: "right" });
        doc.moveDown(0.5);
      };

      addDetail("العنوان", title);
      addDetail("التاريخ والوقت", dateTime);
      addDetail("المكان", location);
      addDetail("الفئة المستهدفة", targetAudience);
      
      doc.moveDown();
      doc.rect(50, doc.y, doc.page.width - 100, 1).fill("#EEEEEE");
      doc.moveDown();

      doc.font(boldFont).fontSize(16).text(prepareArabic("الهدف (Why)"), { align: "right" });
      doc.font(regularFont).fontSize(12).text(prepareArabic(objective), { align: "right" });
      doc.moveDown();

      doc.font(boldFont).fontSize(16).text(prepareArabic("طريقة السير / المحتوى (How)"), { align: "right" });
      doc.font(regularFont).fontSize(12).text(prepareArabic(reformulatedContent), { align: "right" });
      
      doc.end();
    });

  } catch (error) {
    console.error("Error generating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
