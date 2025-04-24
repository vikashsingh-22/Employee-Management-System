import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiCheckSquare, FiCalendar, FiDollarSign, FiClock, FiUser, FiLogOut, FiPlus } from 'react-icons/fi';
import Profile from '../components/Profile';
import { authService } from '../services/api';
import DatePicker from 'react-datepicker'; // Import the DatePicker component
import 'react-datepicker/dist/react-datepicker.css'; // Import the styles

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, login, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    total: 30,
    used: 0
  });

  const [stats, setStats] = useState({
    leavesLeft: 0,
    currentSalary: 0,
    completedTasks: 0,
    assignedTasks: 0
  });

  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    fromDate: null,
    toDate: null,
    reason: ''
  });

  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling every 10 seconds to check for updates
    const pollInterval = setInterval(fetchDashboardData, 10000);
    
    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  }, []);

  // Fetch attendance when Attendance tab is active
  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchAttendanceRecords();
    }
  }, [activeTab]);

  // Listen for attendance mark success event (using localStorage event as a simple cross-component signal)
  useEffect(() => {
    function handleAttendanceMarked(e) {
      if (e.key === 'attendanceMarked' && activeTab === 'attendance') {
        fetchAttendanceRecords();
      }
    }
    window.addEventListener('storage', handleAttendanceMarked);
    return () => window.removeEventListener('storage', handleAttendanceMarked);
  }, [activeTab]);

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:3001/api/attendance/records', config);
      setAttendanceRecords(res.data);
    } catch (err) {
      setAttendanceRecords([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [userRes, tasksRes, leavesRes, taskStatsRes, leaveStatsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/auth/me', config),
        axios.get('http://localhost:3001/api/tasks/my-tasks', config),
        axios.get('http://localhost:3001/api/leaves/my-leaves', config),
        axios.get('http://localhost:3001/api/tasks/stats', config),
        axios.get('http://localhost:3001/api/leaves/stats', config)
      ]);

      const userData = userRes.data;
      const userTasks = tasksRes.data;
      const userLeaves = leavesRes.data;
      const taskStats = taskStatsRes.data;
      const leaveStats = leaveStatsRes.data;

      console.log('User Data:', userData); // Add this for debugging

      setTasks(userTasks);
      setStats({
        leavesLeft: Number(userData.leavesLeft || 20),
        currentSalary: Number(userData.salary || 0),
        completedTasks: Number(taskStats.completedTasks || 0),
        assignedTasks: Number(taskStats.totalTasks || 0)
      });

      setLeaveRequests(userLeaves);

      setLeaveBalance({
        total: Number(userData.leavesLeft || 20),
        used: userLeaves.filter(l => l.status === 'approved').reduce((acc, curr) => {
          const start = new Date(curr.fromDate);
          const end = new Date(curr.toDate);
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          return acc + days;
        }, 0)
      });
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        console.error('Error fetching dashboard data:', error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Format dates for API submission
      const formattedData = {
        fromDate: leaveForm.fromDate ? leaveForm.fromDate.toISOString().split('T')[0] : '',
        toDate: leaveForm.toDate ? leaveForm.toDate.toISOString().split('T')[0] : '',
        reason: leaveForm.reason
      };
      
      await axios.post(
        'http://localhost:3001/api/leaves',
        formattedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowLeaveForm(false);
      setLeaveForm({ fromDate: null, toDate: null, reason: '' });
      // Refresh dashboard data to update leave balance
      fetchDashboardData();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3001/api/tasks/${taskId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) {
      console.error('Error accepting task:', error);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3001/api/tasks/${taskId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const LeaveRequestsList = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">My Leave Requests</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaveRequests.map((leave) => {
              const start = new Date(leave.fromDate);
              const end = new Date(leave.toDate);
              const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
              
              return (
                <tr key={leave._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {start.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {end.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {days}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                      leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave.reviewedBy ? leave.reviewedBy.name : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave.reviewedAt ? new Date(leave.reviewedAt).toLocaleString() : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TaskList = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{task.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(task.deadline).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {!task.accepted && task.status === 'pending' && (
                    <button
                      onClick={() => handleAcceptTask(task._id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Accept
                    </button>
                  )}
                  {task.accepted && task.status !== 'completed' && (
                    <>
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task._id, 'in-progress')}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'in-progress' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Complete
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow fixed top-0 inset-x-0 z-50">
        <div className="h-16 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-800">Employee Management</h1>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="w-64 fixed h-full bg-white shadow-lg z-40">
          <div className="p-6 border-b">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200">
                {user?.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.position}</p>
              </div>
            </div>
          </div>
          <nav className="mt-6">
            <div className="px-3">
              {/* Fixed buttons to maintain consistent width on hover */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center px-4 py-2.5 text-left text-sm font-medium rounded-lg transition-colors w-11/12 mx-auto ${
                  activeTab === 'profile' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <FiUser className="text-lg" />
                <span className="ml-3">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center px-4 py-2.5 text-left text-sm font-medium rounded-lg mt-1 transition-colors w-11/12 mx-auto ${
                  activeTab === 'tasks' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <FiCheckSquare className="text-lg" />
                <span className="ml-3">Tasks</span>
              </button>
              <button
                onClick={() => setShowLeaveForm(true)}
                className="flex items-center px-4 py-2.5 text-left text-sm font-medium rounded-lg mt-1 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors w-11/12 mx-auto"
              >
                <FiCalendar className="text-lg" />
                <span className="ml-3">Request Leave</span>
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center px-4 py-2.5 text-left text-sm font-medium rounded-lg mt-1 transition-colors w-11/12 mx-auto ${
                  activeTab === 'attendance' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <FiClock className="text-lg" />
                <span className="ml-3">Attendance</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Assigned Tasks</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.assignedTasks}</h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FiCheckSquare className="text-blue-500 text-xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Completed Tasks</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.completedTasks}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FiClock className="text-green-500 text-xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Leaves Left</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.leavesLeft}</h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FiCalendar className="text-purple-500 text-xl" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Current Salary</p>
                    <h3 className="text-2xl font-bold text-gray-800">${stats.currentSalary}</h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FiDollarSign className="text-yellow-500 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {activeTab === 'tasks' && (
              <>
                <TaskList />
                <LeaveRequestsList />
              </>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <Profile userData={user} onUpdate={async (formData) => {
  // Remove email if present (cannot be updated)
  const { email, ...updatableFields } = formData;
  try {
    const response = await authService.updateProfile(updatableFields);
    console.log('Profile update response:', response);
    
    // Get fresh user data after update
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const userRes = await axios.get('http://localhost:3001/api/auth/me', config);
    
    // Update user in AuthContext with fresh data
    if (userRes.data) {
      console.log('Updated user data:', userRes.data);
      updateUser(userRes.data);
    }
    
    // Refresh dashboard data
    fetchDashboardData();
  } catch (error) {
    alert('Failed to update profile.');
    console.error(error);
  }
}} />
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Attendance Records</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Time In</th>
                        <th className="px-4 py-2">Time Out</th>
                        <th className="px-4 py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-gray-500">No attendance records found.</td>
                        </tr>
                      ) : (
                        attendanceRecords.map((record) => (
                          <tr key={record._id}>
                            <td className="border px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="border px-4 py-2">{record.status}</td>
                            <td className="border px-4 py-2">{record.timeIn}</td>
                            <td className="border px-4 py-2">{record.timeOut}</td>
                            <td className="border px-4 py-2">{record.notes}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {showLeaveForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Request Leave</h2>
                    <button
                      onClick={() => setShowLeaveForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleLeaveSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiCalendar className="text-gray-400" />
                        </div>
                        {/* Replace the input with DatePicker component */}
                        <DatePicker
                          selected={leaveForm.fromDate}
                          onChange={(date) => setLeaveForm({ ...leaveForm, fromDate: date })}
                          className="w-full pl-10 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          dateFormat="MM/dd/yyyy"
                          placeholderText="Select start date"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiCalendar className="text-gray-400" />
                        </div>
                        {/* Replace the input with DatePicker component */}
                        <DatePicker
                          selected={leaveForm.toDate}
                          onChange={(date) => setLeaveForm({ ...leaveForm, toDate: date })}
                          className="w-full pl-10 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          dateFormat="MM/dd/yyyy"
                          placeholderText="Select end date"
                          minDate={leaveForm.fromDate}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                      <textarea
                        value={leaveForm.reason}
                        onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                        rows="3"
                        required
                        placeholder="Please fill out this field"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowLeaveForm(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;