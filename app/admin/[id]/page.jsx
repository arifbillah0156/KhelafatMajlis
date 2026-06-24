"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../../firebase";
import { ref, get } from "firebase/database";

const bnNum = (n) =>
    n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

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
        subFields: [
            {
                key: "physicalExercise",
                label: "হ্যা/না",
                type: "select",
                options: ["", "হ্যা", "না"],
            },
        ],
    },
    {
        groupLabel: "আত্ম-সমালোচনা",
        subFields: [
            {
                key: "selfCriticism",
                label: "হ্যা/না",
                type: "select",
                options: ["", "হ্যা", "না"],
            },
        ],
    },
];

const SUMMARY_SUFFIXES = {
    quranAyat: "টি আয়াত",
    hadithCount: "টি হাদীস",
    sahityaPage: "পৃষ্ঠা",
    namaz: "ওয়াক্ত",
    contactCount: "জন",
    dawatCount: "জন",
    timeDonation: "ঘন্টা",
};

export default function AdminUserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id;
    const printRef = useRef(null);

    const [userName, setUserName] = useState("");
    const [userBranch, setUserBranch] = useState("");
    const [userMobile, setUserMobile] = useState("");

    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth());
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [profileLoaded, setProfileLoaded] = useState(false);

    // এডমিন চেক
    useEffect(() => {
        if (localStorage.getItem("admin_verified") !== "true") {
            router.replace("/admin");
        }
    }, [router]);

    // প্রোফাইল ফেচ
    useEffect(() => {
        if (!userId) return;
        const fetchProfile = async () => {
            try {
                const snap = await get(ref(db, `users/${userId}`));
                if (snap.exists()) {
                    const d = snap.val();
                    setUserName(d.name || "নাম নেই");
                    setUserBranch(d.branch || "শাখা নেই");
                    setUserMobile(d.mobile || userId);
                } else {
                    setUserName("ইউজার পাওয়া যায়নি");
                    setUserBranch("");
                    setUserMobile(userId);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setProfileLoaded(true);
            }
        };
        fetchProfile();
    }, [userId]);

    // মাসিক ডেটা ফেচ
    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const docId = `${year}-${month + 1}`;
                const snapshot = await get(
                    ref(db, `monthlyData/${userId}/records/${docId}`)
                );
                if (snapshot.exists()) {
                    setTableData(snapshot.val().days || []);
                    setHasData(true);
                } else {
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const emptyDays = Array.from(
                        { length: daysInMonth },
                        (_, i) => {
                            const d = i + 1;
                            const dateObj = new Date(year, month, d);
                            const day = {
                                id: i,
                                date: bnNum(d.toString().padStart(2, "0")),
                                dayName: daysInBn[dateObj.getDay()],
                            };
                            COLUMN_GROUPS.forEach((group) => {
                                group.subFields.forEach((field) => {
                                    day[field.key] = "";
                                });
                            });
                            return day;
                        }
                    );
                    setTableData(emptyDays);
                    setHasData(false);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year, month, userId]);

    const calculateSum = (key) => {
        return tableData.reduce((sum, day) => {
            const val = parseFloat(day[key]);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
    };

    const calculateSelectCount = (key, targetValue) => {
        return tableData.filter((day) => day[key] === targetValue).length;
    };

    const handlePrint = () => window.print();

    if (!profileLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bangla">
            {/* ===== স্টাইল ===== */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                /* === টেবিল বেস স্টাইল (স্ক্রিন + প্রিন্ট) === */
                .print-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 8pt;
                    table-layout: auto;
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
                    background-color: #e8e8e8;
                    font-weight: 700;
                    text-align: center;
                }
                .print-table .date-col {
                    width: 42px;
                    text-align: center;
                    font-weight: 600;
                }
                .print-table .num-col {
                    width: 40px;
                    text-align: center;
                }
                .print-table .text-col {
                    width: 60px;
                    text-align: center;
                }
                .print-table tbody tr:nth-child(even) td {
                    background-color: #fafafa;
                }
                .print-table tfoot td,
                .print-table tfoot th {
                    font-weight: 700;
                    border-top: 2px solid #000;
                    text-align: center;
                }

                /* === স্ক্রিন প্রিভিউ === */
                @media screen {
                    .print-wrapper {
                        max-width: 297mm;
                        margin: 80px auto 40px;
                        background: white;
                        box-shadow: 0 2px 24px rgba(0,0,0,0.12);
                        padding: 12.7mm;
                        min-height: 210mm;
                        overflow-x: auto;
                    }
                }

                /* === প্রিন্ট সেটিং === */
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
                    .no-print {
                        display: none !important;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                    }
                    .print-wrapper {
                        box-shadow: none !important;
                        padding: 0 !important;
                        max-width: none !important;
                        margin: 0 !important;
                        min-height: auto !important;
                        overflow: visible !important;
                    }
                    .print-table {
                        font-size: 7.5pt !important;
                    }
                    .print-table thead th {
                        background-color: #fff !important;
                        color: #000 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print-table tbody tr:nth-child(even) td {
                        background-color: #f5f5f5 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `,
                }}
            />

            {/* ===== নো-প্রিন্ট কন্ট্রোল বার ===== */}
            <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* বাম পাশ */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push("/admin")}
                                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                                    />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-base sm:text-lg font-bold text-gray-800">
                                    {userName}
                                </h1>
                                <p className="text-xs text-gray-400">
                                    {userBranch} • {userId}
                                </p>
                            </div>
                        </div>

                        {/* ডান পাশ */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <select
                                value={month}
                                onChange={(e) => setMonth(+e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            >
                                {monthsInBn.map((m, i) => (
                                    <option key={i} value={i}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={year}
                                onChange={(e) => setYear(+e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            >
                                {[2024, 2025, 2026, 2027].map((y) => (
                                    <option key={y} value={y}>
                                        {bnNum(y)}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                    />
                                </svg>
                                প্রিন্ট করুন
                            </button>
                        </div>
                    </div>

                    {/* ডাটা না থাকলে সতর্কতা */}
                    {!hasData && !loading && (
                        <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 inline-block font-medium">
                            ⚠ এই মাসে কোনো তথ্য জমা হয়নি
                        </p>
                    )}

                    {/* মোবাইলে ল্যান্ডস্কেপ টিপস */}
                    <div className="md:hidden mt-2 text-xs text-red-500">
                        বি.দ্র: মোবাইল থেকে পিডিএফ ডাউনলোড বা প্রিন্ট দেওয়ার ক্ষেত্রে সেটিং
                        থেকে Orientation = Landscape করে নিন।
                    </div>
                </div>
            </div>

            {/* ===== প্রিন্ট এরিয়া ===== */}
            <div className="print-area" ref={printRef}>
                <div className="print-wrapper">
                    {/* ===== হেডার (লোগো সহ) ===== */}
                    <div
                        style={{
                            marginBottom: "10px",
                            borderBottom: "2px solid #000",
                            paddingBottom: "8px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "start",
                                justifyContent: "center",
                                gap: "60px",
                            }}
                        >
                            {/* বাম লোগো */}
                            <img
                                src="/Khelafat_Majlis_logo.jpg"
                                alt="খেলাফত মজলিস লোগো"
                                style={{
                                    height: "65px",
                                    width: "65px",
                                    objectFit: "contain",
                                }}
                            />

                            {/* মাঝখানে টেক্সট */}
                            <div style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        fontSize: "18pt",
                                        fontWeight: "800",
                                        letterSpacing: "0.02em",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    খেলাফত মজলিস
                                </div>
                                <p style={{ margin: "0", fontSize: "9pt" }}>
                                    কেন্দ্রীয় কার্যালয়: ফায়েনাজ টাওয়ার,
                                    ফ্ল্যাট-১১/এ, ৩৭/২ পুরানা পল্টন (কালভার্ট রোড),
                                    ঢাকা-১০০০। ফোন- ০১৭১১৩৪৪৪৮১২
                                </p>
                                <div
                                    style={{
                                        fontSize: "13pt",
                                        fontWeight: "700",
                                        marginTop: "3px",
                                    }}
                                >
                                    ব্যক্তিগত তৎপরতার রিপোর্ট
                                </div>
                                <div
                                    style={{
                                        fontSize: "9pt",
                                        marginTop: "5px",
                                        display: "flex",
                                        justifyContent: "center",
                                        gap: "24px",
                                    }}
                                >
                                    <span>
                                        নাম: <strong>{userName}</strong>
                                    </span>
                                    <span>
                                        শাখা: <strong>{userBranch}</strong>
                                    </span>
                                    <span>
                                        মাস: <strong>{monthsInBn[month]} {bnNum(year)}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* ডান লোগো */}
                            <img
                                src="/KM_Clock.png"
                                alt="খেলাফত মজলিস"
                                style={{
                                    height: "85px",
                                    width: "85px",
                                    objectFit: "contain",
                                }}
                            />
                        </div>
                    </div>

                    {/* ===== টেবিল ===== */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <table className="print-table">
                            <thead>
                                {/* রো ১: গ্রুপ হেডার */}
                                <tr>
                                    <th
                                        rowSpan={2}
                                        className="date-col"
                                        style={{ fontSize: "8pt" }}
                                    >
                                        তারিখ
                                    </th>
                                    {COLUMN_GROUPS.map((group) => (
                                        <th
                                            key={group.groupLabel}
                                            colSpan={group.subFields.length}
                                            style={{
                                                fontSize: "8pt",
                                                textAlign: "center",
                                                borderBottom: "1px solid #000",
                                            }}
                                        >
                                            {group.groupLabel}
                                        </th>
                                    ))}
                                </tr>
                                {/* রো ২: সাব-ফিল্ড হেডার */}
                                <tr>
                                    {COLUMN_GROUPS.map((group) =>
                                        group.subFields.map((field) => (
                                            <th
                                                key={field.key}
                                                className={
                                                    field.type === "number"
                                                        ? "num-col"
                                                        : "text-col"
                                                }
                                                style={{
                                                    fontSize: "7pt",
                                                    textAlign: "center",
                                                }}
                                            >
                                                {field.label}
                                            </th>
                                        ))
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {tableData.map((day, idx) => (
                                    <tr key={day.id ?? idx}>
                                        <td
                                            className="date-col"
                                            style={{ fontSize: "8pt" }}
                                        >
                                            <div style={{ fontWeight: 700 }}>
                                                {day.date}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "5.5pt",
                                                    color: "#222",
                                                }}
                                            >
                                                {day.dayName}
                                            </div>
                                        </td>
                                        {COLUMN_GROUPS.map((group) =>
                                            group.subFields.map((field) => (
                                                <td
                                                    key={field.key}
                                                    className={
                                                        field.type === "number"
                                                            ? "num-col"
                                                            : "text-col"
                                                    }
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
                                    <th
                                        className="date-col"
                                        style={{ fontSize: "8pt" }}
                                    >
                                        মোট
                                    </th>
                                    {COLUMN_GROUPS.map((group) => {
                                        const numField = group.subFields.find(
                                            (f) => f.type === "number"
                                        );
                                        const selectField = group.subFields.find(
                                            (f) => f.type === "select"
                                        );

                                        // সিলেক্ট ফিল্ড (হ্যা/না)
                                        if (selectField) {
                                            const yesCount = calculateSelectCount(
                                                selectField.key,
                                                "হ্যা"
                                            );
                                            const noCount = calculateSelectCount(
                                                selectField.key,
                                                "না"
                                            );
                                            return (
                                                <td
                                                    key={group.groupLabel}
                                                    colSpan={group.subFields.length}
                                                    style={{
                                                        textAlign: "center",
                                                        fontSize: "7.5pt",
                                                    }}
                                                >
                                                    <span>
                                                        হ্যা: {bnNum(yesCount)}
                                                    </span>
                                                    <span
                                                        style={{
                                                            margin: "0 4px",
                                                            color: "#666",
                                                        }}
                                                    >
                                                        |
                                                    </span>
                                                    <span>
                                                        না: {bnNum(noCount)}
                                                    </span>
                                                </td>
                                            );
                                        }

                                        // নাম্বার / টেক্সট ফিল্ড
                                        return (
                                            <td
                                                key={group.groupLabel}
                                                colSpan={group.subFields.length}
                                                style={{
                                                    textAlign: "center",
                                                    fontSize: "8pt",
                                                }}
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
                    )}

                    {/* ===== ফুটার (স্বাক্ষর) ===== */}
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
                            <div>
                                স্বাক্ষর: ___________________________
                            </div>
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
        </div>
    );
}   