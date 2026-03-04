import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

export default function AddReport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    time: "",
    objective: "",
    boysCount: 0,
    girlsCount: 0,
    leadersCount: 0,
    category: "",
    beneficiary: "",
    description: "",
    evaluationPositive: "",
    evaluationNegative: "",
    recommendations: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء التقرير وحفظه بنجاح.",
      });
      navigate("/report-success", { state: { pdfUrl: data.pdfUrl, title: formData.title } });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال التقرير.",
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
              <span className="text-4xl">📄</span>
            </div>
            <h2 className="text-4xl font-black shm-text-gradient mb-4 uppercase tracking-wider">
              إضافة تقرير SHM (نموذج A4)
            </h2>
            <div className="w-16 h-1.5 shm-gradient mx-auto rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">عنوان التقرير</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">المكان</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">الوقت</label>
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">عدد القادة</label>
                <input
                  type="number"
                  name="leadersCount"
                  min={0}
                  required
                  value={formData.leadersCount}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">الفئة العمرية</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="">اختر الفئة...</option>
                  <option value="ashbal_zahrat">اشبال و زهرات</option>
                  <option value="kashafa_mourshidat">كشافة و مرشدات</option>
                  <option value="kashaf_moutaqadim_raidat">كشاف متقدم و رائدات</option>
                  <option value="jawala_dalilat">الجوالة و الدليلات</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">لفائدة</label>
                <select
                  name="beneficiary"
                  required
                  value={formData.beneficiary}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value="">لفائدة من؟...</option>
                  <option value="ashbal_zahrat">اشبال و زهرات</option>
                  <option value="kashafa_mourshidat">كشافة و مرشدات</option>
                  <option value="kashaf_moutaqadim_raidat">كشاف متقدم و رائدات</option>
                  <option value="jawala_dalilat">الجوالة و الدليلات</option>
                  <option value="all">الكل</option>
                </select>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">عدد الذكور</label>
                <input
                  type="number"
                  name="boysCount"
                  min={0}
                  value={formData.boysCount}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-center"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">عدد الإناث</label>
                <input
                  type="number"
                  name="girlsCount"
                  min={0}
                  value={formData.girlsCount}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">الهدف / السياق</label>
              <textarea
                name="objective"
                required
                rows={2}
                value={formData.objective}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">الوصف التفصيلي</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-black text-green-600 uppercase tracking-widest mr-1">التقييم (نقط إيجابية)</label>
                <textarea
                  name="evaluationPositive"
                  rows={3}
                  value={formData.evaluationPositive}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-green-50/30 border-2 border-transparent focus:bg-white focus:border-green-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/5 transition-all font-bold resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-red-600 uppercase tracking-widest mr-1">التقييم (نقط سلبية)</label>
                <textarea
                  name="evaluationNegative"
                  rows={3}
                  value={formData.evaluationNegative}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-red-50/30 border-2 border-transparent focus:bg-white focus:border-red-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/5 transition-all font-bold resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">التوصيات</label>
              <textarea
                name="recommendations"
                rows={3}
                value={formData.recommendations}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-bold resize-none"
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
                    جاري الإرسال...
                  </>
                ) : "إرسال التقرير"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
