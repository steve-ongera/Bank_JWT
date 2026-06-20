import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { 
  biGrid1x2Fill, 
  biWallet2, 
  biArrowUpCircle, 
  biArrowDownCircle, 
  biClockHistory, 
  biPersonCircle,
  biBoxArrowRight 
} from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    { path: '/deposit', icon: 'bi-arrow-up-circle', label: 'Deposit' },
    { path: '/send-money', icon: 'bi-arrow-down-circle', label: 'Send Money' },
    { path: '/transactions', icon: 'bi-clock-history', label: 'Transactions' },
    { path: '/profile', icon: 'bi-person-circle', label: 'Profile' },
  ];

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar">
        <div className="sidebar-brand">
          <i className="bi bi-bank2 me-2"></i>
          <span>Bank App</span>
        </div>
        
        <Nav className="flex-column sidebar-nav">
          {navItems.map((item) => (
            <Nav.Item key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  `nav-link sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi ${item.icon} me-3`}></i>
                <span>{item.label}</span>
              </NavLink>
            </Nav.Item>
          ))}
          
          <Nav.Item className="mt-auto">
            <Nav.Link 
              onClick={logout}
              className="sidebar-link text-danger"
            >
              <i className="bi bi-box-arrow-right me-3"></i>
              <span>Logout</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;