import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { X, Upload, CheckCircle2 } from "lucide-react";

export default function AddSession() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    dateTime: "",
    targetAudience: "",
    objective: "",
    methodology: "",
    location: "",
  });

  const [logos, setLogos] = useState<File[]>([]);
  const [logoPreviews, setLogoPreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (logos.length + files.length > 3) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يمكنك رفع 3 شعارات كحد أقصى.",
      });
      return;
    }

    const newLogos = [...logos, ...files];
    setLogos(newLogos);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setLogoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeLogo = (index: number) => {
    const newLogos = [...logos];
    newLogos.splice(index, 1);
    setLogos(newLogos);

    const newPreviews = [...logoPreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setLogoPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Prepare logos as Base64 strings
      const logosData = await Promise.all(
        logos.map(async (logo) => {
          const reader = new FileReader();
          return new Promise<{ name: string; type: string; data: string }>((resolve) => {
            reader.onload = (e) => {
              const base64 = (e.target?.result as string).split(",")[1];
              resolve({ name: logo.name, type: logo.type, data: base64 });
            };
            reader.readAsDataURL(logo);
          });
        })
      );

      // 2. Submit session data
      const payload = {
        ...formData,
        logos: logosData,
      };

      const response = await fetch("/api/generate-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération de la séance");
      }

      const data = await response.json();

      toast({
        title: "تم بنجاح",
        description: "تم حفظ الجلسة وإنشاء ملف PDF بنجاح.",
      });
      navigate("/report-success", { state: { pdfUrl: data.pdfUrl, title: formData.title } });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء حفظ الجلسة.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-12 duration-700">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-100 p-10 md:p-14">
          <div className="text-center mb-14">
             <div className="w-20 h-20 shm-gradient text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-4xl font-black shm-text-gradient mb-4 uppercase tracking-wider">
              إضافة جلسة (طريقة 5W)
            </h2>
            <div className="w-16 h-1.5 shm-gradient mx-auto rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logos Section */}
            <div className="space-y-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1 mb-4">
                تحميل الشعارات (3 كحد أقصى)
              </label>
              
              <div className="flex flex-wrap gap-4">
                {logoPreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/20 group">
                    <img src={preview} alt={`Logo preview ${index + 1}`} className="w-full h-full object-contain bg-white" />
                    <button
                      type="button"
                      onClick={() => removeLogo(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {logos.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary/50 hover:text-primary transition-all bg-white"
                  >
                    <Upload size={20} className="mb-1" />
                    <span className="text-[10px] font-bold">إضافة</span>
                  </button>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                accept="image/png,image/jpeg,image/jpg"
                multiple
                className="hidden"
              />
              <p className="text-[10px] text-gray-400 font-medium">الأنواع المسموحة: PNG, JPG, JPEG.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">عنوان الجلسة (ماذا؟)</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                  placeholder="عنوان الجلسة البيداغوجية"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">المكان (أين؟)</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                  placeholder="مكان الجلسة"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">التاريخ والوقت (متى؟)</label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  required
                  value={formData.dateTime}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">الفئة المستهدفة (من؟)</label>
                <input
                  type="text"
                  name="targetAudience"
                  required
                  value={formData.targetAudience}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                  placeholder="من هم المستفيدون؟"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">الهدف (لماذا؟)</label>
              <textarea
                name="objective"
                required
                rows={3}
                value={formData.objective}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold resize-none"
                placeholder="ما هو الهدف من هذه الجلسة؟"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">الطريقة / المراحل (كيف؟)</label>
              <textarea
                name="methodology"
                required
                rows={6}
                value={formData.methodology}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold resize-none"
                placeholder="اشرح كيفية سير الجلسة ومراحلها..."
              />
            </div>

            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-sm shm-gradient text-white font-black py-5 rounded-2xl transition-all shm-gradient-hover shadow-xl shadow-primary/20 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </>
                ) : "حفظ الجلسة"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
