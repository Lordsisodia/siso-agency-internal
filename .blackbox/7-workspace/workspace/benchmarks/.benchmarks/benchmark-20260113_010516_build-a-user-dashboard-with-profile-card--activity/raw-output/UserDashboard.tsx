import React, { useState, useEffect } from 'react';
import { User, Activity, Settings, Bell, Shield, CreditCard } from 'lucide-react';

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinedAt: string;
}

interface ActivityItem {
  id: string;
  type: 'login' | 'update' | 'purchase' | 'settings' | 'security';
  description: string;
  timestamp: string;
  icon?: React.ReactNode;
}

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
}

interface SettingsForm {
  username: string;
  email: string;
  bio: string;
  notifications: boolean;
  twoFactor: boolean;
}

// Mock data
const mockUser: UserProfile = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: 'Product Designer',
  joinedAt: '2023-06-15',
};

const mockActivities: ActivityItem[] = [
  { id: '1', type: 'login', description: 'Logged in from San Francisco, CA', timestamp: '2 minutes ago' },
  { id: '2', type: 'update', description: 'Updated profile picture', timestamp: '1 hour ago' },
  { id: '3', type: 'purchase', description: 'Subscribed to Pro plan', timestamp: 'Yesterday' },
  { id: '4', type: 'settings', description: 'Changed password', timestamp: '2 days ago' },
  { id: '5', type: 'security', description: 'Enabled 2FA', timestamp: '3 days ago' },
  { id: '6', type: 'login', description: 'Logged in from New York, NY', timestamp: '4 days ago' },
  { id: '7', type: 'update', description: 'Updated email preferences', timestamp: '5 days ago' },
  { id: '8', type: 'purchase', description: 'Purchased template pack', timestamp: '1 week ago' },
  { id: '9', type: 'settings', description: 'Connected Slack account', timestamp: '1 week ago' },
  { id: '10', type: 'login', description: 'Logged in from London, UK', timestamp: '2 weeks ago' },
];

const mockStats: StatCard[] = [
  { id: '1', label: 'Total Logins', value: '247', trend: '+12 this week', icon: <Activity className="w-5 h-5" /> },
  { id: '2', label: 'Last Login', value: '2 min ago', icon: <Activity className="w-5 h-5" /> },
  { id: '3', label: 'Account Age', value: '7 months', icon: <User className="w-5 h-5" /> },
  { id: '4', label: 'Pro Member', value: 'Since Oct 2023', icon: <CreditCard className="w-5 h-5" /> },
];

// Components
const ProfileCard: React.FC<{ user: UserProfile }> = ({ user }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-center space-x-4">
      <img
        src={user.avatar}
        alt={user.name}
        className="w-20 h-20 rounded-full bg-gray-100"
      />
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
        <p className="text-gray-500">{user.email}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
          {user.role}
        </span>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Member since {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
    </div>
  </div>
);

const StatCardComponent: React.FC<{ stat: StatCard }> = ({ stat }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{stat.label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
        {stat.trend && (
          <p className="text-sm text-green-600 mt-1">{stat.trend}</p>
        )}
      </div>
      <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
        {stat.icon}
      </div>
    </div>
  </div>
);

const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login': return <Activity className="w-4 h-4" />;
      case 'update': return <User className="w-4 h-4" />;
      case 'purchase': return <CreditCard className="w-4 h-4" />;
      case 'settings': return <Settings className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login': return 'bg-blue-50 text-blue-600';
      case 'update': return 'bg-purple-50 text-purple-600';
      case 'purchase': return 'bg-green-50 text-green-600';
      case 'settings': return 'bg-orange-50 text-orange-600';
      case 'security': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} flex-shrink-0`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900">{activity.description}</p>
              <p className="text-sm text-gray-500">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsForm: React.FC = () => {
  const [form, setForm] = useState<SettingsForm>({
    username: 'Alex Johnson',
    email: 'alex@example.com',
    bio: '',
    notifications: true,
    twoFactor: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Validation
    if (!form.username.trim()) {
      setError('Username is required');
      setIsLoading(false);
      return;
    }

    if (!form.email.includes('@')) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);

    // Reset success message after 3 seconds
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">Settings saved successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Tell us about yourself"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={form.notifications}
              onChange={(e) => setForm({ ...form, notifications: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Email notifications</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={form.twoFactor}
              onChange={(e) => setForm({ ...form, twoFactor: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Two-factor authentication</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

// Main Dashboard Component
const UserDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-6 h-6" />
              </button>
              <img
                src={mockUser.avatar}
                alt="Profile"
                className="w-10 h-10 rounded-full bg-gray-100"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mockStats.map((stat) => (
            <StatCardComponent key={stat.id} stat={stat} />
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <ProfileCard user={mockUser} />
            <SettingsForm />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            <ActivityFeed activities={mockActivities} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
