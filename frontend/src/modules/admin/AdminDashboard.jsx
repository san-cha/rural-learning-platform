import React, { useState, useEffect, useMemo } from 'react';
import { Download, Users, Globe, Zap, BookOpen, MessageSquare, Smartphone, BarChart, Settings, LogOut, PlusCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../api/axiosInstance.jsx";
import { CogIcon } from 'lucide-react';
import TicketSubmissionForm from "../../components/TicketSubmissionForm.jsx";

// --- MOCK DATA FOR DEMONSTRATION ---

const mockContent = [
  { id: 101, title: 'Basic Math (Gr 5)', languageStatus: 'All Localized', downloads: '15.2K', views: '20.1K', status: 'Live' },
  { id: 102, title: 'Science: Water Cycle', languageStatus: 'Needs Marathi', downloads: '8.1K', views: '11.5K', status: 'Live' },
  { id: 103, title: 'Digital Literacy 101', languageStatus: 'All Localized', downloads: '25.0K', views: '30.9K', status: 'Live' },
  { id: 104, title: 'Vocational Skills: Carpentry', languageStatus: 'English Only', downloads: '0.5K', views: '1.2K', status: 'Draft' },
];

// --- COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`p-5 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] ${color} text-white`}>
    <div className="flex items-center justify-between">
      <Icon className="w-8 h-8 opacity-75" />
      <span className="text-3xl font-extrabold">{value}</span>
    </div>
    <p className="mt-3 text-sm font-medium opacity-90">{title}</p>
  </div>
);


const OverviewSection = ({ metrics }) => {
  const cards = metrics || [];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Platform Health & Access Metrics</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
};

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
        id: 'T' + Date.now(),
        assignedClasses: 'Not assigned',
        status: 'Pending Activation',
    };

    addNewTeacher(teacherData);
    
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

// Add this definition in the COMPONENTS section near the top of AdminDashboard.jsx
const TechnicianDirectory = ({ technicians }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Technician Directory ({technicians.length})</h3>
        <ul className="mt-4 space-y-2">
            {technicians.length === 0 ? (
                <li className="text-gray-500">No technicians found.</li>
            ) : (
                technicians.map(t => (
                    <li key={t.id} className="text-sm">{t.name} - Status: {t.status}</li>
                ))
            )}
        </ul>
    </div>
);

// Now, the UsersSection component (around line 348) can safely call it.

