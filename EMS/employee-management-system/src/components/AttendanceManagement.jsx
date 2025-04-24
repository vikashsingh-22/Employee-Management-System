import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/attendance.css';
import { attendanceService } from '../services/api';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Tab,
  Tabs
} from '@mui/material';
import { toast } from 'react-toastify';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { Save as SaveIcon, Event as EventIcon, ClearAll as ClearAllIcon } from '@mui/icons-material';

const AttendanceManagement = ({ employees = [] }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [holidays, setHolidays] = useState([]);
  // Removed snackbar state in favor of react-toastify
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Current token:', token);
    initializeAttendanceData();
    fetchHolidays();
  }, [selectedDate, employees]);

  const initializeAttendanceData = () => {
    const existingData = employees.map(employee => ({
      employeeId: employee._id,
      name: employee.name,
      status: '',
      timeIn: '',
      timeOut: '',
      notes: ''
    }));
    setAttendanceData(existingData);
  };

  // Default time settings
  const DEFAULT_TIME_IN = '09:00';
  const DEFAULT_TIME_OUT = '18:00';

  const handleStatusChange = (employeeId, status) => {
    setAttendanceData(prev => prev.map(item => {
      if (item.employeeId === employeeId) {
        if (status === 'Present') {
          return {
            ...item,
            status,
            timeIn: DEFAULT_TIME_IN,
            timeOut: DEFAULT_TIME_OUT
          };
        } else if (status === 'Absent') {
          return {
            ...item,
            status,
            timeIn: '',
            timeOut: '',
            partialHours: 0
          };
        }
        return { ...item, status };
      }
      return item;
    }));
  };

  const handleTimeChange = (employeeId, field, value) => {
    setAttendanceData(prev => prev.map(item => {
      if (item.employeeId === employeeId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleMarkAllPresent = () => {
    setAttendanceData(prev => prev.map(item => ({
      ...item,
      status: 'Present',
      timeIn: DEFAULT_TIME_IN,
      timeOut: DEFAULT_TIME_OUT
    })));
  };

  const handleMarkAllAbsent = () => {
    setAttendanceData(prev => prev.map(item => ({
      ...item,
      status: 'Absent',
      timeIn: '',
      timeOut: ''
    })));
  };

  const saveAttendance = async () => {
    setLoading(true);
    try {
      // Filter out records with no status
      const validAttendanceData = attendanceData.filter(item => item.status !== '');
      
      if (validAttendanceData.length === 0) {
        toast.warning('Please mark attendance status for at least one employee');
        setLoading(false);
        return;
      }

      // Process each attendance record and collect any messages about leave status changes
      const leaveMessages = [];
      
      const promises = validAttendanceData.map(async (item) => {
        // Format the date to ISO string and remove time part
        const formattedDate = new Date(selectedDate);
        formattedDate.setHours(0, 0, 0, 0);

        // Set appropriate time values based on status
        const timeIn = item.status === 'Present' ? (item.timeIn || DEFAULT_TIME_IN) : '';
        const timeOut = item.status === 'Present' ? (item.timeOut || DEFAULT_TIME_OUT) : '';

        try {
          const response = await attendanceService.markAttendance({
            employeeId: item.employeeId,
            date: formattedDate.toISOString(),
            status: item.status,
            timeIn: timeIn,
            timeOut: timeOut,
            notes: item.notes || ''
          });
          
          // Check if the backend automatically changed the status to Leave
          if (response.message && response.message.includes('automatically set to Leave')) {
            const employee = employees.find(emp => emp._id === item.employeeId);
            const employeeName = employee ? employee.name : 'Employee';
            leaveMessages.push(`${employeeName} has an approved leave for this date.`);
            
            // Update the local attendance data to reflect the change
            setAttendanceData(prev => prev.map(record => {
              if (record.employeeId === item.employeeId) {
                return {
                  ...record,
                  status: 'Leave',
                  notes: record.notes ? `${record.notes} (On Leave)` : 'On Leave'
                };
              }
              return record;
            }));
          }
          
          return response;
        } catch (error) {
          console.error(`Error marking attendance for employee ${item.employeeId}:`, error);
          throw error;
        }
      });

      await Promise.all(promises);
      
      // Show leave messages if any employees were automatically marked as on leave
      if (leaveMessages.length > 0) {
        leaveMessages.forEach(message => {
          toast.info(message);
        });
      }
      toast.success('Attendance saved successfully');
      // Trigger EmployeeDashboard to refresh attendance
      localStorage.setItem('attendanceMarked', Date.now().toString());
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error(error.response?.data?.message || 'Error saving attendance');
    } finally {
      setLoading(false);
    }
  };

  const markHoliday = async (date) => {
    try {
      // Format the date to ISO string and remove time part
      const formattedDate = new Date(date);
      formattedDate.setHours(0, 0, 0, 0);

      await attendanceService.markHoliday({
        name: 'Holiday',
        date: formattedDate.toISOString(),
        description: 'Official Holiday'
      });

      fetchHolidays();
      toast.success('Holiday marked successfully');
    } catch (error) {
      console.error('Error marking holiday:', error);
      toast.error(error.response?.data?.message || 'Error marking holiday');
    }
  };

  const fetchHolidays = async () => {
    try {
      const holidays = await attendanceService.getHolidays();
      setHolidays(holidays);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      setHolidays([]);
    }
  };

  const isHoliday = (date) => {
    return holidays.some(h => new Date(h.date).toDateString() === date.toDateString());
  };

  const getTileContent = ({ date }) => {
    const holidaysArray = Array.isArray(holidays) ? holidays : [];
    const attendanceArray = Array.isArray(attendanceRecords) ? attendanceRecords : [];
    
    const holiday = holidaysArray.find(h => new Date(h.date).toDateString() === date.toDateString());
    const attendance = attendanceArray.find(a => new Date(a.date).toDateString() === date.toDateString());
    
    return (
      <div style={{ fontSize: '0.8em', textAlign: 'center' }}>
        {holiday && <div style={{ color: 'red' }}>{holiday.name}</div>}
        {attendance && (
          <div style={{ 
            color: attendance.status === 'Present' ? 'green' : 
                   attendance.status === 'Absent' ? 'red' : 'orange'
          }}>
            {attendance.status}
          </div>
        )}
      </div>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Attendance Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Daily Attendance" />
          <Tab label="Holiday Calendar" />
        </Tabs>
      </Box>

      {currentTab === 0 ? (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={setSelectedDate}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>

            <Button
              variant="contained"
              color="primary"
              onClick={handleMarkAllPresent}
              sx={{ ml: 2 }}
            >
              Mark All Present
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleMarkAllAbsent}
            >
              Mark All Absent
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee Name</TableCell>
                  <TableCell align="center">Present</TableCell>
                  <TableCell align="center">Absent</TableCell>
                  <TableCell>Time In</TableCell>
                  <TableCell>Time Out</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData.map((row) => (
                  <TableRow
                    key={row.employeeId}
                    sx={{
                      backgroundColor:
                        row.status === 'Present' ? '#e8f5e9' :
                        row.status === 'Absent' ? '#ffebee' :
                        row.status === 'Partial' ? '#fff3e0' : 'inherit'
                    }}
                  >
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={row.status === 'Present'}
                        onChange={() => handleStatusChange(row.employeeId, 'Present')}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={row.status === 'Absent'}
                        onChange={() => handleStatusChange(row.employeeId, 'Absent')}
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        type="time"
                        value={row.timeIn}
                        onChange={(e) => handleTimeChange(row.employeeId, 'timeIn', e.target.value)}
                        disabled={row.status === 'Absent'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="time"
                        value={row.timeOut}
                        onChange={(e) => handleTimeChange(row.employeeId, 'timeOut', e.target.value)}
                        disabled={row.status === 'Absent'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={row.notes}
                        onChange={(e) => handleTimeChange(row.employeeId, 'notes', e.target.value)}
                        size="small"
                        placeholder="Add notes"
                      />
                    </TableCell>
                    <TableCell>
                      {row.status === 'Present' ? 'Present' : row.status === 'Absent' ? 'Absent' : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                initializeAttendanceData();
                toast.success('All attendance cleared successfully');
              }}
              startIcon={<ClearAllIcon />}
            >
              Clear All
            </Button>
            <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={saveAttendance}
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              Save Attendance
            </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box>
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileClassName={({ date }) =>
              isHoliday(date) ? 'holiday-tile' : ''
            }
            tileContent={({ date }) => {
              const holiday = holidays.find(h =>
                new Date(h.date).toDateString() === date.toDateString()
              );
              return holiday ? (
                <div className="holiday-indicator">🎉</div>
              ) : null;
            }}
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => markHoliday(selectedDate)}
              startIcon={<EventIcon />}
            >
              Mark as Holiday
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Removed Material UI Snackbar in favor of react-toastify */}
    </Box>
  );
};

export default AttendanceManagement;
