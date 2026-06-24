// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { db } from "../../../firebase";
// import { ref, get } from "firebase/database";

// const bnNum = (n) =>
//     n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

// const daysInBn = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
// const monthsInBn = [
//     "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
//     "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
// ];

// const COLUMNS = [
//     { key: "quranStudy", label: "কোরআন অধ্যয়ন\nসুরা, আয়াত" },
//     { key: "hadithStudy", label: "হাদীস অধ্যয়ন\nসংখ্যা, বিষয়" },
//     { key: "islamicSahitya", label: "ইসলামী সাহিত্য পাঠ\nনাম, পৃষ্ঠা" },
//     { key: "namaz", label: "জামাতে নামাজ\nকত ওয়াক্ত" },
//     { key: "contact", label: "যোগাযোগ\nসংখ্যা, নাম" },
//     { key: "dawat", label: "দাওয়াত\nকত জন, নাম" },
//     { key: "timeDonation", label: "সময় দান\nকত ঘন্টা" },
//     { key: "socialService", label: "সমাজ সেবা\nকি ধরনের" },
//     { key: "selfCriticism", label: "আত্ম-সমালোচনা\nহ্যা/না" },
// ];

// export default function AdminUserDetailPage() {
//     const router = useRouter();
//     const params = useParams();
//     const userId = params.id;
//     const printRef = useRef(null);

//     const [userName, setUserName] = useState("");
//     const [userBranch, setUserBranch] = useState("");

//     const [year, setYear] = useState(new Date().getFullYear());
//     const [month, setMonth] = useState(new Date().getMonth());
//     const [tableData, setTableData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [hasData, setHasData] = useState(false);
//     const [profileLoaded, setProfileLoaded] = useState(false);

//     // এডমিন চেক
//     useEffect(() => {
//         if (localStorage.getItem("admin_verified") !== "true") {
//             router.replace("/admin");
//         }
//     }, [router]);

//     // প্রোফাইল ফেচ
//     useEffect(() => {
//         if (!userId) return;
//         const fetchProfile = async () => {
//             try {
//                 const snap = await get(ref(db, `users/${userId}`));
//                 if (snap.exists()) {
//                     const d = snap.val();
//                     setUserName(d.name || "নাম নেই");
//                     setUserBranch(d.branch || "শাখা নেই");
//                 } else {
//                     setUserName("ইউজার পাওয়া যায়নি");
//                     setUserBranch("");
//                 }
//             } catch (err) {
//                 console.error(err);
//             } finally {
//                 setProfileLoaded(true);
//             }
//         };
//         fetchProfile();
//     }, [userId]);

//     // মাসিক ডেটা ফেচ
//     useEffect(() => {
//         if (!userId) return;
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const docId = `${year}-${month + 1}`;
//                 const snapshot = await get(
//                     ref(db, `monthlyData/${userId}/records/${docId}`)
//                 );
//                 if (snapshot.exists()) {
//                     setTableData(snapshot.val().days || []);
//                     setHasData(true);
//                 } else {
//                     const daysInMonth = new Date(year, month + 1, 0).getDate();
//                     const emptyDays = Array.from(
//                         { length: daysInMonth },
//                         (_, i) => {
//                             const d = i + 1;
//                             const dateObj = new Date(year, month, d);
//                             const day = {
//                                 id: i,
//                                 date: bnNum(d.toString().padStart(2, "0")),
//                                 dayName: daysInBn[dateObj.getDay()],
//                             };
//                             COLUMNS.forEach((col) => {
//                                 day[col.key] = "";
//                             });
//                             return day;
//                         }
//                     );
//                     setTableData(emptyDays);
//                     setHasData(false);
//                 }
//             } catch (err) {
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, [year, month, userId]);

//     const handlePrint = () => {
//         window.print();
//     };

//     // লোডিং
//     if (!profileLoaded) {
//         return (
//             <div className="flex items-center justify-center min-h-screen bg-slate-50">
//                 <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-slate-50 bangla">
//             {/* প্রিন্ট স্টাইল */}
//             <style
//                 dangerouslySetInnerHTML={{
//                     __html: `
//                 .print-only { display: none; }

//                 /* স্ক্রিনে টেবিল ফুল উইডথ ও প্রশস্ত */
//                 .screen-table {
//                     width: 100%;
//                     table-layout: fixed;
//                     border-collapse: separate;
//                     border-spacing: 0;
//                 }
//                 .screen-table col.col-date { width: 75px; }
//                 .screen-table col.col-data { width: calc((100% - 75px) / 9); }
//                 .screen-table th,
//                 .screen-table td {
//                     padding: 8px 10px !important;
//                 }

