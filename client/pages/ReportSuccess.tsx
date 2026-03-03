import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Home, FileText } from "lucide-react";

export default function ReportSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pdfUrl, title } = (location.state as { pdfUrl?: string; title?: string }) || {};

  if (!pdfUrl) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-2xl font-black text-gray-800 mb-4">لم يتم العثور على التقرير</h2>
          <Button onClick={() => navigate("/dashboard")}>العودة للوحة القيادة</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-700">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-100 p-10 md:p-14 text-center">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          
          <h2 className="text-4xl font-black shm-text-gradient mb-4 uppercase tracking-wider">
            تم إنشاء التقرير بنجاح!
          </h2>
          <p className="text-gray-500 font-bold mb-10 text-lg">
            تقرير: <span className="text-primary">{title || "غير مسمى"}</span>
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-8">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 shm-gradient text-white font-black py-5 rounded-2xl transition-all shm-gradient-hover shadow-xl shadow-primary/20 uppercase tracking-widest"
            >
              <FileText size={20} />
              عرض التقرير
            </a>
            
            <a
              href={pdfUrl}
              download={`report_${Date.now()}.pdf`}
              className="flex items-center justify-center gap-3 bg-gray-800 text-white font-black py-5 rounded-2xl transition-all hover:bg-gray-900 shadow-xl shadow-gray-200 uppercase tracking-widest"
            >
              <Download size={20} />
              تحميل PDF
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-50">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-primary font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              <Home size={18} />
              العودة إلى لوحة القيادة
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
