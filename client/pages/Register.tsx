import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

interface PatrolOption {
  id: string;
  name: string;
}

interface RoleOption {
  id: string;
  name: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [patrols, setPatrols] = useState<PatrolOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    patrol: "",
    role: "",
    isHighPatrol: false,
    
    // Guardian info
    guardianFirstName: "",
    guardianLastName: "",
    guardianRelationship: "",
    guardianRelationshipOther: "",
    guardianCin: "",
    
    // Contact info
    userPhone: "+212",
    userEmail: "",
    userPassword: "",
    
    fatherPhone: "",
    motherPhone: "",
    homePhone: "",
    
    fatherEmail: "",
    motherEmail: "",
    
    additionalInfo: "",
  });

  // Load patrols and roles from database (mock for now)
  useEffect(() => {
    // TODO: Fetch from Supabase
    setPatrols([
      { id: "1", name: "دورية 1" },
      { id: "2", name: "دورية 2" },
      { id: "3", name: "دورية 3" },
      { id: "4", name: "دورية 4" },
    ]);
    
    setRoles([
      { id: "1", name: "رائد" },
      { id: "2", name: "مساعد" },
      { id: "3", name: "كاتب" },
      { id: "4", name: "مراقب الزي" },
      { id: "5", name: "عضو 1" },
      { id: "6", name: "عضو 2" },
      { id: "7", name: "عضو 3" },
    ]);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const calculateAge = (birthDate: string): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "الاسم الأول مطلوب";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "النسب مطلوب";
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "تاريخ الميلاد مطلوب";
    } else {
      const age = calculateAge(formData.birthDate);
      if (age === null || age < 10 || age >= 17) {
        newErrors.birthDate = "العمر يجب أن يكون بين 10 و 16 سنة";
      }
    }
    if (!formData.gender) {
      newErrors.gender = "الجنس مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patrol) {
      newErrors.patrol = "اختيار الدورية مطلوب";
    }
    if (!formData.role) {
      newErrors.role = "اختيار الدور مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    // Phone validation: +212 + 9 digits (5, 6, or 7)
    const phoneValue = formData.userPhone.replace("+212", "");
    const phoneRegex = /^[567]\d{8}$/;
    if (!phoneValue || !phoneRegex.test(phoneValue)) {
      newErrors.userPhone = "رقم الهاتف غير صحيح (9 أرقام تبدأ بـ 5 أو 6 أو 7)";
    }

    // Email validation: only gmail, yahoo, hotmail with .com
    const emailRegex = /^[A-Za-z0-9._%+-]+@(gmail|yahoo|hotmail)\.com$/;
    if (!formData.userEmail || !emailRegex.test(formData.userEmail)) {
      newErrors.userEmail = "البريد الإلكتروني يجب أن يكون من gmail أو yahoo أو hotmail";
    }

    // Password validation
    if (!formData.userPassword || formData.userPassword.length < 6) {
      newErrors.userPassword = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.guardianFirstName.trim()) {
      newErrors.guardianFirstName = "اسم الولي مطلوب";
    }
    if (!formData.guardianLastName.trim()) {
      newErrors.guardianLastName = "لقب الولي مطلوب";
    }
    if (!formData.guardianRelationship) {
      newErrors.guardianRelationship = "الصفة مطلوبة";
    }
    if (formData.guardianRelationship === "other" && !formData.guardianRelationshipOther.trim()) {
      newErrors.guardianRelationshipOther = "يرجى توضيح الصفة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    let isValid = false;
    
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    } else if (step === 3) {
      isValid = validateStep3();
    } else if (step === 4) {
      isValid = validateStep4();
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Submit to Supabase
    console.log("Registration data:", formData);
    navigate("/dashboard");
  };

  const age = calculateAge(formData.birthDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cream" dir="rtl">
      <Header />
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Registration Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-l from-red-600 to-purple-600 bg-clip-text text-transparent mb-2">
              إنشاء حساب جديد
            </h1>
            <p className="text-gray-600 mb-4">
              المرحلة {step} من 5
            </p>
            
            {/* Progress Bar */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    s <= step ? "bg-gradient-to-r from-red-600 to-purple-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={step === 5 ? handleSubmit : (e) => e.preventDefault()}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4 border-t-4 border-gradient-to-r from-red-600 to-purple-600">
                <h2 className="text-xl font-bold text-gray-800 mb-4">المعلومات الشخصية</h2>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الاسم الأول
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الأول"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    النسب / اللقب
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="أدخل لقبك"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    تاريخ الميلاد
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.birthDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formData.birthDate && (
                    <p className="text-gray-600 text-sm mt-2">
                      العمر: {age} سنة
                    </p>
                  )}
                  {errors.birthDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الجنس
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">اختر الجنس</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-l from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-2 rounded-lg transition-all mt-6"
                >
                  التالي
                </button>
              </div>
            )}

            {/* Step 2: Patrol & Role */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4 border-t-4 border-gradient-to-r from-red-600 to-purple-600">
                <h2 className="text-xl font-bold text-gray-800 mb-4">الانتساب للكشافة</h2>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    اختيار الدورية
                  </label>
                  <select
                    name="patrol"
                    value={formData.patrol}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.patrol ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">اختر دورية</option>
                    {patrols.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.patrol && (
                    <p className="text-red-500 text-sm mt-1">{errors.patrol}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    اختيار الدور
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.role ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">اختر دور</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <input
                    type="checkbox"
                    name="isHighPatrol"
                    id="isHighPatrol"
                    checked={formData.isHighPatrol}
                    onChange={handleChange}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isHighPatrol" className="text-sm text-gray-700 cursor-pointer">
                    أنا عضو في الدورية العليا
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-gradient-to-l from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-2 rounded-lg transition-all"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4 border-t-4 border-gradient-to-r from-red-600 to-purple-600">
                <h2 className="text-xl font-bold text-gray-800 mb-4">معلومات الاتصال</h2>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    رقم هاتفك
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="+212"
                      disabled
                      className="w-16 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-center font-semibold"
                    />
                    <input
                      type="text"
                      name="userPhone"
                      value={formData.userPhone.replace("+212", "")}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          userPhone: "+212" + e.target.value.slice(0, 9),
                        }));
                        setErrors((prev) => ({ ...prev, userPhone: "" }));
                      }}
                      placeholder="6xx xxx xxx"
                      maxLength={9}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        errors.userPhone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.userPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.userPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="userEmail"
                    value={formData.userEmail}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.userEmail ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.userEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.userEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    name="userPassword"
                    value={formData.userPassword}
                    onChange={handleChange}
                    placeholder="أدخل كلمة مرور قوية"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.userPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.userPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.userPassword}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-gradient-to-l from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-2 rounded-lg transition-all"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Guardian Info */}
            {step === 4 && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4 border-t-4 border-gradient-to-r from-red-600 to-purple-600">
                <h2 className="text-xl font-bold text-gray-800 mb-4">معلومات الولي</h2>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    اسم الولي
                  </label>
                  <input
                    type="text"
                    name="guardianFirstName"
                    value={formData.guardianFirstName}
                    onChange={handleChange}
                    placeholder="أدخل اسم الولي"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.guardianFirstName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.guardianFirstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.guardianFirstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    لقب الولي
                  </label>
                  <input
                    type="text"
                    name="guardianLastName"
                    value={formData.guardianLastName}
                    onChange={handleChange}
                    placeholder="أدخل لقب الولي"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.guardianLastName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.guardianLastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.guardianLastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    الصفة / القرابة
                  </label>
                  <select
                    name="guardianRelationship"
                    value={formData.guardianRelationship}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                      errors.guardianRelationship ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">اختر الصفة</option>
                    <option value="father">أب</option>
                    <option value="mother">أم</option>
                    <option value="other">آخر</option>
                  </select>
                  {errors.guardianRelationship && (
                    <p className="text-red-500 text-sm mt-1">{errors.guardianRelationship}</p>
                  )}
                </div>

                {formData.guardianRelationship === "other" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      توضيح الصفة
                    </label>
                    <input
                      type="text"
                      name="guardianRelationshipOther"
                      value={formData.guardianRelationshipOther}
                      onChange={handleChange}
                      placeholder="مثال: عم، خالة، جد، إلخ"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                        errors.guardianRelationshipOther ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.guardianRelationshipOther && (
                      <p className="text-red-500 text-sm mt-1">{errors.guardianRelationshipOther}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    رقم البطاقة الوطنية
                  </label>
                  <input
                    type="text"
                    name="guardianCin"
                    value={formData.guardianCin}
                    onChange={handleChange}
                    placeholder="رقم البطاقة (اختياري)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
                  >
                    السابق
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 bg-gradient-to-l from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-2 rounded-lg transition-all"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Additional Contact Info */}
            {step === 5 && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4 border-t-4 border-gradient-to-r from-red-600 to-purple-600">
                <h2 className="text-xl font-bold text-gray-800 mb-4">معلومات الاتصال الإضافية</h2>
                
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">أرقام الهواتف والبريد الإلكتروني لأولياء الأمور (اختياري)</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    هاتف الأب
                  </label>
                  <input
                    type="tel"
                    name="fatherPhone"
                    value={formData.fatherPhone}
                    onChange={handleChange}
                    placeholder="+212 6xx xxx xxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    هاتف الأم
                  </label>
                  <input
                    type="tel"
                    name="motherPhone"
                    value={formData.motherPhone}
                    onChange={handleChange}
                    placeholder="+212 6xx xxx xxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    هاتف المنزل (اختياري)
                  </label>
                  <input
                    type="tel"
                    name="homePhone"
                    value={formData.homePhone}
                    onChange={handleChange}
                    placeholder="رقم هاتف ثابت"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    بريد الأب
                  </label>
                  <input
                    type="email"
                    name="fatherEmail"
                    value={formData.fatherEmail}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    بريد الأم
                  </label>
                  <input
                    type="email"
                    name="motherEmail"
                    value={formData.motherEmail}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    معلومات إضافية
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleChange}
                    placeholder="أي معلومات إضافية مهمة..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
                  >
                    السابق
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-l from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-2 rounded-lg transition-all"
                  >
                    إنشاء الحساب
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Already have account */}
          {step === 1 && (
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm mb-2">
                هل لديك حساب بالفعل؟
              </p>
              <a
                href="/login"
                className="text-purple-600 font-bold hover:text-purple-700 transition-colors"
              >
                قم بتسجيل الدخول
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
