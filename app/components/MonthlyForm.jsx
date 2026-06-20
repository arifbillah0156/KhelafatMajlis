"use client";

import { useState, useEffect } from "react";
import LoginPage from "./LoginPage"; // নতুন তৈরি করা ফাইল
import TablePage from "./TablePage"; // নতুন তৈরি করা ফাইল

export default function MonthlyForm() {
    const [userId, setUserId] = useState(null);
    const [isIdentified, setIsIdentified] = useState(false);

    // পেজ লোড হলে চেক করবে আগে থেকে লগইন আছে কি না
    useEffect(() => {
        const savedUserId = localStorage.getItem("app_user_uid");
        if (savedUserId) {
            setUserId(savedUserId);
            setIsIdentified(true);
        }
    }, []);

    // লগইন সফল হলে কল হবে
    const handleLoginSuccess = (uid) => {
        localStorage.setItem("app_user_uid", uid);
        setUserId(uid);
        setIsIdentified(true);
    };

    // লগআউট করলে কল হবে
    const handleLogout = () => {
        localStorage.removeItem("app_user_uid");
        setUserId(null);
        setIsIdentified(false);
    };

    // ইউজার লগইন করেনি তাহলে লগইন পেজ দেখাবে
    if (!isIdentified) {
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    // ইউজার লগইন করেছে তাহলে টেবিল পেজ দেখাবে এবং userId ও onLogout পাস করবে
    return <TablePage userId={userId} onLogout={handleLogout} />;
}