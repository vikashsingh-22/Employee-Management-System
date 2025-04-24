import React from 'react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <div className="main-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8"
      >
        <div className="glass-card">
          <h1 className="title">Welcome to Dashboard</h1>
          <p className="subtitle">Your workspace is ready</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 