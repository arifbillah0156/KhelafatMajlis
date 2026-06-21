"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { ref, get, set, update } from "firebase/database";

const bnNum = (n) => n.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
const daysInBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const monthsInBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

const COLUMNS = [
    { key: "namaz", label: "নামায" },
    { key: "quran", label: "কোরআন" },
    { key: "hadith", label: "হাদিস" },
    { key: "sahitya", label: "সাহিত্য" },
    { key: "khedmat", label: "খেদমত" },
    { key: "sangothan", label: "সাংগঠনিক" },
    { key: "dawat", label: "দাওয়াত" },
    { key: "rogi", label: "রোগী" },
    { key: "montobyo", label: "মন্তব্য" },
];

export default function DashboardPage() {
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [isClientReady, setIsClientReady] = useState(false);

    const [userName, setUserName] = useState("");
    const [userDesignation, setUserDesignation] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState("");
    const [tempDesignation, setTempDesignation] = useState("");
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
                setUserDesignation(data.designation || "পদবী নেই");
            }
        } catch (err) {
            console.error("Profile fetch error", err);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
        }
    }, [userId]);

    const handleProfileUpdate = async () => {
        setProfileSaving(true);
        try {
            await update(ref(db, `users/${userId}`), { name: tempName, designation: tempDesignation });
            setUserName(tempName);
            setUserDesignation(tempDesignation);
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
            const day = { id: d, date: bnNum(d.toString().padStart(2, '0')), dayName: daysInBn[dateObj.getDay()] };
            COLUMNS.forEach(col => { day[col.key] = ""; });
            return day;
        });
    };

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const docId = `${year}-${month + 1}`;
                const snapshot = await get(ref(db, `monthlyData/${userId}/records/${docId}`));
                setFormData(snapshot.exists() ? snapshot.val().days : generateDays(year, month));
            } catch (error) {
                setFormData(generateDays(year, month));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year, month, userId]);

    const handleChange = (id, field, value) => {
        setFormData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
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

    if (!isClientReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!userId) return null;

    if (loading && formData.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 sm:pb-4 bangla">

            {/* মোবাইলে নিচের বাটনের কারণে লুকানো থাকা ঠিক করতে pb-20 sm:pb-4 করা হয়েছে */}

            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow-lg transition-all ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            {isEditing ? (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                    <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="text-sm font-bold border border-slate-300 rounded px-2 py-1 w-full sm:w-auto" placeholder="নাম" />
                                    <input type="text" value={tempDesignation} onChange={(e) => setTempDesignation(e.target.value)} className="text-sm border border-slate-300 rounded px-2 py-1 w-full sm:w-auto" placeholder="পদবী" />
                                    <button onClick={handleProfileUpdate} disabled={profileSaving} className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-200 disabled:opacity-50">
                                        {profileSaving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2">বাতিল</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { setTempName(userName); setTempDesignation(userDesignation); setIsEditing(true); }}>
                                    <div>
                                        <h1 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{userName}</h1>
                                        <p className="text-[11px] text-slate-500">{userDesignation}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </div>
                            )}
                        </div>
                        <button onClick={handleLogout} className="text-[11px] sm:text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-md hover:bg-red-50 transition-colors whitespace-nowrap ml-2">
                            লগআউট
                        </button>
                    </div>

                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <h2 className="text-base sm:text-xl font-bold text-slate-800 sm:ml-auto">
                            {monthsInBn[month]} {bnNum(year)}
                        </h2>
                        <select value={month} onChange={(e) => setMonth(+e.target.value)} className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                            {monthsInBn.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(+e.target.value)} className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{bnNum(y)}</option>)}
                        </select>
                        <button onClick={handleSave} disabled={saving} className="hidden sm:flex text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg transition-colors font-medium">
                            {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                        </button>
                    </div>
                </div>
            </div>




            {/* Table Container */}
            <form onSubmit={handleSave}>
                <div className="overflow-x-auto">
                    <div className="overflow-auto max-h-[80vh] ">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-30 bg-slate-700">
                                <tr className="bg-slate-700 text-white">
                                    <th className="text-left px-2 sm:px-4 py-2.5 sm:py-3 w-[60px] sm:w-24 font-semibold border-b border-slate-600 text-xs sm:text-sm">
                                        তারিখ
                                    </th>
                                    {COLUMNS.map(col => (
                                        <th key={col.key} className="text-left px-1.5 sm:px-3 py-2.5 sm:py-3 font-semibold border-b border-slate-600 whitespace-nowrap text-xs sm:text-sm">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {formData.map((day, idx) => (
                                    <tr key={day.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"} hover:bg-emerald-50/50 transition-colors`}>
                                        <td className="px-2 sm:px-4 py-1.5 sm:py-2 border-b border-slate-100">
                                            <span className="text-xs sm:text-sm font-semibold text-slate-700">{day.date}</span>
                                            <span className="block text-[10px] sm:text-[11px] text-slate-400 leading-tight">{day.dayName}</span>
                                        </td>
                                        {COLUMNS.map(col => (
                                            <td key={col.key} className="px-0.5 sm:px-1 py-0.5 sm:py-1.5 border-b border-slate-100">
                                                <input
                                                    type="text"
                                                    value={day[col.key] || ""}
                                                    onChange={(e) => handleChange(day.id, col.key, e.target.value)}
                                                    className="w-full text-xs sm:text-sm px-1.5 sm:px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all"
                                                    // placeholder={`${col.label}...`}
                                                    placeholder={`...`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Bottom Save Button */}
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