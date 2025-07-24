import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Calendar, ShoppingCart, Timer, Plus, Edit, CheckCircle2, 
  Users, Sun, Moon, Leaf, AlertCircle, User, Star, Trophy,
  Play, Pause, RotateCcw, Bell, Settings, Home, List,
  ChevronLeft, ChevronRight, Target, Flame, Award,
  UserCircle, Palette, Volume2, VolumeX, Share2,
  Clock, Grid3x3, BarChart3, LogOut, LogIn, Mail,
  Lock, Trash2, Send, MessageCircle, Gift, Zap,
  TrendingUp, Repeat,
  MapPin, Mic, Paperclip, Hash, Users2, X
} from 'lucide-react';

// Local Storage Keys
const STORAGE_KEYS = {
  USER: 'tt_user',
  FAMILY: 'tt_family',
  FAMILY_MEMBERS: 'tt_family_members',
  TASKS: 'tt_tasks',
  SHOPPING_ITEMS: 'tt_shopping_items',
  REWARDS: 'tt_rewards',
  ACHIEVEMENTS: 'tt_achievements',
  SETTINGS: 'tt_settings'
};

// Local Storage Helper Functions
const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }
};

// Types
type User = { 
  id: string; 
  email: string;
  familyId?: string;
};

type TaskPriority = 'high' | 'medium' | 'low';
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
type ViewType = 'dashboard' | 'tasks' | 'calendar' | 'shopping' | 'timer' | 'family' | 'stats' | 'rewards';
type CalendarView = 'day' | 'week' | 'month';
type ThemeColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';
type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

interface Family {
  id: string;
  name: string;
  created_at: string;
  settings: any;
  invite_code: string;
}

interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: 'parent' | 'child';
  avatar: string;
  display_name: string;
  color: string;
  points: number;
  streak: number;
  joined_at: string;
}

interface Task {
  id: string;
  family_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to: string;
  created_by: string;
  due_date: string;
  estimated_minutes: number;
  points: number;
  category: string;
  recurrence_type: RecurrenceType;
  recurrence_data?: any;
  location?: string;
  attachments?: string[];
  created_at: string;
  completed_at?: string;
  parent_task_id?: string;
}

interface ShoppingItem {
  id: string;
  family_id: string;
  name: string;
  category: string;
  quantity: number;
  unit?: string;
  added_by: string;
  completed: boolean;
  urgent: boolean;
  notes?: string;
  created_at: string;
}

interface Reward {
  id: string;
  family_id: string;
  name: string;
  description: string;
  points_required: number;
  icon: string;
  created_by: string;
  available: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: any;
  points: number;
}

