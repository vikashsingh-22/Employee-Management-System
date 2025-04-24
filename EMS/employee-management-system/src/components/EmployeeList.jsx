import React, { useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddEmployeeModal from './AddEmployeeModal';

const EmployeeList = ({ employees = [], refreshData }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState({
    name: '',
    email: '',
    status: 'active',
    leavesLeft: 0,
    salary: 0
  });

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3001/api/auth/employees/${employeeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // If we get here, the request was successful (no exception thrown)
      console.log('Employee deletion successful:', response.data);
      
      // Use toast for success notification instead of alert
      if (typeof toast !== 'undefined') {
        toast.success('Employee deleted successfully');
      }
      
      refreshData(); // Refresh the employee list
    } catch (error) {
      console.error('Error deleting employee:', error);
      // Don't show error alert, just log to console
    }
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee({
      _id: employee._id,
      name: employee.name || '',
      email: employee.email || '',
      position: employee.position || '',
      department: employee.department || '',
      status: employee.status || 'active',
      leavesLeft: employee.leavesLeft !== undefined ? employee.leavesLeft : 20,
      salary: employee.salary || 0
    });
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:3001/api/auth/employees/${selectedEmployee._id}`,
        {
          name: selectedEmployee.name,
          email: selectedEmployee.email,
          position: selectedEmployee.position || 'Employee',
          department: selectedEmployee.department || 'General',
          status: selectedEmployee.status,
          leavesLeft: selectedEmployee.leavesLeft,
          salary: selectedEmployee.salary
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // If we get here, the request was successful (no exception thrown)
      console.log('Employee update successful:', response.data);
      refreshData();
      closeModal();
      
      // Show success toast notification with custom configuration
      toast.success('Employee updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      // Show error in console only, don't display alert
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedEmployee(prev => ({
      ...prev,
      [name]: name === 'leavesLeft' || name === 'salary' ? Number(value) : value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Employee List</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leaves Left</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr key={employee._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.leavesLeft}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleEditClick(employee)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-sm text-gray-500">
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Edit Employee</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveChanges} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={selectedEmployee.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={selectedEmployee.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={selectedEmployee.position || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={selectedEmployee.department || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Leaves Left</label>
                  <input
                    type="number"
                    name="leavesLeft"
                    value={selectedEmployee.leavesLeft}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary</label>
                  <input
                    type="number"
                    name="salary"
                    value={selectedEmployee.salary || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={selectedEmployee.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="terminated">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refreshData();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};

export default EmployeeList;
