"use client";

import { useState } from "react";
import { db } from "../../firebase";
import { ref, get, set } from "firebase/database";

export default function LoginPage({ onLoginSuccess }) {
    const [mobileInput, setMobileInput] = useState("");
    const [pinInput, setPinInput] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        const cleanMobile = mobileInput.replace(/\D/g, ''); // শুধু সংখ্যা রাখবে

        if (cleanMobile.length < 11 || pinInput.length < 4) {
            alert("সঠিক মোবাইল নাম্বার (১১ ডিজিট) এবং পিন (কমপক্ষে ৪ ডিজিট) দিন।");
            return;
        }

        setLoginLoading(true);
        try {
            // ডাটাবেসে এই মোবাইল নাম্বারে পিন আছে কি না চেক করা হচ্ছে
            const pinSnapshot = await get(ref(db, `users/${cleanMobile}/pin`));

            if (pinSnapshot.exists()) {
                // নাম্বার পাওয়া গেছে, এখন পিন মেটাচ্ছে কি না দেখবে
                const savedPin = pinSnapshot.val();
                if (savedPin === pinInput) {
                    // পিন মিলে গেছে, মূল কম্পোনেন্টকে জানানো হচ্ছে
                    onLoginSuccess(cleanMobile);
                } else {
                    // পিন মেলে নি
                    alert("এই মোবাইল নাম্বারে আগে থেকেই একটি একাউন্ট রয়েছে। আপনি ভুল পিন দিয়েছেন!");
                }
            } else {
                // নাম্বার পাওয়া যায়নি, তাই নতুন একাউন্ট তৈরি করে পিন সেভ করা হচ্ছে
                await set(ref(db, `users/${cleanMobile}`), {
                    pin: pinInput,
                    createdAt: new Date().toISOString()
                });

                // মূল কম্পোনেন্টকে জানানো হচ্ছে
                onLoginSuccess(cleanMobile);
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("নেটওয়ার্কে সমস্যা হচ্ছে, আবার চেষ্টা করুন।");
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-emerald-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md">
                {/* লোগো বা আইকন */}
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <span className="text-3xl">📋</span>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">প্রবেশ করুন</h2>
                <p className="text-sm text-slate-500 text-center mb-8">আপনার মোবাইল নাম্বার ও পিন দিন</p>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">মোবাইল নাম্বার</label>
                        <input
                            type="tel"
                            value={mobileInput}
                            onChange={(e) => setMobileInput(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="w-full px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 transition-all shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">ইউনিক পিন কোড</label>
                        <input
                            type="password"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            placeholder="কমপক্ষে ৪ সংখ্যার পিন"
                            maxLength={10}
                            className="w-full px-4 py-3.5 text-base border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-slate-700 transition-all shadow-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white font-bold py-3.5 rounded-xl transition-all text-base shadow-md shadow-emerald-200 mt-2"
                    >
                        {loginLoading ? "যাচাই হচ্ছে..." : "প্রবেশ করুন"}
                    </button>
                </form>
            </div>
        </div>
    );
}
