import Head from 'next/head';
import LoginPage from "./login/page";


<Head>
  <link rel="icon" href="/favicon.ico" />
  <meta name="theme-color" content="#111827" />
</Head>


export const metadata = {
  title: "Welcome to EduTrack | Student Portal",
  description: "Login to your personalized EduTrack dashboard to view syllabus, exams, and raise issues.",
  keywords: ["student portal", "EduTrack", "login", "exam schedule", "syllabus"],
  robots: "index, follow",
  openGraph: {
    title: "EduTrack Student Portal",
    description: "Access your personalized dashboard for exams, syllabus, and more.",
    url: "https://yourdomain.com/",
    siteName: "EduTrack",
    images: [
      {
        url: "https://yourdomain.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduTrack Student Portal",
    description: "Login to your dashboard and stay on track.",
    images: ["https://yourdomain.com/og-image.png"],
  },
};

export default function Home() {
  return (
   <div>
    <LoginPage/>
   </div>
  );
}
