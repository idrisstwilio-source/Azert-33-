import { RequestHandler } from "express";
import Groq from "groq-sdk";
import PDFDocument from "pdfkit";
import { supabaseAdmin, ensureBucketExists } from "../lib/supabase";
import { Readable } from "stream";

export const handleGenerateReport: RequestHandler = async (req, res) => {
  const {
    title, location, time, objective, boysCount, girlsCount,
    leadersCount, category, beneficiary, description, evaluationPositive,
    evaluationNegative, recommendations
  } = req.body;

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    // 0. Ensure bucket exists
    await ensureBucketExists("shm-reports");

    // 1. AI Reformulation
    const prompt = `
      أنت مساعد خبير في الكشافة الحسنية المغربية (SHM).
      قم بإعادة صياغة التقرير التالي بشكل احترافي ومؤسساتي، مع احترام القيم الكشفية.
      يجب أن يكون التقرير واضحاً ومنظماً وجاهزاً للأرشفة باللغة العربية.

      البيانات الأصلية:
      العنوان: ${title}
      المكان: ${location}
      الوقت: ${time}
      الهدف: ${objective}
      الفئة: ${category}
      لفائدة: ${beneficiary}
      الوصف: ${description}
      النقط الإيجابية: ${evaluationPositive}
      النقط السلبية: ${evaluationNegative}
      التوصيات: ${recommendations}

      أجب فقط بالمحتوى المعاد صياغته، منظماً حسب الأقسام.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    const reformulatedContent = chatCompletion.choices[0]?.message?.content || description;

    // 2. Generate PDF
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    
    return new Promise((resolve) => {
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(buffers);
        const fileName = `report_${Date.now()}.pdf`;

        // 3. Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabaseAdmin
          .storage
          .from("shm-reports")
          .upload(fileName, pdfBuffer, { contentType: "application/pdf" });

        if (storageError) {
          console.error("Storage Error:", storageError);
          res.status(500).json({ error: "Failed to upload PDF" });
          return resolve(null);
        }

        const { data: { publicUrl } } = supabaseAdmin
          .storage
          .from("shm-reports")
          .getPublicUrl(fileName);

        // 4. Save to Database
        const { error: dbError } = await supabaseAdmin
          .from("reports")
          .insert({
            title,
            location,
            time,
            objective,
            participants_boys: parseInt(boysCount),
            participants_girls: parseInt(girlsCount),
            leaders_count: parseInt(leadersCount),
            category,
            beneficiary,
            description_original: description,
            description_reformulated: reformulatedContent,
            evaluation_positive: evaluationPositive,
            evaluation_negative: evaluationNegative,
            recommendations,
            pdf_url: publicUrl,
          });

        if (dbError) {
          console.error("DB Error:", dbError);
          res.status(500).json({ error: "Failed to save report data" });
          return resolve(null);
        }

        res.json({ success: true, pdfUrl: publicUrl });
        resolve(null);
      });

      // PDF Content (Basic Arabic support in PDFKit might be limited without a font, but let's try)
      doc.fontSize(20).text("تقرير نشاط - الكشافة الحسنية المغربية", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`العنوان: ${title}`);
      doc.text(`المكان: ${location}`);
      doc.text(`الوقت: ${time}`);
      doc.text(`عدد القادة: ${leadersCount}`);
      doc.text(`الفئة: ${category}`);
      doc.text(`لفائدة: ${beneficiary}`);
      doc.text(`المشاركون: ${boysCount} ذكور / ${girlsCount} إناث`);
      doc.moveDown();
      doc.fontSize(16).text("الهدف", { underline: true });
      doc.fontSize(12).text(objective);
      doc.moveDown();
      doc.fontSize(16).text("الوصف (إعادة صياغة IA)", { underline: true });
      doc.fontSize(12).text(reformulatedContent);
      doc.moveDown();
      doc.fontSize(16).text("التقييم", { underline: true });
      doc.text("النقط الإيجابية:");
      doc.text(evaluationPositive);
      doc.text("النقط السلبية:");
      doc.text(evaluationNegative);
      doc.moveDown();
      doc.fontSize(16).text("التوصيات", { underline: true });
      doc.fontSize(12).text(recommendations);
      
      doc.end();
    });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
