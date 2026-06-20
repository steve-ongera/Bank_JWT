import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { 
  Grid1x2Fill, 
  Wallet2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ClockHistory, 
  PersonCircle,
  BoxArrowRight 
} from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Grid1x2Fill, label: 'Dashboard' },
    { path: '/deposit', icon: ArrowUpCircle, label: 'Deposit' },
    { path: '/send-money', icon: ArrowDownCircle, label: 'Send Money' },
    { path: '/transactions', icon: ClockHistory, label: 'Transactions' },
    { path: '/profile', icon: PersonCircle, label: 'Profile' },
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
                <item.icon className="me-3" />
                <span>{item.label}</span>
              </NavLink>
            </Nav.Item>
          ))}
          
          <Nav.Item className="mt-auto">
            <Nav.Link 
              onClick={logout}
              className="sidebar-link text-danger"
            >
              <BoxArrowRight className="me-3" />
              <span>Logout</span>
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;