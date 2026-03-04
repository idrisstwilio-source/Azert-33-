import { useState, useEffect } from "react";
import Layout from "@/components/Layout";

interface UserData {
  id: string;
  generated_id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  gender: string;
  patrol: string;
  role: string;
  is_high_patrol: boolean;
  email: string;
  phone: string;
}

interface GuardianData {
  first_name: string;
  last_name: string;
  relationship: string;
  relationship_other?: string;
  national_id: string;
}

interface ContactData {
  user_phone: string;
  user_email: string;
  father_phone?: string;
  mother_phone?: string;
  home_phone?: string;
  father_email?: string;
  mother_email?: string;
  additional_info?: string;
}

export default function Account() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [guardianData, setGuardianData] = useState<GuardianData | null>(null);
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"personal" | "guardian" | "contact">("personal");

  useEffect(() => {
    // TODO: Fetch from Supabase
    // const fetchUserData = async () => {
    //   try {
    //     const { data: user } = await supabase
    //       .from('users')
    //       .select('*')
    //       .eq('id', userId)
    //       .single();
    //     setUserData(user);
    //     // ... fetch guardian and contact data
    //   } catch (error) {
    //     console.error('Error fetching user data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchUserData();

    // Mock data for development
    setTimeout(() => {
      setUserData({
        id: "1",
        generated_id: "E0001",
        first_name: "أحمد",
        last_name: "علي",
        birth_date: "2010-05-15",
        gender: "male",
        patrol: "دورية 1",
        role: "عضو 1",
        is_high_patrol: false,
        email: "ahmed@gmail.com",
        phone: "+212612345678",
      });
      setGuardianData({
        first_name: "محمد",
        last_name: "علي",
        relationship: "father",
        national_id: "AB123456",
      });
      setContactData({
        user_phone: "+212612345678",
        user_email: "ahmed@gmail.com",
        father_phone: "+212698765432",
        mother_phone: "+212687654321",
        home_phone: "0522456789",
        father_email: "father@gmail.com",
        mother_email: "mother@gmail.com",
        additional_info: "معلومات إضافية إن وجدت",
      });
      setLoading(false);
    }, 500);
  }, []);

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-MA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGenderLabel = (gender: string): string => {
    return gender === "male" ? "ذكر" : "أنثى";
  };

  const getRelationshipLabel = (relationship: string, other?: string): string => {
    const labels: Record<string, string> = {
      father: "أب",
      mother: "أم",
      other: other || "آخر",
    };
    return labels[relationship] || relationship;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userData) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-bold">خطأ في تحميل البيانات. يرجى تحديث الصفحة.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-l from-red-600 to-purple-600 bg-clip-text text-transparent mb-4">
          حسابي
        </h1>
        <p className="text-gray-600">
          معرّفك: <span className="font-bold text-purple-600">{userData.generated_id}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {["personal", "guardian", "contact"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-3 font-bold border-b-4 transition-all ${
              activeTab === tab
                ? "border-gradient-to-r from-red-600 to-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab === "personal" && "المعلومات الشخصية"}
            {tab === "guardian" && "معلومات الولي"}
            {tab === "contact" && "معلومات الاتصال"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Personal Info Tab */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card: Basic Info */}
              <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-gradient-to-b from-red-600 to-purple-600">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  البيانات الأساسية
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">الاسم الأول</p>
                    <p className="text-lg font-semibold text-gray-800">{userData.first_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">النسب / اللقب</p>
                    <p className="text-lg font-semibold text-gray-800">{userData.last_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">الجنس</p>
                    <p className="text-lg font-semibold text-gray-800">{getGenderLabel(userData.gender)}</p>
                  </div>
                </div>
              </div>

              {/* Card: Birth Info */}
              <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-gradient-to-b from-purple-600 to-red-600">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  معلومات الميلاد
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">تاريخ الميلاد</p>
                    <p className="text-lg font-semibold text-gray-800">{formatDate(userData.birth_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">العمر</p>
                    <p className="text-2xl font-bold text-purple-600">{calculateAge(userData.birth_date)} سنة</p>
                  </div>
                </div>
              </div>

              {/* Card: Scout Info */}
              <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-gradient-to-b from-red-600 to-purple-600">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  معلومات الكشافة
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">الدورية</p>
                    <p className="text-lg font-semibold text-gray-800">{userData.patrol}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">الدور</p>
                    <p className="text-lg font-semibold text-gray-800">{userData.role}</p>
                  </div>
                </div>
              </div>

              {/* Card: ID & Status */}
              <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-gradient-to-b from-purple-600 to-red-600">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  الحالة
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">معرّفك الفريد</p>
                    <p className="text-2xl font-bold bg-gradient-to-l from-red-600 to-purple-600 bg-clip-text text-transparent">
                      {userData.generated_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 uppercase">الدورية العليا:</p>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      userData.is_high_patrol
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {userData.is_high_patrol ? "نعم" : "لا"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guardian Info Tab */}
        {activeTab === "guardian" && guardianData && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-gradient-to-b from-red-600 to-purple-600">
              <h3 className="text-lg font-bold text-gray-800 mb-6 pb-3 border-b-2 border-purple-200">
                بيانات الولي / الوصي
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">الاسم الأول</p>
                  <p className="text-lg font-semibold text-gray-800">{guardianData.first_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">النسب / اللقب</p>
                  <p className="text-lg font-semibold text-gray-800">{guardianData.last_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">الصفة</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {getRelationshipLabel(guardianData.relationship, guardianData.relationship_other)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">رقم البطاقة الوطنية</p>
                  <p className="text-lg font-semibold text-gray-800">{guardianData.national_id || "غير محدد"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === "contact" && contactData && (
          <div className="space-y-4">
            {/* Card: User Contact */}
            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-gradient-to-b from-red-600 to-purple-600">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                معلومات اتصالك
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">الهاتف</p>
                  <p className="text-lg font-semibold text-gray-800" dir="ltr">{contactData.user_phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">البريد الإلكتروني</p>
                  <p className="text-lg font-semibold text-gray-800" dir="ltr">{contactData.user_email}</p>
                </div>
              </div>
            </div>

            {/* Card: Parents Contact */}
            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-gradient-to-b from-purple-600 to-red-600">
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                بيانات الوالدين
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contactData.father_phone && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">هاتف الأب</p>
                    <p className="text-lg font-semibold text-gray-800" dir="ltr">{contactData.father_phone}</p>
                  </div>
                )}
                {contactData.mother_phone && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">هاتف الأم</p>
                    <p className="text-lg font-semibold text-gray-800" dir="ltr">{contactData.mother_phone}</p>
                  </div>
                )}
                {contactData.home_phone && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">الهاتف الثابت</p>
                    <p className="text-lg font-semibold text-gray-800" dir="ltr">{contactData.home_phone}</p>
                  </div>
                )}
                {contactData.father_email && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">بريد الأب</p>
                    <p className="text-lg font-semibold text-gray-800" dir="ltr">{contactData.father_email}</p>
                  </div>
                )}
                {contactData.mother_email && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">بريد الأم</p>
                    <p className="text-lg font-semibold text-gray-800" dir="ltr">{contactData.mother_email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card: Additional Info */}
            {contactData.additional_info && (
              <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-gradient-to-b from-red-600 to-purple-600">
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-purple-200">
                  معلومات إضافية
                </h3>
                <p className="text-gray-700 leading-relaxed">{contactData.additional_info}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
