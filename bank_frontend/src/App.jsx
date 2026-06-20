import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import Deposit from './pages/Deposit';
import Profile from './pages/Profile';
import SendMoney from './pages/SendMoney';
import Transactions from './pages/Transactions';
import { Container, Row, Col } from 'react-bootstrap';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="app-wrapper">
      <Navbar />
      <div className="main-content">
        <Sidebar />
        <div className="page-content">
          <Container fluid className="py-4">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/send-money" element={<SendMoney />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Container>
        </div>
      </div>
    </div>
  );
}

export default App;