const UsersSection = ({ learners, teachers, technicians, addNewTeacher }) => {
  const [activeSubTab, setActiveSubTab] = useState('learners');
  const isTeachersArray = Array.isArray(teachers);

  const renderSubContent = () => {
    // Note: You must ensure 'learners', 'teachers', and 'technicians' state arrays are defined
    // and populated by the filtering logic in your useEffect.

    if (activeSubTab === 'learners') {
      return (
        <div className="bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Learner Directory</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/*  FIX: Changed 'users' to the filtered 'learners' array */}
              {/* NOTE: You need to ensure 'learners' is used here, and replace 'isUsersArray' 
                 with an appropriate check like 'Array.isArray(learners)' or use a dedicated 'isLearnersArray' state/check. 
                 I've used 'Array.isArray(learners)' as the safer option here. */}
              {(Array.isArray(learners) ? learners : []).map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {/* Learner Name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user?.name || 'Unknown'}</td>

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
    }

    else if (activeSubTab === 'teachers') {
      // ✅ Correct - uses the dedicated 'teachers' array
      return <TeacherManagementSection teachers={Array.isArray(teachers) ? teachers : []} addNewTeacher={addNewTeacher} />;
    }

    else if (activeSubTab === 'technicians') {
      return (
        <TechnicianDirectory 
           // ✅ Correct - uses the dedicated 'technicians' array
           technicians={Array.isArray(technicians) ? technicians : []} 
           // Pass any technician-specific handlers here
        />
      );
    }

    return <div>Select a sub-tab.</div>;

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

  <div className="flex space-x-1 border-b border-gray-200">
    
    {/* 1. Learners (Students) Tab */}
    <SubTab name="Learners (Students)" id="learners" />
    
    {/* 2. Teachers Tab */}
    <SubTab name="Teachers" id="teachers" />
    
    {/* 3. 🆕 Technicians Tab */}
    <SubTab name="Technicians" id="technicians" /> 
    
  </div>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
      
      <div className="flex border-b border-gray-200 -mb-4">
        <SubTab name="Learners (Students)" id="learners" />
        <SubTab name="Teachers" id="teachers" />
        <SubTab name="Technicians" id="technicians" /> 
      </div>

      <div className="pt-4">
        {renderSubContent()}
      </div>
    </div>
  );
};


const CoreDashboard = ({ data, learners, teachers, technicians, content, addNewTeacher, metrics }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { logout } = useAuth();

  const navigation = useMemo(() => [
    { name: 'Overview', href: 'overview', icon: BarChart, current: activeTab === 'overview' },
    { name: 'Content', href: 'content', icon: BookOpen, current: activeTab === 'content' },
    { name: 'Users', href: 'users', icon: Users, current: activeTab === 'users' },
    { name: 'Support', href: 'support', icon: MessageSquare, current: activeTab === 'support' },
  ], [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection metrics={metrics} data={data} />;
        
      case 'content':
        return <ContentSection content={content} />;
        
      case 'users':
        return (
            <UsersSection 
                learners={learners} // 🚨 PASS THIS
                teachers={teachers} 
                technicians={technicians} // 🚨 PASS THIS
                addNewTeacher={addNewTeacher} 
            />
        );
        
      case 'support': // <-- This is the ONE, merged, working case
        return (
            <div className="space-y-6"> 
                
                {/* 1. Support Metrics Display (Content from the second block, now using safe access) */}
                <div className="p-6 bg-white rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Support & Community</h2>
                    {/* Ensure safe access using optional chaining (data?.supportTicketsOpen) */}
                    <p className="text-xl text-blue-600 font-semibold mb-2">
                    </p>
                    <p className="text-gray-600">This section shows live support queue and community login data.</p>
                </div>

                {/* 2. TICKET SUBMISSION FORM (NEW COMPONENT from the first block) */}
                <TicketSubmissionForm 
                    // Add a callback here later if you want the count to refresh automatically
                />
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

        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// const getDashboardData = (stats) => {
//     if (!mockDashboardData || !mockDashboardData.metrics) {
//         return { metrics: [] };
//     }

//     const updatedMetrics = mockDashboardData.metrics.map(metric => {
//         if (metric.title === "Total Active Learners") {
//             return { ...metric, value: stats.students.toLocaleString() };
//         } 
//         else if (metric.title === "Total Active Teachers") {
//             return { ...metric, value: stats.teachers.toLocaleString() };
//         }
//         else if (metric.title === "Active Classes/Courses") {
//             return { ...metric, value: stats.classes.toLocaleString() };
//         }
//         return metric;
//     });
//     
//     // 🛑 CRITICAL FIX: Ensure the other non-metric properties use the real stats too
//     // If you were tracking 'openTickets' or 'logins' in your /admin/stats endpoint, 
//     // you'd update those properties here as well. Since your API only returns students/teachers/classes, 
//     // we'll pass the stats object through or default to 0.
//     return {
//         ...mockDashboardData,
//         metrics: updatedMetrics,
//         supportTicketsOpen: stats.supportTicketsOpen || 0, // Default to 0 if not in API response
//         communityHubLogins: stats.communityHubLogins || 0, // Default to 0 if not in API response
//     };
// };


const AdminDashboard = () => {
  const [someState, setSomeState] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contentModules, setContentModules] = useState([]);

  // CRITICAL: Initialize ALL dynamic stats here
  const [stats, setStats] = useState({ 
    students: 0, 
    teachers: 0, 
    technicians: 0, 
    supportTicketsOpen: 0, 
    communityHubLogins: 0 
  });

  const [learners, setLearners] = useState([]); 
  const [technicians, setTechnicians] = useState([]);

  const addNewTeacher = (newTeacherData) => {
    setTeachers(prev => [...prev, newTeacherData]);
  };

  // CORRECT: Define metrics array INSIDE the component body
  const metrics = [
    // DYNAMIC CARDS
    { 
      title: 'Total Active Learners', 
      value: stats.students, 
      icon: Users, 
      color: 'bg-blue-600' 
    }, 
    { 
      title: 'Total Active Teachers', 
      value: stats.teachers, 
      icon: User, 
      color: 'bg-indigo-600' 
    }, 
    { 
      title: 'Total Technicians', 
      value: stats.technicians, 
      icon: CogIcon,
      color: 'bg-purple-600' 
    },
    
    { 
        title: 'Open Tickets', 
        value: stats.supportTicketsOpen, // <--- Using the state property
        icon: MessageSquare,             
        color: 'bg-teal-600'             
    },
    // STATIC/MOCK CARDS
    { title: 'Mobile-Only Users', value: '7,120', icon: Smartphone, color: 'bg-rose-500' },
    { title: 'Low-Bandwidth Mode', value: '5,980', icon: Zap, color: 'bg-cyan-600' },
  ];

  useEffect(() => {
    let isActive = true;
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [u, t, s] = await Promise.all([ 
          axios.get('/admin/users'),
          axios.get('/admin/teachers'),
          axios.get('/admin/stats') 
        ]);
        if (!isActive) return;
        
        // Set the fetched stats, merge with defaults for safety
        setStats(prev => ({ ...prev, ...s.data }));

        // Corrected fetchContentModules function structure:

      const fetchContentModules = async () => {
      try {
          // 🎯 Use axios.get for consistency with /admin/users and /admin/stats
          // This ensures the URL prefix and Authorization headers are handled correctly.
          const response = await axios.get('/admin/content'); 
          
          // Axios response data is automatically parsed and stored in the .data property
          const data = response.data; 
          
          if (data.success && Array.isArray(data.modules)) {
              const normalizedModules = data.modules.map(mod => ({
                  id: mod._id,
                  title: mod.title || 'Untitled Module',
                  localization: mod.localizationStatus || 'English Only',
                  downloads: mod.offlineDownloads 
                              ? `${(mod.offlineDownloads / 1000).toFixed(1)}K` 
                              : '0K',
                  status: mod.status || 'Draft',
              }));
              setContentModules(normalizedModules);
          } else {
              console.error("Failed to fetch modules:", data.message);
          }
      } catch (error) {
          // Now you can properly check for 401/404 errors here
          console.error("Network error fetching content:", error);
      }
  };    

      // Ensure you call this new function inside your useEffect:
      fetchContentModules();

        // ✅ NEW FILTERED SECTION ✅

        // 1. Get raw users data from the /admin/users endpoint response (u)
        const rawUsers = Array.isArray(u?.data?.users) ? u.data.users : [];

        // 2. Filter raw data into three separate role arrays:

        // Filter Learners (Students)
        const learnersData = rawUsers
            .filter(user => user.role === 'student' || user.role === 'learner')
            .map(u => ({
                id: u?._id,
                name: u?.name || 'Unknown Learner',
                status: u?.isActive ? 'Active' : 'Inactive',
                // If you need more fields, map them here:
                // device: u?.deviceType || '—', 
                // lastActivity: u?.lastLogin || '—',
            }));
        setLearners(learnersData); // Assumes you defined: const [learners, setLearners] = useState([]);

        // Filter Technicians
        const techniciansData = rawUsers
            .filter(user => user.role === 'technician')
            .map(u => ({
                id: u?._id,
                name: u?.name || 'Unknown Technician',
                status: u?.isActive ? 'Active' : 'Inactive',
            }));
        setTechnicians(techniciansData); // Assumes you defined: const [technicians, setTechnicians] = useState([]);

        // 3. Process Teachers (using the dedicated /admin/teachers endpoint response (t))
        const normalizedTeachers = (Array.isArray(t?.data?.teachers) ? t.data.teachers : []).map((te) => ({
            id: te?._id,
            name: te?.userId?.name || 'Unknown',
            centerCode: '',
            assignedClasses: `${(te?.classes?.length || 0)} classes`,
            subjects: '',
            status: 'Active'
        }));
        setTeachers(normalizedTeachers);

      } catch (e) {
        if (!isActive) return;
        setError('Failed to load admin data'); 
        setUsers([]);
        setTeachers([]);
        setStats({ students: 0, teachers: 0, classes: 0, supportTicketsOpen: 0, communityHubLogins: 0 });
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchAll();
    return () => { isActive = false; };
  }, []);

const contentData = mockContent;

  return (
    <>
      {/* 1. Display the error message at the top if one exists */}
      {error && <div className="p-4 text-red-600 font-medium bg-red-100 border-l-4 border-red-500 mb-4">{error}</div>}

      {/* 2. Display the loading state */}
      {loading && <div className="p-4">Loading Dashboard Data...</div>}

      {/* 3. Render the CoreDashboard always when not loading, 
            regardless of the error state, to keep the navigation visible. */}
      {/* You should ensure 'contentData' is defined before this. */}
      {!loading && (
        <CoreDashboard
          users={(Array.isArray(users) ? users : []).map(u => ({ id: u?._id, name: u?.name || 'Unknown', status: 'Active' }))}
          teachers={Array.isArray(teachers) ? teachers : []}
          learners={Array.isArray(learners) ? learners : []}
          technicians={Array.isArray(technicians) ? technicians : []}
          content={contentData}
          addNewTeacher={addNewTeacher}
          contentModules={contentModules}
          metrics={metrics} // <--- CRITICAL: Pass the metrics array for the Overview cards!
          // We need to pass the stats object for the Support tab as well
          stats={stats}
        />
      )}
      
      {/* NOTE: If you want the CoreDashboard to be hidden entirely on error, 
        revert to your original logic and focus on fixing the 401 error first.
      */}
    </>
  );
};

export default AdminDashboard;