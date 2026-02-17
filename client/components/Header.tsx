import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 relative overflow-hidden rounded-full border-2 border-primary/10 p-1 group-hover:scale-110 transition-transform duration-300">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2Fd8cf247061ae4e73b8c8529275e40675%2F1e55c030693d429b8a71a3a705492b5e?format=webp&width=800&height=1200" 
              alt="Logo SHM" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg md:text-xl shm-text-gradient uppercase tracking-tight">
              الكشافة الحسنية المغربية
            </span>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em] -mt-1">
              Scoutisme Hassania Marocain
            </span>
          </div>
        </Link>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-bold text-white shm-gradient rounded-full shadow-sm hover:shadow-md transition-all shm-gradient-hover"
          >
            تسجيل الخروج
          </button>
        ) : (
          <Link
            to="/login"
            className="px-6 py-2 text-sm font-bold text-white shm-gradient rounded-full shadow-sm hover:shadow-md transition-all shm-gradient-hover"
          >
            تسجيل الدخول
          </Link>
        )}
      </div>
    </header>
  );
}
