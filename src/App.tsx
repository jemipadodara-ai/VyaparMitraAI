import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AudioRecorder } from './components/AudioRecorder';
import { TaskForm } from './components/TaskForm';
import { StructuredTaskCard } from './components/StructuredTaskCard';
import { TaskBoard } from './components/TaskBoard';
import { FinancialChart } from './components/FinancialChart';
import { LanguageHelpModal } from './components/LanguageHelpModal';
import { AuthModal } from './components/AuthModal';
import { ExtractedTaskData, TaskStatus, UserAccount } from './types';
import {
  fetchUsersFromDb,
  createUserInDb,
  fetchTasksFromDb,
  saveTaskToDb,
  updateTaskStatusInDb,
  deleteTaskFromDb,
  clearUserTasksInDb,
  subscribeToTasks,
  subscribeToUsers,
} from './services/api';
import {
  Sparkles,
  Store,
  Users,
  Trash2,
  Database,
  Cloud,
  Mic,
  FileEdit,
  Zap,
  Activity,
  Layers,
  ShoppingBag,
  TrendingUp,
  LayoutDashboard,
} from 'lucide-react';

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    businessName: 'Tirupati Kirana Stores',
    ownerName: 'Rameshbhai Patel',
    phoneNumber: '9898012345',
    pin: '',
    businessType: 'Retailer',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-2',
    businessName: 'Shreeji Fashion Distributors',
    ownerName: 'Prakash Shah',
    phoneNumber: '9825098765',
    pin: '',
    businessType: 'Wholesaler',
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  // Load User Accounts
  const [allUsers, setAllUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('vyaparmitra_all_users');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user accounts from local storage', e);
    }
    return DEFAULT_USERS;
  });

  // Active Logged-In User
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const savedId = localStorage.getItem('vyaparmitra_active_user_id');
      if (savedId) {
        const found = allUsers.find((u) => u.id === savedId);
        if (found) return found;
      }
    } catch (e) {
      console.error('Failed to load active user', e);
    }
    return allUsers[0] || DEFAULT_USERS[0];
  });

  // User-Wise Task Database State
  const [tasks, setTasks] = useState<ExtractedTaskData[]>(() => {
    if (!currentUser) return [];
    try {
      const saved = localStorage.getItem(`vyaparmitra_tasks_${currentUser.id}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load user tasks from local storage', e);
    }
    return [];
  });

  const [currentTask, setCurrentTask] = useState<ExtractedTaskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [entryMode, setEntryMode] = useState<'voice' | 'form'>('voice');
  const [activeSection, setActiveSection] = useState('overview');

  // Global keyboard shortcut (Ctrl+K or Cmd+K) to quick focus on voice prompt input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setEntryMode('voice');
        setActiveSection('voice');
        const el = document.getElementById('section-input-area');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        const inputEl = document.getElementById('text-task-input') as HTMLTextAreaElement | null;
        if (inputEl) {
          setTimeout(() => inputEl.focus(), 150);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync Users from Cloud Firestore and SQLite on Mount
  useEffect(() => {
    fetchUsersFromDb().then((dbUsers) => {
      if (dbUsers && dbUsers.length > 0) {
        setAllUsers(dbUsers);
        localStorage.setItem('vyaparmitra_all_users', JSON.stringify(dbUsers));
      } else {
        // Seed default users
        DEFAULT_USERS.forEach((u) => createUserInDb(u));
      }
    });

    // Real-time listener for user profile updates
    const unsubscribeUsers = subscribeToUsers((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setAllUsers(cloudUsers);
        localStorage.setItem('vyaparmitra_all_users', JSON.stringify(cloudUsers));
      }
    });

    return () => {
      unsubscribeUsers();
    };
  }, []);

  // Save All Users list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vyaparmitra_all_users', JSON.stringify(allUsers));
    } catch (e) {
      console.error('Failed to save all users', e);
    }
  }, [allUsers]);

  // When active currentUser changes, load and subscribe to private task database in Cloud Firestore + SQLite
  useEffect(() => {
    if (!currentUser) return;
    localStorage.setItem('vyaparmitra_active_user_id', currentUser.id);

    // Initial fetch from Cloud Firestore / SQLite
    fetchTasksFromDb(currentUser.id).then((dbTasks) => {
      if (dbTasks && dbTasks.length > 0) {
        setTasks(dbTasks);
        localStorage.setItem(`vyaparmitra_tasks_${currentUser.id}`, JSON.stringify(dbTasks));
      } else {
        const saved = localStorage.getItem(`vyaparmitra_tasks_${currentUser.id}`);
        if (saved) {
          setTasks(JSON.parse(saved));
        } else {
          setTasks([]);
        }
      }
      setCurrentTask(null);
    });

    // Real-time subscription to Cloud Firestore tasks
    const unsubscribeTasks = subscribeToTasks(currentUser.id, (cloudTasks) => {
      if (cloudTasks && cloudTasks.length >= 0) {
        setTasks(cloudTasks);
        localStorage.setItem(`vyaparmitra_tasks_${currentUser.id}`, JSON.stringify(cloudTasks));
      }
    });

    return () => {
      unsubscribeTasks();
    };
  }, [currentUser]);

  // Save tasks to user's private local storage whenever updated
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`vyaparmitra_tasks_${currentUser.id}`, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to local storage', e);
    }
  }, [tasks, currentUser]);

  // Handle Login User selection
  const handleLoginUser = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  // Handle New Account Creation
  const handleCreateAccount = async (newAcc: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const created: UserAccount = {
      ...newAcc,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    await createUserInDb(created);
    setAllUsers((prev) => [...prev, created]);
    setCurrentUser(created);
    setTasks([]); // Starts completely clean
    setIsAuthOpen(false);
  };

  // Clear current user's database
  const handleClearUserDatabase = async () => {
    if (!currentUser) return;
    if (window.confirm(`Clear all database records for "${currentUser.businessName}"? This cannot be undone.`)) {
      await clearUserTasksInDb(currentUser.id);
      setTasks([]);
      setCurrentTask(null);
      localStorage.removeItem(`vyaparmitra_tasks_${currentUser.id}`);
    }
  };

  // Total pending amount calculation across tasks
  const pendingAmountSum = tasks.reduce((sum, t) => {
    if (t.paymentStatus === 'Pending' || t.paymentStatus === 'Partial') {
      return sum + (t.amount || 0);
    }
    return sum;
  }, 0);

  // Handle task parsed from AudioRecorder
  const handleTaskParsed = (newTask: ExtractedTaskData) => {
    setCurrentTask(newTask);
    // Smooth scroll to card result
    setTimeout(() => {
      const element = document.getElementById(`task-card-${newTask.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Save current card to registry board & Cloud Firestore + SQLite DB
  const handleSaveTaskToBoard = async (taskToSave: ExtractedTaskData) => {
    if (currentUser) {
      await saveTaskToDb(currentUser.id, taskToSave);
    }
    setTasks((prev) => {
      const existsIndex = prev.findIndex((t) => t.id === taskToSave.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = taskToSave;
        return updated;
      }
      return [taskToSave, ...prev];
    });
  };

  // Update task status from Board
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    await updateTaskStatusInDb(taskId, newStatus, currentUser?.id);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Delete task from Board
  const handleDeleteTask = async (taskId: string) => {
    await deleteTaskFromDb(taskId, currentUser?.id);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (currentTask && currentTask.id === taskId) {
      setCurrentTask(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 font-sans flex flex-row selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Synora Collapsible Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        entryMode={entryMode}
        setEntryMode={setEntryMode}
        taskCount={tasks.length}
        pendingAmountSum={pendingAmountSum}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          taskCount={tasks.length}
          pendingAmountSum={pendingAmountSum}
          currentUser={currentUser}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onNewTaskClick={() => {
            setEntryMode('voice');
            const el = document.getElementById('section-input-area');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Content View */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
          {/* User Database Status Banner (Synora Glass Panel) */}
          <div className="bg-[#0F1422]/90 border border-white/[0.08] rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-extrabold text-white">
                    {currentUser ? currentUser.businessName : 'Select Profile'}
                  </h1>
                  <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {currentUser?.businessType || 'Retailer'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-2 flex-wrap mt-0.5">
                  <span>Owner: <strong className="text-slate-200">{currentUser?.ownerName || 'Guest'}</strong></span>
                  <span>•</span>
                  <span>Phone: {currentUser?.phoneNumber || 'N/A'}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-sm">
                    <Cloud className="w-3 h-3 text-emerald-400 animate-pulse" />
                    Cloud Firestore (Live Sync • {tasks.length} Records)
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                id="btn-switch-account"
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-bold flex items-center gap-1.5 border border-white/[0.08] shadow-sm transition active:scale-95"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Switch / New DB</span>
              </button>

              {tasks.length > 0 && (
                <button
                  id="btn-clear-db"
                  onClick={handleClearUserDatabase}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 transition"
                  title="Clear Database Records for Current Business"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear DB</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Entry Mode Switcher (Synora Tab Pill Style) */}
          <div className="flex items-center justify-between bg-[#0F1422]/90 border border-white/[0.08] rounded-2xl p-1.5 shadow-sm backdrop-blur-xl">
            <button
              type="button"
              onClick={() => {
                setEntryMode('voice');
                setActiveSection('voice');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                entryMode === 'voice'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Voice & AI Text Extractor (વાણી / AI સ્પીચ)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEntryMode('form');
                setActiveSection('form');
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                entryMode === 'form'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              <span>Direct Task Form Insertion (મેન્યુઅલ ફોર્મ)</span>
            </button>
          </div>

          {/* Section 2: Input Content Area based on Mode */}
          <section id="section-input-area">
            {entryMode === 'voice' ? (
              <AudioRecorder
                onTaskParsed={handleTaskParsed}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            ) : (
              <TaskForm
                onSaveTask={(newTask) => {
                  handleSaveTaskToBoard(newTask);
                  handleTaskParsed(newTask);
                }}
              />
            )}
          </section>

          {/* Section 3: Extracted Task / Order Result Card */}
          {currentTask && (
            <section id="section-extracted-card" className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs uppercase tracking-widest font-mono font-bold text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>EXTRACTED TASK CARD & WHATSAPP CONFIRMATION</span>
                </h2>
                <span className="text-[11px] text-emerald-300 font-mono font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Live Editable
                </span>
              </div>

              <StructuredTaskCard
                task={currentTask}
                onSaveTask={handleSaveTaskToBoard}
              />
            </section>
          )}

          {/* Section 4: Financial Expense & Gains Chart */}
          <section id="section-financial-chart">
            <FinancialChart tasks={tasks} />
          </section>

          {/* Section 5: Saved Task Board & Registry */}
          <section id="section-task-board">
            <TaskBoard
              tasks={tasks}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              onSelectTaskToView={(task) => {
                setCurrentTask(task);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </section>
        </main>

        {/* Mobile Floating Quick Dock (visible on mobile only) */}
        <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-[#0F1422]/95 backdrop-blur-xl border border-white/[0.12] rounded-full px-3 py-2 shadow-2xl flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSection('overview');
              const el = document.getElementById('financial-analytics-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-2 rounded-full transition ${
              activeSection === 'overview'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Overview"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveSection('voice');
              setEntryMode('voice');
              const el = document.getElementById('section-input-area');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-2 rounded-full transition ${
              entryMode === 'voice' && activeSection === 'voice'
                ? 'bg-emerald-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Voice AI"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveSection('form');
              setEntryMode('form');
              const el = document.getElementById('section-input-area');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-2 rounded-full transition ${
              entryMode === 'form'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Task Form"
          >
            <FileEdit className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveSection('registry');
              const el = document.getElementById('section-task-board');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-2 rounded-full transition ${
              activeSection === 'registry'
                ? 'bg-cyan-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Board"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setActiveSection('financial');
              const el = document.getElementById('financial-analytics-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`p-2 rounded-full transition ${
              activeSection === 'financial'
                ? 'bg-purple-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Financials"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>

        {/* Synora Footer */}
        <footer className="px-6 py-4 border-t border-white/[0.08] bg-[#0B0F17]/95 text-slate-400 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold gap-2 shadow-inner">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Gemma Engine: <span className="text-emerald-400 font-bold">Operational</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 font-mono">
              <Cloud className="w-3 h-3 text-emerald-400" />
              Cloud Database: <span className="text-emerald-400 font-bold">Firestore (Connected)</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="font-mono">Gujarati Speech TTS: <span className="text-emerald-400 font-bold">Active</span></span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span>VyaparMitra AI SaaS</span>
            <span>•</span>
            <span>Synora Edition</span>
          </div>
        </footer>
      </div>

      {/* Language Help Modal */}
      <LanguageHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Auth & Database Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onLoginUser={handleLoginUser}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
}
