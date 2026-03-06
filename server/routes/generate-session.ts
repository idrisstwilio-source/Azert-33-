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
    const embeddingLevels = bidi.getEmbeddingLevels(reshaped, "rtl");
    const reordered = bidi.reorderChars(reshaped, embeddingLevels);
    return reordered;
  } catch (e) {
    console.error("Arabic Preparation Error:", e);
    return text;
  }
};

export const handleGenerateSession: RequestHandler = async (req, res) => {
  const {
    title, dateTime, targetAudience, objective, methodology, location, logos = []
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

    // Process logos and upload to storage
    const logoUrls: string[] = [];
    const logoBuffers: { data: Buffer; type: string }[] = [];
    for (const logo of (logos as any[]).slice(0, 3)) {
      try {
        const buffer = Buffer.from(logo.data, 'base64');
        logoBuffers.push({ data: buffer, type: logo.type });

        const fileName = `logo_${Date.now()}_${logo.name}`;
        const { data, error } = await supabaseAdmin.storage
          .from("shm-sessions")
          .upload(`logos/${fileName}`, buffer, {
            contentType: logo.type,
            upsert: true
          });

        if (data) {
          const { data: { publicUrl } } = supabaseAdmin.storage
            .from("shm-sessions")
            .getPublicUrl(`logos/${fileName}`);
          logoUrls.push(publicUrl);
        }
      } catch (e) {
        console.error("Logo Upload Error:", e);
      }
    }

    const doc = new PDFDocument({ margin: 50, layout: "portrait" });
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
      const logoSize = 100;
      const logoY = 40;

      const drawLogos = async () => {
        let currentX = 50;
        for (const logo of logoBuffers) {
          try {
            doc.image(logo.data, currentX, logoY, {
              fit: [logoSize, logoSize],
              align: 'center',
              valign: 'center'
            });
            currentX += logoSize + 15;
          } catch (e) {
            console.error("Logo Placement Error:", e);
          }
        }
      };

      const startGeneration = async () => {
        await drawLogos();

        doc.moveDown(1);
        doc.font(boldFont).fontSize(14).text(prepareArabic("بسم الله الرحمن الرحيم"), { align: "center" });
        doc.font(boldFont).fontSize(12).text(prepareArabic("الكشفية الحسنية المغربية"), { align: "center" });
        doc.font(boldFont).fontSize(10).text(prepareArabic("فرع آسفي – مجموعة العمل – فوج عمر الفاروق"), { align: "center" });

        doc.moveDown(1.5);
        doc.font(boldFont).fontSize(18).text(prepareArabic(`بطاقة جلسة: ${title}`), { align: "center" });
        doc.moveDown(1);

        const labelWidth = 120;
        const dividerX = doc.page.width - 50 - labelWidth;
        const startY = doc.y;

        const drawRow = (label: string, value: string) => {
          if (!value) return;
          const currentY = doc.y;

          // Label (Right Column)
          doc.font(boldFont).fontSize(10).text(prepareArabic(label), dividerX + 10, currentY, {
            width: labelWidth - 10,
            align: "right"
          });
          const labelEndY = doc.y;

          // Value (Left Column)
          doc.y = currentY;
          doc.font(regularFont).fontSize(10).text(prepareArabic(value), 50, currentY, {
            width: dividerX - 50 - 5,
            align: "right"
          });
          const valueEndY = doc.y;

          doc.y = Math.max(labelEndY, valueEndY) + 12;
        };

        drawRow("العنوان", title);
        drawRow("التاريخ والوقت", dateTime);
        drawRow("المكان", location);
        drawRow("الفئة المستهدفة", targetAudience);
        drawRow("الهدف (Why)", objective);
        drawRow("طريقة السير / المحتوى (How)", reformulatedContent);

        const endY = doc.y;
        doc.moveTo(dividerX, startY).lineTo(dividerX, endY).lineWidth(1).stroke("#000000");

        doc.end();
      };

      startGeneration();
    });

  } catch (error) {
    console.error("Error generating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
