"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { ref, get, set } from "firebase/database";

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

export default function MonthlyForm() {
    // ইউজার আইডেন্টিফিকেশন স্টেট
    const [userId, setUserId] = useState(null);
    const [isIdentified, setIsIdentified] = useState(false);
    const [mobileInput, setMobileInput] = useState("");
    const [pinInput, setPinInput] = useState("");

    // ফর্ম এবং ডাটা স্টেট
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const [formData, setFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // পেজ লোড হলে চেক করবে আগে থেকে লগইন আছে কি না
    useEffect(() => {
        const savedUserId = localStorage.getItem("app_user_uid");
        if (savedUserId) {
            setUserId(savedUserId);
            setIsIdentified(true);
        }
    }, []);

    // মোবাইল ও পিন দিয়ে লগইন করার ফাংশন
    const handleLogin = (e) => {
        e.preventDefault();
        const cleanMobile = mobileInput.replace(/\D/g, ''); // শুধু সংখ্যা রাখবে
        if (cleanMobile.length < 11 || pinInput.length < 4) {
            alert("সঠিক মোবাইল নাম্বার (১১ ডিজিট) এবং পিন (কমপক্ষে ৪ ডিজিট) দিন।");
            return;
        }
        // ইউনিক আইডি তৈরি (যেমন: 01712345678_1234)
        const newUserId = `${cleanMobile}_${pinInput}`;
        localStorage.setItem("app_user_uid", newUserId);
        setUserId(newUserId);
        setIsIdentified(true);
    };

    // লগআউট ফাংশন
    const handleLogout = () => {
        localStorage.removeItem("app_user_uid");
        setUserId(null);
        setIsIdentified(false);
        setMobileInput("");
        setPinInput("");
        setFormData([]);
    };

    // ডেটা জেনারেট করার ফাংশন
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

    // ডাটাবেস থেকে ডাটা লোড করা
    useEffect(() => {
        if (!isIdentified || !userId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const docId = `${year}-${month + 1}`;
                const snapshot = await get(ref(db, `monthlyData/${userId}/${docId}`));
                setFormData(snapshot.exists() ? snapshot.val().days : generateDays(year, month));
            } catch (error) {
                console.error("Data fetch error:", error);
                setFormData(generateDays(year, month));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year, month, isIdentified, userId]);

    const handleChange = (id, field, value) => {
        setFormData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    // ডাটাবেসে ডাটা সেভ করা
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const docId = `${year}-${month + 1}`;
            await set(ref(db, `monthlyData/${userId}/${docId}`), {
                days: formData,
                savedAt: new Date().toISOString()
            });
            setToast({ type: "success", msg: "সফলভাবে সেভ হয়েছে" });
        } catch (err) {
            console.error("Save error:", err);
            setToast({ type: "error", msg: "সেভ করতে সমস্যা হয়েছে" });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 2500);
        }
    };

    // ---------------------- লগইন স্ক্রিন ----------------------
    if (!isIdentified) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-100 w-full max-w-sm">
                    <h2 className="text-xl font-bold text-slate-800 text-center mb-6">প্রবেশ করুন</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">মোবাইল নাম্বার</label>
                            <input
                                type="tel"
                                value={mobileInput}
                                onChange={(e) => setMobileInput(e.target.value)}
                                placeholder="০১৭XXXXXXXX"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-700"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">ইউনিক পিন কোড</label>
                            <input
                                type="password"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                placeholder="কমপক্ষে ৪ সংখ্যার পিন"
                                maxLength={10}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-700"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                        >
                            প্রবেশ করুন
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ---------------------- লোডিং স্ক্রিন ----------------------
    if (loading && formData.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-400">লোড হচ্ছে...</span>
                </div>
            </div>
        );
    }

    // ---------------------- মূল টেবিল ফর্ম ----------------------
    return (
        <div className="min-h-screen bg-slate-50 pb-20 sm:pb-0">

            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow-lg transition-all
                    ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <h1 className="text-base sm:text-xl font-bold text-slate-800 whitespace-nowrap">
                            {monthsInBn[month]} {bnNum(year)}
                        </h1>
                        {/* লগআউট বাটন */}
                        <button
                            onClick={handleLogout}
                            className="text-[11px] sm:text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                            লগআউট
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                        <select
                            value={month}
                            onChange={(e) => setMonth(+e.target.value)}
                            className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        >
                            {monthsInBn.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(+e.target.value)}
                            className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        >
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{bnNum(y)}</option>)}
                        </select>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="hidden sm:flex text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg transition-colors font-medium ml-1"
                        >
                            {saving ? (
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    সেভ হচ্ছে
                                </span>
                            ) : "সেভ করুন"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <form onSubmit={handleSave}>
                <div className="overflow-x-auto overscroll-x-contain">
                    <div className="min-w-[850px] max-w-[1600px] mx-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-700 text-white">
                                    <th className="sticky left-0 z-20 bg-slate-700 text-left px-2 sm:px-4 py-2.5 sm:py-3 w-[60px] sm:w-24 font-semibold border-b border-slate-600 text-xs sm:text-sm">
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
                                        <td className="sticky left-0 z-10 px-2 sm:px-4 py-1.5 sm:py-2 border-b border-slate-100 bg-inherit">
                                            <span className="text-xs sm:text-sm font-semibold text-slate-700">{day.date}</span>
                                            <span className="block text-[10px] sm:text-[11px] text-slate-400 leading-tight">{day.dayName}</span>
                                        </td>
                                        {COLUMNS.map(col => (
                                            <td key={col.key} className="px-0.5 sm:px-1 py-0.5 sm:py-1.5 border-b border-slate-100">
                                                <input
                                                    type="text"
                                                    value={day[col.key] || ""}
                                                    onChange={(e) => handleChange(day.id, col.key, e.target.value)}
                                                    className="w-full text-xs sm:text-sm px-1.5 sm:px-2.5 py-1.5 sm:py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all"
                                                    placeholder="—"
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
                <div className="sm:hidden sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-3 text-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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