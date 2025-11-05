import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; 
import { useAuth } from '../../contexts/AuthContext.jsx'; 

// Import icons
import { 
  FaTicketAlt, 
  FaSpinner, 
  FaExclamationCircle, 
  FaWrench, 
  FaSignOutAlt,
  FaUserCircle,
  FaFolderOpen,
  FaCheckCircle 
} from 'react-icons/fa';

// --- SINGLE SOURCE OF MOCK DATA ---
const mockAllTickets = [
  {
    _id: 'ticket123',
    submittedBy: { name: 'Ravi Sharma' },
    description: 'Video player is not loading for Course 101',
    priority: 'High',
    status: 'Open'
  },
  {
    _id: 'ticket124',
    submittedBy: { name: 'Priya Patel' },
    description: 'Cannot submit my quiz, button is greyed out.',
    priority: 'Medium',
    status: 'Open'
  },
  {
    _id: 'ticket125',
    submittedBy: { name: 'Arjun Singh' },
    description: 'Investigating missing assignment files.',
    priority: 'Medium',
    status: 'In Progress'
  },
  {
    _id: 'ticket101',
    submittedBy: { name: 'Aisha Khan' },
    description: 'User forgot password, reset sent.',
    priority: 'Low',
    status: 'Closed'
  }
];
// --- END MOCK DATA ---

