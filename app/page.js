"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function Home() {
  useEffect(() => {
    const savedUserId = localStorage.getItem("app_user_uid");
    if (savedUserId) {
      redirect("/dashboard");
    } else {
      redirect("/login");
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}


// import MonthlyForm from "./components/MonthlyForm";

// export default function Home() {
//   return (
//     <main>
//       <MonthlyForm />
//     </main>
//   );
// }


// import MonthlyForm2 from "./components/MonthlyForm2";

// export default function Home() {
//   return (
//     <main>
//       <MonthlyForm2 />
//     </main>
//   );
// }