/**
 * UrbanServe — India's Multi-Service Super App
 * ──────────────────────────────────────────────
 * Stack    : React 18 + Tailwind CSS (utility-first)
 * Theme    : Pure White + Forest Green — clean, trustworthy, investor-ready
 * Screens  : Home · Services · Pick & Drop · Manpower · Gig Jobs · Onboarding · Booking
 * Features : AI Match, Escrow Pay, Verification, Ratings, Manpower Selector, Delivery Runner
 *
 * File Structure (all in one component tree):
 *  → DATA LAYER  : categories, workers, gigs, trust features, pricing tiers
 *  → COMPONENTS  : Navbar, Footer, Badge, WorkerCard, CategoryCard, StatBar
 *  → PAGES       : HomePage, ServicesPage, PickDropPage, ManpowerPage,
 *                  GigPage, OnboardingPage, BookingPage
 *  → ROOT        : <App /> — manages global view state + navigation
 */
"use client";
import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// § 1. GLOBAL STYLE INJECTION
//     We inject a <style> block for custom animations & scrollbar
//     since Tailwind base doesn't include these.
// ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: 'Outfit', sans-serif; background: #fff; color: #0f2010; margin: 0; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #f0fdf4; }
    ::-webkit-scrollbar-thumb { background: #16a34a; border-radius: 10px; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .page-enter { animation: fadeUp 0.3s ease forwards; }
    @keyframes livePulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.45; transform: scale(0.8); }
    }
    .live-dot { animation: livePulse 1.8s ease infinite; }
    .card-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .card-lift:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(22,163,74,0.13); }
    .nav-link { position: relative; transition: color 0.15s; }
    .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:#16a34a; transition:width 0.2s; border-radius:2px; }
    .nav-link:hover::after, .nav-link.is-active::after { width:100%; }
    .btn-press:active { transform: scale(0.97); }
    input:focus, select:focus, textarea:focus { outline:none; border-color:#16a34a !important; box-shadow: 0 0 0 3px rgba(22,163,74,0.12); }
    input[type="checkbox"] { accent-color: #16a34a; }
    .grad-text { background: linear-gradient(135deg,#15803d,#4ade80); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────
// § 2. DATA LAYER — Categories, Workers, Jobs, etc.
// ─────────────────────────────────────────────────────────────

/** 8 main service categories, each with 6 sub-services */
const CATEGORIES = [
    {
        id: "home-help", icon: "🏠", label: "Home Help",
        tagline: "Cleaners, Cooks, Nannies & More", count: 3200,
        subs: [
            { name: "House Cleaner", icon: "🧹", from: 299, unit: "visit" },
            { name: "Cook / Chef", icon: "👨‍🍳", from: 399, unit: "day" },
            { name: "Nanny / Baby Care", icon: "🍼", from: 499, unit: "day" },
            { name: "Elder Caretaker", icon: "🧑‍⚕️", from: 449, unit: "day" },
            { name: "Gardener", icon: "🌿", from: 249, unit: "visit" },
            { name: "General Helper", icon: "🙋", from: 199, unit: "task" },
        ],
    },
    {
        id: "pick-drop", icon: "🛵", label: "Pick & Drop",
        tagline: "Groceries, Medicines, Parcels", count: 1800,
        subs: [
            { name: "Grocery Run", icon: "🛒", from: 49, unit: "trip" },
            { name: "Medicine Pickup", icon: "💊", from: 39, unit: "trip" },
            { name: "Parcel Delivery", icon: "📦", from: 59, unit: "trip" },
            { name: "Document Courier", icon: "📄", from: 49, unit: "trip" },
            { name: "Buy From Shop", icon: "🏪", from: 69, unit: "trip" },
            { name: "Tiffin Pickup", icon: "🍱", from: 39, unit: "trip" },
        ],
    },
    {
        id: "repair", icon: "🔧", label: "Repair & Tech",
        tagline: "Mobile, Laptop, Appliance Repair", count: 2100,
        subs: [
            { name: "Mobile Repair", icon: "📱", from: 199, unit: "job" },
            { name: "Laptop / PC Repair", icon: "💻", from: 349, unit: "job" },
            { name: "Appliance Repair", icon: "🔌", from: 299, unit: "job" },
            { name: "AC Service", icon: "❄️", from: 399, unit: "job" },
            { name: "TV Repair", icon: "📺", from: 249, unit: "job" },
            { name: "CCTV / Security", icon: "📷", from: 499, unit: "job" },
        ],
    },
    {
        id: "home-repair", icon: "🏗️", label: "Home Repair",
        tagline: "Plumbers, Electricians, Carpenters", count: 2800,
        subs: [
            { name: "Electrician", icon: "⚡", from: 299, unit: "day" },
            { name: "Plumber", icon: "🚿", from: 349, unit: "day" },
            { name: "Carpenter", icon: "🪵", from: 399, unit: "day" },
            { name: "Painter", icon: "🎨", from: 349, unit: "day" },
            { name: "Mason / Tile Fixer", icon: "🧱", from: 399, unit: "day" },
            { name: "Welder", icon: "🔩", from: 449, unit: "day" },
        ],
    },
    {
        id: "it-services", icon: "💻", label: "IT Services",
        tagline: "Networking, POS, Smart Home Setup", count: 560,
        subs: [
            { name: "Network Setup", icon: "📡", from: 499, unit: "job" },
            { name: "POS Technician", icon: "🖥️", from: 599, unit: "job" },
            { name: "Printer Repair", icon: "🖨️", from: 299, unit: "job" },
            { name: "Smart Home Setup", icon: "🏡", from: 699, unit: "job" },
            { name: "Server / IT Support", icon: "🗄️", from: 799, unit: "day" },
            { name: "CCTV / IP Camera", icon: "🔐", from: 549, unit: "job" },
        ],
    },
    {
        id: "manpower", icon: "👷", label: "Manpower Supply",
        tagline: "Labour Teams for Any Scale", count: 5000,
        subs: [
            { name: "Construction Labour", icon: "🏗️", from: 700, unit: "day" },
            { name: "Factory Worker", icon: "🏭", from: 650, unit: "day" },
            { name: "Warehouse Helper", icon: "📦", from: 600, unit: "day" },
            { name: "Event Staff", icon: "🎪", from: 550, unit: "day" },
            { name: "Loading / Shifting", icon: "🚚", from: 600, unit: "day" },
            { name: "Cleaning Team", icon: "🧽", from: 500, unit: "day" },
        ],
    },
    {
        id: "shop-office", icon: "🏪", label: "Shop & Office",
        tagline: "Cashiers, Sales Staff, Office Boys", count: 1900,
        subs: [
            { name: "Cashier", icon: "💰", from: 550, unit: "day" },
            { name: "Sales Boy / Girl", icon: "🛍️", from: 500, unit: "day" },
            { name: "Shop Helper", icon: "🤝", from: 450, unit: "day" },
            { name: "Office Boy", icon: "🗂️", from: 450, unit: "day" },
            { name: "Receptionist", icon: "🧑‍💼", from: 650, unit: "day" },
            { name: "Data Entry Operator", icon: "⌨️", from: 700, unit: "day" },
        ],
    },
    {
        id: "gig-jobs", icon: "💼", label: "Gig Jobs",
        tagline: "Part-time, Daily Wage, Contract", count: 4200,
        subs: [
            { name: "Part-Time Jobs", icon: "⏰", from: 300, unit: "day" },
            { name: "Daily Wage Jobs", icon: "📅", from: 500, unit: "day" },
            { name: "Contract Jobs", icon: "📝", from: 18000, unit: "mo" },
            { name: "Full-Time Placement", icon: "🏢", from: 12000, unit: "mo" },
            { name: "Freelance Task", icon: "🎯", from: 200, unit: "task" },
            { name: "Internship", icon: "🎓", from: 8000, unit: "mo" },
        ],
    },
];

/** Team size options for manpower booking */
const TEAM_SIZES = [
    { count: 1, label: "1 Worker", badge: "Solo", multiplier: 1, cls: "bg-green-100 text-green-700" },
    { count: 5, label: "5 Workers", badge: "Small Team", multiplier: 4.5, cls: "bg-green-200 text-green-800" },
    { count: 10, label: "10 Workers", badge: "Medium", multiplier: 8.5, cls: "bg-green-300 text-green-900" },
    { count: 20, label: "20 Workers", badge: "Large", multiplier: 16, cls: "bg-green-400 text-white" },
    { count: 50, label: "50 Workers", badge: "Bulk", multiplier: 38, cls: "bg-green-600 text-white" },
    { count: 999, label: "Full Team", badge: "Enterprise", multiplier: null, cls: "bg-green-800 text-white" },
];

/** Work type options for manpower page */
const WORK_TYPES = [
    { id: "construction", icon: "🏗️", label: "Construction", desc: "Civil, masonry, RCC, shuttering" },
    { id: "shifting", icon: "📦", label: "Shifting", desc: "Office & home relocation" },
    { id: "events", icon: "🎪", label: "Events", desc: "Setup, ops, security & cleanup" },
    { id: "factory", icon: "🏭", label: "Factory", desc: "Production, assembly, packing" },
    { id: "warehouse", icon: "🏢", label: "Warehouse", desc: "Inventory, loading, dispatch" },
    { id: "retail", icon: "🛒", label: "Retail / Season", desc: "Festive & seasonal staff surge" },
];

/** Booking engagement type options */
const BOOKING_TYPES = [
    { id: "daily", icon: "📅", label: "Daily Wage", desc: "Pay per day worked" },
    { id: "hourly", icon: "⏱️", label: "Hourly Labour", desc: "Flexible hour billing" },
    { id: "contract", icon: "📝", label: "Contract", desc: "Fixed monthly terms" },
    { id: "team", icon: "👥", label: "Team Project", desc: "Fixed-price project hire" },
];

/** Featured workers seed data */
const WORKERS = [
    { id: 1, name: "Rajan Thakur", role: "Master Electrician", rating: 4.9, jobs: 312, exp: "8 yrs", price: "₹850/day", badge: "Top Rated", verified: true, initials: "RT", cat: "home-repair" },
    { id: 2, name: "Suresh Kumar", role: "Plumber & Pipe Fitter", rating: 4.7, jobs: 198, exp: "6 yrs", price: "₹750/day", badge: "Pro", verified: true, initials: "SK", cat: "home-repair" },
    { id: 3, name: "Amir Khan", role: "CCTV & Security Tech", rating: 4.8, jobs: 245, exp: "5 yrs", price: "₹1,100/day", badge: "Top Rated", verified: true, initials: "AK", cat: "it-services" },
    { id: 4, name: "Priya Sharma", role: "IT Support & Networking", rating: 4.9, jobs: 87, exp: "3 yrs", price: "₹1,400/day", badge: "Rising ⭐", verified: true, initials: "PS", cat: "it-services" },
    { id: 5, name: "Ramesh Verma", role: "AC Mechanic / HVAC", rating: 4.6, jobs: 421, exp: "10 yrs", price: "₹950/day", badge: "Expert", verified: true, initials: "RV", cat: "repair" },
    { id: 6, name: "Deepa Nair", role: "Home Cook & Chef", rating: 4.8, jobs: 134, exp: "4 yrs", price: "₹400/day", badge: "Pro", verified: true, initials: "DN", cat: "home-help" },
    { id: 7, name: "Dev Raj", role: "Construction Supervisor", rating: 4.8, jobs: 156, exp: "12 yrs", price: "₹1,200/day", badge: "Pro", verified: true, initials: "DR", cat: "manpower" },
    { id: 8, name: "Kavita Singh", role: "House Cleaner & Helper", rating: 4.7, jobs: 289, exp: "5 yrs", price: "₹300/visit", badge: "Top Rated", verified: true, initials: "KS", cat: "home-help" },
    { id: 9, name: "Mohan Das", role: "Carpenter & Furniture", rating: 4.6, jobs: 201, exp: "9 yrs", price: "₹600/day", badge: "Pro", verified: true, initials: "MD", cat: "home-repair" },
];

/** Gig job listings */
const GIG_JOBS = [
    { id: 1, title: "IT Support Technician", company: "TechCorp Solutions", type: "Daily Wage", pay: "₹1,200/day", location: "Shimla", urgent: true, cat: "it-services", skills: ["Networking", "Hardware"] },
    { id: 2, title: "Site Supervisor", company: "BuildRight Constructions", type: "Contract", pay: "₹28,000/mo", location: "Delhi", urgent: false, cat: "manpower", skills: ["Civil", "AutoCAD"] },
    { id: 3, title: "Cashier (Mall)", company: "ShopEasy Retail", type: "Hourly", pay: "₹120/hr", location: "Mumbai", urgent: true, cat: "shop-office", skills: ["POS", "Customer Service"] },
    { id: 4, title: "CCTV Installer", company: "SecureView Pvt Ltd", type: "Contract", pay: "₹22,000/mo", location: "Bangalore", urgent: false, cat: "repair", skills: ["CCTV", "Wiring"] },
    { id: 5, title: "Event Labour Team (20 pax)", company: "EventPro India", type: "Team Hire", pay: "₹18,000/event", location: "Chandigarh", urgent: true, cat: "manpower", skills: ["Event Setup", "Loading"] },
    { id: 6, title: "House Cook (Part-Time)", company: "HomeChef Network", type: "Part-Time", pay: "₹400/day", location: "Pune", urgent: false, cat: "home-help", skills: ["Cooking", "Menu Planning"] },
    { id: 7, title: "Network Engineer", company: "CloudLink IT", type: "Contract", pay: "₹45,000/mo", location: "Hyderabad", urgent: true, cat: "it-services", skills: ["Cisco", "Firewall"] },
    { id: 8, title: "Warehouse Helper (5 pax)", company: "QuickShip Logistics", type: "Daily Wage", pay: "₹700/day", location: "Noida", urgent: false, cat: "manpower", skills: ["Inventory", "Forklift"] },
    { id: 9, title: "Data Entry Operator", company: "BizPro Services", type: "Part-Time", pay: "₹600/day", location: "Jaipur", urgent: false, cat: "shop-office", skills: ["MS Excel", "Typing 40 WPM"] },
    { id: 10, title: "Mobile Repair Technician", company: "FixIt Mobile Hub", type: "Full-Time", pay: "₹18,000/mo", location: "Surat", urgent: true, cat: "repair", skills: ["iOS Repair", "Android"] },
];

/** Trust & safety features */
const TRUST = [
    { icon: "🛡️", title: "ID Verified", desc: "Aadhaar, PAN & photo ID checked for every worker" },
    { icon: "🧪", title: "Skill Tested", desc: "Practical trade tests before any worker goes live" },
    { icon: "🔍", title: "Background Check", desc: "Criminal & address verified via govt database" },
    { icon: "⭐", title: "2-Way Ratings", desc: "Transparent reviews with dispute resolution" },
    { icon: "💰", title: "Escrow Payment", desc: "Funds released only after job completion sign-off" },
    { icon: "📍", title: "Live Tracking", desc: "Real-time worker GPS & check-in/check-out logs" },
    { icon: "🏥", title: "₹5L Insurance", desc: "Accident cover on every booked job, zero premium" },
    { icon: "📞", title: "24/7 Support", desc: "Dedicated helpline for workers and clients always" },
];

/** Platform-wide stats */
const STATS = [
    { value: "48,000+", label: "Verified Workers" },
    { value: "1.2M+", label: "Jobs Completed" },
    { value: "98.4%", label: "Satisfaction Rate" },
    { value: "340+", label: "Cities Covered" },
];

/** Transparent pricing tiers */
const PRICING = [
    { icon: "📅", tier: "Daily Wage", range: "₹500 – ₹1,500", best: "Home repair, site work" },
    { icon: "⏱️", tier: "Hourly Labour", range: "₹80 – ₹250/hr", best: "Shops, events, delivery" },
    { icon: "📝", tier: "Contract", range: "₹18,000 – ₹60,000/mo", best: "IT roles, supervisors" },
    { icon: "👥", tier: "Team Manpower", range: "₹12,000 – ₹2,50,000", best: "Events, factories, shifting" },
];

// ─────────────────────────────────────────────────────────────
// § 3. SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────

/** Coloured pill badge — 5 variants */
const Badge = ({ children, variant = "default" }) => {
    const v = {
        default: "bg-green-100 text-green-700 border border-green-200",
        solid: "bg-green-600 text-white",
        outline: "border border-green-500 text-green-700",
        urgent: "bg-red-50 text-red-600 border border-red-200",
        muted: "bg-gray-100 text-gray-500 border border-gray-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${v[variant]}`}>
            {children}
        </span>
    );
};

/** Section heading row with optional right-side action link */
const SectionHeading = ({ title, subtitle, action, onAction }) => (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
            <h2 className="text-2xl font-bold text-green-900">{title}</h2>
            {subtitle && <p className="text-green-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {action && (
            <button onClick={onAction} className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors whitespace-nowrap">
                {action} →
            </button>
        )}
    </div>
);

/** Worker profile card used across Home + Workers page */
const WorkerCard = ({ worker, onBook }) => (
    <div className="card-lift bg-white border border-green-100 rounded-2xl p-5 flex flex-col gap-4">
        {/* Avatar + name + badge */}
        <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 border-2 border-green-300 flex items-center justify-center text-green-800 font-bold text-sm flex-shrink-0">
                {worker.initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-green-900 text-sm">{worker.name}</span>
                    {worker.verified && <span className="text-green-500 text-xs font-bold">✓</span>}
                </div>
                <p className="text-xs text-green-500 mt-0.5">{worker.role}</p>
            </div>
            <Badge variant="default">{worker.badge}</Badge>
        </div>

        {/* Rating / Jobs / Exp stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
            {[["⭐", worker.rating, "Rating"], ["✅", worker.jobs, "Jobs"], ["🕐", worker.exp, "Exp"]].map(([icon, val, lbl]) => (
                <div key={lbl} className="bg-green-50 rounded-xl py-2">
                    <div className="text-xs text-green-300 mb-0.5">{icon}</div>
                    <div className="font-bold text-green-900 text-sm">{val}</div>
                    <div className="text-xs text-green-400">{lbl}</div>
                </div>
            ))}
        </div>

        {/* Price + Book */}
        <div className="flex items-center justify-between">
            <div>
                <span className="text-xs text-green-400">From</span>
                <p className="font-bold text-green-800">{worker.price}</p>
            </div>
            <button onClick={onBook}
                className="btn-press bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                Book Now
            </button>
        </div>
    </div>
);

/** Category summary card used on Home page grid */
const CategoryCard = ({ cat, onClick }) => (
    <div onClick={onClick} className="card-lift bg-white border border-green-100 rounded-2xl p-5 cursor-pointer">
        <div className="flex justify-between items-start mb-3">
            <div className="w-12 h-12 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center text-2xl">
                {cat.icon}
            </div>
            <Badge variant="default">{cat.count.toLocaleString()} workers</Badge>
        </div>
        <h3 className="font-bold text-green-900 text-base mb-1">{cat.label}</h3>
        <p className="text-xs text-green-500 mb-3 leading-relaxed">{cat.tagline}</p>
        {/* Show first 3 sub-services as pills */}
        <div className="flex flex-wrap gap-1.5">
            {cat.subs.slice(0, 3).map(s => (
                <span key={s.name} className="text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-2 py-0.5">{s.name}</span>
            ))}
            <span className="text-xs text-green-500 font-semibold">+{cat.subs.length - 3} more</span>
        </div>
    </div>
);

/** 4-column stats strip */
const StatBar = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(s => (
            <div key={s.label} className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-green-700">{s.value}</div>
                <div className="text-xs text-green-500 mt-1">{s.label}</div>
            </div>
        ))}
    </div>
);

/** Filter tab pill button */
const FilterTab = ({ active, onClick, children }) => (
    <button onClick={onClick}
        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors
      ${active ? "bg-green-600 text-white border-green-600" : "border-green-200 text-green-700 hover:bg-green-50"}`}>
        {children}
    </button>
);

// ─────────────────────────────────────────────────────────────
// § 4. NAVBAR
// ─────────────────────────────────────────────────────────────
const Navbar = ({ active, navigate }) => {
    const [open, setOpen] = useState(false);
    const links = [
        { id: "home", label: "Home" },
        { id: "services", label: "Services" },
        { id: "pick-drop", label: "Pick & Drop" },
        { id: "manpower", label: "Manpower" },
        { id: "gigs", label: "Find Jobs" },
        { id: "workers", label: "Workers" },
    ];
    const go = (id) => { navigate(id); setOpen(false); };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-green-100 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
                {/* Brand */}
                <button onClick={() => go("home")} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black text-sm">U</div>
                    <span className="font-black text-green-900 text-lg tracking-tight">Urban<span className="text-green-600">Serve</span></span>
                </button>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map(l => (
                        <button key={l.id} onClick={() => go(l.id)}
                            className={`nav-link px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${active === l.id ? "text-green-700 bg-green-50 is-active" : "text-green-700 hover:bg-green-50"}`}>
                            {l.label}
                        </button>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-2">
                    <button onClick={() => go("onboarding")}
                        className="btn-press text-sm font-semibold text-green-700 border border-green-300 px-4 py-1.5 rounded-xl hover:bg-green-50 transition-colors">
                        Join as Worker
                    </button>
                    <button className="btn-press text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-xl transition-colors">
                        Post a Job
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-green-700 text-xl">
                    {open ? "✕" : "☰"}
                </button>
            </div>

            {/* Mobile menu dropdown */}
            {open && (
                <div className="md:hidden border-t border-green-100 bg-white px-4 py-3 flex flex-col gap-1">
                    {links.map(l => (
                        <button key={l.id} onClick={() => go(l.id)}
                            className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors
                ${active === l.id ? "bg-green-50 text-green-800" : "text-green-700 hover:bg-green-50"}`}>
                            {l.label}
                        </button>
                    ))}
                    <div className="flex gap-2 mt-2 pt-2 border-t border-green-100">
                        <button onClick={() => go("onboarding")} className="flex-1 text-sm font-semibold text-green-700 border border-green-300 py-2 rounded-xl">Join as Worker</button>
                        <button className="flex-1 text-sm font-semibold text-white bg-green-600 py-2 rounded-xl">Post a Job</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

