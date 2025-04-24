import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import '../styles/attendance.css';

const AttendanceTable = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchAttendanceRecords();
  }, [currentMonth]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/attendance/records', {
        params: {
          month: currentMonth.getMonth() + 1,
          year: currentMonth.getFullYear()
        }
      });
      setAttendanceRecords(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      setError('Failed to fetch attendance records');
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (increment) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(prevMonth.getMonth() + increment);
      return newMonth;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading attendance records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Attendance Records</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            ←
          </button>
          <span className="text-gray-700 font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => handleMonthChange(1)}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            →
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                In Note
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Out Note
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceRecords.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(record.date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.inNote || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.outNote || '-'}
                </td>
              </tr>
            ))}
            {attendanceRecords.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                  No attendance records found for this month
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
