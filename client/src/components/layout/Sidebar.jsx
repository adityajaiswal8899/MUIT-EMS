import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  Ticket,
  CheckCircle2,
  Award,
  MessageSquare,
  User,
  Users,
  QrCode,
  FileSpreadsheet,
  Settings,
  LogOut,
  FolderKanban,
  ShieldAlert
} from 'lucide-react';

const Sidebar = ({ activeTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  const getMenuItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Manage Students', icon: Users },
        { id: 'organizers', label: 'Manage Organizers', icon: ShieldAlert },
        { id: 'events', label: 'All Campus Events', icon: FolderKanban },
        { id: 'registrations', label: 'All Registrations', icon: Ticket },
        { id: 'attendance', label: 'Attendance Logs', icon: CheckCircle2 },
        { id: 'certificates', label: 'Certificates Master', icon: Award },
        { id: 'feedbacks', label: 'Student Feedback', icon: MessageSquare },
        { id: 'profile', label: 'Admin Profile', icon: User },
      ];
    }

    if (user?.role === 'organizer') {
      return [
        { id: 'dashboard', label: 'Organizer Overview', icon: LayoutDashboard },
        { id: 'create-event', label: 'Create New Event', icon: CalendarPlus },
        { id: 'manage-events', label: 'Manage My Events', icon: Calendar },
        { id: 'registrations', label: 'Event Registrations', icon: Ticket },
        { id: 'qr-scanner', label: 'QR Attendance Scanner', icon: QrCode, badge: 'Live Scanner' },
        { id: 'participants', label: 'Verified Participants', icon: Users },
        { id: 'certificates', label: 'Issue Certificates', icon: Award },
        { id: 'profile', label: 'Organizer Profile', icon: User },
      ];
    }

    // Student default
    return [
      { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
      { id: 'browse-events', label: 'Browse Events', icon: Calendar },
      { id: 'my-events', label: 'My Registered Events', icon: FolderKanban },
      { id: 'my-qr', label: 'My QR Event Passes', icon: Ticket, badge: 'Fast Pass' },
      { id: 'attendance', label: 'My Attendance', icon: CheckCircle2 },
      { id: 'certificates', label: 'My Certificates', icon: Award },
      { id: 'feedback', label: 'Submit Feedback', icon: MessageSquare },
      { id: 'profile', label: 'Student Profile', icon: User },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-5rem)] sticky top-20 shadow-sm shrink-0">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* User Mini Card with MUIT Emblem */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <img
            src="/muit_logo.png"
            alt="MUIT"
            className="w-10 h-10 rounded-full object-contain bg-white p-0.5 shadow-sm ring-2 ring-amber-400/60 shrink-0"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
            <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-muit-100 text-muit-800">
              {user?.role} Portal
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isCurrent
                    ? 'bg-muit-50 text-muit-700 font-semibold shadow-sm border border-muit-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isCurrent ? 'text-muit-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
