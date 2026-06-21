"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { ref, get, set } from "firebase/database";

export default function AuthPage() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);

    const [name, setName] = useState("");
    const [branch, setBranch] = useState("");
    const [mobileInput, setMobileInput] = useState("");
    const [pinInput, setPinInput] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const existingUser = localStorage.getItem("app_user_uid");
        if (existingUser) {
            router.replace("/dashboard");
        } else {
            setChecking(false);
        }
    }, [router]);

    if (checking) {
        return (
            <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 flex items-center justify-center bangla">
                <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        const cleanMobile = mobileInput.replace(/\D/g, '');

        if (cleanMobile.length < 11 || pinInput.length < 4) {
            setErrorMsg("সঠিক মোবাইল নাম্বার (১১ ডিজিট) এবং পিন (কমপক্ষে ৪ ডিজিট) দিন।");
            return;
        }

        if (isRegister && (name.trim() === "" || branch.trim() === "")) {
            setErrorMsg("রেজিস্ট্রেশনের সময় কর্মীর নাম এবং শাখা আবশ্যক।");
            return;
        }

        setAuthLoading(true);
        try {
            const userSnapshot = await get(ref(db, `users/${cleanMobile}`));

            if (isRegister) {
                if (userSnapshot.exists()) {
                    setErrorMsg("এই মোবাইল নাম্বারে আগে থেকেই একাউন্ট রয়েছে। দয়া করে লগইন করুন।");
                } else {
                    await set(ref(db, `users/${cleanMobile}`), {
                        name: name,
                        branch: branch,
                        pin: pinInput,
                        createdAt: new Date().toISOString()
                    });
                    localStorage.setItem("app_user_uid", cleanMobile);
                    router.push("/dashboard");
                }
            } else {
                if (userSnapshot.exists()) {
                    const savedPin = userSnapshot.val().pin;
                    if (savedPin === pinInput) {
                        localStorage.setItem("app_user_uid", cleanMobile);
                        router.push("/dashboard");
                    } else {
                        setErrorMsg("আপনি ভুল পিন দিয়েছেন!");
                    }
                } else {
                    setErrorMsg("এই নাম্বারে কোনো একাউন্ট নেই। প্রথমে রেজিস্ট্রেশন করুন।");
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            setErrorMsg("নেটওয়ার্কে সমস্যা হচ্ছে, আবার চেষ্টা করুন।");
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <div className="relative min-h-[100dvh] bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bangla">

            {/* ব্যাকগ্রাউন্ড ডেকোরেশন */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">

                {/* ===== হেডার সেকশন ===== */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg shadow-emerald-500/20 mb-4 p-1.5 border border-emerald-100">
                        <img
                            src="/Khelafat_Majlis_logo.jpg"
                            alt="খেলাফত মজলিস"
                            className="w-full h-full object-contain rounded-lg"
                        />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-800 leading-tight">
                        খেলাফত মজলিস
                    </h1>
                    <p className="text-base sm:text-lg font-semibold text-emerald-600 mt-1">
                        ঢাকা মহানগরী উত্তর
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 bg-emerald-100/80 text-emerald-700 text-sm sm:text-lg font-medium px-4 py-1.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        ব্যক্তিগত তৎপরতার রিপোর্ট
                    </div>
                </div>

                {/* ===== কার্ড সেকশন ===== */}
                <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-2xl shadow-emerald-900/10 border border-white/50">

                    {/* ট্যাব বাটন */}
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-7">
                        <button
                            type="button"
                            onClick={() => { setIsRegister(false); setErrorMsg(""); }}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${!isRegister ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            লগইন
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsRegister(true); setErrorMsg(""); }}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${isRegister ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            রেজিস্ট্রেশন
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* --- রেজিস্ট্রেশন ফিল্ড --- */}
                        {isRegister && (
                            <div className="space-y-4 pb-1">
                                {/* কর্মীর নাম */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 mb-2">
                                        <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                        </span>
                                        কর্মীর নাম
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 placeholder:text-slate-400"
                                        placeholder="আপনার পূর্ণ নাম লিখুন"
                                        required
                                    />
                                </div>

                                {/* শাখা */}
                                <div>
                                    <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 mb-2">
                                        <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                        </span>
                                        শাখা
                                    </label>
                                    <input
                                        type="text"
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                        className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 placeholder:text-slate-400"
                                        placeholder="আপনার শাখার নাম লিখুন"
                                        required
                                    />
                                </div>

                                {/* ডিভাইডার */}
                                <div className="flex items-center gap-3 py-1">
                                    <div className="flex-1 h-px bg-slate-200" />
                                    <span className="text-xs text-slate-400 font-medium">একাউন্ট তথ্য</span>
                                    <div className="flex-1 h-px bg-slate-200" />
                                </div>
                            </div>
                        )}

                        {/* --- মোবাইল নাম্বার --- */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 mb-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                </svg>
                                মোবাইল নাম্বার
                            </label>
                            <input
                                type="tel"
                                value={mobileInput}
                                onChange={(e) => setMobileInput(e.target.value)}
                                className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 placeholder:text-slate-400"
                                placeholder="01XXXXXXXXX"
                                required
                            />
                        </div>

                        {/* --- পিন কোড --- */}
                        <div>
                            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 mb-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                পিন কোড
                            </label>
                            {isRegister && (
                                <p className="text-xs text-slate-400 mb-2 pl-0.5">পরবর্তী লগইনের জন্য কমপক্ষে ৪ সংখ্যার পিন কোড তৈরি করুন</p>
                            )}
                            <input
                                type="password"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                maxLength={10}
                                className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 placeholder:text-slate-400"
                                placeholder="পিন কোড লিখুন"
                                required
                            />
                        </div>

                        {/* --- এরর মেসেজ --- */}
                        {errorMsg && (
                            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl">
                                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                <span className="text-sm text-red-600 leading-relaxed">{errorMsg}</span>
                            </div>
                        )}

                        {/* --- সাবমিট বাটন --- */}
                        <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white font-bold py-3.5 rounded-xl transition-all duration-200 text-base shadow-lg shadow-emerald-500/25 mt-2 flex items-center justify-center gap-2"
                        >
                            {authLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    প্রসেস হচ্ছে...
                                </>
                            ) : isRegister ? (
                                "একাউন্ট তৈরি করুন"
                            ) : (
                                "প্রবেশ করুন"
                            )}
                        </button>
                    </form>
                </div>

                {/* ফুটার */}
                <p className="text-center text-xs text-slate-400 mt-5">
                    © খেলাফত মজলিস — ঢাকা মহানগরী উত্তর
                </p>
            </div>
        </div>
    );
}