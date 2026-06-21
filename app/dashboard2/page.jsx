"use client";

import { useState, useEffect, useMemo } from "react";
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

// "মন্তব্য" (comment) is a free-text note, not a daily practice — it's excluded
// from the completion tally so the dot-grid reflects actual activity logged.
const CORE_KEYS = COLUMNS.filter(c => c.key !== "montobyo").map(c => c.key);
const getCompletion = (day) => CORE_KEYS.filter((k) => day[k] && day[k].trim() !== "").length;

// A quiet 8-point star motif — a small nod to the geometric line-work found
// in the org's own visual world — tiled at low opacity behind the header.
function HeaderPattern() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" aria-hidden="true" preserveAspectRatio="none">
            <defs>
                <pattern id="khelafatStar" width="44" height="44" patternUnits="userSpaceOnUse">
                    <polygon points="14,14 30,14 30,30 14,30" fill="none" stroke="white" strokeWidth="1" />
                    <polygon points="22,6 38,22 22,38 6,22" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#khelafatStar)" />
        </svg>
    );
}

// Tally-mark style progress: one dot per daily practice, filled when logged.
// This is the recurring visual thread between the table and the card views.
function DotRow({ day, size = "sm" }) {
    const dim = size === "sm" ? "w-[5px] h-[5px]" : "w-2 h-2";
    return (
        <div className="flex items-center gap-[3px]" aria-hidden="true">
            {CORE_KEYS.map((key) => (
                <span
                    key={key}
                    className={`${dim} rounded-full ${day[key] && day[key].trim() ? "bg-[var(--brass)]" : "bg-slate-200"}`}
                />
            ))}
        </div>
    );
}

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

    const currentYear = new Date().getFullYear();
    const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

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
            const day = {
                id: i,
                date: bnNum(d.toString().padStart(2, '0')),
                dayName: daysInBn[dateObj.getDay()]
            };
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

    const overallCompletion = useMemo(() => {
        if (!formData.length) return 0;
        const totalSlots = formData.length * CORE_KEYS.length;
        const filled = formData.reduce((sum, day) => sum + getCompletion(day), 0);
        return totalSlots ? Math.round((filled / totalSlots) * 100) : 0;
    }, [formData]);

    if (!isClientReady || (loading && formData.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-3" style={{ background: "var(--paper)" }}>
                <div className="w-8 h-8 border-2 border-[var(--ink)] border-t-transparent rounded-full animate-spin" />
                {isClientReady && <p className="text-xs text-slate-400">লোড হচ্ছে...</p>}
            </div>
        );
    }

    if (!userId) return null;

    return (
        <div className="min-h-screen pb-24 md:pb-4 bangla" style={{ background: "var(--paper)", fontFamily: "'Hind Siliguri', sans-serif" }}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
                :root {
                    --ink: #0B4F4A;
                    --ink-light: #146F66;
                    --ink-deep: #08372F;
                    --paper: #FAF7F1;
                    --brass: #B8862F;
                    --brass-light: #E4C896;
                    --rose: #B0392B;
                }
                .font-display { font-family: 'Tiro Bangla', serif; }
            `}</style>

            {toast && (
                <div
                    role="status"
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg"
                    style={{ background: toast.type === "success" ? "var(--ink)" : "var(--rose)" }}
                >
                    {toast.type === "success" ? (
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 3h.01M12 3l9 18H3L12 3z" /></svg>
                    )}
                    {toast.msg}
                </div>
            )}

            {/* হেডলাইন হেডার */}
            <div className="relative overflow-hidden text-center py-5 sm:py-6 shadow-md" style={{ background: "linear-gradient(135deg, var(--ink-deep), var(--ink))" }}>
                <HeaderPattern />
                <h1 className="font-display relative text-lg sm:text-2xl font-bold text-white tracking-wide">খেলাফত মজলিস, ঢাকা মহানগরী উত্তর</h1>
                <p className="relative text-[11px] sm:text-xs mt-1 tracking-[0.2em] uppercase" style={{ color: "var(--brass-light)" }}>মাসিক কার্যক্রম ডায়েরি</p>
            </div>

            {/* সাব হেডার */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2">
                            <div className="flex-1 sm:flex-none">
                                {isEditing ? (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="text-sm font-bold border border-slate-300 rounded-lg px-2 py-1.5 w-full sm:w-auto focus:outline-none focus:border-[var(--brass)] focus:ring-2 focus:ring-[var(--brass)]/20" placeholder="নাম" />
                                        <input type="text" value={tempDesignation} onChange={(e) => setTempDesignation(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-2 py-1.5 w-full sm:w-auto focus:outline-none focus:border-[var(--brass)] focus:ring-2 focus:ring-[var(--brass)]/20" placeholder="পদবী" />
                                        <button onClick={handleProfileUpdate} disabled={profileSaving} className="text-[12px] text-white px-3 py-2 rounded-lg font-semibold disabled:opacity-50" style={{ background: "var(--ink)" }}>
                                            {profileSaving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                                        </button>
                                        <button onClick={() => setIsEditing(false)} className="text-xs text-slate-500 hover:text-slate-700 px-2">বাতিল</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { setTempName(userName); setTempDesignation(userDesignation); setIsEditing(true); }}>
                                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-display text-sm font-bold shrink-0" style={{ background: "var(--ink)" }}>
                                            {userName ? userName.charAt(0) : "?"}
                                        </div>
                                        <div>
                                            <h1 className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-[var(--ink)] transition-colors">{userName}</h1>
                                            <p className="text-[11px] text-slate-500">{userDesignation}</p>
                                        </div>
                                        <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-[var(--brass)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </div>
                                )}
                            </div>
                            <button onClick={handleLogout} className="text-[12px] sm:text-[13px] border px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap" style={{ borderColor: "var(--rose)", color: "var(--rose)" }}>
                                লগআউট
                            </button>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                            <div className="flex items-center gap-2">
                                <h2 className="font-display text-base sm:text-xl font-bold text-slate-800">
                                    {monthsInBn[month]} {bnNum(year)}
                                </h2>
                                <span className="hidden sm:inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "var(--brass-light)", color: "var(--ink-deep)" }}>
                                    অগ্রগতি {bnNum(overallCompletion)}%
                                </span>
                            </div>
                            <select value={month} onChange={(e) => setMonth(+e.target.value)} className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20">
                                {monthsInBn.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select value={year} onChange={(e) => setYear(+e.target.value)} className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--ink)]/20">
                                {yearOptions.map(y => <option key={y} value={y}>{bnNum(y)}</option>)}
                            </select>
                            <button onClick={handleSave} disabled={saving} className="hidden md:flex text-[15px] disabled:opacity-50 text-white px-5 py-2 rounded-lg transition-colors font-medium" style={{ background: "var(--ink)" }}>
                                {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave}>
                {/* ডেস্কটপ টেবিল ভিউ */}
                <div className="hidden md:block overflow-x-auto">
                    <div className="overflow-auto max-h-[78vh]">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-30">
                                <tr style={{ background: "var(--ink-deep)" }} className="text-white">
                                    <th className="text-left px-4 py-3 w-28 font-semibold border-b text-sm" style={{ borderColor: "var(--ink)" }}>
                                        তারিখ
                                    </th>
                                    {COLUMNS.map(col => (
                                        <th key={col.key} className="min-w-[90px] text-left px-3 py-3 font-semibold border-b text-sm" style={{ borderColor: "var(--ink)" }}>
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {formData.map((day, idx) => {
                                    const filled = getCompletion(day);
                                    const accent = filled === 0 ? "#E2E8F0" : filled === CORE_KEYS.length ? "var(--ink)" : "var(--brass)";
                                    return (
                                        <tr key={day.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-[var(--paper)]"} hover:bg-amber-50/40 transition-colors`}>
                                            <td className="px-4 py-2 border-b border-slate-100" style={{ borderLeft: `3px solid ${accent}` }}>
                                                <span className="text-sm font-semibold text-slate-700">{day.date}</span>
                                                <span className="block text-[11px] text-slate-400 leading-tight">{day.dayName}</span>
                                                <div className="mt-1.5"><DotRow day={day} /></div>
                                            </td>
                                            {COLUMNS.map(col => (
                                                <td key={col.key} className="px-1 py-1.5 border-b border-slate-100">
                                                    <input
                                                        type="text"
                                                        value={day[col.key] || ""}
                                                        onChange={(e) => handleChange(day.id, col.key, e.target.value)}
                                                        aria-label={`${day.date} - ${col.label}`}
                                                        className="w-full text-sm px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[var(--brass)] focus:ring-1 focus:ring-[var(--brass)]/30 transition-all"
                                                        placeholder="..."
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* মোবাইল কার্ড ভিউ */}
                <div className="md:hidden px-3 pt-4 space-y-3">
                    {formData.map((day) => {
                        const filled = getCompletion(day);
                        const complete = filled === CORE_KEYS.length;
                        const accent = filled === 0 ? "#E2E8F0" : complete ? "var(--ink)" : "var(--brass)";
                        return (
                            <div key={day.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3.5" style={{ borderLeft: `4px solid ${accent}` }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-base font-bold text-slate-800">{day.date}</span>
                                        <span className="text-xs text-slate-400">{day.dayName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DotRow day={day} size="md" />
                                        {complete ? (
                                            <svg className="w-4 h-4" fill="none" stroke="var(--ink)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        ) : (
                                            <span className="text-[11px] font-semibold text-slate-400">{bnNum(filled)}/{bnNum(CORE_KEYS.length)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {COLUMNS.map(col => (
                                        <div key={col.key} className={col.key === "montobyo" ? "col-span-2" : ""}>
                                            <label className="text-[11px] font-medium text-slate-500 block mb-1">{col.label}</label>
                                            <input
                                                type="text"
                                                value={day[col.key] || ""}
                                                onChange={(e) => handleChange(day.id, col.key, e.target.value)}
                                                aria-label={`${day.date} - ${col.label}`}
                                                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:outline-none focus:border-[var(--brass)] focus:ring-2 focus:ring-[var(--brass)]/20 transition-all"
                                                placeholder="..."
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* মোবাইল সেভ বাটন */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-3 shadow-lg">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full text-sm text-white py-3 rounded-xl transition-colors font-medium disabled:opacity-50"
                        style={{ background: "var(--ink)" }}
                    >
                        {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
                    </button>
                </div>
            </form>
        </div>
    );
}
