"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { ref, get, remove } from "firebase/database";

// এডমিন পিন 
const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PASS;

const bnNum = (n) =>
    n.toString().replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);

const monthsInBn = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর",
];

export default function AdminPage() {
    const router = useRouter();

    // --- PIN ভেরিফিকেশন ---
    const [isVerified, setIsVerified] = useState(false);
    const [pinInput, setPinInput] = useState("");
    const [pinError, setPinError] = useState("");

    // --- ইউজার তালিকা ---
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    // --- ডিলিট মোডাল ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // --- টোস্ট ---
    const [toast, setToast] = useState(null);

    // আগে ভেরিফাইড আছে কিনা চেক
    useEffect(() => {
        if (localStorage.getItem("admin_verified") === "true") {
            setIsVerified(true);
        }
    }, []);

    // ইউজার ফেচ
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const snapshot = await get(ref(db, "users"));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const userList = Object.entries(data).map(([mobile, info]) => ({
                    mobile,
                    name: info.name || "নাম নেই",
                    branch: info.branch || "শাখা নেই",
                    createdAt: info.createdAt || "",
                }));
                userList.sort((a, b) =>
                    (b.createdAt || "").localeCompare(a.createdAt || "")
                );
                setUsers(userList);
                setFilteredUsers(userList);
            } else {
                setUsers([]);
                setFilteredUsers([]);
            }
        } catch (err) {
            console.error(err);
            setToast({ type: "error", msg: "ইউজার লোড করতে সমস্যা হয়েছে" });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isVerified) fetchUsers();
    }, [isVerified, fetchUsers]);

    // সার্চ ফিল্টার
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredUsers(users);
        } else {
            const q = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    (u) =>
                        u.name.toLowerCase().includes(q) ||
                        u.branch.toLowerCase().includes(q) ||
                        u.mobile.includes(q)
                )
            );
        }
    }, [searchQuery, users]);

    // PIN সাবমিট
    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pinInput === ADMIN_PIN) {
            localStorage.setItem("admin_verified", "true");
            setIsVerified(true);
            setPinError("");
        } else {
            setPinError("ভুল পিন! আবার চেষ্টা করুন।");
            setPinInput("");
        }
    };

    // লগআউট
    const handleLogout = () => {
        localStorage.removeItem("admin_verified");
        setIsVerified(false);
        setPinInput("");
    };

    // ডিলিট কনফার্ম
    const confirmDelete = (user) => {
        setDeleteTarget(user);
        setShowDeleteModal(true);
    };

    // ডিলিট এক্সিকিউট
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeletingId(deleteTarget.mobile);
        try {
            await remove(ref(db, `users/${deleteTarget.mobile}`));
            await remove(ref(db, `monthlyData/${deleteTarget.mobile}`));
            setUsers((prev) =>
                prev.filter((u) => u.mobile !== deleteTarget.mobile)
            );
            setToast({
                type: "success",
                msg: `${deleteTarget.name} সফলভাবে ডিলিট হয়েছে`,
            });
        } catch (err) {
            setToast({ type: "error", msg: "ডিলিট করতে সমস্যা হয়েছে" });
        } finally {
            setDeletingId(null);
            setShowDeleteModal(false);
            setDeleteTarget(null);
            setTimeout(() => setToast(null), 3000);
        }
    };

    // তারিখ ফরম্যাট
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return `${bnNum(d.getDate().toString().padStart(2, "0"))} ${monthsInBn[d.getMonth()]
            } ${bnNum(d.getFullYear())}`;
    };

    // ==========================================
    // PIN ভেরিফিকেশন স্ক্রিন
    // ==========================================
    if (!isVerified) {
        return (
            <div className="min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4 bangla">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-32 -right-32 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative w-full max-w-sm">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/10">
                            <svg
                                className="w-8 h-8 text-emerald-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white">এডমিন প্যানেল</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            প্রবেশ করতে পিন দিন
                        </p>
                    </div>

                    <form
                        onSubmit={handlePinSubmit}
                        className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10"
                    >
                        <input
                            type="password"
                            value={pinInput}
                            onChange={(e) => {
                                setPinInput(e.target.value);
                                setPinError("");
                            }}
                            className="w-full px-4 py-3.5 text-base bg-white/10 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-center tracking-[0.3em]"
                            placeholder="••••"
                            maxLength={10}
                            autoFocus
                        />
                        {pinError && (
                            <p className="text-red-400 text-sm mt-3 text-center">
                                {pinError}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors"
                        >
                            প্রবেশ করুন
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ==========================================
    // মূল এডমিন প্যানেল
    // ==========================================
    return (
        <div className="min-h-screen bg-slate-50 bangla">
            {/* টোস্ট */}
            {toast && (
                <div
                    className={`fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow-lg transition-all ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                >
                    {toast.msg}
                </div>
            )}

            {/* ডিলিট কনফার্মেশন মোডাল */}
            {showDeleteModal && deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowDeleteModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
                                <svg
                                    className="w-7 h-7 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                                ডিলিট করতে চান?
                            </h3>
                            <p className="text-sm text-slate-500 mt-2">
                                <span className="font-semibold text-slate-700">
                                    {deleteTarget.name}
                                </span>{" "}
                                এর সকল তথ্য এবং ডেটা স্থায়ীভাবে মুছে যাবে।
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                বাতিল করুন
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={!!deletingId}
                                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {deletingId && (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                )}
                                হ্যাঁ, ডিলিট করুন
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== হেডার ===== */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-emerald-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-800">
                                    এডমিন প্যানেল
                                </h1>
                                <p className="text-xs text-slate-400">
                                    খেলাফত মজলিস — ঢাকা মহানগরী উত্তর
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchUsers}
                                disabled={loading}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="রিফ্রেশ"
                            >
                                <svg
                                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-medium"
                            >
                                লগআউট
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== কন্টেন্ট ===== */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
                {/* স্ট্যাটস ও সার্চ */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
                            <span className="text-sm text-emerald-600 font-medium">
                                মোট কর্মী
                            </span>
                            <span className="ml-2 text-lg font-bold text-emerald-700">
                                {bnNum(users.length)}
                            </span>
                            <span className="text-sm ml-2 text-emerald-600 font-medium">
                                জন
                            </span>
                        </div>
                        {/* <div className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl">
                            <span className="text-sm text-slate-500 font-medium">
                                দেখাচ্ছে
                            </span>
                            <span className="ml-2 text-lg font-bold text-slate-700">
                                {bnNum(filteredUsers.length)}
                            </span>
                        </div> */}
                    </div>
                    <div className="relative w-full sm:w-72">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 bg-white text-slate-700 placeholder:text-slate-400"
                            placeholder="নাম, শাখা বা নাম্বার দিয়ে খুঁজুন..."
                        />
                    </div>
                </div>

                {/* লোডিং */}
                {loading && users.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    /* ফাঁকা স্টেট */
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                            <svg
                                className="w-8 h-8 text-slate-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                />
                            </svg>
                        </div>
                        <p className="text-slate-400 font-medium">
                            {searchQuery
                                ? "কোনো কর্মী পাওয়া যায়নি"
                                : "এখনো কোনো কর্মী রেজিস্ট্রেশন করেনি"}
                        </p>
                    </div>
                ) : (
                    /* কার্ড গ্রিড */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.mobile}
                                className="relative group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-200 transition-all duration-200 cursor-pointer"
                                onClick={() =>
                                    router.push(`/admin/${user.mobile}`)
                                }
                            >
                                {/* ডিলিট বাটন */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        confirmDelete(user);
                                    }}
                                    disabled={deletingId === user.mobile}
                                    className="absolute top-3 right-3 p-1.5  text-red-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group-hover:opacity-100 z-10"
                                    title="ডিলিট করুন"
                                >
                                    {deletingId === user.mobile ? (
                                        <div className="w-6 h-6 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                                    ) : (
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                            />
                                        </svg>
                                    )}
                                </button>

                                {/* অ্যাভাটার ও তথ্য */}
                                <div className="flex items-start gap-3.5">
                                    {/* <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm shadow-emerald-500/20">
                                        {user.name.charAt(0)}
                                    </div> */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-slate-800 text-base truncate">
                                            {user.name}
                                        </h3>
                                        <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
                                            {user.branch}
                                        </span>
                                    </div>
                                </div>

                                {/* মোবাইল */}
                                <div className="mt-4 flex items-center gap-2 text-slate-500">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium mt-1">
                                        {user.mobile}
                                    </span>
                                </div>

                                {/* তারিখ */}
                                {user.createdAt && (
                                    <p className="mt-2 text-xs text-slate-400">
                                        তৈরি: {formatDate(user.createdAt)}
                                    </p>
                                )}

                                {/* হোভার হিন্ট */}
                                <div className="mt-3 flex items-center gap-1 text-emerald-500 text-xs font-medium  group-hover:opacity-100 transition-opacity">
                                    <span>বিস্তারিত দেখুন</span>
                                    <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                        />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}