//                 /* মোবাইলে মিনিমাম উইডথ + হরাইজন্টাল/ভার্টিকাল স্ক্রল */
//                 @media (max-width: 1024px) {
//                     .table-scroll-wrapper {
//                         overflow-x: auto;
//                         overflow-y: auto;
//                         max-height: 75vh;
//                         -webkit-overflow-scrolling: touch;
//                         border: 1px solid #e2e8f0;
//                         border-radius: 0.75rem;
//                     }
//                     .screen-table {
//                         min-width: 1024px;
//                     }
//                     .screen-table thead th {
//                         position: sticky;
//                         top: 0;
//                         z-index: 10;
//                     }
//                 }

//                 /* প্রিন্ট সেটিং */
//                 @page {
//                     size: A4;
//                     margin: 0.4in;
//                 }
//                 @media print {
//                     body * { visibility: hidden; }
//                     .print-area, .print-area * { visibility: visible; }
//                     .print-area {
//                         position: absolute;
//                         left: 0;
//                         top: 0;
//                         width: 100%;
//                         background: white;
//                         padding: 0;
//                         box-sizing: border-box;
//                     }
//                     .print-only { display: block !important; }
//                     .no-print { display: none !important; }

//                     .table-scroll-wrapper {
//                         overflow: visible !important;
//                         max-height: none !important;
//                         border: none !important;
//                     }

//                     .print-area table {
//                         width: 100% !important;
//                         min-width: 0 !important;
//                         table-layout: fixed;
//                         border-collapse: collapse;
//                         border: 1px solid #000 !important;
//                         border-radius: 0 !important;
//                         box-shadow: none !important;
//                         font-size: 9pt;
//                     }
//                     .print-area col.col-date { width: 60px; }
//                     .print-area col.col-data { width: calc((100% - 60px) / 9); }

//                     .print-area th,
//                     .print-area td {
//                         border: 1px solid #000 !important;
//                         padding: 4px 6px !important;
//                         text-align: center;
//                         word-wrap: break-word;
//                         overflow-wrap: break-word;
//                         background: transparent !important;
//                         color: #000 !important;
//                         box-shadow: none !important;
//                         position: static !important;
//                     }
//                     .print-area th:first-child,
//                     .print-area td:first-child {
//                         text-align: left;
//                     }
//                     .print-area th {
//                         font-size: 7.5pt;
//                         line-height: 1.35;
//                         vertical-align: middle;
//                         font-weight: 700;
//                     }
//                     .print-area td {
//                         font-size: 9pt;
//                         vertical-align: middle;
//                     }
//                     .print-area .empty-cell {
//                         color: #ccc !important;
//                     }
//                     .print-area .print-only {
//                         color: #000 !important;
//                     }
//                 }
//             `,
//                 }}
//             />

