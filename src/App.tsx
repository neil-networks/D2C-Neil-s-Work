import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import Layout from './components/Layout';
import DiscoveryEngine from './components/DiscoveryEngine';
import PipelineCRM from './components/PipelineCRM';
import Dashboard from './components/Dashboard';
import { Sparkles, LogIn, Loader2 } from 'lucide-react';

// Auth Context
const AuthContext = React.createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = React.useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
}

function Login() {
  const { user, loading } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  if (loading) return null;
  if (user) return <Navigate to={from} replace />;

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-[#4F46E5] rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-[#4F46E5]/20 rotate-3">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-[#111827]">D2C Flow</h1>
            <p className="text-[#6B7280] text-lg">The intelligent brand onboarding platform.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Welcome back</h3>
            <p className="text-sm text-[#9CA3AF]">Sign in with your Google account to access the platform.</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#111827] text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-black/10 group"
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            Continue with Google
          </button>
        </div>

        <p className="text-xs text-[#9CA3AF]">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

// Auth Context
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/discovery" element={<PrivateRoute><DiscoveryEngine /></PrivateRoute>} />
          <Route path="/pipeline" element={<PrivateRoute><PipelineCRM /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
