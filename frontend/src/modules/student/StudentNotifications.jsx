import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { studentNotifications as initialNotifications } from '../../data/notificationData.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

// --- Helper Icons for different notification types ---
const GradeIcon = () => <div className="bg-green-100 rounded-full p-2"><svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
const AssignmentIcon = () => <div className="bg-blue-100 rounded-full p-2"><svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-5.22-6.862l-1.588-1.588a2 2 0 010-2.828l.004-.004a2 2 0 012.828 0l1.588 1.588m10.44-2.274l-1.588 1.588a2 2 0 01-2.828 0l-.004-.004a2 2 0 010-2.828l1.588-1.588" /></svg></div>;
const AnnouncementIcon = () => <div className="bg-yellow-100 rounded-full p-2"><svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.354a1.76 1.76 0 013.417-.592z" /></svg></div>;

const NOTIFICATION_ICONS = {
  grade: <GradeIcon />,
  assignment: <AssignmentIcon />,
  announcement: <AnnouncementIcon />,
};

// --- Main Component ---
export default function StudentNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => filter === 'unread' ? !n.read : true);
  }, [notifications, filter]);

  // Group notifications by date for a better UX
  const groupedNotifications = useMemo(() => {
    const groups = { Today: [], Yesterday: [], 'Older': [] };
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filteredNotifications.forEach(n => {
      const notificationDate = new Date(n.timestamp);
      if (notificationDate.toDateString() === today.toDateString()) {
        groups.Today.push(n);
      } else if (notificationDate.toDateString() === yesterday.toDateString()) {
        groups.Yesterday.push(n);
      } else {
        groups.Older.push(n);
      }
    });
    return groups;
  }, [filteredNotifications]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header user={{ name: "Sanjana Chavan" }} />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Link to="/student-dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
          </div>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
              <p className="text-slate-500 mt-1">Check for new grades, assignments, and announcements.</p>
            </div>
            <button 
              onClick={handleMarkAllAsRead}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition disabled:text-slate-400"
              disabled={notifications.every(n => n.read)}
            >
              Mark all as read
            </button>
          </div>
          
          {/* Filter Tabs */}
          <div className="mb-6 flex border-b">
            <button 
              onClick={() => setFilter('all')} 
              className={`py-2 px-4 font-medium transition ${filter === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')} 
              className={`py-2 px-4 font-medium transition ${filter === 'unread' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Unread
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-8">
            {Object.entries(groupedNotifications).map(([group, items]) => (
              items.length > 0 && (
                <div key={group}>
                  <h2 className="text-sm font-bold text-slate-500 uppercase pb-2 mb-4 border-b">{group}</h2>
                  <div className="space-y-4">
                    {items.map(n => (
                      <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl transition-all ${n.read ? 'bg-white' : 'bg-blue-50 border border-blue-200'}`}>
                        {NOTIFICATION_ICONS[n.type]}
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800">{n.title}</h3>
                          <p className="text-slate-600 text-sm mt-1">{n.message}</p>
                          <div className="mt-3">
                            {!n.read && (
                              <button onClick={() => handleMarkAsRead(n.id)} className="text-xs font-semibold text-blue-600 hover:underline">
                                Mark as Read
                              </button>
                            )}
                          </div>
                        </div>
                        {!n.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5"></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
             {filteredNotifications.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg">
                    <h3 className="text-lg font-medium text-slate-800">All caught up!</h3>
                    <p className="text-slate-500 mt-1">You have no new notifications.</p>
                </div>
             )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}