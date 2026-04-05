import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Test from './pages/menu';
import AdminDashboard from "./pages/AdminDashboard"
import MenuManagement from "./pages/MenuManagement"
import Billing from "./pages/Billing"
function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Order" element={<Test />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
        <Route path="/billing" element={<Billing />} />
      </Routes>
    </Router>
  );
}

export default App;