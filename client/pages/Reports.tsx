import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";

interface Report {
  id: string;
  title: string;
  location: string;
  time: string;
  pdf_url: string;
  created_at: string;
}

interface Session {
  id: string;
  title: string;
  location: string;
  date_time: string;
  pdf_url: string;
  created_at: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reports" | "sessions">("reports");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!supabase) {
          console.warn("Supabase client not initialized");
          setLoading(false);
          return;
        }
        const { data: reportsData } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });
        
        const { data: sessionsData } = await supabase
          .from("sessions")
          .select("*")
          .order("created_at", { ascending: false });

        setReports(reportsData || []);
        setSessions(sessionsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="mb-12 animate-in fade-in duration-700">
        <h1 className="text-4xl font-black shm-text-gradient mb-4 uppercase tracking-wider">
          إدارة الوثائق
        </h1>
        <div className="w-20 h-1.5 shm-gradient rounded-full"></div>
      </div>

      <div className="flex bg-gray-50 p-2 rounded-2xl mb-10 w-fit animate-in slide-in-from-right-4 duration-500">
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-8 py-3 font-black uppercase tracking-widest text-sm transition-all rounded-xl ${
            activeTab === "reports"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          التقارير
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-8 py-3 font-black uppercase tracking-widest text-sm transition-all rounded-xl ${
            activeTab === "sessions"
              ? "bg-white text-secondary shadow-sm"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          الجلسات
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-700">
          {activeTab === "reports" ? (
            reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} className="shm-card group">
                  <div className="w-12 h-12 shm-gradient text-white rounded-xl flex items-center justify-center mb-6 shadow-md shadow-primary/10 group-hover:scale-110 transition-transform">
                    <span className="text-xl">📄</span>
                  </div>
                  <h3 className="font-black text-xl mb-3 text-gray-800 uppercase tracking-tight line-clamp-2 min-h-[3.5rem]">
                    {report.title}
                  </h3>
                  <div className="text-sm text-gray-400 font-bold space-y-2 mb-6 border-t border-gray-50 pt-4">
                    <p className="flex items-center gap-2">📍 {report.location}</p>
                    <p className="flex items-center gap-2">🕒 {report.time}</p>
                    <p className="flex items-center gap-2">📅 {new Date(report.created_at).toLocaleDateString("ar-MA")}</p>
                  </div>
                  <a
                    href={report.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full shm-gradient text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest shm-gradient-hover shadow-lg shadow-primary/10"
                  >
                    عرض ملف PDF
                  </a>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
                <p className="text-gray-300 font-black uppercase tracking-[0.2em]">لا توجد تقارير متاحة حالياً</p>
              </div>
            )
          ) : (
            sessions.length > 0 ? (
              sessions.map((session) => (
                <div key={session.id} className="shm-card group">
                   <div className="w-12 h-12 shm-gradient text-white rounded-xl flex items-center justify-center mb-6 shadow-md shadow-primary/10 group-hover:scale-110 transition-transform">
                    <span className="text-xl">📝</span>
                  </div>
                  <h3 className="font-black text-xl mb-3 text-gray-800 uppercase tracking-tight line-clamp-2 min-h-[3.5rem]">
                    {session.title}
                  </h3>
                  <div className="text-sm text-gray-400 font-bold space-y-2 mb-6 border-t border-gray-50 pt-4">
                    <p className="flex items-center gap-2">📍 {session.location}</p>
                    <p className="flex items-center gap-2">🕒 {new Date(session.date_time).toLocaleString("ar-MA")}</p>
                    <p className="flex items-center gap-2">📅 {new Date(session.created_at).toLocaleDateString("ar-MA")}</p>
                  </div>
                  <a
                    href={session.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full shm-gradient text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest shm-gradient-hover shadow-lg shadow-primary/10"
                  >
                    عرض ملف PDF
                  </a>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-[3rem]">
                <p className="text-gray-300 font-black uppercase tracking-[0.2em]">لا توجد جلسات متاحة حالياً</p>
              </div>
            )
          )}
        </div>
      )}
    </Layout>
  );
}
