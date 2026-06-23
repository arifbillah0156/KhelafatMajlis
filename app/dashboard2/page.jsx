"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { ref, get, set, update } from "firebase/database";

const bnNum = (n) => n.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
const daysInBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const monthsInBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

const COLUMN_GROUPS = [
    {
        groupLabel: "কোরআন অধ্যয়ন",
        subFields: [
            { key: "quranAyat", label: "আয়াত সংখ্যা", type: "number" },
            { key: "quranSura", label: "সুরার নাম", type: "text" },
        ],
    },
    {
        groupLabel: "হাদীস অধ্যয়ন",
        subFields: [
            { key: "hadithCount", label: "হাদীস সংখ্যা", type: "number" },
            { key: "hadithTopic", label: "বিষয়", type: "text" },
        ],
    },
    {
        groupLabel: "ইসলামী সাহিত্য পাঠ",
        subFields: [
            { key: "sahityaPage", label: "পৃষ্ঠা সংখ্যা", type: "number" },
            { key: "sahityaName", label: "নাম", type: "text" },
        ],
    },
    {
        groupLabel: "জামাতে নামাজ",
        subFields: [
            { key: "namaz", label: "ওয়াক্ত", type: "number" },
        ],
    },
    {
        groupLabel: "যোগাযোগ",
        subFields: [
            { key: "contactCount", label: "সংখ্যা", type: "number" },
            { key: "contactNames", label: "নামসমূহ", type: "text" },
        ],
    },
    {
        groupLabel: "দাওয়াত",
        subFields: [
            { key: "dawatCount", label: "কত জন", type: "number" },
            { key: "dawatNames", label: "নামসমূহ", type: "text" },
        ],
    },
    {
        groupLabel: "সময় দান",
        subFields: [
            { key: "timeDonation", label: "ঘন্টা", type: "number" },
        ],
    },
    {
        groupLabel: "সমাজ সেবা",
        subFields: [
            { key: "socialService", label: "বিবরণ", type: "text" },
        ],
    },
    {
        groupLabel: "শরীর চর্চা",
        subFields: [
            { key: "physicalExercise", label: "হ্যা/না", type: "select", options: ["", "হ্যা", "না"] },
        ],
    },
    {
        groupLabel: "আত্ম-সমালোচনা",
        subFields: [
            { key: "selfCriticism", label: "হ্যা/না", type: "select", options: ["", "হ্যা", "না"] },
        ],
    },
];

const ALL_FIELD_KEYS = COLUMN_GROUPS.flatMap(g => g.subFields.map(f => f.key));

export default function DashboardPage() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [isClientReady, setIsClientReady] = useState(false);
    const [isValidUser, setIsValidUser] = useState(false);

    const [userName, setUserName] = useState("");
    const [userBranch, setUserBranch] = useState("");
    const [userPin, setUserPin] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState("");
    const [tempBranch, setTempBranch] = useState("");
    const [tempPin, setTempPin] = useState("");
    const [profileSaving, setProfileSaving] = useState(false);

    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const [formData, setFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const savedUserId = localStorage.getItem("app_user_uid");
        if (savedUserId) {
            setUserId(savedUserId);
        } else {
            router.push("/login");
        }
        setIsClientReady(true);
    }, []);

    const fetchUserProfile = async () => {
        if (!userId) return;
        try {
            const snap = await get(ref(db, `users/${userId}`));
            if (snap.exists()) {
                const data = snap.val();
                setUserName(data.name || "নাম নেই");
                setUserBranch(data.branch || "শাখা নেই");
                setUserPin(data.pin || "");
                setIsValidUser(true);
            } else {
                localStorage.removeItem("app_user_uid");
                router.push("/login");
            }
        } catch (err) {
            console.error("Profile fetch error", err);
            localStorage.removeItem("app_user_uid");
            router.push("/login");
        }
    };

    useEffect(() => {
        if (userId) fetchUserProfile();
    }, [userId]);

    const handleProfileUpdate = async () => {
        if (tempPin !== "" && tempPin.length < 4) {
            setToast({ type: "error", msg: "পিন কমপক্ষে ৪ সংখ্যার হতে হবে" });
            return;
        }
        setProfileSaving(true);
        try {
            const pinToSave = tempPin === "" ? userPin : tempPin;
            await update(ref(db, `users/${userId}`), { name: tempName, branch: tempBranch, pin: pinToSave });
            setUserName(tempName);
            setUserBranch(tempBranch);
            setUserPin(pinToSave);
            setIsEditing(false);
            setToast({ type: "success", msg: "প্রোফাইল আপডেট হয়েছে" });
        } catch (err) {
            setToast({ type: "error", msg: "আপডেট করতে সমস্যা হয়েছে" });
        } finally {
            setProfileSaving(false);
            setTimeout(() => setToast(null), 2500);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("app_user_uid");
        router.push("/login");
    };

    const generateDays = (y, m) => {
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1;
            const dateObj = new Date(y, m, d);
            const day = { id: i, date: bnNum(d.toString().padStart(2, "0")), dayName: daysInBn[dateObj.getDay()] };
            ALL_FIELD_KEYS.forEach((key) => { day[key] = ""; });
            return day;
        });
    };

    const migrateOldData = (days) => {
        return days.map((day) => {
            const migrated = { ...day };
            if (day.quranStudy !== undefined && !day.quranAyat) { migrated.quranAyat = ""; migrated.quranSura = day.quranStudy || ""; }
            if (day.hadithStudy !== undefined && !day.hadithCount) { migrated.hadithCount = ""; migrated.hadithTopic = day.hadithStudy || ""; }
            if (day.islamicSahitya !== undefined && !day.sahityaPage) { migrated.sahityaPage = ""; migrated.sahityaName = day.islamicSahitya || ""; }
            if (day.contact !== undefined && !day.contactCount) { migrated.contactCount = ""; migrated.contactNames = day.contact || ""; }
            if (day.dawat !== undefined && !day.dawatCount) { migrated.dawatCount = ""; migrated.dawatNames = day.dawat || ""; }
            ALL_FIELD_KEYS.forEach((key) => { if (migrated[key] === undefined) migrated[key] = ""; });
            return migrated;
        });
    };

    useEffect(() => {
        if (!userId || !isValidUser) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const docId = `${year}-${month + 1}`;
                const snapshot = await get(ref(db, `monthlyData/${userId}/records/${docId}`));
                if (snapshot.exists()) {
                    setFormData(migrateOldData(snapshot.val().days));
                } else {
                    setFormData(generateDays(year, month));
                }
            } catch (error) {
                setFormData(generateDays(year, month));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year, month, userId, isValidUser]);

    const handleChange = (id, field, value) => {
        setFormData((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const docId = `${year}-${month + 1}`;
            await set(ref(db, `monthlyData/${userId}/records/${docId}`), { days: formData, savedAt: new Date().toISOString() });
            setToast({ type: "success", msg: "সফলভাবে সেভ হয়েছে" });
        } catch (err) {
            setToast({ type: "error", msg: "সেভ করতে সমস্যা হয়েছে" });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 2500);
        }
    };

    const calculateSum = (key) => {
        return formData.reduce((sum, day) => {
            const val = parseFloat(day[key]);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
    };

    const calculateSelectCount = (key, targetValue) => {
        return formData.filter(day => day[key] === targetValue).length;
    };

    const handlePrint = () => {
        router.push(`/print?year=${year}&month=${month}`);
    };

    if (!isClientReady || !userId || !isValidUser) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 sm:pb-4 bangla">
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow-lg transition-all ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {toast.msg}
                </div>
            )}

            {/* ===== Header ===== */}
            <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 text-white shadow-lg">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-16 -left-16 w-52 h-52 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white shadow-lg ring-2 ring-white/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                            <img src="/Khelafat_Majlis_logo.jpg" alt="Logo" className="w-11 h-11 sm:w-13 sm:h-13 object-contain" />
                        </div>
                        <div className="text-left">
                            <div className="md:hidden">
                                <h1 className="text-xl font-bold leading-tight">খেলাফত মজলিস</h1>
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-3xl font-extrabold leading-none tracking-wide">
                                    খেলাফত মজলিস
                                </h1>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 border border-white/20">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-lime-300 animate-ping opacity-70"></span>
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-300"></span>
                                </span>
                                <span className="text-[12px] sm:text-[16px] font-semibold tracking-wide mt-[2px]">ব্যক্তিগত তৎপরতার রিপোর্ট</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* সাব হেডার */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2">
                            <div className="flex-1 sm:flex-none">
                                {isEditing ? (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="text-sm font-bold border border-slate-300 rounded px-2 py-1 w-full sm:w-auto" placeholder="নাম" />
                                        <input type="text" value={tempBranch} onChange={(e) => setTempBranch(e.target.value)} className="text-sm border border-slate-300 rounded px-2 py-1 w-full sm:w-auto" placeholder="শাখা" />
                                        <input type="text" value={tempPin} onChange={(e) => setTempPin(e.target.value)} className="text-sm border border-slate-300 rounded px-2 py-1 w-full sm:w-auto" placeholder="পিন পরিবর্তন করতে চাইলে নতুন পিন দিন" maxLength={10} />
                                        <button onClick={handleProfileUpdate} disabled={profileSaving} className="text-[12px] bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg font-semibold hover:bg-emerald-200 disabled:opacity-50">
                                            {profileSaving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2">বাতিল</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setTempName(userName); setTempBranch(userBranch); setTempPin(userPin); setIsEditing(true); }}>
                                        <div>
                                            <h1 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{userName}</h1>
                                            <p className="text-[11px] text-slate-500">{userBranch}</p>
                                        </div>
                                        <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="sm:hidden flex items-center gap-1 text-[12px] bg-slate-700 text-white px-3 py-2 rounded-md transition-colors font-medium"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                                    </svg>
                                    প্রিন্ট
                                </button>
                                <button onClick={handleLogout} className="text-[12px] sm:text-[14px] hover:text-red-700 border border-red-200 px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-50 transition-colors whitespace-nowrap lg:ml-6">
                                    লগআউট
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <h2 className="text-base sm:text-xl font-bold text-slate-800">
                                {monthsInBn[month]} {bnNum(year)}
                            </h2>
                            <select value={month} onChange={(e) => setMonth(+e.target.value)} className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                                {monthsInBn.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select value={year} onChange={(e) => setYear(+e.target.value)} className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{bnNum(y)}</option>)}
                            </select>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="hidden sm:flex items-center gap-1.5 text-[14px] bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                                </svg>
                                প্রিন্ট করুন
                            </button>

                            <button onClick={handleSave} disabled={saving} className="hidden sm:flex text-[16px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg transition-colors font-medium">
                                {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <form onSubmit={handleSave} className="flex justify-center">
                <div className="overflow-x-auto">
                    <div className="overflow-auto max-h-[80vh]">
                        <table className="w-min border-collapse">
                            <thead className="sticky top-0 z-30">
                                <tr className="bg-slate-700 text-white">
                                    <th rowSpan={2} className="text-left px-2 sm:px-4 py-2 font-semibold border-b border-r border-slate-600 text-xs sm:text-sm align-middle">তারিখ</th>
                                    {COLUMN_GROUPS.map((group) => (
                                        <th key={group.groupLabel} colSpan={group.subFields.length} className="text-center px-2 py-2 font-semibold border-b border-r border-slate-600 text-xs sm:text-sm whitespace-pre-line">
                                            {group.groupLabel}
                                        </th>
                                    ))}
                                </tr>
                                <tr className="bg-slate-600 text-white">
                                    {COLUMN_GROUPS.map((group) =>
                                        group.subFields.map((field) => (
                                            <th key={field.key} className="text-center px-1.5 sm:px-2 py-1.5 font-medium border-b border-r border-slate-500 text-[10px] sm:text-xs whitespace-nowrap">
                                                {field.label}
                                            </th>
                                        ))
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={ALL_FIELD_KEYS.length + 1} className="text-center py-12 text-slate-400">
                                            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                            <span className="text-xs">লোড হচ্ছে...</span>
                                        </td>
                                    </tr>
                                ) : (
                                    formData.map((day, idx) => (
                                        <tr key={day.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"} hover:bg-emerald-50/50 transition-colors`}>
                                            <td className="px-2 sm:px-4 py-1.5 sm:py-2 border-b border-r border-slate-100">
                                                <span className="text-xs sm:text-sm font-semibold text-slate-700">{day.date}</span>
                                                <span className="block text-[10px] sm:text-[11px] text-slate-400 leading-tight">{day.dayName}</span>
                                            </td>
                                            {COLUMN_GROUPS.map((group) =>
                                                group.subFields.map((field) => (
                                                    <td key={field.key} className="px-0.5 sm:px-1 py-0.5 sm:py-1.5 border-b border-r border-slate-100">
                                                        {field.type === "select" ? (
                                                            <select
                                                                value={day[field.key] || ""}
                                                                onChange={(e) => handleChange(day.id, field.key, e.target.value)}
                                                                className="text-xs sm:text-sm px-1 sm:px-2 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all w-16 sm:w-20 text-center appearance-none cursor-pointer"
                                                            >
                                                                {(field.options || []).map((opt) => (
                                                                    <option key={opt} value={opt}>{opt || "..."}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type={field.type}
                                                                value={day[field.key] || ""}
                                                                onChange={(e) => handleChange(day.id, field.key, e.target.value)}
                                                                min={field.type === "number" ? 0 : undefined}
                                                                className={`text-xs sm:text-sm px-1.5 sm:px-2 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all ${field.type === "number" ? "w-14 sm:w-16 text-center" : "w-24 sm:w-32"}`}
                                                                placeholder="..."
                                                                maxLength={field.type === "text" ? 100 : undefined}
                                                            />
                                                        )}
                                                    </td>
                                                ))
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>

                            <tfoot className="">
                                <tr className="bg-slate-800 text-white">
                                    <th className="text-left px-2 sm:px-4 py-3 font-bold border-t-2 border-r border-slate-600 text-xs sm:text-sm bg-slate-800">মোট</th>
                                    {COLUMN_GROUPS.map((group) => {
                                        const numberField = group.subFields.find(f => f.type === "number");
                                        const selectField = group.subFields.find(f => f.type === "select");

                                        if (selectField) {
                                            const yesCount = calculateSelectCount(selectField.key, "হ্যা");
                                            const noCount = calculateSelectCount(selectField.key, "না");
                                            return (
                                                <td key={group.groupLabel} colSpan={group.subFields.length} className="text-center px-2 py-3 border-t-2 border-r border-slate-600 text-xs sm:text-sm font-bold bg-slate-800">
                                                    <span className="text-emerald-300">হ্যা: {bnNum(yesCount)}</span> <br />
                                                    <span className="text-red-300">না: {bnNum(noCount)}</span>
                                                </td>
                                            );
                                        }

                                        let suffix = "";
                                        switch (numberField?.key) {
                                            case "quranAyat": suffix = "টি আয়াত"; break;
                                            case "hadithCount": suffix = "টি হাদীস"; break;
                                            case "sahityaPage": suffix = "পৃষ্ঠা"; break;
                                            case "namaz": suffix = "ওয়াক্ত"; break;
                                            case "contactCount": suffix = "জন"; break;
                                            case "dawatCount": suffix = "জন"; break;
                                            case "timeDonation": suffix = "ঘন্টা"; break;
                                            default: suffix = "";
                                        }
                                        return (
                                            <td key={group.groupLabel} colSpan={group.subFields.length} className="text-center px-2 py-3 border-t-2 border-r border-slate-600 text-xs sm:text-sm font-bold bg-slate-800">
                                                {numberField ? `${bnNum(calculateSum(numberField.key))} ${suffix}` : ""}
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* মোবাইলে নিচে শুধু সেভ বাটন থাকবে */}
                <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-3 shadow-lg">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl transition-colors font-medium"
                    >
                        {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                    </button>
                </div>
            </form>
        </div>
    );
}