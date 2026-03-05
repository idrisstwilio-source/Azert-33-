import { RequestHandler } from "express";
import Groq from "groq-sdk";
import PDFDocument from "pdfkit";
import { supabaseAdmin, ensureBucketExists } from "../lib/supabase";
import path from "path";
import arabicReshaper from 'arabic-reshaper';
import Bidi from 'bidi-js';

const bidi = new Bidi();
const { convertArabic } = arabicReshaper;

// Helper to handle Arabic text for PDFKit (Robust with Bidi support)
const prepareArabic = (text: string) => {
  if (!text) return "";
  try {
    const reshaped = convertArabic(text);
    const embeddingLevels = bidi.getEmbeddingLevels(reshaped);
    const reordered = bidi.reorderChars(reshaped, embeddingLevels);
    return reordered;
  } catch (e) {
    console.error("Arabic Preparation Error:", e);
    return text;
  }
};

export const handleGenerateSession: RequestHandler = async (req, res) => {
  const {
    title, dateTime, targetAudience, objective, methodology, location, logoUrls = []
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

      // Header with Logos
      const logoSize = 60;
      const logoY = 40;
      
      const drawLogos = async () => {
        let currentX = 50;
        for (const url of logoUrls.slice(0, 3)) {
          try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            doc.image(Buffer.from(arrayBuffer), currentX, logoY, { width: logoSize });
            currentX += logoSize + 10;
          } catch (e) {
            console.error("Logo Download Error:", e);
          }
        }
      };

      const startGeneration = async () => {
        await drawLogos();
        
        doc.moveDown(4);
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
      };

      startGeneration();
    });

  } catch (error) {
    console.error("Error generating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
