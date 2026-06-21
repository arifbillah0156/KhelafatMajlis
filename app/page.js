import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
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