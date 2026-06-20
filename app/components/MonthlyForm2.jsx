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
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(5);
    const [formData, setFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

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
        const fetchData = async () => {
            setLoading(true);
            try {
                const snapshot = await get(ref(db, `monthlyData/${year}-${month + 1}`));
                setFormData(snapshot.exists() ? snapshot.val().days : generateDays(year, month));
            } catch {
                setFormData(generateDays(year, month));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year, month]);

    const handleChange = (id, field, value) => {
        setFormData(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await set(ref(db, `monthlyData/${year}-${month + 1}`), {
                days: formData,
                savedAt: new Date().toISOString()
            });
            setToast({ type: "success", msg: "সফলভাবে সেভ হয়েছে" });
        } catch (err) {
            setToast({ type: "error", msg: "সেভ করতে সমস্যা হয়েছে" });
        } finally {
            setSaving(false);
            setTimeout(() => setToast(null), 2500);
        }
    };

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

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow-lg transition-all
                    ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                        {monthsInBn[month]} {bnNum(year)}
                    </h1>
                    <div className="flex items-center gap-2">
                        <select
                            value={month}
                            onChange={(e) => setMonth(+e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        >
                            {monthsInBn.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(+e.target.value)}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        >
                            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{bnNum(y)}</option>)}
                        </select>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg transition-colors font-medium ml-1"
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

            {/* Table */}
            <form onSubmit={handleSave}>
                <div className="overflow-x-auto">
                    <div className="min-w-[1100px]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-700 text-white text-sm">
                                    <th className="sticky left-0 z-20 bg-slate-700 text-left px-4 py-3 w-24 font-semibold border-b border-slate-600">
                                        তারিখ
                                    </th>
                                    {COLUMNS.map(col => (
                                        <th key={col.key} className="text-left px-3 py-3 font-semibold border-b border-slate-600 whitespace-nowrap">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {formData.map((day, idx) => (
                                    <tr key={day.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-emerald-50/40 transition-colors`}>
                                        <td className="sticky left-0 z-10 px-4 py-2 border-b border-slate-100 bg-inherit">
                                            <span className="text-sm font-semibold text-slate-700">{day.date}</span>
                                            <span className="block text-[11px] text-slate-400 leading-tight">{day.dayName}</span>
                                        </td>
                                        {COLUMNS.map(col => (
                                            <td key={col.key} className="px-1 py-1.5 border-b border-slate-100">
                                                <input
                                                    type="text"
                                                    value={day[col.key] || ""}
                                                    onChange={(e) => handleChange(day.id, col.key, e.target.value)}
                                                    className="w-full text-sm px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all"
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

                {/* Bottom Save - Mobile Friendly */}
                <div className="sm:hidden sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 text-center">
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