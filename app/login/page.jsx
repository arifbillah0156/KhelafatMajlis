"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase"; // আপনার firebase ফাইলের পাথ ঠিক করে নেবেন
import { ref, get, set } from "firebase/database";

export default function AuthPage() {
    const router = useRouter();
    const [isRegister, setIsRegister] = useState(false);

    // ফর্ম স্টেট
    const [name, setName] = useState("");
    const [designation, setDesignation] = useState("");
    const [mobileInput, setMobileInput] = useState("");
    const [pinInput, setPinInput] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        const cleanMobile = mobileInput.replace(/\D/g, '');

        if (cleanMobile.length < 11 || pinInput.length < 4) {
            setErrorMsg("সঠিক মোবাইল নাম্বার (১১ ডিজিট) এবং পিন (কমপক্ষে ৪ ডিজিট) দিন।");
            return;
        }

        if (isRegister && (name.trim() === "" || designation.trim() === "")) {
            setErrorMsg("রেজিস্ট্রেশনের সময় নাম এবং পদবী আবশ্যক।");
            return;
        }

        setAuthLoading(true);
        try {
            const userSnapshot = await get(ref(db, `users/${cleanMobile}`));

            if (isRegister) {
                // ------------------- রেজিস্ট্রেশন লজিক -------------------
                if (userSnapshot.exists()) {
                    setErrorMsg("এই মোবাইল নাম্বারে আগে থেকেই একাউন্ট রয়েছে। দয়া করে লগইন করুন।");
                } else {
                    await set(ref(db, `users/${cleanMobile}`), {
                        name: name,
                        designation: designation,
                        pin: pinInput,
                        createdAt: new Date().toISOString()
                    });
                    localStorage.setItem("app_user_uid", cleanMobile);
                    router.push("/dashboard"); // টেবিল পেইজে নিয়ে যাবে
                }
            } else {
                // ------------------- লগইন লজিক -------------------
                if (userSnapshot.exists()) {
                    const savedPin = userSnapshot.val().pin;
                    if (savedPin === pinInput) {
                        localStorage.setItem("app_user_uid", cleanMobile);
                        router.push("/dashboard"); // টেবিল পেইজে নিয়ে যাবে
                    } else {
                        setErrorMsg("আপনি ভুল পিন দিয়েছেন!");
                    }
                } else {
                    setErrorMsg("এই নাম্বারে কোনো একাউন্ট নেই। প্রথমে রেজিস্ট্রেশন করুন।");
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            setErrorMsg("নেটওয়ার্কে সমস্যা হচ্ছে, আবার চেষ্টা করুন।");
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <div className="relative min-h-[100dvh] bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-md bg-white/95 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-2xl shadow-emerald-900/10 border border-white/50">

                {/* ট্যাব বাটন */}
                <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                    <button
                        type="button"
                        onClick={() => { setIsRegister(false); setErrorMsg(""); }}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isRegister ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        লগইন
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsRegister(true); setErrorMsg(""); }}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isRegister ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        রেজিস্ট্রেশন
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* রেজিস্ট্রেশনের সময় এই ফিল্ডগুলো দেখাবে */}
                    {isRegister && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">আপনার নাম</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700" placeholder="পূর্ণ নাম" required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">পদবী</label>
                                <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700" placeholder="যেমন: সভাপতি, সদস্য" required />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">মোবাইল নাম্বার</label>
                        <input type="tel" value={mobileInput} onChange={(e) => setMobileInput(e.target.value)} className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700" placeholder="০১৭XXXXXXXX" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-1">পিন কোড</label>
                        <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} maxLength={10} className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700" placeholder="কমপক্ষে ৪ সংখ্যার পিন" required />
                    </div>

                    {errorMsg && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <button type="submit" disabled={authLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all text-base shadow-lg shadow-emerald-500/30 mt-2">
                        {authLoading ? "প্রসেস হচ্ছে..." : isRegister ? "একাউন্ট তৈরি করুন" : "প্রবেশ করুন"}
                    </button>
                </form>
            </div>
        </div>
    );
}