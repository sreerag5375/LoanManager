import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoanDashboard from './pages/LoanDashboard';
import VisionBoard from './pages/VisionBoard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoanDashboard />} />
        <Route path="/vision-board" element={<VisionBoard />} />
      </Routes>
    </Router>
  );
};

export default App;