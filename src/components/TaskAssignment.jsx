import React, { useState } from 'react';
import axios from 'axios';

const TaskAssignment = ({ employees, onTaskAssigned }) => {
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        deadline: '',
        assignedTo: '',
        priority: 'medium',
        status: 'pending'
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // First check user role
            const userResponse = await axios.get('http://localhost:3001/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Current user:', userResponse.data);

            const response = await axios.post(
                'http://localhost:3001/api/tasks',
                taskForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data) {
                setTaskForm({
                    title: '',
                    description: '',
                    deadline: '',
                    assignedTo: '',
                    priority: 'medium',
                    status: 'pending'
                });
                onTaskAssigned();
            }
        } catch (error) {
            console.error('Error details:', {
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            setError(error.response?.data?.message || 'Error assigning task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        rows="3"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                    <input
                        type="date"
                        value={taskForm.deadline}
                        onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                    <select
                        value={taskForm.assignedTo}
                        onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                    >
                        <option value="">Select Employee</option>
                        {employees.map((employee) => (
                            <option key={employee._id} value={employee._id}>
                                {employee.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors ${
                            loading 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Assigning...' : 'Assign Task'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskAssignment; 