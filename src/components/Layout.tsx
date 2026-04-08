import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  Kanban, 
  LogOut, 
  Menu, 
  X,
  User,
  Sparkles
} from 'lucide-react';
import { auth } from '../firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Discovery', path: '/discovery' },
    { icon: Kanban, label: 'Pipeline CRM', path: '/pipeline' },
  ];

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-[#111827] font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-white border-r border-[#E5E7EB] flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-[#111827]">
              <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span>D2C Flow</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-[#EEF2FF] text-[#4F46E5] font-medium shadow-sm" 
                  : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
              )}
            >
              <item.icon className={cn("w-5 h-5", isSidebarOpen ? "" : "mx-auto")} />
              {isSidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E5E7EB]">
          <div className={cn("flex items-center gap-3 p-2", isSidebarOpen ? "" : "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center border border-[#E5E7EB]">
              <User className="w-4 h-4 text-[#6B7280]" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{auth.currentUser?.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-[#EF4444] hover:bg-[#FEF2F2] transition-colors",
              isSidebarOpen ? "" : "justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-[#E5E7EB] px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-[#6B7280]">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