// --- Reusable SidebarLink Component (No changes) ---
const SidebarLink = ({ onClick, icon: Icon, children, isActive }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-all ${
      isActive
        ? 'bg-blue-600 text-white' // Style for the active link
        : 'text-slate-300 hover:text-white hover:bg-slate-700/50' // Style for inactive links
    }`}
  >
    <Icon className="h-5 w-5" />
    {children}
  </button>
);

// --- Sidebar Component Definition (No changes) ---
const Sidebar = ({ activePage, setActivePage }) => {
  const { logout } = useAuth();
  return (
    <div className="flex h-screen w-64 flex-col bg-blue-900 text-white">
      {/* Logo/Title Area */}
      <div className="flex items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-white">SarvaShiksha</h1>
      </div>
      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 p-4">
        <SidebarLink 
          icon={FaWrench} 
          isActive={activePage === 'dashboard'}
          onClick={() => setActivePage('dashboard')}
        >
          Dashboard
        </SidebarLink>
        <SidebarLink 
          icon={FaFolderOpen} 
          isActive={activePage === 'open_issues'}
          onClick={() => setActivePage('open_issues')}
        >
          Open Issues
        </SidebarLink>
        <SidebarLink 
          icon={FaSpinner} 
          isActive={activePage === 'in_progress'}
          onClick={() => setActivePage('in_progress')}
        >
          In Progress
        </SidebarLink>
        <SidebarLink 
          icon={FaCheckCircle} 
          isActive={activePage === 'closed'}
          onClick={() => setActivePage('closed')}
        >
          Closed Issues
        </SidebarLink>
      </nav>
      {/* Logout Button */}
      <div className="p-4 mt-auto">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-400 transition-all hover:text-white hover:bg-red-500/50"
        >
          <FaSignOutAlt className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

// --- Header Component Definition (No changes) ---
const Header = () => {
  const { user } = useAuth(); 
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-md">
      <h2 className="text-xl font-semibold text-gray-700">Technician Panel</h2>
      <div className="flex items-center">
        <span className="mr-4">Welcome, {user?.name || 'Technician'}</span>
        <FaUserCircle className="h-8 w-8 text-gray-500" />
      </div>
    </header>
  );
};

// --- (UPDATED) Dashboard Overview Page Component ---
// This component now receives props from its parent
const TechOverview = ({ allTickets, handleStatusChange, loading, error }) => {
  // --- (REMOVED) Local useState and handleStatusChange.
  // We now use the 'allTickets' prop directly.
  const tickets = allTickets; 

  const openTickets = tickets.filter((t) => t.status === 'Open').length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'In Progress'
  ).length;
  const highPriorityTickets = tickets.filter(
    (t) => t.priority === 'High' && t.status !== 'Closed'
  ).length;

  return (
    <>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Technician Dashboard
      </h1>

      {/* Overview Cards (No changes needed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <FaTicketAlt className="text-3xl text-blue-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium text-gray-600">Open Tickets</h3>
            <p className="text-3xl font-bold text-gray-800">{openTickets}</p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <FaSpinner className="text-3xl text-yellow-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium text-gray-600">In Progress</h3>
            <p className="text-3xl font-bold text-gray-800">{inProgressTickets}</p>
          </div>
        </div>
        {/* Card 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <FaExclamationCircle className="text-3xl text-red-500 mr-4" />
          <div>
            <h3 className="text-lg font-medium text-gray-600">High Priority</h3>
            <p className="text-3xl font-bold text-gray-800">{highPriorityTickets}</p>
          </div>
        </div>
      </div>

      {/* All Tickets Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          All Support Tickets
        </h3>
        {loading ? (
          <p>Loading support tickets...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.submittedBy?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={ticket.status}
                      // --- (UPDATED) Uses the handler from props ---
                      onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                      className="border border-gray-300 rounded-md p-1"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

// --- (UPDATED) Open Issues Page Component ---
// This component now receives props
const OpenIssues = ({ openTickets, handleStatusChange, loading, error }) => {
  // --- (REMOVED) Local useState and handleStatusChange. ---
  
  return (
    <>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Open Support Issues
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          All Open Tickets
        </h3>
        {loading ? (
          <p>Loading support tickets...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        // --- (UPDATED) Use the 'openTickets' prop ---
        ) : openTickets.length === 0 ? (
          <p>No open tickets found. Good job!</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* --- (UPDATED) Map over the 'openTickets' prop --- */}
              {openTickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.submittedBy?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      defaultValue="Open" 
                      // --- (UPDATED) Uses the handler from props ---
                      onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                      className="border border-gray-300 rounded-md p-1"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

// --- (UPDATED) In Progress Issues Page Component ---
// This component now receives props
const InProgressIssues = ({ inProgressTickets, handleStatusChange, loading, error }) => {
  // --- (REMOVED) Local useState and handleStatusChange. ---

  return (
    <>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        In Progress Issues
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          All "In Progress" Tickets
        </h3>
        {loading ? (
          <p>Loading tickets...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        // --- (UPDATED) Use the 'inProgressTickets' prop ---
        ) : inProgressTickets.length === 0 ? (
          <p>No tickets are currently "In Progress".</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* --- (UPDATED) Map over the 'inProgressTickets' prop --- */}
              {inProgressTickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.submittedBy?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowGrap">{ticket.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      defaultValue="In Progress" 
                      // --- (UPDATED) Uses the handler from props ---
                      onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                      className="border border-gray-300 rounded-md p-1"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

// --- (UPDATED) Closed Issues Page Component ---
// This component now receives props
const ClosedIssues = ({ closedTickets, loading, error }) => {
  // --- (REMOVED) Local useState and handleStatusChange. ---

  return (
    <>
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Closed Issues
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          All Closed Tickets
        </h3>
        {loading ? (
          <p>Loading tickets...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        // --- (UPDATED) Use the 'closedTickets' prop ---
        ) : closedTickets.length === 0 ? (
          <p>No tickets have been closed yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* --- (UPDATED) Map over the 'closedTickets' prop --- */}
              {closedTickets.map((ticket) => (
                <tr key={ticket._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.submittedBy?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* For closed tickets, we show a disabled dropdown */}
                    <select
                      defaultValue="Closed" 
                      disabled
                      className="border border-gray-300 rounded-md p-1 bg-gray-100"
                    >
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};


// --- (UPDATED) Main TechDashboard (The Parent Component) ---
function TechDashboard() {
  const [activePage, setActivePage] = useState('dashboard');

  // --- (NEW) STATE IS LIFTED TO THE PARENT ---
  // This is now the *single source of truth* for all tickets.
  const [tickets, setTickets] = useState(mockAllTickets);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  /*
  // --- (LATER) We will uncomment this to fetch real data ---
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/tickets');
        setTickets(res.data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError('Failed to load tickets. Please try again.');
      }
      setLoading(false);
    };
    fetchTickets();
  }, []);
  */

  // --- (NEW) HANDLER IS LIFTED TO THE PARENT ---
  // This function updates the single source of truth.
  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(
      tickets.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );
    
    // --- (LATER) We will add the API call here ---
    // try {
    //   await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { status: newStatus });
    // } catch (err) {
    //   console.error("Error updating ticket:", err);
    //   // TODO: Add error handling (e.g., revert state)
    // }
  };

  // --- (NEW) Filter lists here in the parent ---
  // These lists are re-calculated every time the 'tickets' state changes.
  const openTickets = tickets.filter((t) => t.status === 'Open');
  const inProgressTickets = tickets.filter((t) => t.status === 'In Progress');
  const closedTickets = tickets.filter((t) => t.status === 'Closed');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. Sidebar (No changes) */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Header (No changes) */}
        <Header />

        {/* 3. Main Content Area - Conditionally renders pages */}
        {/* --- (UPDATED) We now pass all the data down as props --- */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {activePage === 'dashboard' && (
            <TechOverview
              allTickets={tickets} // Pass all tickets
              handleStatusChange={handleStatusChange}
              loading={loading}
              error={error}
            />
          )}
          {activePage === 'open_issues' && (
            <OpenIssues
              openTickets={openTickets} // Pass *only* open tickets
              handleStatusChange={handleStatusChange}
              loading={loading}
              error={error}
            />
          )}
          {activePage === 'in_progress' && (
            <InProgressIssues
              inProgressTickets={inProgressTickets} // Pass *only* in-progress tickets
              handleStatusChange={handleStatusChange}
              loading={loading}
              error={error}
            />
          )}
          {activePage === 'closed' && (
            <ClosedIssues
              closedTickets={closedTickets} // Pass *only* closed tickets
              loading={loading}
              error={error}
              // Note: No handleStatusChange needed for closed
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default TechDashboard;