import React, { useState, useEffect, useMemo } from 'react';
import { Download, Users, Globe, Zap, BookOpen, MessageSquare, Smartphone, BarChart, Settings, LogOut, PlusCircle, User, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../api/axiosInstance.jsx";

// --- MOCK DATA FOR DEMONSTRATION ---
const mockDashboardData = {
  // Connectivity & Device Metrics (Crucial for rural areas)
  activeUsers: 8432,
  mobileUsers: 7120, // High mobile usage is expected
  offlineDownloads: 41290,
  lowBandwidthModeUsers: 5980,

  // Content Metrics
  localizedContentViews: 32100, // Content consumed in regional languages
  totalCourses: 120,
  activeModules: 450,

  // Support & Engagement
  supportTicketsOpen: 12,
  communityHubLogins: 1540, // Users accessing via shared digital hubs
};

// users will be fetched from API

// teachers will be fetched from API

const mockContent = [
  { id: 101, title: 'Basic Math (Gr 5)', languageStatus: 'All Localized', downloads: '15.2K', views: '20.1K', status: 'Live' },
  { id: 102, title: 'Science: Water Cycle', languageStatus: 'Needs Marathi', downloads: '8.1K', views: '11.5K', status: 'Live' },
  { id: 103, title: 'Digital Literacy 101', languageStatus: 'All Localized', downloads: '25.0K', views: '30.9K', status: 'Live' },
  { id: 104, title: 'Vocational Skills: Carpentry', languageStatus: 'English Only', downloads: '0.5K', views: '1.2K', status: 'Draft' },
];

// --- COMPONENTS ---

/**
 * Reusable card for key performance indicators.
 */
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${color} text-white`}>
    <div className="flex items-center justify-between">
      <Icon className="w-8 h-8 opacity-75" />
      <span className="text-3xl font-extrabold">{(Number(value) || 0).toLocaleString()}</span>
    </div>
    <p className="mt-3 text-sm font-medium opacity-90">{title}</p>
  </div>
);


/**
 * Overview Tab Content
 */
const OverviewSection = ({ data }) => {
  const cards = [
    { title: 'Total Active Learners', value: data.activeUsers, icon: Users, color: 'bg-blue-600' }, 
    { title: 'Offline Content Downloads', value: data.offlineDownloads, icon: Download, color: 'bg-teal-600' },
    { title: 'Mobile-Only Users', value: data.mobileUsers, icon: Smartphone, color: 'bg-rose-500' },
    { title: 'Localized Content Views', value: data.localizedContentViews, icon: Globe, color: 'bg-amber-500' },
    { title: 'Low-Bandwidth Mode', value: data.lowBandwidthModeUsers, icon: Zap, color: 'bg-cyan-600' },
    { title: 'Digital Hub Logins', value: data.communityHubLogins, icon: BookOpen, color: 'bg-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Platform Health & Access Metrics</h2>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
      
    </div>
  );
};

/**
 * Content Management Tab Content
 */
const ContentSection = ({ content }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Content Localization & Performance</h2>
    <div className="bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localization Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offline Downloads</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {content.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.languageStatus.includes('All Localized') ? 'bg-green-100 text-green-800' :
                  item.languageStatus.includes('Needs') ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.languageStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.downloads}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.status === 'Live' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => console.log(`Editing content ${item.id}`)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-lg">
      <p className="font-semibold">Action Required:</p>
      <p className="text-sm">Prioritize localization for modules with 'Needs Marathi' status to ensure equitable access.</p>
    </div>
  </div>
);


/**
 * Teacher Management Section (Admin-Added Flow)
 * Now takes addNewTeacher function from props to update the list.
 */
const TeacherManagementSection = ({ teachers, addNewTeacher }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    centerCode: '',
    subjects: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTeacher = (e) => {
    e.preventDefault();

    if (!newTeacher.name || !newTeacher.email) {
      alert("Please provide the teacher's name and email.");
      return;
    }

    // Prepare new teacher object with initial status
    const teacherData = {
        ...newTeacher,
        id: 'T' + Date.now(), // Generate a unique mock ID
        assignedClasses: 'Not assigned',
        status: 'Pending Activation', // New teachers start as Pending
    };

    addNewTeacher(teacherData); // Call the function passed from App to update state
    
    // Show confirmation and reset form
    alert(`Teacher ${newTeacher.name} added! Activation link simulated to be sent to ${newTeacher.email}.`);
    setIsAdding(false);
    setNewTeacher({ name: '', email: '', centerCode: '', subjects: '' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center justify-between">
        Teacher Directory
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md text-sm"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Add New Teacher
        </button>
      </h2>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">Add Teacher (Admin-Added Flow)</h3>
          <form onSubmit={handleAddTeacher} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={newTeacher.name}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email (Activation Link Target)"
              required
              value={newTeacher.email}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              name="centerCode"
              placeholder="Center Code (e.g., SS-DLI-101)"
              value={newTeacher.centerCode}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              name="subjects"
              placeholder="Assigned Subjects (e.g., Science, Math)"
              value={newTeacher.subjects}
              onChange={handleInputChange}
              className="p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="sm:col-span-2 flex justify-end space-x-3 mt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                Create Account & Send Link
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teacher List Table */}
      <div className="bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Center Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Classes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    {teacher.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.centerCode || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.assignedClasses || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    teacher.status === 'Active' ? 'bg-green-100 text-green-800' :
                    teacher.status === 'Pending Activation' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {teacher.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => console.log(`Editing teacher ${teacher.id}`)} className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button onClick={() => console.log(`Resending link for ${teacher.id}`)} className="text-purple-600 hover:text-purple-800">Resend Link</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


/**
 * User Management Tab Content (Combines Learners and Teachers)
 */
const UsersSection = ({ users, teachers, addNewTeacher }) => {
  const [activeSubTab, setActiveSubTab] = useState('learners');
  const isUsersArray = Array.isArray(users);
  const isTeachersArray = Array.isArray(teachers);

  const renderSubContent = () => {
    if (activeSubTab === 'learners') {
      return (
        <div className="bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Learner Directory</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(isUsersArray ? users : []).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Smartphone className="w-4 h-4 mr-2 text-gray-400" />
                      {user?.device || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user?.lastLogin || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user?.language || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.status || 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return <TeacherManagementSection teachers={isTeachersArray ? teachers : []} addNewTeacher={addNewTeacher} />;
    }
  };

  const SubTab = ({ name, id }) => (
    <button
      onClick={() => setActiveSubTab(id)}
      className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors duration-200 ${
        activeSubTab === id
          ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-t'
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-b border-gray-200'
      }`}
    >
      {name}
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
      
      {/* Sub Tabs for Learners/Teachers */}
      <div className="flex border-b border-gray-200 -mb-4">
        <SubTab name="Learners (Students)" id="learners" />
        <SubTab name="Teachers" id="teachers" />
      </div>

      <div className="pt-4">
        {renderSubContent()}
      </div>
    </div>
  );
};


