import React, { useState, useEffect, useMemo } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useParams,
  useLocation,
  Navigate
} from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  Wallet, 
  CalendarCheck, 
  GraduationCap, 
  School, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ChevronRight, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { toBlob } from 'html-to-image';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { 
  Branch, 
  Student, 
  Teacher, 
  Fee, 
  SalaryPayment, 
  Attendance, 
  Expense, 
  Exam, 
  Result 
} from './types';

// Import images directly to ensure Vite bundles them correctly



// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error.message || String(this.state.error);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, to }: { icon: any, label: string, to: string }) => {
  const location = useLocation();
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        active 
          ? "text-white bg-school-orange shadow-md shadow-school-orange/20 font-semibold" 
          : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
      )}
    >
      <Icon size={18} className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-white")} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[14px]">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
        />
      )}
    </Link>
  );
};

const Card = ({ children, className, title, subtitle, action }: { children: React.ReactNode, className?: string, title?: string, subtitle?: string, action?: React.ReactNode }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200/50 shadow-sm overflow-hidden", className)}>
    {(title || action) && (
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-bold text-navy-900 tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, trend }: { title: string, value: string | number, icon: any, color: string, trend?: { value: string, up: boolean } }) => {
  const isNavy = color.includes('navy');
  
  return (
    <Card className="hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-navy-900">{value}</h4>
            {trend && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                trend.up ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {trend.up ? '↑' : '↓'} {trend.value.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          isNavy ? "bg-navy-900 text-school-orange" : "bg-slate-50 text-slate-400"
        )}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
};

// --- Print Utility ---
export const handlePrint = (e: React.MouseEvent<HTMLButtonElement>) => {
  const target = e.currentTarget;
  const printArea = target.closest('.print-area') as HTMLElement;

  if (!printArea) {
    window.print();
    return;
  }

  // Clone the print area to avoid modifying the actual DOM
  const clone = printArea.cloneNode(true) as HTMLElement;
  
  // Capture the exact width of the print area to ensure it stays the same size
  const exactWidth = printArea.offsetWidth;
  
  // Remove any elements that shouldn't be printed
  const noPrintElements = clone.querySelectorAll('.no-print');
  noPrintElements.forEach(el => el.remove());

  // Fix broken images in the new window by copying the computed absolute src from the original DOM
  const originalImages = printArea.querySelectorAll('img');
  const clonedImages = clone.querySelectorAll('img');
  clonedImages.forEach((img, index) => {
    if (originalImages[index]) {
      // Use the absolute URL from the original image
      img.src = originalImages[index].src;
      // Add a native onerror handler to handle fallbacks in the new window
      img.setAttribute('onerror', "this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';");
    }
  });

  // Get all styles from the current document
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(s => s.outerHTML)
    .join('\n');

  // Open a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Popup blocked! Please allow popups for this site to print.");
    return;
  }

  // Write the content to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Document</title>
        <base href="${window.location.origin}">
        ${styles}
        <style>
          @page { margin: 0.5cm; size: auto; }
          body {
            background: white !important;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-area { 
            box-shadow: none !important; 
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            transform: none !important;
            position: relative !important;
            left: auto !important;
            top: auto !important;
            margin: 0 auto !important;
            width: ${exactWidth}px !important;
            max-width: ${exactWidth}px !important;
          }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
        <script>
          const doPrint = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };

          const images = Array.from(document.querySelectorAll('img'));
          let loaded = 0;
          
          if (images.length === 0) {
            setTimeout(doPrint, 500);
          } else {
            images.forEach(img => {
              if (img.complete) {
                loaded++;
                if (loaded === images.length) setTimeout(doPrint, 500);
              } else {
                img.onload = img.onerror = () => {
                  loaded++;
                  if (loaded === images.length) setTimeout(doPrint, 500);
                };
              }
            });
            // Fallback timeout in case images hang
            setTimeout(doPrint, 2000);
          }
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

// --- Main Application ---

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubStudents = onSnapshot(collection(db, 'students'), (s) => setStudents(s.docs.map(d => ({ id: d.id, ...d.data() } as Student))), (err) => handleFirestoreError(err, OperationType.GET, 'students'));
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (s) => setTeachers(s.docs.map(d => ({ id: d.id, ...d.data() } as Teacher))), (err) => handleFirestoreError(err, OperationType.GET, 'teachers'));
    const unsubFees = onSnapshot(collection(db, 'fees'), (s) => setFees(s.docs.map(d => ({ id: d.id, ...d.data() } as Fee))), (err) => handleFirestoreError(err, OperationType.GET, 'fees'));
    const unsubSalaries = onSnapshot(collection(db, 'salaries'), (s) => setSalaries(s.docs.map(d => ({ id: d.id, ...d.data() } as SalaryPayment))), (err) => handleFirestoreError(err, OperationType.GET, 'salaries'));
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (s) => setExpenses(s.docs.map(d => ({ id: d.id, ...d.data() } as Expense))), (err) => handleFirestoreError(err, OperationType.GET, 'expenses'));
    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (s) => setAttendance(s.docs.map(d => ({ id: d.id, ...d.data() } as Attendance))), (err) => handleFirestoreError(err, OperationType.GET, 'attendance'));
    const unsubExams = onSnapshot(collection(db, 'exams'), (s) => setExams(s.docs.map(d => ({ id: d.id, ...d.data() } as Exam))), (err) => handleFirestoreError(err, OperationType.GET, 'exams'));
    const unsubResults = onSnapshot(collection(db, 'results'), (s) => setResults(s.docs.map(d => ({ id: d.id, ...d.data() } as Result))), (err) => handleFirestoreError(err, OperationType.GET, 'results'));

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubFees();
      unsubSalaries();
      unsubExpenses();
      unsubAttendance();
      unsubExams();
      unsubResults();
    };
  }, [user]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-[0_0_40px_rgba(255,255,255,0.1)] relative z-10">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border border-white/10 rounded-full"
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-white text-lg font-black tracking-[0.4em] uppercase">QUAID-E-AZAM MODEL SCHOOL</p>
            <div className="flex items-center justify-center gap-2">
              <span className="h-0.5 w-8 bg-school-orange rounded-full"></span>
              <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">Academic Excellence</p>
              <span className="h-0.5 w-8 bg-school-orange rounded-full"></span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-navy-900/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-school-orange/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full relative z-10"
        >
          <div className="bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 p-10 text-center">
            <div className="inline-block mb-8 relative">
              <div className="w-40 h-40 flex items-center justify-center bg-white rounded-full p-3 shadow-xl border border-slate-50">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-navy-950 mb-1 tracking-tighter uppercase">QUAID-E-AZAM MODEL SCHOOL</h1>
            <p className="text-school-orange font-bold tracking-[0.3em] mb-6 text-[10px] uppercase">Dhonikey ⋅ Wazirabad</p>
            
            <p className="text-slate-500 mb-10 text-sm leading-relaxed max-w-[300px] mx-auto">
              Welcome to the official management portal of Quaid-E-Azam Model School.
            </p>

            <button 
              onClick={login}
              className="w-full py-4 bg-navy-950 text-white rounded-2xl font-bold hover:bg-navy-900 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-navy-950/20 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
            
            <p className="mt-8 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              Authorized Personnel Only
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] flex">
        {/* Sidebar */}
        <aside className="w-64 bg-navy-950 border-r border-navy-900 flex flex-col sticky top-0 h-screen text-white z-50">
          <div className="p-8 flex flex-col items-center gap-4">
            <div className="w-24 h-24 flex items-center justify-center bg-white rounded-full p-1 shadow-2xl">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-black text-white leading-none tracking-tighter uppercase font-display">QUAID-E-AZAM MODEL SCHOOL</h1>
              <p className="text-school-orange text-[9px] font-bold tracking-[0.2em] uppercase mt-1">Dhonikey ⋅ Wazirabad</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
            <SidebarItem icon={Users} label="Students" to="/students" />
            <SidebarItem icon={UserSquare2} label="Teachers" to="/teachers" />
            <SidebarItem icon={Wallet} label="Finance" to="/finance" />
            <SidebarItem icon={CalendarCheck} label="Attendance" to="/attendance" />
            <SidebarItem icon={GraduationCap} label="Exams" to="/exams" />
          </nav>

          <footer className="p-4 mt-auto">
            <div className="bg-navy-900 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
              <img src={user.photoURL || ''} className="w-10 h-10 rounded-full border border-white/10" alt="User" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
                <p className="text-[10px] text-slate-400 truncate tracking-tight">{user.email}</p>
              </div>
              <button 
                onClick={() => signOut(auth)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </footer>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-20 bg-white/60 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-950 tracking-tighter uppercase leading-none font-display">System Portal</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Online</p>
                </div>
              </div>
            </div>
            
            
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-school-orange transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search records..." 
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-school-orange/20 focus:border-school-orange w-64 transition-all outline-hidden"
                />
              </div>
              <button className="p-2 bg-navy-900 text-school-orange rounded-xl hover:bg-navy-950 transition-all shadow-md shadow-navy-900/10 active:scale-95">
                <Plus size={20} />
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{format(new Date(), 'EEEE, MMMM d')}</p>
                <p className="text-xs font-medium text-slate-500">Academic Year 2026</p>
              </div>
            </div>
          </header>

          <div className="p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  students={students} 
                  teachers={teachers} 
                  fees={fees} 
                  salaries={salaries} 
                  expenses={expenses} 
                />
              } />
              <Route path="/students" element={<StudentsManager students={students} />} />
              <Route path="/teachers" element={<TeachersManager teachers={teachers} />} />
              <Route path="/finance" element={<FinanceManager fees={fees} salaries={salaries} expenses={expenses} students={students} teachers={teachers} />} />
              <Route path="/attendance" element={<AttendanceManager attendance={attendance} students={students} teachers={teachers} />} />
              <Route path="/exams" element={<ExamsManager exams={exams} results={results} students={students} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// --- Dashboard Component ---

function Dashboard({ students, teachers, fees, salaries, expenses }: any) {
  const totalIncome = fees.reduce((acc: number, f: any) => acc + (f.status === 'paid' ? f.amount : 0), 0);
  const totalExpense = salaries.reduce((acc: number, s: any) => acc + (s.status === 'paid' ? s.amount : 0), 0) + 
                       expenses.reduce((acc: number, e: any) => acc + e.amount, 0);

  const chartData = useMemo(() => {
    // Group by month for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => {
      const income = fees.filter((f: any) => f.month === m && f.status === 'paid').reduce((acc: number, f: any) => acc + f.amount, 0);
      const expense = salaries.filter((s: any) => s.month === m && s.status === 'paid').reduce((acc: number, s: any) => acc + s.amount, 0) +
                      expenses.filter((e: any) => format(new Date(e.date), 'MMM') === m).reduce((acc: number, e: any) => acc + e.amount, 0);
      return { name: m, income, expense };
    });
  }, [fees, salaries, expenses]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={students.length} icon={Users} color="bg-navy" trend={{ value: "+12% Growth", up: true }} />
        <StatCard title="Total Teachers" value={teachers.length} icon={UserSquare2} color="bg-slate" />
        <StatCard title="Monthly Income" value={`Rs. ${totalIncome.toLocaleString()}`} icon={TrendingUp} color="bg-navy" trend={{ value: "+5.4% Revenue", up: true }} />
        <StatCard title="Monthly Expenses" value={`Rs. ${totalExpense.toLocaleString()}`} icon={TrendingDown} color="bg-slate" trend={{ value: "Controlled", up: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Institutional Financial Health" subtitle="Income vs. Expense Analytics" className="lg:col-span-3">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="income" fill="#001e3d" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="expense" fill="#f07d00" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}

// --- Students Manager ---

function StudentsManager({ students }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [selectedStudentForId, setSelectedStudentForId] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({ 
    name: '', rollNumber: '', class: '', section: '', fatherName: '', contact: '', address: '', status: 'active', imageUrl: '' 
  });
  const [errorMsg, setErrorMsg] = useState('');

  const filteredStudents = students;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image is too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setNewStudent({ ...newStudent, imageUrl: dataUrl });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setNewStudent({ name: '', rollNumber: '', class: '', section: '', fatherName: '', contact: '', address: '', status: 'active', imageUrl: '' });
    setEditingStudentId(null);
    setErrorMsg('');
    setIsAdding(true);
  };

  const openEditModal = (student: Student) => {
    setNewStudent({
      name: student.name || '',
      
      rollNumber: student.rollNumber || '',
      class: student.class || '',
      section: student.section || '',
      fatherName: student.fatherName || '',
      contact: student.contact || '',
      address: student.address || '',
      status: student.status || 'active',
      imageUrl: student.imageUrl || ''
    });
    setEditingStudentId(student.id);
    setErrorMsg('');
    setIsAdding(true);
  };

  const handleSave = async () => {
    setErrorMsg('');
    if (!newStudent.name) {
      setErrorMsg('Student Name is required.');
      return;
    }
    
    
    let finalRollNumber = newStudent.rollNumber.trim();
    if (finalRollNumber) {
      let baseRoll = finalRollNumber;
      if (baseRoll.startsWith('QMS-')) {
        const parts = baseRoll.split('-');
        baseRoll = parts[parts.length - 1];
      }
      finalRollNumber = `QMS-${newStudent.class || '0'}-${baseRoll}`;
    }

    const studentDataToSave = {
      ...newStudent,
      rollNumber: finalRollNumber
    };
    
    try {
      if (editingStudentId) {
        await updateDoc(doc(db, 'students', editingStudentId), studentDataToSave);
      } else {
        await addDoc(collection(db, 'students'), studentDataToSave);
      }
      setIsAdding(false);
    } catch (err: any) {
      setErrorMsg('Failed to save data. Please try again.');
      try {
        handleFirestoreError(err, OperationType.WRITE, 'students');
      } catch (e) {
        // Prevent crash
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-navy-950 tracking-tight uppercase">Student Records</h3>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">Academic Year 2026-27</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-navy-950 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-navy-900 transition-all shadow-lg shadow-navy-900/10 active:scale-95 text-sm font-bold uppercase tracking-wider"
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      <Card className="p-0 border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student / Guardian</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll Number</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Class / Sec</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.map((student: Student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      {student.imageUrl ? (
                        <div className="relative">
                          <img src={student.imageUrl} alt={student.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-900 flex items-center justify-center font-black text-lg border border-navy-100">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-black text-navy-950 leading-tight">{student.name}</p>
                        <p className="text-xs text-slate-400 font-medium tracking-tight mt-0.5">{student.fatherName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-xs font-bold text-slate-500 leading-none">
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">{student.rollNumber}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-black text-navy-900 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-100 uppercase tracking-tighter">
                      {student.class} - {student.section}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      student.status === 'active' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200"
                    )}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => setSelectedStudentForId(student)}
                        className="p-2 text-slate-400 hover:text-navy-900 hover:bg-white rounded-lg shadow-sm transition-all border border-transparent hover:border-slate-100"
                        title="Identity Card"
                      >
                        <UserSquare2 size={16} />
                      </button>
                      <button 
                        onClick={() => openEditModal(student)}
                        className="p-2 text-slate-400 hover:text-navy-900 hover:bg-white rounded-lg shadow-sm transition-all border border-transparent hover:border-slate-100"
                        title="Modify Profile"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={async () => {
                          if(confirm("Confirm deletion of this student profile?")) {
                            try {
                              await deleteDoc(doc(db, 'students', student.id));
                            } catch (err) {
                              handleFirestoreError(err, OperationType.DELETE, `students/${student.id}`);
                            }
                          }
                        }}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      ><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-xl font-bold text-slate-900">{editingStudentId ? 'Edit Student' : 'Add New Student'}</h4>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">
                    {errorMsg}
                  </div>
                )}
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center">
                      {newStudent.imageUrl ? (
                        <img src={newStudent.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserSquare2 size={40} className="text-slate-300" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <span className="text-xs font-medium">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={newStudent.name}
                      onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 45 (Auto-formats to QMS-Class-45)"
                      value={newStudent.rollNumber}
                      onChange={e => setNewStudent({...newStudent, rollNumber: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                    <input 
                      type="text" 
                      value={newStudent.class}
                      onChange={e => setNewStudent({...newStudent, class: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                    <input 
                      type="text" 
                      value={newStudent.section}
                      onChange={e => setNewStudent({...newStudent, section: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Father's Name</label>
                    <input 
                      type="text" 
                      value={newStudent.fatherName}
                      onChange={e => setNewStudent({...newStudent, fatherName: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                    <input 
                      type="text" 
                      value={newStudent.contact}
                      onChange={e => setNewStudent({...newStudent, contact: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100"
                >
                  {editingStudentId ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ID Card Modal */}
      <AnimatePresence>
        {selectedStudentForId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 relative print-area flex flex-col"
            >
                <div className="h-[260px] w-full flex flex-col bg-white overflow-hidden text-slate-900 relative border-4 border-navy-950">
                  {/* Luxury Header for ID Card */}
                  <div className="bg-navy-950 px-4 py-3 flex items-center gap-3 border-b-2 border-school-orange">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain bg-white rounded-full p-0.5" />
                    <div className="flex-1 text-left">
                      <h2 className="text-[12px] font-black leading-none text-white tracking-tighter uppercase font-display">QUAID-E-AZAM MODEL SCHOOL</h2>
                      <p className="text-school-orange text-[7px] font-bold tracking-[0.25em] uppercase mt-0.5">Dhonikey ⋅ Wazirabad</p>
                    </div>
                    <button 
                      onClick={() => setSelectedStudentForId(null)} 
                      className="text-white/40 hover:text-white no-print"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="flex-1 flex p-4 gap-4">
                    {/* Left Column: Photo & Basic Rank */}
                    <div className="w-1/3 flex flex-col items-center gap-2">
                      <div className="w-24 h-28 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center relative group">
                        {selectedStudentForId.imageUrl ? (
                          <img src={selectedStudentForId.imageUrl} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-300">
                            <Users size={32} />
                            <span className="text-[8px] font-bold mt-1 uppercase">NO PHOTO</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center w-full">
                        <h3 className="text-[13px] font-black text-navy-950 leading-tight truncate font-display uppercase">{selectedStudentForId.name}</h3>
                        <p className="text-school-orange font-black text-[9px] mt-0.5 uppercase tracking-tighter inline-block px-2 bg-school-orange/10 rounded">STUDENT</p>
                      </div>
                    </div>
                    
                    {/* Right Column: Key Academic Details */}
                    <div className="w-2/3 flex flex-col justify-between py-1 text-left">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Registration</p>
                          <p className="text-[11px] font-black text-navy-900 leading-none tracking-tight">{selectedStudentForId.rollNumber}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Academic</p>
                            <p className="text-[9px] font-black text-navy-900 leading-none">{selectedStudentForId.class}-{selectedStudentForId.section}</p>
                          </div>
                          <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Session</p>
                            <p className="text-[9px] font-black text-navy-900 leading-none">2026-27</p>
                          </div>
                        </div>
                        <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                          <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Guardian / Contact</p>
                          <p className="text-[9px] font-black text-navy-900 truncate tracking-tight">{selectedStudentForId.fatherName}</p>
                          <p className="text-[8px] text-slate-500 font-bold mt-0.5">{selectedStudentForId.contact || '--------'}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                      <div className="text-right flex flex-col items-end relative w-full">
                        <div className="w-full border-t border-navy-900/20 pt-1 mt-4 text-center">
                          <span className="text-[7px] text-navy-950 uppercase font-black tracking-widest leading-none">Principal Authority</span>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Safety Rail */}
                  <div className="h-2 bg-navy-950 w-full mt-auto"></div>
                </div>
                
                <div className="bg-slate-50 p-6 text-center border-t border-slate-100 no-print flex flex-col gap-3">
                  <button 
                    onClick={handlePrint}
                    className="w-full bg-navy-950 text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-navy-900 transition-all flex items-center justify-center gap-3 shadow-lg shadow-navy-950/10 active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print Verification
                  </button>
                  <button onClick={() => setSelectedStudentForId(null)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Close Registry</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Teachers Manager ---

function TeachersManager({ teachers }: any) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [selectedTeacherForId, setSelectedTeacherForId] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState({ 
    name: '', employeeId: '', subject: '', qualification: '', contact: '', salary: 0, status: 'active', imageUrl: '' 
  });
  const [errorMsg, setErrorMsg] = useState('');

  const filteredTeachers = teachers;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image is too large. Please select an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setNewTeacher({ ...newTeacher, imageUrl: dataUrl });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    setNewTeacher({ name: '', employeeId: '', subject: '', qualification: '', contact: '', salary: 0, status: 'active', imageUrl: '' });
    setEditingTeacherId(null);
    setErrorMsg('');
    setIsAdding(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setNewTeacher({
      name: teacher.name || '',
      
      employeeId: teacher.employeeId || '',
      subject: teacher.subject || '',
      qualification: teacher.qualification || '',
      contact: teacher.contact || '',
      salary: teacher.salary || 0,
      status: teacher.status || 'active',
      imageUrl: teacher.imageUrl || ''
    });
    setEditingTeacherId(teacher.id);
    setErrorMsg('');
    setIsAdding(true);
  };

  const handleSave = async () => {
    setErrorMsg('');
    if (!newTeacher.name) {
      setErrorMsg('Teacher Name is required.');
      return;
    }
    

    try {
      if (editingTeacherId) {
        await updateDoc(doc(db, 'teachers', editingTeacherId), newTeacher);
      } else {
        await addDoc(collection(db, 'teachers'), newTeacher);
      }
      setIsAdding(false);
    } catch (err: any) {
      setErrorMsg('Failed to save data. Please try again.');
      try {
        handleFirestoreError(err, OperationType.WRITE, 'teachers');
      } catch (e) {
        // Prevent crash
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-navy-950 tracking-tight uppercase">Faculty Registry</h3>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">Personnel Management Portal</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-navy-950 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-navy-900 transition-all shadow-lg shadow-navy-900/10 active:scale-95 text-sm font-bold uppercase tracking-wider"
        >
          <Plus size={18} /> Register Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher: Teacher) => (
          <Card key={teacher.id} className="hover:border-navy-900/20 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-navy-50 rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 group-hover:scale-150"></div>
            <div className="flex justify-between items-start mb-6 relative z-10 text-right">
              {teacher.imageUrl ? (
                <img src={teacher.imageUrl} alt={teacher.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-navy-900 text-school-orange flex items-center justify-center font-black text-2xl border-2 border-white shadow-md">
                  {teacher.name.charAt(0)}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => setSelectedTeacherForId(teacher)}
                  className="p-2 text-slate-400 hover:text-navy-950 hover:bg-white rounded-lg transition-all"
                  title="Personnel Card"
                >
                  <UserSquare2 size={16} />
                </button>
                <button 
                  onClick={() => openEditModal(teacher)}
                  className="p-2 text-slate-400 hover:text-navy-950 hover:bg-white rounded-lg transition-all"
                  title="Update Registry"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={async () => {
                    if(confirm("Permanently delete faculty record?")) {
                      try {
                        await deleteDoc(doc(db, 'teachers', teacher.id));
                      } catch (err) {
                        handleFirestoreError(err, OperationType.DELETE, `teachers/${teacher.id}`);
                      }
                    }
                  }}
                  className="p-2 text-slate-300 hover:text-rose-600 transition-all"
                ><Trash2 size={16} /></button>
              </div>
            </div>
            
            <div className="relative z-10">
              <h4 className="text-xl font-black text-navy-950 mb-1 leading-none">{teacher.name}</h4>
              <p className="text-school-orange font-black text-[10px] uppercase tracking-wider mb-4 inline-block px-2 py-0.5 bg-school-orange/5 rounded">{teacher.subject}</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase tracking-widest leading-none">Qualification</span>
                  <span className="font-black text-navy-950 uppercase">{teacher.qualification}</span>
                </div>
                
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase tracking-widest leading-none">Settlement</span>
                  <span className="text-navy-950 font-black text-xs">Rs. {teacher.salary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-xl font-bold text-slate-900">{editingTeacherId ? 'Edit Teacher' : 'Add New Teacher'}</h4>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium">
                    {errorMsg}
                  </div>
                )}
                <div className="flex justify-center mb-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center">
                      {newTeacher.imageUrl ? (
                        <img src={newTeacher.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserSquare2 size={40} className="text-slate-300" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <span className="text-xs font-medium">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={newTeacher.name}
                      onChange={e => setNewTeacher({...newTeacher, name: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Employee ID</label>
                    <input 
                      type="text" 
                      value={newTeacher.employeeId}
                      onChange={e => setNewTeacher({...newTeacher, employeeId: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      value={newTeacher.subject}
                      onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Qualification</label>
                    <input 
                      type="text" 
                      value={newTeacher.qualification}
                      onChange={e => setNewTeacher({...newTeacher, qualification: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                    <input 
                      type="text" 
                      value={newTeacher.contact}
                      onChange={e => setNewTeacher({...newTeacher, contact: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Salary</label>
                    <input 
                      type="number" 
                      value={newTeacher.salary}
                      onChange={e => setNewTeacher({...newTeacher, salary: Number(e.target.value)})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100"
                >
                  {editingTeacherId ? 'Update Teacher' : 'Save Teacher'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Teacher ID Card Modal */}
      <AnimatePresence>
        {selectedTeacherForId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden relative print-area flex flex-col"
            >
              <button 
                onClick={() => setSelectedTeacherForId(null)} 
                  className="absolute top-2 right-2 text-white/80 hover:text-white z-20 bg-black/20 rounded-full p-1 backdrop-blur-md no-print"
                >
                  <X size={16} />
                </button>
                
                {/* ID Card Header (Landscape) */}
                <div className="bg-amber-400 py-3 px-4 text-center relative overflow-hidden flex items-center gap-3">
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full border-4 border-black"></div>
                    <div className="absolute top-10 -right-10 w-32 h-32 rounded-full border-4 border-black"></div>
                  </div>
                  <img src="/logo.png" alt="Logo" className="w-12 h-12 shadow-lg bg-white rounded-lg p-1 z-10" />
                <div className="text-left z-10">
                  <h2 className="text-slate-900 font-bold text-lg leading-tight tracking-tight uppercase">QUAID-E-AZAM MODEL SCHOOL</h2>
                  <p className="text-slate-700 text-[8px] uppercase tracking-[0.3em] font-black">Dhonikey ⋅ Wazirabad</p>
                  <p className="text-slate-600 text-[9px] uppercase tracking-widest font-bold mt-1">Staff ID Card</p>
                </div>
                </div>

                {/* ID Card Body (Landscape) */}
                <div className="p-4 flex gap-4 bg-white relative flex-1">
                  {/* Left Column: Photo & Name */}
                  <div className="w-1/3 flex flex-col items-center justify-center border-r border-slate-100 pr-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-amber-100 shadow-sm bg-slate-100 overflow-hidden mb-3">
                      {selectedTeacherForId.imageUrl ? (
                        <img src={selectedTeacherForId.imageUrl} alt={selectedTeacherForId.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-700/10 text-blue-700 text-3xl font-bold">
                          {selectedTeacherForId.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 text-center leading-tight">{selectedTeacherForId.name}</h3>
                    <p className="text-blue-700 font-bold text-[10px] mt-0.5 text-center leading-tight">{selectedTeacherForId.subject} Teacher</p>
                  </div>
                  
                  {/* Right Column: Details & Signature */}
                  <div className="w-2/3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">Emp ID:</span>
                        <span className="text-slate-900 font-bold">{selectedTeacherForId.employeeId}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">Qual:</span>
                        <span className="text-slate-900 font-bold truncate max-w-[120px] text-right">{selectedTeacherForId.qualification}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">Contact:</span>
                        <span className="text-slate-900 font-bold">{selectedTeacherForId.contact || 'N/A'}</span>
                      </div>
                      
                    </div>
                    
                    <div className="flex justify-between items-end mt-3">
                      <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                        <span className="text-[6px] text-slate-400 uppercase font-bold tracking-widest rotate-90">Valid 2026</span>
                      </div>
                      <div className="text-right flex flex-col items-end relative">
                        <div className="w-24 border-t border-slate-400 pt-0.5 mt-8 text-center">
                          <span className="text-[7px] text-slate-500 uppercase font-bold tracking-widest">Principal Signature</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Print Button (Hidden in print) */}
                <div className="bg-slate-50 p-3 text-center border-t border-slate-100 no-print">
                  <button 
                    onClick={handlePrint}
                    className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print ID Card
                  </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Finance Manager ---

function FinanceManager({ fees, salaries, expenses, students, teachers }: any) {
  const [activeTab, setActiveTab] = useState<'fees' | 'salaries' | 'expenses' | 'balance'>('fees');
  const [isAdding, setIsAdding] = useState(false);
  const [viewingFeeSlip, setViewingFeeSlip] = useState<Fee | null>(null);
  const [newFee, setNewFee] = useState({ studentId: '', month: format(new Date(), 'MMM'), year: new Date().getFullYear(), amount: 0, status: 'unpaid' });
  const [newSalary, setNewSalary] = useState({ teacherId: '', month: format(new Date(), 'MMM'), year: new Date().getFullYear(), amount: 0, status: 'unpaid' });
  const [newExpense, setNewExpense] = useState({ category: '', amount: 0, description: '', date: format(new Date(), 'yyyy-MM-dd') });
  
  const [isCapturing, setIsCapturing] = useState(false);
  
  const feeSlipRef = React.useRef<HTMLDivElement>(null);

  const filteredFees = fees;
  const filteredSalaries = salaries;
  const filteredExpenses = expenses;

  const totalIncome = filteredFees.reduce((acc: number, f: any) => acc + (f.status === 'paid' ? f.amount : 0), 0);
  const totalExpense = filteredSalaries.reduce((acc: number, s: any) => acc + (s.status === 'paid' ? s.amount : 0), 0) + 
                       filteredExpenses.reduce((acc: number, e: any) => acc + e.amount, 0);

  const sendWhatsAppReceipt = async (fee: any, student: any, winRef?: Window | null) => {
    if (!student || !student.contact) {
      alert("Student contact number is missing! Cannot send WhatsApp receipt.");
      if (winRef) winRef.close();
      return;
    }

    setIsCapturing(true);
    
    // Attempt to copy image to clipboard if feeSlipRef is available
    let imageCopied = false;
    if (feeSlipRef.current) {
      try {
        // Filter out buttons and other non-print elements
        const blob = await toBlob(feeSlipRef.current, { 
          cacheBust: true, 
          filter: (node: any) => {
            if (node.classList && (node.classList.contains('no-print') || node.tagName === 'BUTTON' || node.role === 'button')) return false;
            return true;
          },
          backgroundColor: '#ffffff',
          pixelRatio: 2 // Higher quality
        });
        
        if (blob && navigator.clipboard && (window as any).ClipboardItem) {
          await navigator.clipboard.write([
            new (window as any).ClipboardItem({ 'image/png': blob })
          ]);
          imageCopied = true;
        }
      } catch (err) {
        console.error("Failed to capture or copy image:", err);
      }
    }
    
    setIsCapturing(false);
    
    let formattedContact = student.contact.replace(/[^\d]/g, '');
    
    // Handle common prefixes for Pakistan
    if (formattedContact.startsWith('0092')) {
      formattedContact = formattedContact.substring(2);
    } else if (formattedContact.startsWith('03')) {
      formattedContact = '92' + formattedContact.substring(1);
    } else if (formattedContact.startsWith('92')) {
      // Already correct
    } else if (formattedContact.length === 10 && formattedContact.startsWith('3')) {
      formattedContact = '92' + formattedContact;
    }

    const message = `🏫 *QUAID-E-AZAM MODEL SCHOOL*\n*FEE RECEIPT*\n\n*Student:* ${student.name}\n*Roll No:* ${student.rollNumber || 'N/A'}\n*Class:* ${student.class || 'N/A'} - ${student.section || 'N/A'}\n*Fee Month:* ${fee.month} ${fee.year}\n*Amount Paid:* Rs. ${fee.amount.toLocaleString()}\n*Status:* ${fee.status.toUpperCase()} ${fee.status === 'paid' ? '✅' : '❌'}\n\nThank you for your payment!`;
    
    const whatsappUrl = `https://wa.me/${formattedContact}?text=${encodeURIComponent(message)}`;
    
    if (imageCopied) {
      alert("✅ Fee receipt image copied to clipboard!\n\nOpening WhatsApp... Please PASTE (Ctrl+V) the image in the chat to send it.");
    }

    if (winRef) {
      winRef.location.href = whatsappUrl;
    } else {
      try {
        const win = window.open(whatsappUrl, '_blank');
        if (!win) {
          // If popup blocked, still alert about clipboard
          if (!imageCopied) {
            alert("WhatsApp popup was blocked by your browser. Please allow popups for this site.");
          }
        }
      } catch (err) {
        console.error("Failed to open WhatsApp:", err);
      }
    }
  };

  const handleAddFee = async () => {
    if (!newFee.studentId) return;
    
    const student = students.find((s: any) => s.id === newFee.studentId);
    const shouldSendWhatsApp = newFee.status === 'paid';

    // Open window synchronously in the click handler to bypass popup blockers
    let whatsappWin: Window | null = null;
    if (shouldSendWhatsApp && student?.contact) {
      whatsappWin = window.open('about:blank', '_blank');
    }

    try {
      await addDoc(collection(db, 'fees'), {
        ...newFee,
        datePaid: newFee.status === 'paid' ? new Date().toISOString() : null
      });
      
      if (shouldSendWhatsApp) {
        sendWhatsAppReceipt(newFee, student, whatsappWin);
      }
      
      setIsAdding(false);
    } catch (err) {
      if (whatsappWin) whatsappWin.close();
      handleFirestoreError(err, OperationType.WRITE, 'fees');
    }
  };

  const handleAddSalary = async () => {
    if (!newSalary.teacherId) return;
    try {
      await addDoc(collection(db, 'salaries'), {
        ...newSalary,
        datePaid: newSalary.status === 'paid' ? new Date().toISOString() : null
      });
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'salaries');
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.amount) return;
    try {
      await addDoc(collection(db, 'expenses'), newExpense);
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'expenses');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Institutional Revenue" value={`Rs. ${totalIncome.toLocaleString()}`} icon={TrendingUp} color="bg-navy" trend={{ value: "+8.2% vs Last Month", up: true }} />
        <StatCard title="Operating Expenses" value={`Rs. ${totalExpense.toLocaleString()}`} icon={TrendingDown} color="bg-slate" />
        <StatCard title="Net Liquid Assets" value={`Rs. ${(totalIncome - totalExpense).toLocaleString()}`} icon={DollarSign} color="bg-navy" />
      </div>

      <div className="flex gap-1.5 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {(['fees', 'salaries', 'expenses', 'balance'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
              activeTab === tab ? "bg-white text-navy-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'fees' && (
        <Card title="Student Tuition & Fees" subtitle="Detailed Fee Collection History" action={
          <button onClick={() => setIsAdding(true)} className="bg-navy-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-navy-900 transition-all shadow-lg shadow-navy-900/10 active:scale-95">
            <Plus size={16} /> Record Transaction
          </button>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="pb-5">Student Reference</th>
                  <th className="pb-5">Billing Period</th>
                  <th className="pb-5">Transaction Amount</th>
                  <th className="pb-5 text-center">Status</th>
                  <th className="pb-5 text-right">Settlement Date</th>
                  <th className="pb-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredFees.map((fee: Fee) => (
                  <tr key={fee.id} className="text-sm hover:bg-slate-50/50 transition-colors group">
                    <td className="py-5">
                      <p className="font-black text-navy-950 leading-tight">
                        {students.find((s: any) => s.id === fee.studentId)?.name || 'Unknown Registry'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">ID: {fee.studentId.slice(0, 8)}</p>
                    </td>
                    <td className="py-5 text-slate-600 font-medium">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg text-slate-700 text-xs">{fee.month} {fee.year}</span>
                    </td>
                    <td className="py-5 font-black text-navy-950">Rs. {fee.amount.toLocaleString()}</td>
                    <td className="py-5 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        fee.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                      )}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-5 text-right text-slate-500 font-mono text-xs">{fee.datePaid ? format(new Date(fee.datePaid), 'MMM dd, yyyy') : 'Pending'}</td>
                    <td className="py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            const student = students.find((s: any) => s.id === fee.studentId);
                            sendWhatsAppReceipt(fee, student);
                          }}
                          className="p-2 text-emerald-500 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="Quick WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        </button>
                        <button 
                          onClick={() => setViewingFeeSlip(fee)}
                          className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                          Fee Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'salaries' && (
        <Card title="Teacher Salaries" action={
          <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition-all">
            <Plus size={16} /> Record Salary
          </button>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                  <th className="pb-4">Teacher</th>
                  <th className="pb-4">Month/Year</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Date Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSalaries.map((sal: SalaryPayment) => (
                  <tr key={sal.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-900">
                      {teachers.find((t: any) => t.id === sal.teacherId)?.name || 'Unknown'}
                    </td>
                    <td className="py-4 text-slate-600">{sal.month} {sal.year}</td>
                    <td className="py-4 font-bold text-slate-900">Rs. {sal.amount}</td>
                    <td className="py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        sal.status === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {sal.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-slate-500">{sal.datePaid ? format(new Date(sal.datePaid), 'MMM dd, yyyy') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'expenses' && (
        <Card title="School Expenses" action={
          <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700 transition-all">
            <Plus size={16} /> Add Expense
          </button>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                  <th className="pb-4">Category</th>
                  <th className="pb-4">Description</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredExpenses.map((exp: Expense) => (
                  <tr key={exp.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-900">{exp.category}</td>
                    <td className="py-4 text-slate-600">{exp.description}</td>
                    <td className="py-4 font-bold text-rose-600">Rs. {exp.amount}</td>
                    <td className="py-4 text-right text-slate-500">{format(new Date(exp.date), 'MMM dd, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'balance' && (
        <Card 
          title="Monthly Balance Sheet" 
          subtitle="Summary of income and expenses"
          className="print-area"
          action={
            <button 
              onClick={handlePrint}
              className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-100 transition-all font-bold no-print"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Report
            </button>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-emerald-600 flex items-center gap-2">
                  <TrendingUp size={18} /> Income Sources
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Student Fees</span>
                    <span className="font-bold text-slate-900">Rs. {totalIncome.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                    <span>Total Income</span>
                    <span className="text-emerald-600">Rs. {totalIncome.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-rose-600 flex items-center gap-2">
                  <TrendingDown size={18} /> Expense Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Teacher Salaries</span>
                    <span className="font-bold text-slate-900">Rs. {filteredSalaries.reduce((acc: number, s: any) => acc + (s.status === 'paid' ? s.amount : 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Other Expenses</span>
                    <span className="font-bold text-slate-900">Rs. {filteredExpenses.reduce((acc: number, e: any) => acc + e.amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between font-bold">
                    <span>Total Expenses</span>
                    <span className="text-rose-600">Rs. {totalExpense.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-blue-50 rounded-2xl flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Net Profit / Loss</p>
                <h3 className="text-3xl font-bold text-blue-900">Rs. {(totalIncome - totalExpense).toLocaleString()}</h3>
              </div>
              <div className={cn(
                "p-4 rounded-full",
                (totalIncome - totalExpense) >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              )}>
                {(totalIncome - totalExpense) >= 0 ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
              </div>
            </div>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {viewingFeeSlip && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              ref={feeSlipRef}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative print-area border border-slate-200"
            >
              {/* Header */}
              <div className="p-6 text-center border-b border-slate-200 relative bg-slate-50/50">
                <button 
                  onClick={() => setViewingFeeSlip(null)} 
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 no-print"
                >
                  <X size={20} />
                </button>
                <img src="/logo.png" alt="Logo" className="w-28 h-28 mx-auto mb-4 object-contain"  />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">QUAID-E-AZAM MODEL SCHOOL</h3>
                <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">Dhonikey ⋅ Wazirabad</p>
                <div className="w-16 h-1 bg-amber-400 mx-auto mt-4"></div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="mb-6 pb-6 border-b border-dashed border-slate-300">
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    {students.find((s: any) => s.id === viewingFeeSlip.studentId)?.name || 'Unknown Student'}
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p className="text-slate-500">Roll No:</p>
                    <p className="text-slate-900 font-medium text-right">{students.find((s: any) => s.id === viewingFeeSlip.studentId)?.rollNumber || 'N/A'}</p>
                    <p className="text-slate-500">Class:</p>
                    <p className="text-slate-900 font-medium text-right">{students.find((s: any) => s.id === viewingFeeSlip.studentId)?.class || 'N/A'} - {students.find((s: any) => s.id === viewingFeeSlip.studentId)?.section || 'N/A'}</p>
                    
                    
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <p className="text-slate-500">Fee Month:</p>
                    <p className="text-slate-900 font-medium text-right">{viewingFeeSlip.month} {viewingFeeSlip.year}</p>
                    <p className="text-slate-500">Status:</p>
                    <p className="text-right">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                        viewingFeeSlip.status === 'paid' ? "border-slate-800 text-slate-800" : "border-slate-400 text-slate-500"
                      )}>
                        {viewingFeeSlip.status}
                      </span>
                    </p>
                  </div>

                  <div className="py-4 border-y border-slate-900 flex justify-between items-center mt-4">
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Total Amount</p>
                    <p className="text-xl font-black text-slate-900">
                      Rs. {viewingFeeSlip.amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="pt-8 flex justify-between items-end">
                    <div className="text-center">
                      <div className="w-20 h-px bg-slate-400 mb-1"></div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cashier</p>
                    </div>
                    <div className="text-center flex flex-col items-center relative">
                      <div className="w-24 border-t border-slate-400 pt-1 mt-10">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Principal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-200">
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">System Generated Receipt</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const student = students.find((s: any) => s.id === viewingFeeSlip?.studentId);
                      sendWhatsAppReceipt(viewingFeeSlip, student);
                    }}
                    disabled={isCapturing}
                    className={cn(
                      "p-2 text-emerald-500 hover:text-emerald-700 transition-all no-print flex items-center justify-center",
                      isCapturing ? "opacity-50 cursor-not-allowed scale-90" : "hover:scale-110 active:scale-95"
                    )}
                    title="Send via WhatsApp"
                  >
                    {isCapturing ? (
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    )}
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="p-2 text-slate-500 hover:text-slate-900 transition-colors no-print"
                    title="Print Receipt"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-xl font-bold text-slate-900">
                  {activeTab === 'fees' ? 'Record Student Fee' : 'Add New Expense'}
                </h4>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                {activeTab === 'fees' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
                      <select 
                        value={newFee.studentId}
                        onChange={e => {
                          const s = students.find((st: any) => st.id === e.target.value);
                          setNewFee({...newFee, studentId: e.target.value, });
                        }}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Student</option>
                        {students.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                        <select 
                          value={newFee.month}
                          onChange={e => setNewFee({...newFee, month: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        >
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                        <input 
                          type="number" 
                          value={newFee.amount}
                          onChange={e => setNewFee({...newFee, amount: Number(e.target.value)})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select 
                        value={newFee.status}
                        onChange={e => setNewFee({...newFee, status: e.target.value as any})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </>
                ) : activeTab === 'salaries' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
                      <select 
                        value={newSalary.teacherId}
                        onChange={e => {
                          const t = teachers.find((th: any) => th.id === e.target.value);
                          setNewSalary({...newSalary, teacherId: e.target.value, amount: t?.salary || 0});
                        }}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.employeeId})</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                        <select 
                          value={newSalary.month}
                          onChange={e => setNewSalary({...newSalary, month: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        >
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                        <input 
                          type="number" 
                          value={newSalary.amount}
                          onChange={e => setNewSalary({...newSalary, amount: Number(e.target.value)})}
                          className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                      <select 
                        value={newSalary.status}
                        onChange={e => setNewSalary({...newSalary, status: e.target.value as any})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <input 
                        type="text" 
                        value={newExpense.category}
                        onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Utilities, Rent, Maintenance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                      <input 
                        type="number" 
                        value={newExpense.amount}
                        onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <textarea 
                        value={newExpense.description}
                        onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={activeTab === 'fees' ? handleAddFee : activeTab === 'salaries' ? handleAddSalary : handleAddExpense}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Save Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Attendance Manager ---

function AttendanceManager({ attendance, students, teachers }: any) {
  const [type, setType] = useState<'student' | 'teacher'>('student');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const filteredPeople = type === 'student' 
    ? students
    : teachers;

  const handleMark = async (personId: string, status: 'present' | 'absent' | 'late' | 'leave') => {
    const existing = attendance.find((a: any) => a.personId === personId && a.date === date);
    try {
      if (existing) {
        await updateDoc(doc(db, 'attendance', existing.id), { status });
      } else {
        await addDoc(collection(db, 'attendance'), {
          personId,
          type,
          
          date,
          status
        });
      }
    } catch (err) {
      handleFirestoreError(err, existing ? OperationType.UPDATE : OperationType.WRITE, `attendance/${existing?.id || ''}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-2xl font-bold text-slate-900">Attendance Tracker</h3>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setType('student')}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", type === 'student' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}
            >Students</button>
            <button 
              onClick={() => setType('teacher')}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", type === 'teacher' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}
            >Teachers</button>
          </div>
          <input 
            type="date" 
            value={date}
            onChange={e => setDate(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID / Roll No</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPeople.map((person: any) => {
                const record = attendance.find((a: any) => a.personId === person.id && a.date === date);
                return (
                  <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{person.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{type === 'student' ? person.rollNumber : person.employeeId}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {(['present', 'absent', 'late', 'leave'] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => handleMark(person.id, s)}
                            className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                              record?.status === s 
                                ? (s === 'present' ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" : s === 'absent' ? "bg-rose-600 text-white shadow-md shadow-rose-100" : s === 'late' ? "bg-amber-500 text-white shadow-md shadow-amber-100" : "bg-blue-500 text-white shadow-md shadow-blue-100")
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// --- Exams Manager ---

function ExamsManager({ exams, results, students }: any) {
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
  const [isAdding, setIsAdding] = useState(false);
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  const [viewingResults, setViewingResults] = useState<string | null>(null);
  const [viewingResultCard, setViewingResultCard] = useState<Result | null>(null);
  const [newExam, setNewExam] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), class: '', subject: '' });
  const DEFAULT_SUBJECTS = [
    { subject: 'English', obtained: 0, total: 100 },
    { subject: 'Urdu', obtained: 0, total: 100 },
    { subject: 'Maths', obtained: 0, total: 100 },
    { subject: 'Science', obtained: 0, total: 100 },
    { subject: 'Islamiyat', obtained: 0, total: 100 },
    { subject: 'Biology', obtained: 0, total: 100 },
    { subject: 'Physics', obtained: 0, total: 100 },
    { subject: 'Chemistry', obtained: 0, total: 100 },
    { subject: 'Pak Study', obtained: 0, total: 100 },
  ];

  const [newResult, setNewResult] = useState({ 
    examId: '',
    studentId: '', 
    marksObtained: 0, 
    totalMarks: 0, 
    grade: '',
    subjectMarks: DEFAULT_SUBJECTS
  });

  const filteredExams = exams;
  const filteredResults = results;

  const handleAddExam = async () => {
    if (!newExam.title) return;
    try {
      await addDoc(collection(db, 'exams'), newExam);
      setIsAdding(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'exams');
    }
  };

  const handleAddResult = async () => {
    const targetExamId = viewingResults || newResult.examId;
    if (!targetExamId || !newResult.studentId) return;
    
    // Calculate totals from subjectMarks
    const activeSubjects = newResult.subjectMarks.filter(s => s.total > 0);
    const totalObtained = activeSubjects.reduce((sum, s) => sum + (Number(s.obtained) || 0), 0);
    const totalMax = activeSubjects.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    
    let calculatedGrade = 'F';
    if (percentage >= 80) calculatedGrade = 'A+';
    else if (percentage >= 70) calculatedGrade = 'A';
    else if (percentage >= 60) calculatedGrade = 'B';
    else if (percentage >= 50) calculatedGrade = 'C';
    else if (percentage >= 40) calculatedGrade = 'D';

    try {
      await addDoc(collection(db, 'results'), { 
        studentId: newResult.studentId,
        examId: targetExamId,
        marksObtained: totalObtained,
        totalMarks: totalMax,
        grade: newResult.grade || calculatedGrade,
        subjectMarks: activeSubjects
      });
      setNewResult({ 
        examId: '',
        studentId: '', 
        marksObtained: 0, 
        totalMarks: 0, 
        grade: '',
        subjectMarks: DEFAULT_SUBJECTS
      });
      setIsGeneratingResult(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'results');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-2xl font-bold text-slate-900">Examination Section</h3>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setActiveTab('exams')}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", activeTab === 'exams' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}
            >Exams</button>
            <button 
              onClick={() => setActiveTab('results')}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", activeTab === 'results' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}
            >Results</button>
          </div>
          {activeTab === 'exams' && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              <Plus size={20} /> Schedule Exam
            </button>
          )}
          {activeTab === 'results' && (
            <button 
              onClick={() => setIsGeneratingResult(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              <Plus size={20} /> Generate Result Card
            </button>
          )}
        </div>
      </div>

      {activeTab === 'exams' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((exam: Exam) => (
            <Card key={exam.id} title={exam.title} subtitle={`${exam.subject} • Class ${exam.class}`}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CalendarCheck size={16} />
                  {format(new Date(exam.date), 'MMMM dd, yyyy')}
                </div>
                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-sm text-slate-500">Results Published: {results.filter((r: any) => r.examId === exam.id).length}</span>
                <button 
                  onClick={() => setViewingResults(exam.id)}
                  className="text-sm font-bold text-blue-600 hover:underline"
                >
                  Manage Results
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredResults.map((res: Result) => {
                  const student = students.find((s: any) => s.id === res.studentId);
                  const exam = exams.find((e: any) => e.id === res.examId);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {student?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{student?.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Roll: {student?.rollNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">{exam?.title}</p>
                        <p className="text-xs text-slate-500">{exam?.subject}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{res.marksObtained}</span>
                        <span className="text-xs text-slate-400"> / {res.totalMarks}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-lg font-bold text-xs",
                          res.grade.startsWith('A') ? "bg-emerald-50 text-emerald-600" :
                          res.grade.startsWith('B') ? "bg-blue-50 text-blue-600" :
                          res.grade.startsWith('C') ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {res.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setViewingResultCard(res)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="View Result Card"
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      No results found for the selected branch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {isGeneratingResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h4 className="text-xl font-bold text-slate-900">Generate Result Card</h4>
                <button onClick={() => setIsGeneratingResult(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Exam</label>
                    <select 
                      value={newResult.examId}
                      onChange={e => setNewResult({...newResult, examId: e.target.value, studentId: ''})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Exam</option>
                      {filteredExams.length === 0 && (
                        <option value="" disabled>No exams available. Please schedule an exam first.</option>
                      )}
                      {filteredExams.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.title} ({e.class})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Student</label>
                    <select 
                      value={newResult.studentId}
                      onChange={e => setNewResult({...newResult, studentId: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newResult.examId}
                    >
                      <option value="">Select Student</option>
                      {newResult.examId && students.length === 0 && (
                        <option value="" disabled>No students found.</option>
                      )}
                      {students.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Subject Marks</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {newResult.subjectMarks.map((sm, idx) => (
                      <div key={sm.subject} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-700 w-24 truncate" title={sm.subject}>{sm.subject}</span>
                        <input 
                          type="number" 
                          placeholder="Obt"
                          value={sm.obtained || ''}
                          onChange={e => {
                            const newMarks = [...newResult.subjectMarks];
                            newMarks[idx].obtained = Number(e.target.value);
                            setNewResult({...newResult, subjectMarks: newMarks});
                          }}
                          className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-slate-400 text-xs">/</span>
                        <input 
                          type="number" 
                          placeholder="Tot"
                          value={sm.total || ''}
                          onChange={e => {
                            const newMarks = [...newResult.subjectMarks];
                            newMarks[idx].total = Number(e.target.value);
                            setNewResult({...newResult, subjectMarks: newMarks});
                          }}
                          className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Overall Grade (Optional)</label>
                  <input 
                    type="text" 
                    value={newResult.grade}
                    onChange={e => setNewResult({...newResult, grade: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Auto-calculated if empty (e.g. A+, B)"
                  />
                </div>
              </div>
              
              <div className="p-6 bg-slate-50 flex gap-3 shrink-0 border-t border-slate-100">
                <button 
                  onClick={() => setIsGeneratingResult(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddResult}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  disabled={!newResult.examId || !newResult.studentId}
                >
                  Generate Result Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h4 className="text-xl font-bold text-slate-900">Schedule New Exam</h4>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Exam Title</label>
                  <input 
                    type="text" 
                    value={newExam.title}
                    onChange={e => setNewExam({...newExam, title: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Mid-Term Examination"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                    <input 
                      type="text" 
                      value={newExam.class}
                      onChange={e => setNewExam({...newExam, class: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      value={newExam.subject}
                      onChange={e => setNewExam({...newExam, subject: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newExam.date}
                    onChange={e => setNewExam({...newExam, date: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddExam}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Schedule Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {viewingResults && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Exam Results</h4>
                  <p className="text-sm text-slate-500">{exams.find((e: any) => e.id === viewingResults)?.title}</p>
                </div>
                <button onClick={() => setViewingResults(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <h5 className="font-bold text-slate-800">Published Results</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                          <th className="pb-2">Student</th>
                          <th className="pb-2">Marks</th>
                          <th className="pb-2">Grade</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {results.filter((r: any) => r.examId === viewingResults).map((res: Result) => (
                          <tr key={res.id} className="text-sm">
                            <td className="py-3 font-medium text-slate-900">
                              {students.find((s: any) => s.id === res.studentId)?.name}
                            </td>
                            <td className="py-3 text-slate-600">{res.marksObtained} / {res.totalMarks}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg font-bold">{res.grade}</span>
                            </td>
                            <td className="py-3 text-right flex justify-end gap-2">
                              <button 
                                onClick={() => setViewingResultCard(res)}
                                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-lg transition-colors"
                                title="View Result Card"
                              >
                                <FileText size={16} />
                              </button>
                              <button 
                                onClick={async () => {
                                  try {
                                    await deleteDoc(doc(db, 'results', res.id));
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.DELETE, `results/${res.id}`);
                                  }
                                }}
                                className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition-colors"
                                title="Delete Result"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="w-full lg:w-96 bg-slate-50 rounded-2xl p-6 h-fit flex flex-col max-h-full">
                  <h5 className="font-bold text-slate-800 mb-4 shrink-0">Add Result</h5>
                  <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student</label>
                      <select 
                        value={newResult.studentId}
                        onChange={e => setNewResult({...newResult, studentId: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Student</option>
                        {students.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject Marks</label>
                      {newResult.subjectMarks.map((sm, idx) => (
                        <div key={sm.subject} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                          <span className="text-xs font-bold text-slate-700 w-20 truncate" title={sm.subject}>{sm.subject}</span>
                          <input 
                            type="number" 
                            placeholder="Obt"
                            value={sm.obtained || ''}
                            onChange={e => {
                              const newMarks = [...newResult.subjectMarks];
                              newMarks[idx].obtained = Number(e.target.value);
                              setNewResult({...newResult, subjectMarks: newMarks});
                            }}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-slate-400 text-xs">/</span>
                          <input 
                            type="number" 
                            placeholder="Tot"
                            value={sm.total || ''}
                            onChange={e => {
                              const newMarks = [...newResult.subjectMarks];
                              newMarks[idx].total = Number(e.target.value);
                              setNewResult({...newResult, subjectMarks: newMarks});
                            }}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Overall Grade (Optional)</label>
                      <input 
                        type="text" 
                        value={newResult.grade}
                        onChange={e => setNewResult({...newResult, grade: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="Auto-calculated if empty"
                      />
                    </div>
                  </div>
                  <div className="pt-4 shrink-0 mt-2 border-t border-slate-200">
                    <button 
                      onClick={handleAddResult}
                      className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                    >
                      Save Result
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {viewingResultCard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative print-area"
            >
              {/* Header */}
              <div className="p-6 text-center border-b border-slate-200 relative bg-slate-50/50">
                <button 
                  onClick={() => setViewingResultCard(null)} 
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 no-print"
                >
                  <X size={24} />
                </button>
                <img src="/logo.png" alt="Logo" className="w-28 h-28 mx-auto mb-3 object-contain"  />
                <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">QUAID-E-AZAM MODEL SCHOOL</h3>
                <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1">Academic Result Card</p>
              </div>

              {/* Body */}
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-200 shrink-0">
                    {students.find((s: any) => s.id === viewingResultCard.studentId)?.imageUrl ? (
                      <img 
                        src={students.find((s: any) => s.id === viewingResultCard.studentId)?.imageUrl} 
                        alt="Student" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                        {students.find((s: any) => s.id === viewingResultCard.studentId)?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 leading-tight">
                      {students.find((s: any) => s.id === viewingResultCard.studentId)?.name || 'Unknown Student'}
                    </h4>
                    <p className="text-slate-500 font-medium mt-1">
                      Roll No: <span className="text-slate-900">{students.find((s: any) => s.id === viewingResultCard.studentId)?.rollNumber || 'N/A'}</span>
                    </p>
                    <p className="text-slate-500 font-medium">
                      Class: <span className="text-slate-900">{students.find((s: any) => s.id === viewingResultCard.studentId)?.class || 'N/A'} - {students.find((s: any) => s.id === viewingResultCard.studentId)?.section || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Examination</p>
                        <p className="font-bold text-slate-900">{exams.find((e: any) => e.id === viewingResultCard.examId)?.title || 'Unknown Exam'}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{exams.find((e: any) => e.id === viewingResultCard.examId)?.subject || 'Unknown Subject'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          (viewingResultCard.marksObtained / viewingResultCard.totalMarks) >= 0.4 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                        )}>
                          {(viewingResultCard.marksObtained / viewingResultCard.totalMarks) >= 0.4 ? 'Pass' : 'Fail'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {viewingResultCard.subjectMarks && viewingResultCard.subjectMarks.length > 0 && (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-bold text-slate-600">Subject</th>
                            <th className="px-4 py-2 font-bold text-slate-600 text-center">Total</th>
                            <th className="px-4 py-2 font-bold text-slate-600 text-center">Obtained</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {viewingResultCard.subjectMarks.filter(sm => sm.total > 0).map((sm, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-4 py-2 font-medium text-slate-800">{sm.subject}</td>
                              <td className="px-4 py-2 text-center text-slate-500">{sm.total}</td>
                              <td className="px-4 py-2 text-center font-bold text-slate-900">{sm.obtained}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-center border border-blue-100/50">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Marks</p>
                      <p className="text-lg font-black text-blue-700">
                        {viewingResultCard.marksObtained}<span className="text-xs text-blue-400 font-bold">/{viewingResultCard.totalMarks}</span>
                      </p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-2xl text-center border border-amber-100/50">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">Grade</p>
                      <p className="text-lg font-black text-amber-600">{viewingResultCard.grade}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-2xl text-center border border-purple-100/50">
                      <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1">Perc.</p>
                      <p className="text-lg font-black text-purple-600">
                        {Math.round((viewingResultCard.marksObtained / viewingResultCard.totalMarks) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-between items-end">
                    <div className="text-center">
                      <div className="w-24 h-px bg-slate-200 mb-2"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class Teacher</p>
                    </div>
                    <div className="text-center flex flex-col items-center relative">
                      <div className="w-28 border-t border-slate-300 pt-1 mt-12">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Principal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 flex justify-between items-center border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium italic">Computer generated result card. No signature required.</p>
                <button 
                  onClick={handlePrint}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors no-print"
                  title="Print Result"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
