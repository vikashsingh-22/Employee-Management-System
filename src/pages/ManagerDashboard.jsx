import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaTasks, FaCalendarAlt, FaBars, FaChartLine, FaBell, FaUserCircle, FaCalendarCheck } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import '../styles/ManagerDashboard.css';
import EmployeeList from '../components/EmployeeList';
import TaskAssignment from '../components/TaskAssignment';
import Profile from '../components/Profile';
import AttendanceManagement from '../components/AttendanceManagement';
import { useAuth } from '../context/AuthContext';

const DashboardStats = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Total Employees</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalEmployees || 0}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                    <FaUsers className="text-blue-500 text-xl" />
                </div>
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Active Tasks</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.activeTasks || 0}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                    <FaTasks className="text-green-500 text-xl" />
                </div>
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Pending Leaves</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.pendingLeaves || 0}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                    <FaCalendarAlt className="text-purple-500 text-xl" />
                </div>
            </div>
        </div>
    </div>
);

const LeaveRequests = ({ leaveRequests, onApprove, onReject }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Leave Requests</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {leaveRequests.map((request) => (
                        <tr key={request._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{request.employee?.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(request.fromDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(request.toDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.reason}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {request.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {request.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => onApprove(request._id)}
                                            className="text-green-600 hover:text-green-900 mr-4"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => onReject(request._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Reject
                                        </button>
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

const TaskList = ({ tasks }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task) => (
                        <tr key={task._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                <div className="text-sm text-gray-500">{task.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {task.assignedTo?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(task.deadline).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    task.accepted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {task.accepted ? 'Accepted' : 'Pending Acceptance'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ManagerDashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [stats, setStats] = useState({});
    const [employees, setEmployees] = useState([]);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [tasks, setTasks] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        setShowMobileMenu(false);
    }, [location]);

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

            const [statsRes, employeesRes, leavesRes, tasksRes] = await Promise.all([
                axios.get('http://localhost:3001/api/auth/stats', config),
                axios.get('http://localhost:3001/api/auth/employees', config),
                axios.get('http://localhost:3001/api/leaves', config),
                axios.get('http://localhost:3001/api/tasks', config)
            ]);

            setStats(statsRes.data);
            setEmployees(employeesRes.data);
            setLeaveRequests(leavesRes.data);
            setTasks(tasksRes.data);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                console.error('Error fetching dashboard data:', error);
                // You might want to show an error message to the user here
            }
        }
    };

    const handleLeaveApproval = async (leaveId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:3001/api/leaves/${leaveId}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh the dashboard data to show updated leave requests
            fetchDashboardData();
        } catch (error) {
            console.error('Error updating leave request:', error);
            // You might want to show an error message to the user here
        }
    };

    const handleTaskAssigned = () => {
        fetchDashboardData();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleApproveLeave = async (leaveId) => {
        try {
            await handleLeaveApproval(leaveId, 'approved');
        } catch (error) {
            console.error('Error approving leave:', error);
        }
    };

    const handleRejectLeave = async (leaveId) => {
        try {
            await handleLeaveApproval(leaveId, 'rejected');
        } catch (error) {
            console.error('Error rejecting leave:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <div className="bg-white shadow-sm fixed top-0 inset-x-0 z-50">
                <div className="h-16 border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                        <div className="flex items-center justify-between h-full">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                                >
                                    <FaBars className="text-gray-600 text-xl" />
                                </button>
                                <h1 className="text-xl font-semibold text-gray-800">Management Dashboard</h1>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
                                <div className="flex items-center gap-4">
                                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                        <FaBell className="text-gray-600 text-xl" />
                                    </button>
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
            </div>

            <div className="flex pt-16">
                {/* Sidebar */}
                <div className={`fixed h-[calc(100vh-4rem)] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
                    sidebarCollapsed ? 'w-20' : 'w-64'
                } ${showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className="p-4 border-b">
                        <h2 className={`text-xl font-bold text-gray-800 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
                            Management
                        </h2>
                    </div>
                    <nav className="mt-4">
                        <Link
                            to="/manager-dashboard/profile"
                            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                                location.pathname === '/manager-dashboard/profile' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                            }`}
                        >
                            <FaUserCircle className="text-lg" />
                            <span className={`ml-3 ${sidebarCollapsed ? 'hidden' : 'block'}`}>Profile</span>
                        </Link>
                        <Link
                            to="/manager-dashboard"
                            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                                location.pathname === '/manager-dashboard' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                            }`}
                        >
                            <FaUsers className="text-lg" />
                            <span className={`ml-3 ${sidebarCollapsed ? 'hidden' : 'block'}`}>Employees</span>
                        </Link>
                        <Link
                            to="/manager-dashboard/tasks"
                            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                                location.pathname === '/manager-dashboard/tasks' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                            }`}
                        >
                            <FaTasks className="text-lg" />
                            <span className={`ml-3 ${sidebarCollapsed ? 'hidden' : 'block'}`}>Tasks</span>
                        </Link>
                        <Link
                            to="/manager-dashboard/leaves"
                            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                                location.pathname === '/manager-dashboard/leaves' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                            }`}
                        >
                            <FaCalendarAlt className="text-lg" />
                            <span className={`ml-3 ${sidebarCollapsed ? 'hidden' : 'block'}`}>Leave Requests</span>
                        </Link>
                        <Link
                            to="/manager-dashboard/attendance"
                            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                                location.pathname === '/manager-dashboard/attendance' ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                            }`}
                        >
                            <FaCalendarCheck className="text-lg" />
                            <span className={`ml-3 ${sidebarCollapsed ? 'hidden' : 'block'}`}>Attendance</span>
                        </Link>
                    </nav>
                </div>

                {/* Main Content */}
                <div className={`flex-1 transition-all duration-300 ease-in-out ${
                    sidebarCollapsed ? 'ml-20' : 'ml-64'
                } ${!showMobileMenu ? 'lg:ml-64' : ''}`}>
                    <div className="p-8">
                        <Routes>
                            <Route path="/profile" element={
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <Profile userData={user} onUpdate={fetchDashboardData} />
                                </div>
                            } />
                            <Route path="/" element={
                                <>
                                    <DashboardStats stats={stats} />
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-200">
                                            <h2 className="text-xl font-semibold text-gray-800">Employee List</h2>
                                        </div>
                                        <EmployeeList employees={employees} />
                                    </div>
                                </>
                            } />
                            <Route path="/tasks" element={
                                <>
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                                        <div className="p-6 border-b border-gray-200">
                                            <h2 className="text-xl font-semibold text-gray-800">Assign New Task</h2>
                                        </div>
                                        <div className="p-6">
                                            <TaskAssignment employees={employees} onTaskAssigned={handleTaskAssigned} />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="p-6 border-b border-gray-200">
                                            <h2 className="text-xl font-semibold text-gray-800">All Tasks</h2>
                                        </div>
                                        <TaskList tasks={tasks} />
                                    </div>
                                </>
                            } />
                            <Route path="/leaves" element={
                                <LeaveRequests
                                    leaveRequests={leaveRequests}
                                    onApprove={handleApproveLeave}
                                    onReject={handleRejectLeave}
                                />
                            } />
                            <Route path="/attendance" element={<AttendanceManagement employees={employees} />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard; 