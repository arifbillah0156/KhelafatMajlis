"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../../firebase";
import { ref, get } from "firebase/database";

const bnNum = (n) => n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
const daysInBn = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
const monthsInBn = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

const COLUMN_GROUPS = [
    {
        groupLabel: "কোরআন অধ্যয়ন",
        subFields: [
            { key: "quranAyat", label: "আয়াত", type: "number" },
            { key: "quranSura", label: "সুরার নাম", type: "text" },
        ],
    },
    {
        groupLabel: "হাদীস অধ্যয়ন",
        subFields: [
            { key: "hadithCount", label: "হাদীস", type: "number" },
            { key: "hadithTopic", label: "বিষয়", type: "text" },
        ],
    },
    {
        groupLabel: "ইসলামী সাহিত্য",
        subFields: [
            { key: "sahityaPage", label: "পৃষ্ঠা", type: "number" },
            { key: "sahityaName", label: "নাম", type: "text" },
        ],
    },
    {
        groupLabel: "জামাতে নামাজ",
        subFields: [{ key: "namaz", label: "ওয়াক্ত", type: "number" }],
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
        subFields: [{ key: "timeDonation", label: "ঘন্টা", type: "number" }],
    },
    {
        groupLabel: "সমাজ সেবা",
        subFields: [{ key: "socialService", label: "বিবরণ", type: "text" }],
    },
    {
        groupLabel: "শরীর চর্চা",
        subFields: [{ key: "physicalExercise", label: "হ্যা/না", type: "select", options: ["", "হ্যা", "না"] }],
    },
    {
        groupLabel: "আত্ম-সমালোচনা",
        subFields: [{ key: "selfCriticism", label: "হ্যা/না", type: "select", options: ["", "হ্যা", "না"] }],
    },
];

const ALL_FIELD_KEYS = COLUMN_GROUPS.flatMap((g) => g.subFields.map((f) => f.key));

const SUMMARY_SUFFIXES = {
    quranAyat: "টি আয়াত",
    hadithCount: "টি হাদীস",
    sahityaPage: "পৃষ্ঠা",
    namaz: "ওয়াক্ত",
    contactCount: "জন",
    dawatCount: "জন",
    timeDonation: "ঘন্টা",
};

function PrintContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState(null);
    const [userName, setUserName] = useState("");
    const [userBranch, setUserBranch] = useState("");
    const [userMobile, setUserMobile] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const month = monthParam ? parseInt(monthParam) : new Date().getMonth();

    useEffect(() => {
        const userId = localStorage.getItem("app_user_uid");
        if (!userId) {
            router.push("/login");
            return;
        }

        const fetchAll = async () => {
            try {
                const [userSnap, dataSnap] = await Promise.all([
                    get(ref(db, `users/${userId}`)),
                    get(ref(db, `monthlyData/${userId}/records/${year}-${month + 1}`)),
                ]);

                if (userSnap.exists()) {
                    const u = userSnap.val();
                    setUserName(u.name || "");
                    setUserBranch(u.branch || "");
                    setUserMobile(u.mobile || "");
                } else {
                    router.push("/login");
                    return;
                }

                if (dataSnap.exists()) {
                    setData(dataSnap.val().days);
                } else {
                    setError("এই মাসের কোনো ডেটা পাওয়া যায়নি।");
                }
            } catch (err) {
                setError("ডেটা লোড করতে সমস্যা হয়েছে।");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [year, month]);

    const calculateSum = (key) => {
        if (!data) return 0;
        return data.reduce((sum, day) => {
            const val = parseFloat(day[key]);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
    };

    // সিলেক্ট ফিল্ডের জন্য গুণতি বের করার ফাংশন
    const calculateSelectCount = (key, targetValue) => {
        if (!data) return 0;
        return data.filter((day) => day[key] === targetValue).length;
    };

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bangla">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bangla">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={() => router.back()} className="text-sm underline text-gray-500">
                        ফিরে যান
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3 bangla">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        ফিরে যান
                    </button>

                    <span className="text-sm font-semibold text-gray-700">
                        {monthsInBn[month]} {bnNum(year)}
                    </span>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        প্রিন্ট করুন
                    </button>
                </div>

                <div className="md:hidden mt-3 text-sm text-red-500 bangla">
                    বি.দ্র: মোবাইল থেকে পিডিএফ ডাউনলোড বা প্রিন্ট দেওয়ার ক্ষেত্রে সেটিং থেকে Orientation = Landscape করে নিন।
                </div>
            </div>

            {/* ===== Printable content ===== */}
            <div className="bangla print:m-0 pt-16 print:pt-0">
                <style>{`
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 0.5in;
                            margin-top: 0.6in;
                        }
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .print-page {
                            page-break-after: always;
                        }
                        .print-page:last-child {
                            page-break-after: avoid;
                        }
                    }

                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 7.5pt;
                        table-layout: auto !important;
                    }
                    .print-table th,
                    .print-table td {
                        border: 1px solid #000;
                        padding: 2px 3px;
                        vertical-align: middle;
                        word-break: break-word;
                        line-height: 1.3;
                    }
                    .print-table thead th {
                        background-color: #fff !important;
                        font-weight: 700;
                        text-align: center;
                    }
                    .print-table .date-col {
                        width: 42px;
                        text-align: center;
                        font-weight: 600;
                    }
                    .print-table .num-col {
                        width: 40px !important; 
                        text-align: center;
                    }
                    .print-table .text-col {
                        width: 60px !important; 
                        text-align: center;
                    }
                    .print-table tbody tr:nth-child(even) td {
                        background-color: #f5f5f5 !important;
                    }
                    .print-table tfoot td,
                    .print-table tfoot th {
                        font-weight: 700;
                        border-top: 2px solid #000;
                        text-align: center;
                    }

                    /* Screen preview styles */
                    @media screen {
                        .print-wrapper {
                            max-width: 297mm;
                            margin: 20px auto 40px;
                            background: white;
                            box-shadow: 0 2px 20px rgba(0,0,0,0.12);
                            padding: 12.7mm; 
                            min-height: 210mm;
                        }
                        .print-table {
                            font-size: 8pt;
                        }
                    }
                `}</style>

                <div className="print-wrapper">

                    {/* ===== আপডেটেড হেডার (ছবি সহ) ===== */}
                    <div style={{ marginBottom: "10px", borderBottom: "2px solid #000", paddingBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "start", justifyContent: "center", gap: "60px" }}>
                            {/* বাম পাশের ছবি */}
                            <img
                                src="/Khelafat_Majlis_logo.jpg"
                                alt="খেলাফত মজলিস লোগো"
                                style={{ height: "65px", width: "65px", objectFit: "contain" }}
                            />

                            {/* মাঝখানে টেক্সট কন্টেন্ট */}
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "18pt", fontWeight: "800", letterSpacing: "0.02em", lineHeight: 1.5 }}>
                                    খেলাফত মজলিস
                                </div>
                                <p style={{ margin: "0", fontSize: "9pt" }}>কেন্দ্রীয় কার্যালয়: ফায়েনাজ টাওয়ার, ফ্ল্যাট-১১/এ, ৩৭/২ পুরানা পল্টন (কালভার্ট রোড), ঢাকা-১০০০। ফোন- ০১৭১১৩৪৪৪৮১২</p>
                                <div style={{ fontSize: "13pt", fontWeight: "700", marginTop: "3px" }}>
                                    ব্যক্তিগত তৎপরতার রিপোর্ট
                                </div>
                                <div style={{ fontSize: "9pt", marginTop: "5px", display: "flex", justifyContent: "center", gap: "24px" }}>
                                    <span>নাম: <strong>{userName}</strong></span>
                                    <span>শাখা: <strong>{userBranch}</strong></span>
                                    <span>মাস: <strong>{monthsInBn[month]} {bnNum(year)}</strong></span>
                                </div>
                            </div>

                            {/* ডান পাশের ছবি */}
                            <img
                                src="/KM_Clock.png"
                                alt="খেলাফত মজলিস লোগো"
                                style={{ height: "85px", width: "85px", objectFit: "contain" }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <table className="print-table">
                        <thead>
                            {/* Row 1: Group headers */}
                            <tr>
                                <th rowSpan={2} className="date-col" style={{ fontSize: "8pt" }}>
                                    তারিখ
                                </th>
                                {COLUMN_GROUPS.map((group) => (
                                    <th
                                        key={group.groupLabel}
                                        colSpan={group.subFields.length}
                                        style={{ fontSize: "8pt", textAlign: "center", borderBottom: "1px solid #000" }}
                                    >
                                        {group.groupLabel}
                                    </th>
                                ))}
                            </tr>
                            {/* Row 2: Sub-field headers */}
                            <tr>
                                {COLUMN_GROUPS.map((group) =>
                                    group.subFields.map((field) => (
                                        <th
                                            key={field.key}
                                            className={field.type === "number" ? "num-col" : "text-col"}
                                            style={{ fontSize: "7pt", textAlign: 'center' }}
                                        >
                                            {field.label}
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {data &&
                                data.map((day, idx) => (
                                    <tr key={day.id ?? idx}>
                                        <td className="date-col" style={{ fontSize: "8pt" }}>
                                            <div style={{ fontWeight: 700 }}>{day.date}</div>
                                            <div style={{ fontSize: "5.5pt", color: "#222" }}>{day.dayName}</div>
                                        </td>
                                        {COLUMN_GROUPS.map((group) =>
                                            group.subFields.map((field) => (
                                                <td
                                                    key={field.key}
                                                    className={field.type === "number" ? "num-col" : "text-col"}
                                                >
                                                    {day[field.key] || ""}
                                                </td>
                                            ))
                                        )}
                                    </tr>
                                ))}
                        </tbody>

                        <tfoot>
                            <tr>
                                <th className="date-col" style={{ fontSize: "8pt" }}>মোট</th>
                                {COLUMN_GROUPS.map((group) => {
                                    const numField = group.subFields.find((f) => f.type === "number");
                                    const selectField = group.subFields.find((f) => f.type === "select");

                                    // যদি ফিল্ড টাইপ সিলেক্ট হয় (হ্যা/না)
                                    if (selectField) {
                                        const yesCount = calculateSelectCount(selectField.key, "হ্যা");
                                        const noCount = calculateSelectCount(selectField.key, "না");
                                        return (
                                            <td
                                                key={group.groupLabel}
                                                colSpan={group.subFields.length}
                                                style={{ textAlign: "center", fontSize: "7.5pt" }}
                                            >
                                                <span>হ্যা: {bnNum(yesCount)}</span>
                                                <span style={{ margin: "0 4px", color: "#666" }}>|</span>
                                                <span>না: {bnNum(noCount)}</span>
                                            </td>
                                        );
                                    }

                                    // সাধারণ নাম্বার বা টেক্সট ফিল্ডের জন্য
                                    return (
                                        <td
                                            key={group.groupLabel}
                                            colSpan={group.subFields.length}
                                            style={{ textAlign: "center", fontSize: "8pt" }}
                                        >
                                            {numField
                                                ? `${bnNum(calculateSum(numField.key))} ${SUMMARY_SUFFIXES[numField.key] || ""}`
                                                : "—"}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer */}
                    <div
                        style={{
                            marginTop: "12px",
                            fontSize: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            borderTop: "1px solid #ccc",
                            paddingTop: "6px",
                            color: "black",
                        }}
                    >
                        <span></span>

                        <div style={{ textAlign: "right", marginTop: "20px" }}>
                            <div>স্বাক্ষর: ___________________________</div>

                            <div
                                style={{
                                    marginTop: "8px",
                                    textAlign: "left",
                                }}
                            >
                                মোবাইল: <strong>{userMobile}</strong>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}


export default function PrintPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bangla"><div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">প্রিন্ট পেজ লোড হচ্ছে...</p></div>}>
            <PrintContent />
        </Suspense>
    );
}