// Context
interface AppContextType {
  user: User | null;
  family: Family | null;
  familyMembers: FamilyMember[];
  currentMember: FamilyMember | null;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const AppContext = createContext<AppContextType>({
  user: null,
  family: null,
  familyMembers: [],
  currentMember: null,
  isDark: true,
  setIsDark: () => {},
  themeColor: 'purple',
  setThemeColor: () => {},
});

// Utility function for class names
const cn = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Theme configurations
const themes: Record<ThemeColor, { primary: string; secondary: string; accent: string; gradient: string }> = {
  purple: { primary: '#8B5CF6', secondary: '#A78BFA', accent: '#DDD6FE', gradient: 'from-purple-500 to-pink-500' },
  blue: { primary: '#3B82F6', secondary: '#60A5FA', accent: '#DBEAFE', gradient: 'from-blue-500 to-cyan-500' },
  green: { primary: '#10B981', secondary: '#34D399', accent: '#D1FAE5', gradient: 'from-green-500 to-emerald-500' },
  orange: { primary: '#F59E0B', secondary: '#FBBF24', accent: '#FEF3C7', gradient: 'from-orange-500 to-yellow-500' },
  pink: { primary: '#EC4899', secondary: '#F472B6', accent: '#FCE7F3', gradient: 'from-pink-500 to-rose-500' }
};

// Components

// Auth Component
const AuthScreen = ({ onAuthSuccess }: { onAuthSuccess: (user: User, family: Family) => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (isSignUp) {
        // Sign up logic
        if (!familyName && !inviteCode) {
          throw new Error('Please enter a family name or invite code');
        }

        // Create user
        const userId = `user_${Date.now()}`;
        const newUser: User = {
          id: userId,
          email,
          familyId: undefined
        };

        // Create or join family
        let family: Family;
        let familyMembers: FamilyMember[] = [];

        if (inviteCode) {
          // Try to join existing family
          const families: Family[] = storage.get(STORAGE_KEYS.FAMILY) || [];
          family = families.find(f => f.invite_code === inviteCode) as Family;
          
          if (!family) {
            throw new Error('Invalid invite code');
          }
          
          familyMembers = storage.get(`${STORAGE_KEYS.FAMILY_MEMBERS}_${family.id}`) || [];
        } else {
          // Create new family
          const familyId = `family_${Date.now()}`;
          family = {
            id: familyId,
            name: familyName,
            created_at: new Date().toISOString(),
            settings: {},
            invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
          };
          
          const families = storage.get(STORAGE_KEYS.FAMILY) || [];
          families.push(family);
          storage.set(STORAGE_KEYS.FAMILY, families);
        }

        // Add user to family
        const avatars = ['👨', '👩', '👦', '👧', '👶', '🧑', '👨‍🦱', '👩‍🦰', '🧔', '👱'];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        
        const newMember: FamilyMember = {
          id: `member_${Date.now()}`,
          family_id: family.id,
          user_id: userId,
          role: familyMembers.length === 0 ? 'parent' : 'child',
          avatar: randomAvatar,
          display_name: email.split('@')[0],
          color: '#8B5CF6',
          points: 0,
          streak: 0,
          joined_at: new Date().toISOString()
        };

        familyMembers.push(newMember);
        
        // Add demo family members for new families
        if (!inviteCode && familyName.toLowerCase().includes('demo')) {
          const demoMembers: FamilyMember[] = [
            {
              id: `member_${Date.now() + 1}`,
              family_id: family.id,
              user_id: `user_demo_1`,
              role: 'parent',
              avatar: '👩',
              display_name: 'Mom',
              color: '#EC4899',
              points: 120,
              streak: 5,
              joined_at: new Date().toISOString()
            },
            {
              id: `member_${Date.now() + 2}`,
              family_id: family.id,
              user_id: `user_demo_2`,
              role: 'child',
              avatar: '👦',
              display_name: 'Alex',
              color: '#3B82F6',
              points: 85,
              streak: 3,
              joined_at: new Date().toISOString()
            },
            {
              id: `member_${Date.now() + 3}`,
              family_id: family.id,
              user_id: `user_demo_3`,
              role: 'child',
              avatar: '👧',
              display_name: 'Emma',
              color: '#10B981',
              points: 95,
              streak: 7,
              joined_at: new Date().toISOString()
            }
          ];
          familyMembers.push(...demoMembers);
        }
        
        storage.set(`${STORAGE_KEYS.FAMILY_MEMBERS}_${family.id}`, familyMembers);

        // Save user
        newUser.familyId = family.id;
        storage.set(STORAGE_KEYS.USER, newUser);

        // Initialize default rewards for new family
        if (!inviteCode) {
          const defaultRewards: Reward[] = [
            { id: '1', family_id: family.id, name: 'Ice Cream', description: 'Your favorite flavor!', points_required: 50, icon: '🍦', created_by: userId, available: true },
            { id: '2', family_id: family.id, name: 'Movie Night', description: 'Choose the family movie', points_required: 100, icon: '🎬', created_by: userId, available: true },
            { id: '3', family_id: family.id, name: 'Extra Screen Time', description: '30 minutes extra', points_required: 30, icon: '📱', created_by: userId, available: true },
            { id: '4', family_id: family.id, name: 'Stay Up Late', description: '30 minutes past bedtime', points_required: 75, icon: '🌙', created_by: userId, available: true }
          ];
          storage.set(`${STORAGE_KEYS.REWARDS}_${family.id}`, defaultRewards);

          // Add sample tasks for demo
          const demoMemberIds = familyName.toLowerCase().includes('demo') ? 
            familyMembers.map(m => m.id) : 
            [newMember.id];
            
          const sampleTasks: Task[] = [
            {
              id: `task_${Date.now()}`,
              family_id: family.id,
              title: 'Welcome to TogetherTracker!',
              description: 'Complete this task to earn your first points',
              priority: 'medium',
              status: 'pending',
              assigned_to: demoMemberIds[0],
              created_by: userId,
              due_date: new Date().toISOString(),
              estimated_minutes: 5,
              points: 10,
              category: 'general',
              recurrence_type: 'none',
              created_at: new Date().toISOString()
            },
            {
              id: `task_${Date.now() + 1}`,
              family_id: family.id,
              title: 'Clean your room',
              description: 'Make your bed and organize your desk',
              priority: 'high',
              status: 'pending',
              assigned_to: demoMemberIds[Math.min(2, demoMemberIds.length - 1)],
              created_by: userId,
              due_date: new Date().toISOString(),
              estimated_minutes: 20,
              points: 15,
              category: 'cleaning',
              recurrence_type: 'daily',
              created_at: new Date().toISOString()
            },
            {
              id: `task_${Date.now() + 2}`,
              family_id: family.id,
              title: 'Take out the trash',
              description: 'Empty all bins and take to the curb',
              priority: 'medium',
              status: 'pending',
              assigned_to: demoMemberIds[Math.min(3, demoMemberIds.length - 1)],
              created_by: userId,
              due_date: new Date(Date.now() + 86400000).toISOString(),
              estimated_minutes: 10,
              points: 10,
              category: 'chores',
              recurrence_type: 'weekly',
              created_at: new Date().toISOString()
            }
          ];
          storage.set(`${STORAGE_KEYS.TASKS}_${family.id}`, sampleTasks);
        }

        onAuthSuccess(newUser, family);
      } else {
        // Sign in logic
        const savedUser = storage.get(STORAGE_KEYS.USER);
        
        if (!savedUser || savedUser.email !== email) {
          throw new Error('Invalid email or password');
        }

        const families: Family[] = storage.get(STORAGE_KEYS.FAMILY) || [];
        const family = families.find(f => f.id === savedUser.familyId);
        
        if (!family) {
          throw new Error('Family not found');
        }

        onAuthSuccess(savedUser, family);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignup = () => {
    setIsSignUp(true);
    setEmail('demo@family.com');
    setPassword('demo123');
    setFamilyName('The Demo Family');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4"
          >
            <Users className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800">TogetherTracker</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your family account' : 'Welcome back!'}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="family@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Family Name
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="The Awesome Family"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invite Code (optional)
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter code to join existing family"
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </motion.button>

          <div className="text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-xs text-purple-700 mb-2">
              Demo: Just sign up with any email to try it out!
            </p>
            <button
              onClick={handleDemoSignup}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium underline"
            >
              Click here to auto-fill demo credentials
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Enhanced Task Card with real-time updates
const TaskCard = ({ 
  task, 
  onComplete, 
  onEdit, 
  onDelete,
  familyMembers,
  isDark 
}: { 
  task: Task; 
  onComplete: (id: string) => void; 
  onEdit: (task: Task) => void; 
  onDelete: (id: string) => void;
  familyMembers: FamilyMember[];
  isDark: boolean;
}) => {
  const [dragX, setDragX] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const assignedMember = familyMembers.find(m => m.id === task.assigned_to);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onComplete(task.id);
    } else if (info.offset.x < -100) {
      onDelete(task.id);
    }
    setDragX(0);
  };

  const priorityColors = {
    high: { bg: 'bg-red-500/20', text: 'text-red-500', border: 'border-red-500/30' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/30' },
    low: { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500/30' }
  };

  const colors = priorityColors[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      onDragEnd={handleDragEnd}
      onDrag={(event, info) => setDragX(info.offset.x)}
      className={cn(
        "relative rounded-2xl p-4 cursor-grab active:cursor-grabbing",
        "border-2 transition-all duration-300 shadow-lg",
        isDark ? "bg-zinc-900/90 border-zinc-800" : "bg-white border-zinc-200",
        "backdrop-blur-sm hover:shadow-xl",
        task.status === 'completed' && "opacity-60"
      )}
      style={{ x: dragX }}
    >
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-gradient-to-r from-green-500/20 to-green-500/10 rounded-l-2xl flex items-center justify-start pl-4">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
          <span className="ml-2 text-green-500 font-medium">Complete</span>
        </div>
        <div className="flex-1 bg-gradient-to-l from-red-500/20 to-red-500/10 rounded-r-2xl flex items-center justify-end pr-4">
          <span className="mr-2 text-red-500 font-medium">Delete</span>
          <Trash2 className="h-6 w-6 text-red-500" />
        </div>
      </div>

      {/* Task Content */}
      <div className="relative z-10 bg-inherit rounded-2xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                "font-semibold text-lg",
                isDark ? "text-white" : "text-zinc-900",
                task.status === 'completed' && "line-through"
              )}>
                {task.title}
              </h3>
              <div className={cn("px-2 py-1 rounded-full text-xs font-medium", colors.bg, colors.text)}>
                {task.priority}
              </div>
              {task.points > 0 && (
                <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-yellow-500 font-medium">{task.points}pts</span>
                </div>
              )}
            </div>
            {task.description && (
              <p className={cn(
                "text-sm mb-2",
                isDark ? "text-zinc-400" : "text-zinc-600"
              )}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Task Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {assignedMember && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {assignedMember.avatar}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  isDark ? "text-zinc-300" : "text-zinc-700"
                )}>
                  {assignedMember.display_name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span className={cn(
                "text-sm",
                isDark ? "text-zinc-400" : "text-zinc-600"
              )}>
                {task.estimated_minutes}m
              </span>
            </div>
            {task.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-zinc-500" />
                <span className={cn(
                  "text-sm",
                  isDark ? "text-zinc-400" : "text-zinc-600"
                )}>
                  {task.location}
                </span>
              </div>
            )}
            {task.recurrence_type !== 'none' && (
              <div className="flex items-center gap-1">
                <Repeat className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-purple-500">
                  {task.recurrence_type}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "p-2 rounded-full transition-colors",
                isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
              )}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4 text-zinc-500" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "p-2 rounded-full transition-colors",
                isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
              )}
              onClick={() => onEdit(task)}
            >
              <Edit className="h-4 w-4 text-zinc-500" />
            </motion.button>
            {task.status !== 'completed' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500/30"
                onClick={() => onComplete(task.id)}
              >
                <CheckCircle2 className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className={cn(
                      "flex-1 px-3 py-1 rounded-lg text-sm",
                      isDark 
                        ? "bg-zinc-800 text-white placeholder-zinc-400" 
                        : "bg-zinc-100 text-zinc-900 placeholder-zinc-500"
                    )}
                  />
                  <button className="p-1 rounded-lg bg-purple-500 text-white">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Dashboard Component
const Dashboard = ({ tasks, familyMembers, isDark }: { tasks: Task[]; familyMembers: FamilyMember[]; isDark: boolean }) => {
  const todayTasks = tasks.filter(t => {
    const dueDate = new Date(t.due_date);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  });

  const upcomingTasks = tasks.filter(t => {
    const dueDate = new Date(t.due_date);
    const today = new Date();
    return dueDate > today && t.status !== 'completed';
  }).slice(0, 5);

  const topPerformers = [...familyMembers].sort((a, b) => b.points - a.points).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Welcome Section */}
      <div className={cn(
        "p-6 rounded-3xl",
        "bg-gradient-to-r from-purple-500 to-pink-500",
        "text-white"
      )}>
        <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-purple-100">
          You have {todayTasks.filter(t => t.status !== 'completed').length} tasks to complete today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            "p-4 rounded-2xl border-2",
            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-purple-500" />
            <span className="text-2xl font-bold text-purple-500">{todayTasks.length}</span>
          </div>
          <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-600")}>
            Today's Tasks
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            "p-4 rounded-2xl border-2",
            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-bold text-green-500">
              {Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%
            </span>
          </div>
          <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-600")}>
            Completion Rate
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            "p-4 rounded-2xl border-2",
            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-500">
              {familyMembers.reduce((acc, m) => acc + m.points, 0)}
            </span>
          </div>
          <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-600")}>
            Total Points
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            "p-4 rounded-2xl border-2",
            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-2xl font-bold text-orange-500">
              {Math.max(...familyMembers.map(m => m.streak))}
            </span>
          </div>
          <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-600")}>
            Best Streak
          </p>
        </motion.div>
      </div>

      {/* Upcoming Tasks */}
      <div className={cn(
        "p-6 rounded-2xl border-2",
        isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        <h2 className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-zinc-900")}>
          Upcoming Tasks
        </h2>
        <div className="space-y-3">
          {upcomingTasks.map(task => {
            const assignee = familyMembers.find(m => m.id === task.assigned_to);
            return (
              <div
                key={task.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  isDark ? "bg-zinc-800/50" : "bg-zinc-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    task.priority === 'high' ? "bg-red-500" :
                    task.priority === 'medium' ? "bg-yellow-500" :
                    "bg-green-500"
                  )} />
                  <div>
                    <p className={cn("font-medium", isDark ? "text-white" : "text-zinc-900")}>
                      {task.title}
                    </p>
                    <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-600")}>
                      Due {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {assignee && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                    {assignee.avatar}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className={cn(
        "p-6 rounded-2xl border-2",
        isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
      )}>
        <h2 className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-zinc-900")}>
          Top Performers
        </h2>
        <div className="space-y-3">
          {topPerformers.map((member, index) => (
            <div
              key={member.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                isDark ? "bg-zinc-800/50" : "bg-zinc-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                  index === 0 ? "bg-yellow-500 text-white" :
                  index === 1 ? "bg-gray-400 text-white" :
                  "bg-orange-600 text-white"
                )}>
                  {index + 1}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {member.avatar}
                </div>
                <div>
                  <p className={cn("font-medium", isDark ? "text-white" : "text-zinc-900")}>
                    {member.display_name}
                  </p>
                  <p className={cn("text-sm", isDark ? "text-zinc-400" : "text-zinc-600")}>
                    {member.points} points • {member.streak} day streak
                  </p>
                </div>
              </div>
              {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Rewards Shop Component
const RewardsShop = ({ rewards, userPoints, onRedeem, isDark }: {
  rewards: Reward[];
  userPoints: number;
  onRedeem: (rewardId: string) => void;
  isDark: boolean;
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = ['all', 'treats', 'privileges', 'experiences', 'items'];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Points Balance */}
      <div className={cn(
        "p-6 rounded-3xl",
        "bg-gradient-to-r from-yellow-500 to-orange-500",
        "text-white"
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-100">Your Balance</p>
            <p className="text-4xl font-bold">{userPoints} Points</p>
          </div>
          <Zap className="h-12 w-12 text-yellow-200" />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full capitalize whitespace-nowrap",
              selectedCategory === category
                ? "bg-purple-500 text-white"
                : isDark 
                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            )}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {rewards.map(reward => {
          const canAfford = userPoints >= reward.points_required;
          
          return (
            <motion.div
              key={reward.id}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "p-4 rounded-2xl border-2",
                isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200",
                !canAfford && "opacity-60"
              )}
            >
              <div className="text-4xl mb-3">{reward.icon}</div>
              <h3 className={cn(
                "font-semibold mb-1",
                isDark ? "text-white" : "text-zinc-900"
              )}>
                {reward.name}
              </h3>
              <p className={cn(
                "text-sm mb-3",
                isDark ? "text-zinc-400" : "text-zinc-600"
              )}>
                {reward.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className={cn(
                    "font-bold",
                    canAfford ? "text-yellow-500" : "text-zinc-500"
                  )}>
                    {reward.points_required}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!canAfford}
                  onClick={() => onRedeem(reward.id)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm font-medium",
                    canAfford
                      ? "bg-purple-500 text-white hover:bg-purple-600"
                      : "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                  )}
                >
                  Redeem
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Main App Component
const TogetherTracker = () => {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [themeColor, setThemeColor] = useState<ThemeColor>('purple');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showMemberSwitch, setShowMemberSwitch] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assigned_to: '',
    estimated_minutes: 30,
    points: 10,
    category: 'general'
  });

  // Load saved data on mount
  useEffect(() => {
    const savedUser = storage.get(STORAGE_KEYS.USER);
    const savedSettings = storage.get(STORAGE_KEYS.SETTINGS) || {};
    
    if (savedSettings.isDark !== undefined) setIsDark(savedSettings.isDark);
    if (savedSettings.themeColor) setThemeColor(savedSettings.themeColor);
    
    if (savedUser && savedUser.familyId) {
      const families: Family[] = storage.get(STORAGE_KEYS.FAMILY) || [];
      const userFamily = families.find(f => f.id === savedUser.familyId);
      
      if (userFamily) {
        setUser(savedUser);
        setFamily(userFamily);
        loadFamilyData(userFamily.id, savedUser.id);
      }
    }
    
    setLoading(false);
  }, []);

  // Save settings when they change
  useEffect(() => {
    storage.set(STORAGE_KEYS.SETTINGS, { isDark, themeColor });
  }, [isDark, themeColor]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMemberSwitch(false);
    };

    if (showMemberSwitch) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMemberSwitch]);

  const loadFamilyData = (familyId: string, userId: string) => {
    // Load family members
    const members = storage.get(`${STORAGE_KEYS.FAMILY_MEMBERS}_${familyId}`) || [];
    setFamilyMembers(members);
    
    const currentUserMember = members.find((m: FamilyMember) => m.user_id === userId);
    setCurrentMember(currentUserMember || null);
    
    // Load tasks
    const savedTasks = storage.get(`${STORAGE_KEYS.TASKS}_${familyId}`) || [];
    setTasks(savedTasks);
    
    // Load shopping items
    const savedShopping = storage.get(`${STORAGE_KEYS.SHOPPING_ITEMS}_${familyId}`) || [];
    setShoppingItems(savedShopping);
    
    // Load rewards
    const savedRewards = storage.get(`${STORAGE_KEYS.REWARDS}_${familyId}`) || [];
    setRewards(savedRewards);
  };

  const handleAuthSuccess = (authUser: User, authFamily: Family) => {
    setUser(authUser);
    setFamily(authFamily);
    loadFamilyData(authFamily.id, authUser.id);
  };

  const handleSignOut = () => {
    storage.remove(STORAGE_KEYS.USER);
    setUser(null);
    setFamily(null);
    setFamilyMembers([]);
    setCurrentMember(null);
    setTasks([]);
    setShoppingItems([]);
    setRewards([]);
  };

  // Save data whenever it changes
  useEffect(() => {
    if (family) {
      storage.set(`${STORAGE_KEYS.TASKS}_${family.id}`, tasks);
    }
  }, [tasks, family]);

  useEffect(() => {
    if (family) {
      storage.set(`${STORAGE_KEYS.FAMILY_MEMBERS}_${family.id}`, familyMembers);
    }
  }, [familyMembers, family]);

  useEffect(() => {
    if (family) {
      storage.set(`${STORAGE_KEYS.SHOPPING_ITEMS}_${family.id}`, shoppingItems);
    }
  }, [shoppingItems, family]);

  useEffect(() => {
    if (family) {
      storage.set(`${STORAGE_KEYS.REWARDS}_${family.id}`, rewards);
    }
  }, [rewards, family]);

  // Task functions
  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Update task status
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: 'completed' as TaskStatus, completed_at: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);
    
    // Award points
    const member = familyMembers.find(m => m.id === task.assigned_to);
    if (member) {
      const updatedMembers = familyMembers.map(m => 
        m.id === member.id ? { ...m, points: m.points + task.points, streak: m.streak + 1 } : m
      );
      setFamilyMembers(updatedMembers);
      
      // Update current member if it's the one who completed the task
      if (currentMember && currentMember.id === member.id) {
        setCurrentMember({ ...currentMember, points: currentMember.points + task.points, streak: currentMember.streak + 1 });
      }
      
      // Show notification
      setNotifications(prev => [...prev, `🎉 ${member.display_name} earned ${task.points} points!`]);
      setTimeout(() => setNotifications(prev => prev.slice(1)), 3000);
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const addTask = () => {
    if (!newTask.title || !newTask.assigned_to || !family) return;
    
    const task: Task = {
      id: `task_${Date.now()}`,
      family_id: family.id,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
      assigned_to: newTask.assigned_to,
      created_by: user?.id || '',
      due_date: new Date().toISOString(),
      estimated_minutes: newTask.estimated_minutes,
      points: newTask.points,
      category: newTask.category,
      recurrence_type: 'none',
      created_at: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, task]);
    setShowAddTask(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assigned_to: '',
      estimated_minutes: 30,
      points: 10,
      category: 'general'
    });
    
    setNotifications(prev => [...prev, '✅ Task created successfully!']);
    setTimeout(() => setNotifications(prev => prev.slice(1)), 3000);
  };

  const redeemReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || !currentMember || currentMember.points < reward.points_required) return;
    
    // Deduct points
    const updatedMembers = familyMembers.map(m => 
      m.id === currentMember.id ? { ...m, points: m.points - reward.points_required } : m
    );
    setFamilyMembers(updatedMembers);
    setCurrentMember({ ...currentMember, points: currentMember.points - reward.points_required });
    
    // Show notification
    setNotifications(prev => [...prev, `🎁 ${reward.name} redeemed!`]);
    setTimeout(() => setNotifications(prev => prev.slice(1)), 3000);
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard' as const, icon: Home, label: 'Home' },
    { id: 'tasks' as const, icon: List, label: 'Tasks', count: tasks.filter(t => t.status === 'pending').length },
    { id: 'calendar' as const, icon: Calendar, label: 'Calendar' },
    { id: 'shopping' as const, icon: ShoppingCart, label: 'Shopping' },
    { id: 'rewards' as const, icon: Gift, label: 'Rewards' },
    { id: 'family' as const, icon: Users, label: 'Family' }
  ];

  const theme = themes[themeColor];

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      user,
      family,
      familyMembers,
      currentMember,
      isDark,
      setIsDark,
      themeColor,
      setThemeColor
    }}>
      <div className={cn(
        "min-h-screen transition-all duration-300",
        isDark ? "bg-black" : "bg-zinc-50"
      )}>
        {/* Notifications */}
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-lg"
            >
              {notification}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Header */}
        <header className={cn(
          "sticky top-0 z-40 border-b backdrop-blur-sm",
          isDark ? "bg-black/80 border-zinc-800" : "bg-white/80 border-zinc-200"
        )}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <motion.h1 
                className={cn(
                  "text-2xl font-bold bg-clip-text text-transparent",
                  `bg-gradient-to-r ${theme.gradient}`
                )}
                whileHover={{ scale: 1.05 }}
              >
                TogetherTracker
              </motion.h1>
              
              <div className="flex items-center gap-2">
                {currentMember && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMemberSwitch(!showMemberSwitch);
                      }}
                      className="flex items-center gap-2 mr-4 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {currentMember.avatar}
                      </div>
                      <div className={cn("text-sm text-left", isDark ? "text-white" : "text-zinc-900")}>
                        <p className="font-medium">{currentMember.display_name}</p>
                        <p className="text-xs text-purple-500">{currentMember.points} points</p>
                      </div>
                    </button>
                    
                    {/* Member Switch Dropdown */}
                    <AnimatePresence>
                      {showMemberSwitch && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            "absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden",
                            isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200"
                          )}
                        >
                          <div className={cn(
                            "px-3 py-2 text-xs font-medium",
                            isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"
                          )}>
                            Switch User
                          </div>
                          {familyMembers.map(member => (
                            <button
                              key={member.id}
                              onClick={() => {
                                setCurrentMember(member);
                                setShowMemberSwitch(false);
                              }}
                              className={cn(
                                "w-full px-3 py-2 flex items-center gap-2 hover:bg-zinc-800/50 transition-colors",
                                currentMember.id === member.id && "bg-purple-500/20"
                              )}
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm">
                                {member.avatar}
                              </div>
                              <div className="flex-1 text-left">
                                <p className={cn(
                                  "text-sm font-medium",
                                  isDark ? "text-white" : "text-zinc-900"
                                )}>
                                  {member.display_name}
                                </p>
                                <p className="text-xs text-zinc-500">{member.points} points</p>
                              </div>
                              {currentMember.id === member.id && (
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                  )}
                  onClick={() => setIsDark(!isDark)}
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                  )}
                >
                  <Bell className="h-5 w-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                  )}
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-20">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <AnimatePresence mode="wait">
              {activeView === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Dashboard tasks={tasks} familyMembers={familyMembers} isDark={isDark} />
                </motion.div>
              )}

              {activeView === 'tasks' && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className={cn(
                      "text-2xl font-bold",
                      isDark ? "text-white" : "text-zinc-900"
                    )}>
                      All Tasks
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAddTask(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
                    >
                      Add Task
                    </motion.button>
                  </div>

                  {/* Add Task Form */}
                  <AnimatePresence>
                    {showAddTask && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                          "p-6 rounded-2xl border-2",
                          isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
                        )}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className={cn(
                            "text-lg font-semibold",
                            isDark ? "text-white" : "text-zinc-900"
                          )}>
                            Create New Task
                          </h3>
                          <button
                            onClick={() => setShowAddTask(false)}
                            className={cn(
                              "p-1 rounded-lg",
                              isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                            )}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className={cn(
                              "block text-sm font-medium mb-1",
                              isDark ? "text-zinc-300" : "text-zinc-700"
                            )}>
                              Title
                            </label>
                            <input
                              type="text"
                              value={newTask.title}
                              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                              className={cn(
                                "w-full px-3 py-2 rounded-lg border",
                                isDark 
                                  ? "bg-zinc-800 border-zinc-700 text-white" 
                                  : "bg-white border-zinc-300 text-zinc-900"
                              )}
                              placeholder="Enter task title"
                            />
                          </div>

                          <div>
                            <label className={cn(
                              "block text-sm font-medium mb-1",
                              isDark ? "text-zinc-300" : "text-zinc-700"
                            )}>
                              Description
                            </label>
                            <textarea
                              value={newTask.description}
                              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                              className={cn(
                                "w-full px-3 py-2 rounded-lg border",
                                isDark 
                                  ? "bg-zinc-800 border-zinc-700 text-white" 
                                  : "bg-white border-zinc-300 text-zinc-900"
                              )}
                              placeholder="Enter task description"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={cn(
                                "block text-sm font-medium mb-1",
                                isDark ? "text-zinc-300" : "text-zinc-700"
                              )}>
                                Assign to
                              </label>
                              <select
                                value={newTask.assigned_to}
                                onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                                className={cn(
                                  "w-full px-3 py-2 rounded-lg border",
                                  isDark 
                                    ? "bg-zinc-800 border-zinc-700 text-white" 
                                    : "bg-white border-zinc-300 text-zinc-900"
                                )}
                              >
                                <option value="">Select member</option>
                                {familyMembers.map(member => (
                                  <option key={member.id} value={member.id}>
                                    {member.display_name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className={cn(
                                "block text-sm font-medium mb-1",
                                isDark ? "text-zinc-300" : "text-zinc-700"
                              )}>
                                Priority
                              </label>
                              <select
                                value={newTask.priority}
                                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                                className={cn(
                                  "w-full px-3 py-2 rounded-lg border",
                                  isDark 
                                    ? "bg-zinc-800 border-zinc-700 text-white" 
                                    : "bg-white border-zinc-300 text-zinc-900"
                                )}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={cn(
                                "block text-sm font-medium mb-1",
                                isDark ? "text-zinc-300" : "text-zinc-700"
                              )}>
                                Time (minutes)
                              </label>
                              <input
                                type="number"
                                value={newTask.estimated_minutes}
                                onChange={(e) => setNewTask({ ...newTask, estimated_minutes: parseInt(e.target.value) || 0 })}
                                className={cn(
                                  "w-full px-3 py-2 rounded-lg border",
                                  isDark 
                                    ? "bg-zinc-800 border-zinc-700 text-white" 
                                    : "bg-white border-zinc-300 text-zinc-900"
                                )}
                                min="1"
                              />
                            </div>

                            <div>
                              <label className={cn(
                                "block text-sm font-medium mb-1",
                                isDark ? "text-zinc-300" : "text-zinc-700"
                              )}>
                                Points
                              </label>
                              <input
                                type="number"
                                value={newTask.points}
                                onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) || 0 })}
                                className={cn(
                                  "w-full px-3 py-2 rounded-lg border",
                                  isDark 
                                    ? "bg-zinc-800 border-zinc-700 text-white" 
                                    : "bg-white border-zinc-300 text-zinc-900"
                                )}
                                min="0"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={addTask}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
                            >
                              Create Task
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setShowAddTask(false)}
                              className={cn(
                                "px-4 py-2 rounded-lg font-medium",
                                isDark
                                  ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                              )}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="space-y-4">
                    <AnimatePresence>
                      {tasks.filter(t => t.status !== 'completed').map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onComplete={completeTask}
                          onEdit={(task) => {}}
                          onDelete={deleteTask}
                          familyMembers={familyMembers}
                          isDark={isDark}
                        />
                      ))}
                    </AnimatePresence>
                    
                    {tasks.filter(t => t.status !== 'completed').length === 0 && (
                      <div className={cn(
                        "text-center py-12 rounded-2xl border-2 border-dashed",
                        isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-300 text-zinc-500"
                      )}>
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No active tasks</p>
                        <p className="text-sm mt-1">Click "Add Task" to create your first task</p>
                      </div>
                    )}
                  </div>

                  {/* Completed Tasks Section */}
                  {tasks.filter(t => t.status === 'completed').length > 0 && (
                    <div className="mt-8">
                      <h3 className={cn(
                        "text-lg font-semibold mb-3",
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      )}>
                        Completed ({tasks.filter(t => t.status === 'completed').length})
                      </h3>
                      <div className="space-y-2 opacity-60">
                        {tasks.filter(t => t.status === 'completed').map(task => {
                          const assignee = familyMembers.find(m => m.id === task.assigned_to);
                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={cn(
                                "p-3 rounded-lg flex items-center gap-3",
                                isDark ? "bg-zinc-900/30" : "bg-zinc-50"
                              )}
                            >
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                              <div className="flex-1">
                                <span className={cn(
                                  "font-medium line-through",
                                  isDark ? "text-zinc-500" : "text-zinc-400"
                                )}>
                                  {task.title}
                                </span>
                              </div>
                              {assignee && (
                                <div className="text-sm text-zinc-500">
                                  {assignee.avatar} +{task.points}pts
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeView === 'calendar' && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>
                    Task Calendar
                  </h2>
                  <div className={cn(
                    "p-6 rounded-2xl border-2",
                    isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
                  )}>
                    <p className={cn(
                      "text-center py-12",
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    )}>
                      Calendar view coming soon!
                    </p>
                  </div>
                </motion.div>
              )}

              {activeView === 'shopping' && (
                <motion.div
                  key="shopping"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>
                    Shopping List
                  </h2>
                  <div className={cn(
                    "p-6 rounded-2xl border-2",
                    isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
                  )}>
                    <p className={cn(
                      "text-center py-12",
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    )}>
                      Shopping list coming soon!
                    </p>
                  </div>
                </motion.div>
              )}

              {activeView === 'family' && (
                <motion.div
                  key="family"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className={cn(
                    "text-2xl font-bold mb-4",
                    isDark ? "text-white" : "text-zinc-900"
                  )}>
                    Family Members
                  </h2>

                  {/* Family Invite Code */}
                  {family && currentMember?.role === 'parent' && (
                    <div className={cn(
                      "p-4 rounded-2xl border-2",
                      isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
                    )}>
                      <h3 className={cn(
                        "text-lg font-semibold mb-2",
                        isDark ? "text-white" : "text-zinc-900"
                      )}>
                        Invite Family Members
                      </h3>
                      <p className={cn(
                        "text-sm mb-3",
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      )}>
                        Share this code with family members to join
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "flex-1 px-4 py-2 rounded-lg text-lg font-mono font-bold text-center",
                          isDark ? "bg-zinc-800 text-purple-400" : "bg-zinc-100 text-purple-600"
                        )}>
                          {family.invite_code}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigator.clipboard.writeText(family.invite_code);
                            setNotifications(prev => [...prev, '📋 Invite code copied!']);
                            setTimeout(() => setNotifications(prev => prev.slice(1)), 2000);
                          }}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          <Share2 className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyMembers.map(member => (
                      <motion.div
                        key={member.id}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "p-6 rounded-2xl border-2",
                          isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                            {member.avatar}
                          </div>
                          <div className="flex-1">
                            <h3 className={cn(
                              "text-lg font-semibold",
                              isDark ? "text-white" : "text-zinc-900"
                            )}>
                              {member.display_name}
                            </h3>
                            <p className={cn(
                              "text-sm",
                              isDark ? "text-zinc-400" : "text-zinc-600"
                            )}>
                              {member.role === 'parent' ? '👑 Parent' : '⭐ Child'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-yellow-500">{member.points}</p>
                            <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-zinc-600")}>Points</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-orange-500">{member.streak}</p>
                            <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-zinc-600")}>Streak</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-500">
                              {tasks.filter(t => t.assigned_to === member.id && t.status === 'completed').length}
                            </p>
                            <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-zinc-600")}>Done</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeView === 'rewards' && (
                <motion.div
                  key="rewards"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <RewardsShop
                    rewards={rewards}
                    userPoints={currentMember?.points || 0}
                    onRedeem={redeemReward}
                    isDark={isDark}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 border-t backdrop-blur-sm",
          isDark ? "bg-black/80 border-zinc-800" : "bg-white/80 border-zinc-200"
        )}>
          <div className="px-4 py-2">
            <div className="flex justify-around max-w-6xl mx-auto">
              {navItems.map(item => {
                const isActive = activeView === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors relative",
                      isActive 
                        ? `text-${themeColor}-500`
                        : isDark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"
                    )}
                    onClick={() => setActiveView(item.id)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <div className={cn(
                        "absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center",
                        "bg-gradient-to-r from-purple-500 to-pink-500"
                      )}>
                        {item.count}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </AppContext.Provider>
  );
};

export default TogetherTracker;