import { useState, useEffect } from 'react';
import { authService } from '../services/api';

const TestConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic ping endpoint
        const response = await fetch('http://localhost:8080/ping');
        if (response.ok) {
          setConnectionStatus('Backend server is running!');
        } else {
          setConnectionStatus('Backend server is not responding');
        }
      } catch (err) {
        setConnectionStatus('Failed to connect to backend');
        setError(err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Connection Test</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded">
            <p className="font-medium">Backend Status:</p>
            <p className={connectionStatus.includes('running') ? 'text-green-600' : 'text-red-600'}>
              {connectionStatus}
            </p>
          </div>
          {error && (
            <div className="p-4 bg-red-50 rounded">
              <p className="font-medium text-red-600">Error Details:</p>
              <p className="text-red-500">{error}</p>
            </div>
          )}
          <div className="p-4 bg-gray-100 rounded">
            <p className="font-medium">Backend URL:</p>
            <p className="text-gray-600">http://localhost:8080</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p className="font-medium">API Base URL:</p>
            <p className="text-gray-600">http://localhost:8080/api</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection; 