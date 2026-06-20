"use client";

import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { ref, get, set } from "firebase/database"; // ✅ Realtime Database imports

// বাংলা সংখ্যা ও দিনের নাম
const bnNum = (n) => n.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
const daysInBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const monthsInBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

// ✅ ছবির কলামগুলো এখানে — চাইলে নতুন কলাম যোগ/বাদ দেওয়া যাবে
const COLUMNS = [
    { key: "namaz", label: "নামায পড়া" },
    { key: "quran", label: "কোরআন পাঠ" },
    { key: "hadith", label: "হাদিস পাঠ" },
    { key: "sahitya", label: "ইসলামি সাহিত্য" },
    { key: "khedmat", label: "পারিবারিক খেদমত" },
    { key: "sangothan", label: "সাংগঠনিক কাজ" },
    { key: "dawat", label: "দাওয়াত দেওয়া" },
    { key: "rogi", label: "রোগী দেখা" },
    { key: "montobyo", label: "মন্তব্য" },
];

export default function MonthlyForm() {
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(5);
    const [formData, setFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // মাসের তারিখগুলো তৈরি করার ফাংশন
    const generateDays = (y, m) => {
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const daysArray = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const dateObj = new Date(y, m, i);
            const dayItem = {
                id: i,
                date: `${bnNum(i.toString().padStart(2, '0'))}/${bnNum((m + 1).toString().padStart(2, '0'))}/${bnNum(y)}`,
                dayName: daysInBn[dateObj.getDay()],
            };
            // প্রতিটি কলামের জন্য খালি ভ্যালু সেট করা হলো
            COLUMNS.forEach(col => { dayItem[col.key] = ""; });
            daysArray.push(dayItem);
        }
        return daysArray;
    };

    // ✅ Realtime Database থেকে ডাটা ফেচ
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const docId = `${year}-${month + 1}`;
                const dbRef = ref(db, `monthlyData/${docId}`); // ✅ Realtime DB path
                const snapshot = await get(dbRef); // ✅ get() instead of getDoc()

                if (snapshot.exists()) {
                    setFormData(snapshot.val().days);
                } else {
                    setFormData(generateDays(year, month));
                }
            } catch (err) {
                console.error("Error fetching data: ", err);
                setError(err.message);
                setFormData(generateDays(year, month));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year, month]);

    // ইনপুট পরিবর্তন হ্যান্ডেল করার ফাংশন
    const handleChange = (id, field, value) => {
        setFormData(prevData =>
            prevData.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // ✅ Realtime Database এ ডাটা সেভ
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const docId = `${year}-${month + 1}`;
            const dbRef = ref(db, `monthlyData/${docId}`); // ✅ Realtime DB path
            await set(dbRef, { // ✅ set() instead of setDoc()
                days: formData,
                savedAt: new Date().toISOString()
            });
            alert("তথ্য সফলভাবে সেভ হয়েছে!");
        } catch (error) {
            console.error("Error saving data: ", error);
            alert("সেভ করতে সমস্যা হয়েছে: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Loading state UI
    if (loading && formData.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <div className="w-full bg-white shadow-md">
                <h2 className="text-2xl font-bold py-4 text-center text-gray-800 border-b border-gray-200">
                    মাসিক তথ্য ফর্ম - {monthsInBn[month]} {bnNum(year)}
                </h2>

                {error && (
                    <div className="mx-4 mt-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 text-sm">
                        ⚠️ Firebase থেকে ডাটা লোড করতে সমস্যা হয়েছে।
                        <br /><span className="text-xs">Error: {error}</span>
                    </div>
                )}

                {/* মাস ও সাল নির্বাচন */}
                <div className="flex gap-4 py-4 justify-center">
                    <select
                        value={month}
                        onChange={(e) => setMonth(parseInt(e.target.value))}
                        className="border p-2 rounded"
                    >
                        {monthsInBn.map((m, idx) => (
                            <option key={idx} value={idx}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="border p-2 rounded"
                    >
                        {[2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{bnNum(y)}</option>
                        ))}
                    </select>
                </div>

                <form onSubmit={handleSave} className="w-full">
                    {/* পুরো স্ক্রিন জুড়ে টেবিল */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 table-fixed">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-2 text-left w-28">তারিখ</th>
                                    {COLUMNS.map(col => (
                                        <th key={col.key} className="border border-gray-300 p-2 text-left">
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {formData.map((dayData) => (
                                    <tr key={dayData.id} className="hover:bg-gray-50">
                                        {/* বাম পাশে তারিখ, তারিখের নিচে দিনের নাম (বার) */}
                                        <td className="border border-gray-300 p-2 align-top">
                                            <div className="font-medium whitespace-nowrap">{dayData.date}</div>
                                            <div className="text-xs text-gray-500">{dayData.dayName}</div>
                                        </td>
                                        {/* ডানে প্রতিটি কলামের জন্য ইনপুট ফিল্ড */}
                                        {COLUMNS.map(col => (
                                            <td key={col.key} className="border border-gray-300 p-1">
                                                <input
                                                    type="text"
                                                    value={dayData[col.key] || ""}
                                                    onChange={(e) => handleChange(dayData.id, col.key, e.target.value)}
                                                    className="w-full p-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="my-6 text-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-8 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "সেভ হচ্ছে..." : "সেভ করুন"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}