import React from 'react';

const RoleSelector = ({ role, setRole }) => {
  return (
    <div className="role-container">
      <button
        type="button"
        className={`role-btn ${role === 'employee' ? 'role-btn-selected' : 'role-btn-unselected'}`}
        onClick={() => setRole('employee')}
      >
        Employee
      </button>
      <button
        type="button"
        className={`role-btn ${role === 'manager' ? 'role-btn-selected' : 'role-btn-unselected'}`}
        onClick={() => setRole('manager')}
      >
        Manager
      </button>
    </div>
  );
};

export default RoleSelector; 