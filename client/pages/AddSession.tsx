import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const BENEFICIARY_OPTIONS = [
  { id: "ashbal_zahrat", label: "اشبال و زهرات" },
  { id: "kashafa_mourshidat", label: "كشافة و مرشدات" },
  { id: "kashaf_moutaqadim_raidat", label: "كشاف متقدم و رائدات" },
  { id: "jawala_dalilat", label: "الجوالة و الدليلات" },
];

export default function AddSession() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    dateTime: "",
    objective: "",
    methodology: "",
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBeneficiaryToggle = (id: string) => {
    setSelectedBeneficiaries(prev =>
      prev.includes(id)
        ? prev.filter(b => b !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBeneficiaries.length === 0) {
      toast({
        variant: "destructive",
        title: "تنبيه",
        description: "يرجى اختيار فئة مستفيدة واحدة على الأقل.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/generate-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          targetAudience: selectedBeneficiaries.map(id =>
            BENEFICIARY_OPTIONS.find(opt => opt.id === id)?.label
          ).join(", "),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération de la séance");
      }

      toast({
        title: "تم بنجاح",
        description: "تم حفظ الجلسة وإنشاء ملف PDF بنجاح.",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الجلسة.",
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
              <div className="space-y-4 col-span-1 md:col-span-2">
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mr-1">الفئة المستهدفة (من؟ - اختر واحدة أو أكثر)</label>
                <div className="flex flex-wrap gap-3">
                  {BENEFICIARY_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleBeneficiaryToggle(option.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all",
                        selectedBeneficiaries.includes(option.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {selectedBeneficiaries.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedBeneficiaries.map(id => (
                      <Badge key={id} variant="secondary" className="px-3 py-1 gap-2 bg-primary/5 text-primary border-primary/10">
                        {BENEFICIARY_OPTIONS.find(opt => opt.id === id)?.label}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBeneficiaryToggle(id);
                          }}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
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
                className="w-full max-sm shm-gradient text-white font-black py-5 rounded-2xl transition-all shm-gradient-hover shadow-xl shadow-primary/20 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3"
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