//             {/* ===== হেডার (প্রিন্টে লুকানো) ===== */}
//             <div className="no-print bg-white border-b border-slate-200 shadow-sm">
//                 <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <button
//                                 onClick={() => router.push("/admin")}
//                                 className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
//                             >
//                                 <svg
//                                     className="w-5 h-5"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                     strokeWidth={2}
//                                     stroke="currentColor"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
//                                     />
//                                 </svg>
//                             </button>
//                             <div>
//                                 <h1 className="text-lg sm:text-xl font-bold text-slate-800">
//                                     {userName}
//                                 </h1>
//                                 <p className="text-xs text-slate-400">
//                                     {userBranch} • {userId}
//                                 </p>
//                             </div>
//                         </div>
//                         <button
//                             onClick={handlePrint}
//                             className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
//                         >
//                             <svg
//                                 className="w-4 h-4"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                                 strokeWidth={2}
//                                 stroke="currentColor"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 7.131s0 0 0 0"
//                                 />
//                             </svg>
//                             প্রিন্ট করুন
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* ===== মাস/সাল সিলেক্টর (প্রিন্টে লুকানো) ===== */}
//             <div className="no-print bg-white border-b border-slate-100">
//                 <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
//                     <div className="flex flex-wrap items-center gap-3">
//                         <h2 className="text-base sm:text-lg font-bold text-slate-700">
//                             {monthsInBn[month]} {bnNum(year)}
//                         </h2>
//                         <select
//                             value={month}
//                             onChange={(e) => setMonth(+e.target.value)}
//                             className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
//                         >
//                             {monthsInBn.map((m, i) => (
//                                 <option key={i} value={i}>
//                                     {m}
//                                 </option>
//                             ))}
//                         </select>
//                         <select
//                             value={year}
//                             onChange={(e) => setYear(+e.target.value)}
//                             className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
//                         >
//                             {[2024, 2025, 2026, 2027].map((y) => (
//                                 <option key={y} value={y}>
//                                     {bnNum(y)}
//                                 </option>
//                             ))}
//                         </select>
//                         {!hasData && !loading && (
//                             <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 font-medium">
//                                 এই মাসে কোনো তথ্য জমা হয়নি
//                             </span>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* ===== প্রিন্ট এরিয়া ===== */}
//             <div className="print-area" ref={printRef}>
//                 {/* প্রিন্ট হেডার (শুধু প্রিন্টে দেখাবে) */}
//                 <div className="print-only text-center mb-5">
//                     <h1
//                         style={{
//                             fontSize: "15pt",
//                             fontWeight: "bold",
//                             marginBottom: "1px",
//                         }}
//                     >
//                         খেলাফত মজলিস — ঢাকা মহানগরী উত্তর
//                     </h1>
//                     <p style={{ fontSize: "10pt", marginTop: "1px" }}>
//                         ব্যক্তিগত তৎপরতার রিপোর্ট
//                     </p>
//                     <div
//                         style={{
//                             marginTop: "6px",
//                             fontSize: "9.5pt",
//                             display: "flex",
//                             justifyContent: "center",
//                             flexWrap: "wrap",
//                             gap: "2px 14px",
//                         }}
//                     >
//                         <span>
//                             <strong>নাম:</strong> {userName}
//                         </span>
//                         <span>
//                             <strong>শাখা:</strong> {userBranch}
//                         </span>
//                         <span>
//                             <strong>মোবাইল:</strong> {bnNum(userId)}
//                         </span>
//                         <span>
//                             <strong>মাস:</strong> {monthsInBn[month]}{" "}
//                             {bnNum(year)}
//                         </span>
//                     </div>
//                     <div
//                         style={{
//                             marginTop: "3px",
//                             fontSize: "7.5pt",
//                             color: "#aaa",
//                         }}
//                     >
//                         প্রিন্ট তারিখ:{" "}
//                         {new Date().toLocaleDateString("bn-BD", {
//                             year: "numeric",
//                             month: "long",
//                             day: "numeric",
//                         })}
//                     </div>
//                 </div>

//                 {/* টেবিল */}
//                 <div className="flex justify-center p-3 sm:p-4">
//                     <div className="table-scroll-wrapper overflow-x-auto w-full">
//                         {loading ? (
//                             <div className="flex items-center justify-center py-20">
//                                 <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//                             </div>
//                         ) : (
//                             <table className="screen-table bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
//                                 <colgroup>
//                                     <col className="col-date" />
//                                     {COLUMNS.map((_, i) => (
//                                         <col key={i} className="col-data" />
//                                     ))}
//                                 </colgroup>
//                                 <thead className="bg-slate-700">
//                                     <tr>
//                                         <th className="text-left px-4 py-3 text-white font-semibold text-sm border-b border-slate-600">
//                                             তারিখ
//                                         </th>
//                                         {COLUMNS.map((col) => (
//                                             <th
//                                                 key={col.key}
//                                                 className="text-center px-3 py-3 text-white font-semibold text-xs sm:text-sm whitespace-pre-line border-b border-slate-600"
//                                             >
//                                                 {col.label}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {tableData.map((day, idx) => (
//                                         <tr
//                                             key={day.id}
//                                             className={`${idx % 2 === 0
//                                                 ? "bg-white"
//                                                 : "bg-slate-50"
//                                                 } hover:bg-emerald-50/60 transition-colors`}
//                                         >
//                                             <td className="px-4 py-3 border-b border-slate-200">
//                                                 <span className="text-sm font-semibold text-slate-700">
//                                                     {day.date}
//                                                 </span>
//                                                 <span className="block text-[11px] text-slate-400 mt-0.5">
//                                                     {day.dayName}
//                                                 </span>
//                                             </td>
//                                             {COLUMNS.map((col) => (
//                                                 <td
//                                                     key={col.key}
//                                                     className="px-3 py-3 border-b border-slate-200 text-center"
//                                                 >
//                                                     <span
//                                                         className={`text-sm leading-relaxed ${day[col.key]
//                                                             ? "text-slate-700"
//                                                             : "text-slate-300 empty-cell"
//                                                             }`}
//                                                     >
//                                                         {day[col.key] || "—"}
//                                                     </span>
//                                                 </td>
//                                             ))}
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


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
        <div className="min-h-screen bg-gray-100 bangla">
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
                    text-align: left;
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