import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { 
  Card, 
  Row, 
  Col, 
  Spinner, 
  Alert 
} from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  biWallet2, 
  biArrowUpCircle, 
  biArrowDownCircle,
  biClockHistory,
  biTrendingUp,
  biCashStack
} from 'react-bootstrap-icons';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await userService.getDashboardStats();
      setStats(response.data);
      
      // Get recent transactions
      const txResponse = await userService.getTransactions({ limit: 5 });
      setRecentTransactions(txResponse.data.transactions || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Chart data for spending trends
  const spendingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [1200, 1900, 1500, 2100, 1800, 2400],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: [800, 1100, 900, 1400, 1200, 1600],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Chart data for expense distribution
  const expenseDistributionData = {
    labels: ['Shopping', 'Food', 'Transport', 'Bills', 'Entertainment', 'Others'],
    datasets: [
      {
        data: [30, 25, 15, 12, 10, 8],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Income vs Expenses',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Expense Distribution',
      },
    },
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const statCards = [
    {
      title: 'Total Balance',
      value: `$${parseFloat(user?.balance || 0).toFixed(2)}`,
      icon: biWallet2,
      color: 'primary',
      bgColor: 'bg-primary-subtle',
      change: '+12.5%',
    },
    {
      title: 'Total Deposits',
      value: `$${stats?.totalDeposits?.toFixed(2) || '0.00'}`,
      icon: biArrowUpCircle,
      color: 'success',
      bgColor: 'bg-success-subtle',
      change: '+8.2%',
    },
    {
      title: 'Total Withdrawals',
      value: `$${stats?.totalWithdrawals?.toFixed(2) || '0.00'}`,
      icon: biArrowDownCircle,
      color: 'danger',
      bgColor: 'bg-danger-subtle',
      change: '-3.1%',
    },
    {
      title: 'Transactions',
      value: stats?.transactionCount || 0,
      icon: biClockHistory,
      color: 'info',
      bgColor: 'bg-info-subtle',
      change: '+15.7%',
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted">Welcome back, {user?.name}!</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm">
            <i className="bi bi-download me-1"></i> Export
          </button>
          <button className="btn btn-primary btn-sm">
            <i className="bi bi-plus-circle me-1"></i> New Transaction
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <Col lg={3} md={6} key={index}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h4 className="fw-bold mb-0">{stat.value}</h4>
                    <small className={`text-${stat.change.startsWith('+') ? 'success' : 'danger'}`}>
                      <i className={`bi bi-arrow-${stat.change.startsWith('+') ? 'up' : 'down'}-circle me-1`}></i>
                      {stat.change}
                    </small>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-circle`}>
                    <i className={`bi bi-${stat.icon} fs-4 text-${stat.color}`}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Line data={spendingData} options={lineOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Doughnut data={expenseDistributionData} options={doughnutOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Recent Transactions</h5>
            <a href="/transactions" className="text-primary text-decoration-none">
              View All <i className="bi bi-chevron-right ms-1"></i>
            </a>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className={`transaction-icon bg-${tx.type === 'deposit' ? 'success' : 'danger'}-subtle p-2 rounded-circle me-2`}>
                            <i className={`bi bi-${tx.type === 'deposit' ? 'arrow-up-circle' : 'arrow-down-circle'} text-${tx.type === 'deposit' ? 'success' : 'danger'}`}></i>
                          </div>
                          <div>
                            <div className="fw-medium">{tx.description || tx.type}</div>
                            <small className="text-muted">{tx.type}</small>
                          </div>
                        </div>
                      </td>
                      <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td className={`fw-bold ${tx.type === 'deposit' ? 'text-success' : 'text-danger'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td>
                        <span className="badge bg-success">Completed</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-3">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerDashboard;