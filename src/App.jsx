import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MoneyFlow from './pages/MoneyFlow';
import LoanDashboard from './pages/LoanDashboard';
import VisionBoard from './pages/VisionBoard';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<MoneyFlow />} />
          <Route path="/loans" element={<LoanDashboard />} />
          <Route path="/vision" element={<VisionBoard />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;