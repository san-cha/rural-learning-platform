import React, { useState } from 'react';
import axios from "../api/axiosInstance.jsx"; // Use configured axios instance

// Assuming other necessary imports like useContext or useAuth are here

const TicketSubmissionForm = ({ onTicketSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [message, setMessage] = useState(null);
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setIsError(false);

        const ticketData = { title, description, priority };

        try {
            // --- CRITICAL CHANGE: Use the new explicit /submit path ---
            const res = await axios.post('/api/tickets/submit', ticketData);
            
            setMessage('Ticket submitted successfully! An administrator will review it shortly.');
            setIsError(false);
            setTitle('');
            setDescription('');
            setPriority('Medium');
            if (onTicketSubmit) {
                onTicketSubmit(res.data);
            }
        } catch (error) {
            console.error('Ticket submission failed:', error);
            // Check if error response exists and use its message
            const errorMsg = error.response && error.response.data && error.response.data.msg 
                             ? error.response.data.msg 
                             : 'Failed to submit ticket. Please try again.';

            setMessage(errorMsg);
            setIsError(true);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                Submit a New Support Ticket
            </h2>

            {/* Message Box */}
            {message && (
                <div 
                    className={`p-3 mb-4 rounded-lg text-sm ${
                        isError 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-green-100 text-green-700 border border-green-200'
                    }`}
                    role="alert"
                >
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        placeholder="A brief summary of the issue"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                        placeholder="Provide details about the problem, including steps to reproduce."
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border bg-white"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                    Submit Ticket
                </button>
            </form>
        </div>
    );
};

export default TicketSubmissionForm;