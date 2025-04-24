import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiClock, FiClipboard, FiCalendar, FiSearch } from 'react-icons/fi';
import Profile from '../components/Profile';

const ManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState([
    {
      id: 'EMP001',
      name: 'John Doe',
      position: 'Software Developer',
      department: 'Engineering',
      status: 'active',
      email: 'john.doe@company.com',
      joinDate: '2023-01-15'
    },
    {
      id: 'EMP002',
      name: 'Jane Smith',
      position: 'UI Designer',
      department: 'Design',
      status: 'active',
      email: 'jane.smith@company.com',
      joinDate: '2023-02-01'
    }
  ]);

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      type: 'Sick Leave',
      from: '2024-03-10',
      to: '2024-03-12',
      status: 'pending',
      reason: 'Medical appointment'
    }
  ]);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Project Documentation',
      assignedTo: 'EMP001',
      deadline: '2024-03-20',
      priority: 'high',
      status: 'in-progress'
    }
  ]);

  const mockManagerData = {
    fullName: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    phone: '+1234567890',
    address: '456 Street, City, Country',
    position: 'Engineering Manager',
    employeeId: 'MGR001',
    department: 'Engineering',
    joiningDate: '2022-01-01',
    photoUrl: 'https://via.placeholder.com/150'
  };

  const handleProfileUpdate = (data) => {
    console.log('Profile updated:', data);
  };

  const handleLeaveAction = (leaveId, action) => {
    setLeaveRequests(leaveRequests.map(leave =>
      leave.id === leaveId ? { ...leave, status: action } : leave
    ));
  };

  const handleEmployeeAction = (employeeId, action) => {
    if (action === 'block') {
      setEmployees(employees.map(emp =>
        emp.id === employeeId ? { ...emp, status: emp.status === 'blocked' ? 'active' : 'blocked' } : emp
      ));
    } else if (action === 'delete') {
      setEmployees(employees.filter(emp => emp.id !== employeeId));
    }
  };

  const handleTaskAssignment = (taskData) => {
    const newTask = {
      id: tasks.length + 1,
      ...taskData,
      status: 'pending'
    };
    setTasks([...tasks, newTask]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Employees</p>
                  <p className="text-xl font-bold text-gray-800">{employees.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FiClock className="text-yellow-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Leave Requests</p>
                  <p className="text-xl font-bold text-gray-800">
                    {leaveRequests.filter(l => l.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiClipboard className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Tasks</p>
                  <p className="text-xl font-bold text-gray-800">
                    {tasks.filter(t => t.status !== 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiCalendar className="text-purple-600 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Departments</p>
                  <p className="text-xl font-bold text-gray-800">
                    {new Set(employees.map(e => e.department)).size}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="col-span-full md:col-span-3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="border-b">
                <nav className="flex">
                  {['employees', 'leaves', 'tasks', 'reports'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'employees' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search employees..."
                          className="form-input pl-10"
                        />
                      </div>
                      <button className="submit-btn">Add Employee</button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">ID</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Name</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Position</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Department</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employees.map(employee => (
                            <tr key={employee.id} className="border-b last:border-b-0">
                              <td className="py-3 px-4 text-sm text-gray-800">{employee.id}</td>
                              <td className="py-3 px-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-800">{employee.name}</div>
                                  <div className="text-sm text-gray-500">{employee.email}</div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-800">{employee.position}</td>
                              <td className="py-3 px-4 text-sm text-gray-800">{employee.department}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  employee.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEmployeeAction(employee.id, 'block')}
                                    className="text-sm text-gray-600 hover:text-red-600"
                                  >
                                    {employee.status === 'blocked' ? 'Unblock' : 'Block'}
                                  </button>
                                  <button
                                    onClick={() => handleEmployeeAction(employee.id, 'delete')}
                                    className="text-sm text-red-600 hover:text-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'leaves' && (
                  <div className="space-y-4">
                    {leaveRequests.map(leave => (
                      <div key={leave.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">{leave.employeeName}</h3>
                            <p className="text-sm text-gray-500">{leave.type}</p>
                            <p className="text-sm text-gray-500">
                              {leave.from} to {leave.to}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">{leave.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            {leave.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleLeaveAction(leave.id, 'approved')}
                                  className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleLeaveAction(leave.id, 'rejected')}
                                  className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {leave.status !== 'pending' && (
                              <span className={`px-3 py-1 rounded-lg text-sm ${
                                leave.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-800 mb-4">Assign New Task</h3>
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label className="form-label">Task Title</label>
                          <input type="text" className="form-input" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Assign To</label>
                          <select className="form-input">
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Deadline</label>
                          <input type="date" className="form-input" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Priority</label>
                          <select className="form-input">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <div className="form-group md:col-span-2">
                          <label className="form-label">Description</label>
                          <textarea className="form-input" rows={3}></textarea>
                        </div>
                        <div className="md:col-span-2">
                          <button type="submit" className="submit-btn">
                            Assign Task
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-800">Active Tasks</h3>
                      {tasks.map(task => (
                        <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">{task.title}</h4>
                              <p className="text-sm text-gray-500">
                                Assigned to: {employees.find(e => e.id === task.assignedTo)?.name}
                              </p>
                              <p className="text-sm text-gray-500">Due: {task.deadline}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                task.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : task.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                              <select
                                value={task.status}
                                onChange={(e) => {
                                  setTasks(tasks.map(t =>
                                    t.id === task.id ? { ...t, status: e.target.value } : t
                                  ));
                                }}
                                className="form-input py-1 px-2 text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-4">Department Overview</h3>
                        {/* Add department statistics */}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-4">Leave Statistics</h3>
                        {/* Add leave statistics */}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-4">Task Completion Rate</h3>
                        {/* Add task completion statistics */}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-4">Employee Performance</h3>
                        {/* Add performance metrics */}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-full md:col-span-1">
            <div className="space-y-6">
              <Profile userData={mockManagerData} onUpdate={handleProfileUpdate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard; 