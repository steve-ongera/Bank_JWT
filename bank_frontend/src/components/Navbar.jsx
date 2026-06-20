import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Navbar as BootstrapNavbar, 
  Container, 
  Dropdown, 
  Badge 
} from 'react-bootstrap';
import { 
  Bell, 
  PersonCircle, 
  BoxArrowRight,
  Wallet2 
} from 'react-bootstrap-icons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(3);

  const handleLogout = () => {
    logout();
  };

  return (
    <BootstrapNavbar bg="white" className="navbar-custom shadow-sm" expand="lg">
      <Container fluid>
        <div className="d-flex align-items-center">
          <button 
            className="sidebar-toggle btn btn-link d-lg-none"
            onClick={() => document.querySelector('.sidebar-wrapper')?.classList.toggle('show')}
          >
            <i className="bi bi-list fs-3"></i>
          </button>
          <BootstrapNavbar.Brand href="#" className="d-lg-none">
            <i className="bi bi-bank2 me-2"></i>
            Bank App
          </BootstrapNavbar.Brand>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Balance Badge */}
          <div className="balance-badge d-none d-md-block">
            <Wallet2 className="me-2" />
            <span className="fw-bold">
              ${parseFloat(user?.balance || 0).toFixed(2)}
            </span>
          </div>

          {/* Notifications */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="position-relative p-0" id="notification-dropdown">
              <Bell className="fs-5" />
              {notifications > 0 && (
                <Badge 
                  bg="danger" 
                  className="position-absolute top-0 start-100 translate-middle rounded-circle"
                  style={{ fontSize: '0.6rem', padding: '0.25rem 0.5rem' }}
                >
                  {notifications}
                </Badge>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu className="notification-dropdown p-0">
              <div className="p-3 border-bottom">
                <h6 className="mb-0">Notifications</h6>
              </div>
              <div className="notification-list">
                <Dropdown.Item className="notification-item">
                  <i className="bi bi-arrow-up-circle text-success me-2"></i>
                  Deposit of $500 confirmed
                </Dropdown.Item>
                <Dropdown.Item className="notification-item">
                  <i className="bi bi-arrow-down-circle text-danger me-2"></i>
                  Payment to John Doe
                </Dropdown.Item>
                <Dropdown.Item className="notification-item">
                  <i className="bi bi-wallet2 text-primary me-2"></i>
                  Monthly interest added
                </Dropdown.Item>
              </div>
              <div className="p-2 text-center border-top">
                <small className="text-muted">View all notifications</small>
              </div>
            </Dropdown.Menu>
          </Dropdown>

          {/* User Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle 
              variant="link" 
              className="d-flex align-items-center gap-2 p-0" 
              id="user-dropdown"
            >
              <div className="user-avatar">
                <PersonCircle className="fs-4" />
              </div>
              <span className="d-none d-md-inline fw-medium">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="user-dropdown">
              <div className="px-3 py-2 border-bottom">
                <div className="fw-bold">{user?.name}</div>
                <small className="text-muted">{user?.email}</small>
              </div>
              <Dropdown.Item href="/profile">
                <PersonCircle className="me-2" />
                Profile
              </Dropdown.Item>
              <Dropdown.Item href="/dashboard">
                <i className="bi bi-grid-1x2-fill me-2"></i>
                Dashboard
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <BoxArrowRight className="me-2" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;