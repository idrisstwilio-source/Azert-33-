import { RequestHandler } from "express";
import Groq from "groq-sdk";
import PDFDocument from "pdfkit";
import { supabaseAdmin, ensureBucketExists } from "../lib/supabase";
import { prepareArabicText, fetchAsset, ASSETS, BISMILLAH } from "../lib/pdf-utils";

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
      هام جداً: يجب أن يكون المحتوى مختصراً بحيث لا يتجاوز صفحة واحدة A4 عند طباعته.

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

    // 2. Fetch Assets for PDF
    const [arabicFont, logoLeft, logoRight] = await Promise.all([
      fetchAsset(ASSETS.ARABIC_FONT),
      fetchAsset(ASSETS.LOGO_LEFT),
      fetchAsset(ASSETS.LOGO_RIGHT),
    ]);

    // 3. Generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));

    return new Promise((resolve) => {
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(buffers);
        const fileName = `session_${Date.now()}.pdf`;

        // 4. Upload to Supabase Storage
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

        // 5. Save to Database
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

      // Register Arabic Font
      doc.registerFont("ArabicFont", arabicFont);
      doc.font("ArabicFont");

      // Header Layout
      // 1. Bismillah top right
      doc.fontSize(12).text(prepareArabicText(BISMILLAH), { align: "right" });
      doc.moveDown(0.5);

      // 2. Logos on sides
      const logoY = 40;
      doc.image(logoRight, 495, logoY, { height: 60 });
      doc.image(logoLeft, 40, logoY, { height: 60 });

      doc.moveDown(2);

      // 3. Main Title
      doc.fontSize(22).text(prepareArabicText("بطاقة جلسة بيداغوجية - SHM"), { align: "center", underline: true });
      doc.moveDown(1);

      // 4. Information Grid (Arabic style - RTL)
      const labelSize = 12;
      const contentSize = 11;

      const drawField = (label: string, value: string) => {
        doc.fontSize(labelSize).fillColor("#8B0000").text(prepareArabicText(label + ": "), { align: "right", continued: true });
        doc.fontSize(contentSize).fillColor("black").text(prepareArabicText(value), { align: "right" });
        doc.moveDown(0.4);
      };

      drawField("العنوان", title);
      drawField("المكان", location);
      drawField("التاريخ/الوقت", dateTime);
      drawField("الفئة المستهدفة", targetAudience);

      doc.moveDown(1);

      // 5. Sections
      const drawSection = (label: string, value: string) => {
        if (!value) return;
        doc.fontSize(14).fillColor("#5A189A").text(prepareArabicText(label), { align: "right", underline: true });
        doc.fontSize(10).fillColor("black").text(prepareArabicText(value), { align: "right" });
        doc.moveDown(0.8);
      };

      drawSection("الهدف (Why)", objective);
      drawSection("طريقة السير / المحتوى (How - 5W)", reformulatedContent);

      doc.end();
    });

  } catch (error) {
    console.error("Error generating session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