// ─────────────────────────────────────────────────────────────
// § 5. FOOTER
// ─────────────────────────────────────────────────────────────
const Footer = () => (
    <footer className="bg-green-900 text-green-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                {/* Brand */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center text-green-900 font-black text-sm">U</div>
                        <span className="font-black text-white text-lg">UrbanServe</span>
                    </div>
                    <p className="text-sm text-green-300 leading-relaxed">India's #1 multi-service super app. Connecting verified workers with everyday needs across 340+ cities.</p>
                    <div className="flex gap-2 mt-4">
                        {["📱 App Store", "▶ Play Store"].map(s => (
                            <span key={s} className="text-xs bg-green-800 border border-green-700 rounded-lg px-2 py-1">{s}</span>
                        ))}
                    </div>
                </div>
                {/* Services */}
                <div>
                    <h4 className="font-bold text-white mb-3">Services</h4>
                    {["Home Help", "Pick & Drop", "Repair & Tech", "Home Repair", "IT Services", "Manpower Supply"].map(s => (
                        <div key={s} className="text-sm text-green-300 mb-1.5 hover:text-white cursor-pointer transition-colors">{s}</div>
                    ))}
                </div>
                {/* Company */}
                <div>
                    <h4 className="font-bold text-white mb-3">Company</h4>
                    {["About Us", "Careers", "Investor Relations", "Press Kit", "Blog", "Partner Program"].map(s => (
                        <div key={s} className="text-sm text-green-300 mb-1.5 hover:text-white cursor-pointer transition-colors">{s}</div>
                    ))}
                </div>
                {/* Support */}
                <div>
                    <h4 className="font-bold text-white mb-3">Support</h4>
                    {["Help Centre", "Safety Guide", "Terms of Service", "Privacy Policy", "Refund Policy", "Contact Us"].map(s => (
                        <div key={s} className="text-sm text-green-300 mb-1.5 hover:text-white cursor-pointer transition-colors">{s}</div>
                    ))}
                    <div className="mt-4 p-3 bg-green-800 rounded-xl">
                        <div className="text-xs font-bold text-green-400 mb-1">24/7 Helpline</div>
                        <div className="text-white font-bold">1800-123-4567</div>
                    </div>
                </div>
            </div>
            {/* Bottom bar */}
            <div className="border-t border-green-800 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-sm text-green-400">
                <span>© 2025 UrbanServe Technologies Pvt. Ltd. | DPIIT Recognised Startup</span>
                <span>ISO 27001 Certified · PCI DSS Compliant</span>
            </div>
        </div>
    </footer>
);