/**
 * Core Dashboard View
 */
const CoreDashboard = ({ data, users, teachers, content, addNewTeacher }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { logout } = useAuth();

  const navigation = useMemo(() => [
    { name: 'Overview', href: 'overview', icon: BarChart, current: activeTab === 'overview' },
    { name: 'Content', href: 'content', icon: BookOpen, current: activeTab === 'content' },
    { name: 'Users', href: 'users', icon: Users, current: activeTab === 'users' },
    { name: 'Support', href: 'support', icon: MessageSquare, current: activeTab === 'support' },
    { name: 'Settings', href: 'settings', icon: Settings, current: activeTab === 'settings' },
  ], [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection data={data} />;
      case 'content':
        return <ContentSection content={content} />;
      case 'users':
        return <UsersSection users={users} teachers={teachers} addNewTeacher={addNewTeacher} />;
      case 'support':
        return (
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Support & Community</h2>
            <p className="text-xl text-blue-600 font-semibold mb-2">{data.supportTicketsOpen} Open Tickets</p>
            <p className="text-gray-600">This section would show live support queue and track usage of community digital hubs.</p>
            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-lg">
              <p className="font-semibold">Digital Hub Logins: {data.communityHubLogins.toLocaleString()}</p>
              <p className="text-sm">These logins often represent multiple students sharing a device, critical for tracking true reach.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Platform Settings</h2>
            <p className="text-gray-600">Manage localization settings, API keys, and low-bandwidth mode configurations here.</p>
          </div>
        );
      default:
        return <OverviewSection data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center py-4 px-4 bg-white shadow-md rounded-xl mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-700">
          <Link to="/admin-dashboard">Welcome Admin</Link>
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600 hidden sm:block">Admin User</span>
          <Link to="/admin-settings" className="text-blue-600 hover:text-blue-700">Settings</Link>
          <button
            onClick={logout}
            className="flex items-center text-red-600 hover:text-red-700 transition duration-150 p-2 rounded-lg hover:bg-red-50"
            aria-label="Log out"
          >
            <LogOut className="w-5 h-5 mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar/Mobile Tabs */}
        <nav className="lg:w-64 bg-white p-4 rounded-xl shadow-lg lg:sticky lg:top-8 self-start">
          <div className="flex lg:flex-col lg:space-y-2 overflow-x-auto whitespace-nowrap">
            {navigation.map((item) => (
              <a
                key={item.name}
                href="#"
                onClick={(e) => { e.preventDefault(); setActiveTab(item.href); }}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                  item.current
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                } mr-2 lg:mr-0 lg:w-full`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium text-sm">{item.name}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};


/**
 * Main Application Component - Now handles state for Teachers
 */
const App = () => {
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addNewTeacher = (newTeacherData) => {
    // This UI flow remains mock; real creation should be via separate admin endpoint
    setTeachers(prev => [...prev, newTeacherData]);
  };

  useEffect(() => {
    let isActive = true;
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [u, t] = await Promise.all([
          axios.get('/admin/users'),
          axios.get('/admin/teachers')
        ]);
        if (!isActive) return;
        setUsers(Array.isArray(u?.data?.users) ? u.data.users : []);
        const normalized = (Array.isArray(t?.data?.teachers) ? t.data.teachers : []).map((te) => ({
          id: te?._id,
          name: te?.userId?.name || 'Unknown',
          centerCode: '',
          assignedClasses: `${(te?.classes?.length || 0)} classes`,
          subjects: '',
          status: 'Active'
        }));
        setTeachers(normalized);
      } catch (e) {
        if (!isActive) return;
        setError('Failed to load admin data');
        setUsers([]);
        setTeachers([]);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchAll();
    return () => { isActive = false; };
  }, []);

  const dashboardData = mockDashboardData;
  const contentData = mockContent;

  return (
    <>
      {loading && <div className="p-4">Loading...</div>}
      {error && !loading && <div className="p-4 text-red-600 text-sm">{error}</div>}
      {!loading && (
        <CoreDashboard
          data={dashboardData}
          users={(Array.isArray(users) ? users : []).map(u => ({ id: u?._id, name: u?.name || 'Unknown', device: '', lastLogin: '', status: 'Active', language: '' }))}
          teachers={Array.isArray(teachers) ? teachers : []}
          content={contentData}
          addNewTeacher={addNewTeacher}
        />
      )}
    </>
  );
};

export default App;
