import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans" dir="rtl">
      <Header />

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12 w-full animate-in fade-in duration-700">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <img 
                src="https://cdn.builder.io/api/v1/image/assets%2Fd8cf247061ae4e73b8c8529275e40675%2F1850b5e832b4437a9da2e8ba900aa4ce?format=webp&width=800&height=1200" 
                alt="Logo 2 SHM" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                فوج الفاروق
              </span>
            </div>
            <div className="text-center text-gray-400 text-[10px] md:text-xs uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} الكشافة الحسنية المغربية - جميع الحقوق محفوظة
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