// ─────────────────────────────────────────────────────────────
// § 6. PAGE — HOME
// ─────────────────────────────────────────────────────────────
const HomePage = ({ navigate }) => (
    <div className="page-enter">

        {/* ── Hero Section ── */}
        <section className="bg-gradient-to-br from-green-50 via-white to-green-50 border-b border-green-100 py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
                {/* Live indicator badge */}
                <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-1.5 mb-6">
                    <span className="live-dot w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                    <span className="text-xs font-bold text-green-700 tracking-wide">INDIA'S LARGEST LABOUR MARKETPLACE</span>
                </div>

                {/* Main headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-green-900 leading-tight mb-5">
                    Hire Verified Workers.<br />
                    <span className="grad-text">Find Jobs. Build Teams.</span>
                </h1>
                <p className="text-base sm:text-lg text-green-600 max-w-xl mx-auto mb-8 leading-relaxed">
                    From a single house cleaner to a 50-person construction team — book skilled, background-verified workers for every need, on demand.
                </p>

                {/* Hero CTA buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    <button onClick={() => navigate("services")} className="btn-press bg-green-600 hover:bg-green-700 text-white font-bold px-7 py-3 rounded-2xl text-sm transition-colors shadow-md">Hire a Worker →</button>
                    <button onClick={() => navigate("manpower")} className="btn-press bg-white hover:bg-green-50 text-green-700 font-bold px-7 py-3 rounded-2xl text-sm border-2 border-green-300 transition-colors">Book Manpower Team</button>
                    <button onClick={() => navigate("gigs")} className="btn-press bg-green-800 hover:bg-green-900 text-white font-bold px-7 py-3 rounded-2xl text-sm transition-colors">Find a Job</button>
                </div>

                {/* Quick search */}
                <div className="max-w-lg mx-auto flex gap-2">
                    <input placeholder="Search workers, services, or jobs..." className="flex-1 bg-white border-2 border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-900 placeholder-green-300" />
                    <button className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">Search</button>
                </div>
            </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">

            {/* ── Platform Stats ── */}
            <StatBar />

            {/* ── All Categories ── */}
            <section>
                <SectionHeading title="All Service Categories" subtitle="8 major categories · 48 sub-services · 48,000+ verified workers" action="View All" onAction={() => navigate("services")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {CATEGORIES.map(cat => (
                        <CategoryCard key={cat.id} cat={cat} onClick={() => navigate("services")} />
                    ))}
                </div>
            </section>

            {/* ── Pick & Drop Feature Banner ── */}
            <section className="bg-gradient-to-r from-green-700 to-green-900 rounded-3xl p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                        <Badge variant="solid">New Feature</Badge>
                        <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2">🛵 Pick & Drop Runner</h3>
                        <p className="text-green-200 text-sm max-w-md leading-relaxed">
                            Send a nearby runner to buy groceries, pick up medicines, deliver parcels, or get anything from any shop — all within your neighbourhood.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {["Groceries", "Medicines", "Parcels", "Food Pickup", "Documents", "Buy From Shop"].map(t => (
                                <span key={t} className="text-xs bg-green-800 text-green-200 border border-green-700 rounded-lg px-2.5 py-1">{t}</span>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => navigate("pick-drop")} className="btn-press bg-white text-green-800 font-bold px-8 py-3 rounded-2xl text-sm hover:bg-green-50 transition-colors whitespace-nowrap shadow-lg">
                        Send a Runner →
                    </button>
                </div>
            </section>

            {/* ── Featured Workers ── */}
            <section>
                <SectionHeading title="Top Rated Workers" subtitle="Individually verified, skill-tested, and insured" action="Browse All" onAction={() => navigate("workers")} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {WORKERS.slice(0, 6).map(w => (
                        <WorkerCard key={w.id} worker={w} onBook={() => navigate("booking")} />
                    ))}
                </div>
            </section>

            {/* ── AI Matching Banner ── */}
            <section className="border-2 border-green-200 rounded-3xl p-8 bg-green-50">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-5xl">🤖</div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-black text-green-900 mb-2">AI-Powered Smart Matching</h3>
                        <p className="text-sm text-green-600 leading-relaxed max-w-lg">
                            Our AI engine analyses your job requirements, location, budget, and past ratings to instantly match you with the 3 best-fit verified workers — no browsing needed.
                        </p>
                    </div>
                    <button className="btn-press bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-2xl text-sm whitespace-nowrap transition-colors">
                        Try AI Match →
                    </button>
                </div>
            </section>

            {/* ── Trust & Safety ── */}
            <section>
                <SectionHeading title="Built on Trust & Safety" subtitle="Every worker on UrbanServe is verified, tested, and insured" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {TRUST.map(f => (
                        <div key={f.title} className="bg-white border border-green-100 rounded-2xl p-5 card-lift">
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <div className="font-bold text-green-900 text-sm mb-1.5">{f.title}</div>
                            <div className="text-xs text-green-500 leading-relaxed">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Manpower CTA ── */}
            <section className="bg-green-900 rounded-3xl p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left">
                        <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Need a Full Labour Team?</h3>
                        <p className="text-green-300 text-sm max-w-md leading-relaxed">Select from 1 to 50+ workers for construction, events, factory ops, and relocation. Team deployed in under 4 hours.</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {["1 Worker", "5 Workers", "10 Workers", "20 Workers", "50 Workers", "Full Team"].map(n => (
                                <span key={n} className="text-xs bg-green-800 border border-green-700 text-green-200 rounded-lg px-2.5 py-1">{n}</span>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => navigate("manpower")} className="btn-press bg-green-400 hover:bg-green-300 text-green-900 font-bold px-8 py-3 rounded-2xl text-sm whitespace-nowrap transition-colors shadow-lg">
                        Build Your Team →
                    </button>
                </div>
            </section>

            {/* ── Pricing Tiers ── */}
            <section>
                <SectionHeading title="Transparent Pricing" subtitle="No hidden charges. Platform fee of 12–18% on all bookings." />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PRICING.map(p => (
                        <div key={p.tier} className="bg-white border border-green-100 rounded-2xl p-5 card-lift">
                            <div className="text-3xl mb-3">{p.icon}</div>
                            <div className="font-black text-green-600 text-sm mb-1">{p.tier}</div>
                            <div className="text-lg font-bold text-green-900 mb-2">{p.range}</div>
                            <div className="text-xs text-green-400">Best for: {p.best}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Gig Jobs CTA ── */}
            <section className="border-2 border-green-200 bg-green-50 rounded-3xl p-8 sm:p-10 text-center">
                <div className="text-4xl mb-3">💼</div>
                <h3 className="text-2xl font-black text-green-900 mb-2">Looking for Work?</h3>
                <p className="text-green-600 text-sm max-w-md mx-auto mb-6 leading-relaxed">
                    Find part-time, daily wage, hourly, contract, or full-time jobs across IT, construction, shops, offices, and factories.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <button onClick={() => navigate("gigs")} className="btn-press bg-green-600 hover:bg-green-700 text-white font-bold px-7 py-3 rounded-2xl text-sm transition-colors">Browse All Jobs →</button>
                    <button onClick={() => navigate("onboarding")} className="btn-press bg-white hover:bg-green-50 text-green-700 font-bold px-7 py-3 rounded-2xl text-sm border-2 border-green-300 transition-colors">Register as Worker</button>
                </div>
            </section>

        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// § 7. PAGE — SERVICES
// ─────────────────────────────────────────────────────────────
const ServicesPage = ({ navigate }) => {
    const [filter, setFilter] = useState("all");
    const shown = filter === "all" ? CATEGORIES : CATEGORIES.filter(c => c.id === filter);

    return (
        <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <SectionHeading title="All Services" subtitle={`${CATEGORIES.length} categories · 48+ sub-services · 48,000+ verified workers`} />

            {/* Category filter tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>All Categories</FilterTab>
                {CATEGORIES.map(c => (
                    <FilterTab key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.icon} {c.label}</FilterTab>
                ))}
            </div>

            {/* Render each category section */}
            <div className="space-y-12">
                {shown.map(cat => (
                    <div key={cat.id}>
                        {/* Category title bar */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">{cat.icon}</div>
                            <div>
                                <h3 className="font-bold text-green-900 text-lg">{cat.label}</h3>
                                <p className="text-xs text-green-400">{cat.count.toLocaleString()} workers available</p>
                            </div>
                        </div>
                        {/* Sub-service grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {cat.subs.map(sub => (
                                <div key={sub.name} onClick={() => navigate("workers")}
                                    className="card-lift bg-white border border-green-100 rounded-2xl p-4 text-center cursor-pointer">
                                    <div className="text-2xl mb-2">{sub.icon}</div>
                                    <div className="text-xs font-semibold text-green-800 leading-tight mb-1">{sub.name}</div>
                                    <div className="text-xs text-green-400">From ₹{sub.from}/{sub.unit}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// § 8. PAGE — PICK & DROP
//     3-step runner booking flow
// ─────────────────────────────────────────────────────────────
const PickDropPage = () => {
    const [step, setStep] = useState(0);   // 0=type, 1=details, 2=confirm
    const [taskType, setTaskType] = useState(null);

    const tasks = [
        { id: "grocery", icon: "🛒", label: "Grocery Run", desc: "Any supermarket or kirana store", fee: "₹49" },
        { id: "medicine", icon: "💊", label: "Medicine Pickup", desc: "Chemist / pharmacy near you", fee: "₹39" },
        { id: "parcel", icon: "📦", label: "Parcel Delivery", desc: "Send or receive packages locally", fee: "₹59" },
        { id: "document", icon: "📄", label: "Document Courier", desc: "Offices, banks, or courier hubs", fee: "₹49" },
        { id: "shop", icon: "🏪", label: "Buy From Shop", desc: "Send a list — runner buys for you", fee: "₹69" },
        { id: "food", icon: "🍱", label: "Tiffin / Food", desc: "Pick up food from any restaurant", fee: "₹39" },
    ];

    /* Step indicator component */
    const StepBar = () => (
        <div className="flex items-center gap-2 mb-8">
            {["Select Task", "Task Details", "Confirm & Pay"].map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0
            ${step >= i ? "bg-green-600 border-green-600 text-white" : "border-green-200 text-green-400"}`}>{i + 1}</div>
                    <span className={`text-xs font-medium hidden sm:block truncate ${step >= i ? "text-green-700" : "text-green-300"}`}>{s}</span>
                    {i < 2 && <div className={`flex-1 h-0.5 ${step > i ? "bg-green-500" : "bg-green-100"}`} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <SectionHeading title="🛵 Pick & Drop Runner" subtitle="Send a nearby verified runner for any errand in your area" />
            <StepBar />

            {/* ─ Step 0: Choose task type ─ */}
            {step === 0 && (
                <div>
                    <h3 className="font-bold text-green-900 mb-4">What do you need?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                        {tasks.map(t => (
                            <div key={t.id} onClick={() => setTaskType(t.id)}
                                className={`card-lift cursor-pointer rounded-2xl p-5 border-2 text-center transition-all
                  ${taskType === t.id ? "border-green-500 bg-green-50" : "border-green-100 bg-white hover:border-green-300"}`}>
                                <div className="text-3xl mb-2">{t.icon}</div>
                                <div className={`font-semibold text-sm mb-1 ${taskType === t.id ? "text-green-700" : "text-green-900"}`}>{t.label}</div>
                                <div className="text-xs text-green-500 mb-2 leading-snug">{t.desc}</div>
                                <div className="font-bold text-green-700 text-sm">{t.fee} base fee</div>
                            </div>
                        ))}
                    </div>
                    <button disabled={!taskType} onClick={() => setStep(1)}
                        className={`btn-press w-full py-3 rounded-2xl font-bold text-sm transition-colors
              ${taskType ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-100 text-green-400 cursor-not-allowed"}`}>
                        Continue →
                    </button>
                </div>
            )}

            {/* ─ Step 1: Task details form ─ */}
            {step === 1 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-green-900 mb-4">Task Details</h3>
                    {[
                        ["Your Location / Pickup Address", "text", "Enter your full address"],
                        ["Shop / Destination Name (optional)", "text", "e.g. Big Bazaar, Apollo Pharmacy"],
                        ["Estimated Item Budget (₹)", "number", "e.g. 500"],
                    ].map(([lbl, type, ph]) => (
                        <div key={lbl}>
                            <label className="text-xs font-semibold text-green-600 block mb-1">{lbl}</label>
                            <input type={type} placeholder={ph} className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900 placeholder-green-300" />
                        </div>
                    ))}
                    <div>
                        <label className="text-xs font-semibold text-green-600 block mb-1">Item List / Instructions</label>
                        <textarea rows={3} placeholder="e.g. 2kg tomatoes, 1L milk, bread..." className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900 placeholder-green-300 resize-none" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl border-2 border-green-200 text-green-700 font-semibold text-sm hover:bg-green-50">← Back</button>
                        <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors">Continue →</button>
                    </div>
                </div>
            )}

            {/* ─ Step 2: Confirm & pay ─ */}
            {step === 2 && (
                <div>
                    <h3 className="font-bold text-green-900 mb-4">Confirm & Pay</h3>
                    {/* Assigned runner preview */}
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🛵</div>
                        <div className="flex-1">
                            <div className="font-bold text-green-900 text-sm">Runner: Vikram S.</div>
                            <div className="text-xs text-green-500 mt-0.5">4.8 ⭐ · 1,240 deliveries · 0.8 km away</div>
                        </div>
                        <Badge variant="default">ETA 8 min</Badge>
                    </div>
                    {/* Price breakdown */}
                    <div className="bg-white border border-green-100 rounded-2xl p-5 mb-4">
                        <h4 className="font-bold text-green-900 text-sm mb-3">Price Breakdown</h4>
                        {[["Runner Base Fee", "₹49"], ["Distance Charge", "₹12"], ["Platform Fee (10%)", "₹6"], ["GST (18%)", "₹12"]].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm py-1.5 border-b border-green-50">
                                <span className="text-green-500">{k}</span><span className="font-medium text-green-900">{v}</span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold pt-3">
                            <span className="text-green-900">Total</span><span className="text-green-700 text-base">₹79</span>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex gap-2 text-xs text-green-600">
                        <span>🔒</span><span>Payment held in escrow — released to runner only after you confirm delivery.</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl border-2 border-green-200 text-green-700 font-semibold text-sm">← Back</button>
                        <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors">Confirm & Pay ✓</button>
                    </div>
                </div>
            )}

            {/* How it works section */}
            <div className="mt-12">
                <h3 className="font-bold text-green-900 mb-5">How Pick & Drop Works</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[["1️⃣", "Choose Task", "Select what you need done"], ["2️⃣", "Add Details", "Items, address & instructions"], ["3️⃣", "Runner Assigned", "Nearby verified runner accepts"], ["4️⃣", "Delivered!", "Confirm & release payment"]].map(([i, t, d]) => (
                        <div key={t} className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                            <div className="text-2xl mb-2">{i}</div>
                            <div className="font-bold text-green-900 text-sm mb-1">{t}</div>
                            <div className="text-xs text-green-500 leading-snug">{d}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// § 9. PAGE — MANPOWER
//     Work type → Team size → Engagement → Live cost summary
// ─────────────────────────────────────────────────────────────
const ManpowerPage = () => {
    const [workType, setWorkType] = useState(null);
    const [teamSize, setTeamSize] = useState(null);
    const [engageType, setEngageType] = useState("daily");

    /* Live cost estimator */
    const cost = () => {
        if (!teamSize || teamSize.count === 999) return "Custom Quote";
        const rate = engageType === "hourly" ? 120 : engageType === "contract" ? 25000 : 750;
        const total = Math.round(rate * teamSize.multiplier);
        const sfx = engageType === "hourly" ? "/hr" : engageType === "contract" ? "/mo" : "/day";
        return `₹${total.toLocaleString()}${sfx}`;
    };

    /* Shared selection card style */
    const selCard = (active) =>
        `cursor-pointer rounded-2xl border-2 text-center transition-all card-lift p-4
    ${active ? "border-green-500 bg-green-50" : "border-green-100 bg-white hover:border-green-300"}`;

    return (
        <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <SectionHeading title="👷 Full Manpower Supply" subtitle="Deploy labour teams of any size to any location across India" />

            {/* ─ Step 1: Work Type ─ */}
            <div className="mb-10">
                <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    Select Work Type
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {WORK_TYPES.map(wt => (
                        <div key={wt.id} onClick={() => setWorkType(wt.id)} className={selCard(workType === wt.id)}>
                            <div className="text-2xl mb-2">{wt.icon}</div>
                            <div className={`font-semibold text-sm mb-1 ${workType === wt.id ? "text-green-700" : "text-green-900"}`}>{wt.label}</div>
                            <div className="text-xs text-green-400 leading-snug">{wt.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─ Step 2: Team Size ─ */}
            <div className="mb-10">
                <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    Select Team Size
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {TEAM_SIZES.map(ts => (
                        <div key={ts.count} onClick={() => setTeamSize(ts)} className={selCard(teamSize?.count === ts.count)}>
                            {/* Large count number */}
                            <div className={`font-black text-2xl mb-1 ${teamSize?.count === ts.count ? "text-green-700" : "text-green-900"}`}>
                                {ts.count === 999 ? "∞" : ts.count}
                            </div>
                            <div className="text-xs text-green-500 mb-2">{ts.count === 999 ? "Workers" : `Worker${ts.count > 1 ? "s" : ""}`}</div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ts.cls}`}>{ts.badge}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─ Step 3: Engagement Type ─ */}
            <div className="mb-10">
                <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    Engagement Type
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {BOOKING_TYPES.map(bt => (
                        <div key={bt.id} onClick={() => setEngageType(bt.id)} className={selCard(engageType === bt.id)}>
                            <div className="text-2xl mb-2">{bt.icon}</div>
                            <div className={`font-semibold text-sm mb-1 ${engageType === bt.id ? "text-green-700" : "text-green-900"}`}>{bt.label}</div>
                            <div className="text-xs text-green-400">{bt.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─ Live Booking Summary (shown when selections made) ─ */}
            {(workType || teamSize) && (
                <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-3xl p-6 sm:p-8 text-white mb-10">
                    <h3 className="font-bold text-lg mb-5">📋 Booking Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {[
                            ["Work Type", workType ? WORK_TYPES.find(w => w.id === workType)?.label : "—"],
                            ["Team Size", teamSize ? (teamSize.count === 999 ? "Full Team" : `${teamSize.count} Workers`) : "—"],
                            ["Engagement", BOOKING_TYPES.find(b => b.id === engageType)?.label ?? "—"],
                            ["Est. Cost", cost()],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <div className="text-xs text-green-300 mb-1">{k}</div>
                                <div className="font-bold text-lg">{v}</div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button className="btn-press flex-1 bg-green-400 hover:bg-green-300 text-green-900 font-bold py-3 rounded-2xl text-sm transition-colors">
                            Request Team → Deploy in &lt; 4 Hours
                        </button>
                        <button className="btn-press sm:w-auto bg-green-800 hover:bg-green-700 text-green-100 font-semibold py-3 px-6 rounded-2xl text-sm transition-colors border border-green-600">
                            Get Custom Quote
                        </button>
                    </div>
                </div>
            )}

            {/* Popular use cases grid */}
            <div>
                <h3 className="font-bold text-green-900 mb-5">Popular Use Cases</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { title: "Wedding Event — 50 Staff", size: "50", desc: "Setup crew, waiters, security, cleanup team", time: "1-day deployment", price: "₹45,000" },
                        { title: "Office Relocation — 10", size: "10", desc: "Packing, loading, transport & unpacking", time: "Same-day service", price: "₹12,000" },
                        { title: "Factory Operations — 20/day", size: "20", desc: "Production line, inventory, assembly", time: "Recurring daily", price: "₹16,000/day" },
                        { title: "Construction — Full Team", size: "50+", desc: "Civil, masonry, rod bending, shuttering", time: "Contract basis", price: "Custom Quote" },
                        { title: "Warehouse — 5 Workers", size: "5", desc: "Loading, sorting, barcode scanning", time: "Flexible shifts", price: "₹4,000/day" },
                        { title: "Retail Season — 15 Staff", size: "15", desc: "Cashiers, sales staff, floor helpers", time: "Per season/event", price: "₹18,000" },
                    ].map(uc => (
                        <div key={uc.title} className="card-lift bg-white border border-green-100 rounded-2xl p-5">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-green-900 text-sm leading-snug">{uc.title}</div>
                                <div className="font-black text-green-700 text-sm ml-2 flex-shrink-0">{uc.price}</div>
                            </div>
                            <p className="text-xs text-green-500 mb-3 leading-relaxed">{uc.desc}</p>
                            <div className="flex justify-between text-xs">
                                <span className="text-green-400">⏱ {uc.time}</span>
                                <span className="text-green-500 font-medium">👷 {uc.size} workers</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// § 10. PAGE — GIG JOBS
// ─────────────────────────────────────────────────────────────
const GigJobsPage = ({ navigate }) => {
    const [catFilter, setCatFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const jobTypes = ["all", "daily wage", "hourly", "contract", "part-time", "full-time", "team hire"];

    /* Apply both filters */
    const shown = GIG_JOBS
        .filter(j => catFilter === "all" || j.cat === catFilter)
        .filter(j => typeFilter === "all" || j.type.toLowerCase().includes(typeFilter));

    return (
        <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <SectionHeading title="💼 Gig Job Marketplace" subtitle="Daily wage, hourly, part-time, contract & full-time opportunities" />

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-3">
                <FilterTab active={catFilter === "all"} onClick={() => setCatFilter("all")}>All Categories</FilterTab>
                {CATEGORIES.map(c => (
                    <FilterTab key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>{c.icon} {c.label}</FilterTab>
                ))}
            </div>

            {/* Job type filter */}
            <div className="flex flex-wrap gap-2 mb-8">
                {jobTypes.map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)}
                        className={`text-xs font-medium px-3 py-1 rounded-full border capitalize transition-colors
              ${typeFilter === t ? "bg-green-100 text-green-800 border-green-300" : "border-gray-200 text-gray-400 hover:bg-gray-50"}`}>
                        {t === "all" ? "All Types" : t}
                    </button>
                ))}
            </div>

            {/* Job cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
                {shown.length === 0 && (
                    <div className="col-span-2 text-center py-16 text-green-300">
                        <div className="text-4xl mb-3">🔍</div>
                        <div className="font-semibold text-green-600">No jobs match this filter.</div>
                    </div>
                )}
                {shown.map(job => {
                    const cat = CATEGORIES.find(c => c.id === job.cat);
                    return (
                        <div key={job.id} className="card-lift bg-white border border-green-100 rounded-2xl p-5">
                            {/* Top: badges + pay */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {job.urgent && <Badge variant="urgent">🔴 Urgent</Badge>}
                                    <Badge variant="outline">{cat?.icon} {cat?.label}</Badge>
                                    <Badge variant="muted">{job.type}</Badge>
                                </div>
                                <div className="font-black text-green-700 text-base ml-2 flex-shrink-0">{job.pay}</div>
                            </div>
                            {/* Title + company */}
                            <h3 className="font-bold text-green-900 text-base mb-0.5">{job.title}</h3>
                            <p className="text-sm text-green-400 mb-3">{job.company}</p>
                            {/* Skills + location + apply */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap gap-1.5">
                                    {job.skills.map(s => (
                                        <span key={s} className="text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-2 py-0.5">{s}</span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-green-400">📍 {job.location}</span>
                                    <button className="btn-press text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-xl transition-colors">Apply →</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Worker CTA */}
            <div className="bg-green-900 rounded-3xl p-8 text-center">
                <div className="text-3xl mb-3">🙌</div>
                <h3 className="text-xl font-black text-white mb-2">Are You a Skilled Worker?</h3>
                <p className="text-green-300 text-sm max-w-md mx-auto mb-5 leading-relaxed">Join 48,000+ verified workers earning on UrbanServe. Daily payouts, job guarantees, and accident insurance on every booking.</p>
                <button onClick={() => navigate("onboarding")} className="btn-press bg-green-400 hover:bg-green-300 text-green-900 font-bold px-8 py-3 rounded-2xl text-sm transition-colors">
                    Join as a Worker — Free →
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// § 11. PAGE — WORKERS
// ─────────────────────────────────────────────────────────────
const WorkersPage = ({ navigate }) => {
    const [filter, setFilter] = useState("all");
    const shown = filter === "all" ? WORKERS : WORKERS.filter(w => w.cat === filter);

    return (
        <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <SectionHeading title="Verified Workers" subtitle="All workers are ID-verified, skill-tested, and insured" />

            {/* Filter row */}
            <div className="flex flex-wrap gap-2 mb-8">
                <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>All Workers</FilterTab>
                {CATEGORIES.map(c => (
                    <FilterTab key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.icon} {c.label}</FilterTab>
                ))}
            </div>

            {/* Worker grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shown.map(w => (
                    <WorkerCard key={w.id} worker={w} onBook={() => navigate("booking")} />
                ))}
                {shown.length === 0 && (
                    <div className="col-span-3 text-center py-16 text-green-300">
                        <div className="text-4xl mb-3">👷</div>
                        <div className="font-semibold text-green-500">No workers in this category yet.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// § 12. PAGE — BOOKING
//     3-step: Booking Type → Schedule → Confirm/Escrow Pay
// ─────────────────────────────────────────────────────────────
const BookingPage = ({ navigate }) => {
    const [step, setStep] = useState(0);
    const [bookingType, setBookingType] = useState("daily");
    const worker = WORKERS[0]; // demo worker

    /* Reusable step progress bar */
    const StepBar = () => (
        <div className="flex items-center gap-2 mb-8">
            {["Booking Type", "Schedule", "Confirm & Pay"].map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0
            ${step >= i ? "bg-green-600 border-green-600 text-white" : "border-green-200 text-green-400"}`}>{i + 1}</div>
                    <span className={`text-xs font-medium hidden sm:block truncate ${step >= i ? "text-green-700" : "text-green-300"}`}>{s}</span>
                    {i < 2 && <div className={`flex-1 h-0.5 ${step > i ? "bg-green-500" : "bg-green-100"}`} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 py-10">
            <button onClick={() => navigate("workers")} className="text-sm text-green-500 hover:text-green-700 mb-6 flex items-center gap-1 font-medium">
                ← Back to Workers
            </button>

            {/* Selected worker summary */}
            <div className="bg-white border border-green-100 rounded-2xl p-5 mb-6">
                <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 bg-green-100 border-2 border-green-300 rounded-2xl flex items-center justify-center text-green-800 font-black text-lg flex-shrink-0">
                        {worker.initials}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-green-900">{worker.name}</span>
                            <span className="text-green-500 text-xs font-bold">✓ Verified</span>
                            <Badge variant="default">{worker.badge}</Badge>
                        </div>
                        <p className="text-sm text-green-500 mb-2">{worker.role}</p>
                        <div className="flex gap-4 text-xs text-green-400">
                            <span>⭐ {worker.rating}</span>
                            <span>✅ {worker.jobs} jobs</span>
                            <span>🕐 {worker.exp}</span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="font-black text-green-700 text-lg">{worker.price}</div>
                        <div className="text-xs text-green-400">Starting rate</div>
                    </div>
                </div>
            </div>

            <StepBar />

            {/* ─ Step 0: Booking type ─ */}
            {step === 0 && (
                <div className="bg-white border border-green-100 rounded-2xl p-6">
                    <h3 className="font-bold text-green-900 mb-5">Select Booking Type</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {BOOKING_TYPES.map(bt => (
                            <div key={bt.id} onClick={() => setBookingType(bt.id)}
                                className={`cursor-pointer rounded-2xl p-4 border-2 text-center transition-all
                  ${bookingType === bt.id ? "border-green-500 bg-green-50" : "border-green-100 hover:border-green-300"}`}>
                                <div className="text-2xl mb-2">{bt.icon}</div>
                                <div className={`font-semibold text-sm mb-1 ${bookingType === bt.id ? "text-green-700" : "text-green-900"}`}>{bt.label}</div>
                                <div className="text-xs text-green-400">{bt.desc}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setStep(1)} className="btn-press w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl text-sm transition-colors">Continue →</button>
                </div>
            )}

            {/* ─ Step 1: Schedule form ─ */}
            {step === 1 && (
                <div className="bg-white border border-green-100 rounded-2xl p-6">
                    <h3 className="font-bold text-green-900 mb-5">Schedule & Location</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {[["Start Date", "date", ""], ["Start Time", "time", ""], ["Duration", "text", "e.g. 1 day, 3 hrs"], ["Location", "text", "Full address"], ["Special Notes", "text", "Any instructions?"], ["No. of Workers", "number", "1"]].map(([lbl, type, ph]) => (
                            <div key={lbl}>
                                <label className="text-xs font-semibold text-green-600 block mb-1">{lbl}</label>
                                <input type={type} placeholder={ph} className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900 placeholder-green-300" />
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl border-2 border-green-200 text-green-700 font-semibold text-sm hover:bg-green-50">← Back</button>
                        <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors">Continue →</button>
                    </div>
                </div>
            )}

            {/* ─ Step 2: Confirm & escrow pay ─ */}
            {step === 2 && (
                <div className="bg-white border border-green-100 rounded-2xl p-6">
                    <h3 className="font-bold text-green-900 mb-5">Confirm & Pay (Escrow)</h3>
                    {/* Cost table */}
                    <div className="border border-green-100 rounded-2xl p-4 mb-4">
                        {[["Worker Rate", worker.price], ["Platform Fee (15%)", "₹128"], ["GST (18%)", "₹153"], ["Accident Insurance", "₹5L (Included)"]].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm py-1.5 border-b border-green-50">
                                <span className="text-green-500">{k}</span><span className="font-medium text-green-900">{v}</span>
                            </div>
                        ))}
                        <div className="flex justify-between font-bold pt-3">
                            <span className="text-green-900">Total</span><span className="text-green-700 text-base">₹1,131/day</span>
                        </div>
                    </div>
                    {/* Escrow note */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex gap-2 text-xs text-green-600">
                        <span>🔒</span><span>Payment held in secure escrow. Released to worker only after you confirm job completion.</span>
                    </div>
                    {/* Payment method */}
                    <div className="mb-5">
                        <label className="text-xs font-semibold text-green-600 block mb-2">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                            {["UPI 💳", "Card 🏦", "Cash 💵"].map(m => (
                                <div key={m} className="border-2 border-green-200 rounded-xl py-2 text-center text-sm font-medium text-green-700 hover:border-green-400 cursor-pointer transition-colors">{m}</div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl border-2 border-green-200 text-green-700 font-semibold text-sm hover:bg-green-50">← Back</button>
                        <button onClick={() => setStep(0)} className="btn-press flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors">Confirm & Pay ✓</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// § 13. PAGE — WORKER ONBOARDING
//     4-step verification + registration form
// ─────────────────────────────────────────────────────────────
const OnboardingPage = () => (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-green-900 mb-2">Join UrbanServe as a Worker</h2>
            <p className="text-green-500 text-sm max-w-md mx-auto">Get verified, start earning, and unlock daily payouts, insurance, and job guarantees. Verification in under 48 hours.</p>
        </div>

        {/* 4 verification steps timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {[
                { step: "01", icon: "📄", title: "Register & Submit ID", desc: "Aadhaar, PAN upload + selfie. Takes 5 minutes." },
                { step: "02", icon: "🧪", title: "Skill Assessment", desc: "Online test or short video demo of your trade." },
                { step: "03", icon: "🔍", title: "Background Verification", desc: "Address & criminal record check via govt APIs." },
                { step: "04", icon: "🚀", title: "Go Live & Earn", desc: "Profile live in 24–48 hrs. Start receiving jobs." },
            ].map((s, i) => (
                <div key={s.step} className="text-center bg-white border border-green-100 rounded-2xl p-5 card-lift relative">
                    {/* Step connector line (desktop) */}
                    {i < 3 && <div className="hidden sm:block absolute top-5 left-3/4 w-1/2 h-0.5 bg-green-100 z-0" />}
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-xl mx-auto mb-3 relative z-10">{s.icon}</div>
                    <div className="font-black text-green-100 text-3xl mb-1">{s.step}</div>
                    <div className="font-bold text-green-900 text-sm mb-1">{s.title}</div>
                    <div className="text-xs text-green-500 leading-snug">{s.desc}</div>
                </div>
            ))}
        </div>

        {/* Registration form — 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Personal Details */}
            <div className="bg-white border border-green-100 rounded-2xl p-6">
                <h3 className="font-bold text-green-900 mb-5">Personal Details</h3>
                <div className="space-y-4">
                    {[["Full Name", "text", "As per Aadhaar"], ["Mobile Number", "tel", "+91 XXXXX XXXXX"], ["Aadhaar Number", "text", "12-digit Aadhaar"], ["PAN Card Number", "text", "e.g. ABCDE1234F"], ["City / District", "text", "Your city"], ["Pin Code", "text", "6-digit PIN"]].map(([lbl, type, ph]) => (
                        <div key={lbl}>
                            <label className="text-xs font-semibold text-green-600 block mb-1">{lbl} <span className="text-red-400">*</span></label>
                            <input type={type} placeholder={ph} className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900 placeholder-green-300" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Trade & Skills */}
            <div className="bg-white border border-green-100 rounded-2xl p-6">
                <h3 className="font-bold text-green-900 mb-5">Trade & Skills</h3>
                <div className="space-y-4">
                    {/* Category select */}
                    <div>
                        <label className="text-xs font-semibold text-green-600 block mb-1">Primary Category <span className="text-red-400">*</span></label>
                        <select className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900">
                            <option value="">Select category...</option>
                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                        </select>
                    </div>
                    {/* Skill field */}
                    <div>
                        <label className="text-xs font-semibold text-green-600 block mb-1">Primary Skill / Trade</label>
                        <input placeholder="e.g. Electrician, AC Mechanic, Cook" className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900 placeholder-green-300" />
                    </div>
                    {/* Experience */}
                    <div>
                        <label className="text-xs font-semibold text-green-600 block mb-1">Years of Experience</label>
                        <select className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900">
                            {["Less than 1 year", "1–2 years", "3–5 years", "5–10 years", "10+ years"].map(y => <option key={y}>{y}</option>)}
                        </select>
                    </div>
                    {/* Daily rate */}
                    <div>
                        <label className="text-xs font-semibold text-green-600 block mb-1">Expected Daily Rate (₹)</label>
                        <input type="number" placeholder="e.g. 800" className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900 placeholder-green-300" />
                    </div>
                    {/* Availability checkboxes */}
                    <div>
                        <label className="text-xs font-semibold text-green-600 block mb-2">Available For</label>
                        <div className="grid grid-cols-2 gap-2">
                            {["Daily Wage Jobs", "Hourly Work", "Contract Jobs", "Team Manpower", "Gig / Freelance", "Full-Time Hire"].map(a => (
                                <label key={a} className="flex items-center gap-2 text-xs text-green-700 cursor-pointer">
                                    <input type="checkbox" className="rounded" />{a}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Document upload row */}
        <div className="bg-white border border-green-100 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-green-900 mb-5">Document Upload & Verification</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[["📄", "Aadhaar Card", "Front & Back", true], ["💳", "PAN Card", "Clear photo", false], ["🤳", "Selfie / Live Photo", "Take now", true], ["📜", "Skill Certificate", "If available", false]].map(([icon, title, sub, req]) => (
                    <div key={title} className="border-2 border-dashed border-green-200 rounded-2xl p-5 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                        <div className="text-3xl mb-2">{icon}</div>
                        <div className="font-bold text-green-900 text-sm mb-1">{title} {req && <span className="text-red-400">*</span>}</div>
                        <div className="text-xs text-green-400 mb-2">{sub}</div>
                        <span className="text-xs font-semibold text-green-600">Tap to upload ↑</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Submit */}
        <div className="text-center mb-12">
            <button className="btn-press bg-green-600 hover:bg-green-700 text-white font-bold px-12 py-3.5 rounded-2xl text-sm transition-colors shadow-md">
                Submit for Verification →
            </button>
            <p className="text-xs text-green-400 mt-3">Profile reviewed within 24–48 hours. SMS + email update will be sent.</p>
        </div>

        {/* Worker benefits grid */}
        <div>
            <h3 className="font-bold text-green-900 text-xl mb-5">Worker Benefits on UrbanServe</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    ["💸", "Daily Payouts", "Earnings deposited same-day after job completion confirmation."],
                    ["🏥", "₹5L Accident Cover", "Free insurance on every booked job — no premium deducted."],
                    ["📱", "Easy Job Booking", "Accept or reject jobs via app. No broker, no middleman."],
                    ["⭐", "Build Your Profile", "Ratings & reviews grow your reputation for higher-paying gigs."],
                    ["📈", "Free Skill Upgrade", "Online courses to unlock higher-earning service categories."],
                    ["🔒", "Earnings Guarantee", "Earn minimum ₹600 on any confirmed booking — or we compensate."],
                ].map(([icon, title, desc]) => (
                    <div key={title} className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-4">
                        <div className="text-2xl flex-shrink-0">{icon}</div>
                        <div>
                            <div className="font-bold text-green-900 text-sm mb-1">{title}</div>
                            <div className="text-xs text-green-500 leading-relaxed">{desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────
// § 14. ROOT APP COMPONENT
//     Single entry point — manages global view state
// ─────────────────────────────────────────────────────────────

/**
 * <App /> is the root component.
 * - `view` state controls which page is rendered.
 * - `navigate(id)` is passed to every page as a prop.
 * - Scrolls to top on each navigation change.
 */
export default function UrbanServe() {
    const [view, setView] = useState("home");

    /** Navigate to a new page and scroll to top */
    const navigate = (id) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setView(id);
    };

    /** Route map — returns the correct page component */
    const renderPage = () => {
        switch (view) {
            case "home": return <HomePage navigate={navigate} />;
            case "services": return <ServicesPage navigate={navigate} />;
            case "pick-drop": return <PickDropPage />;
            case "manpower": return <ManpowerPage />;
            case "gigs": return <GigJobsPage navigate={navigate} />;
            case "workers": return <WorkersPage navigate={navigate} />;
            case "booking": return <BookingPage navigate={navigate} />;
            case "onboarding": return <OnboardingPage />;
            default: return <HomePage navigate={navigate} />;
        }
    };

    return (
        <>
            {/* Inject custom CSS (animations, fonts, scrollbar) */}
            <GlobalStyles />

            {/* App shell: sticky nav + scrollable content + footer */}
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar active={view} navigate={navigate} />
                <main className="flex-1">{renderPage()}</main>
                <Footer />
            </div>
        </>
    );
}
