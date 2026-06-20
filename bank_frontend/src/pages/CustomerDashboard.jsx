import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { 
  Card, 
  Row, 
  Col, 
  Spinner, 
  Alert,
  Badge,
  Button
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
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Wallet2, 
  ArrowUpCircle, 
  ArrowDownCircle,
  ClockHistory,
  GraphUp,  // Instead of TrendingUp
  CashStack,
  Person,
  Calendar
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
  const [timeFrame, setTimeFrame] = useState('month');
  const [chartData, setChartData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await userService.getDashboardStats();
      setStats(statsResponse.data);
      
      // Fetch recent transactions
      const txResponse = await userService.getTransactions({ limit: 5 });
      setRecentTransactions(txResponse.data.transactions || []);
      
      // Generate chart data
      generateChartData();
      generateExpenseData();
      
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    // Monthly data for the last 6 months
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const incomeData = [1200, 1900, 1500, 2100, 1800, 2400];
    const expenseData = [800, 1100, 900, 1400, 1200, 1600];
    
    setChartData({
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
        },
      ],
    });
  };

  const generateExpenseData = () => {
    setExpenseData({
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
          hoverOffset: 4,
        },
      ],
    });
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '$' + context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed + '%';
            }
            return label;
          }
        }
      }
    },
    cutout: '65%',
  };

  // Generate mock transactions if API returns empty
  const getMockTransactions = () => {
    const mockData = [
      {
        id: '1',
        type: 'deposit',
        amount: 500.00,
        description: 'Salary Deposit',
        created_at: new Date().toISOString(),
        balance_after: 2500.00
      },
      {
        id: '2',
        type: 'withdrawal',
        amount: 120.50,
        description: 'Online Purchase - Amazon',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        balance_after: 2379.50
      },
      {
        id: '3',
        type: 'deposit',
        amount: 200.00,
        description: 'Freelance Payment',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        balance_after: 2579.50
      },
      {
        id: '4',
        type: 'withdrawal',
        amount: 75.00,
        description: 'Restaurant - Dinner',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        balance_after: 2504.50
      },
      {
        id: '5',
        type: 'withdrawal',
        amount: 200.00,
        description: 'Transfer to Savings',
        created_at: new Date(Date.now() - 345600000).toISOString(),
        balance_after: 2304.50
      }
    ];
    return mockData;
  };

  const displayTransactions = recentTransactions.length > 0 ? recentTransactions : getMockTransactions();

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: 'bi-arrow-down-circle text-success',
      withdrawal: 'bi-arrow-up-circle text-danger',
      transfer: 'bi-arrow-right-circle text-warning',
      payment: 'bi-credit-card text-info'
    };
    return icons[type] || 'bi-circle text-secondary';
  };

  const getTransactionBadge = (type) => {
    const badges = {
      deposit: { bg: 'success', text: 'Deposit' },
      withdrawal: { bg: 'danger', text: 'Withdrawal' },
      transfer: { bg: 'warning', text: 'Transfer' },
      payment: { bg: 'info', text: 'Payment' }
    };
    return badges[type] || { bg: 'secondary', text: type };
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Error Loading Dashboard</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Alert>
    );
  }

  // Stats cards data
  const statCards = [
    {
      title: 'Total Balance',
      value: formatCurrency(user?.balance || 0),
      icon: Wallet2,
      color: 'primary',
      bgColor: 'bg-primary-subtle',
      change: '+12.5%',
      changeColor: 'success'
    },
    {
      title: 'Total Deposits',
      value: formatCurrency(stats?.totalDeposits || 0),
      icon: ArrowUpCircle,
      color: 'success',
      bgColor: 'bg-success-subtle',
      change: '+8.2%',
      changeColor: 'success'
    },
    {
      title: 'Total Withdrawals',
      value: formatCurrency(stats?.totalWithdrawals || 0),
      icon: ArrowDownCircle,
      color: 'danger',
      bgColor: 'bg-danger-subtle',
      change: '-3.1%',
      changeColor: 'danger'
    },
    {
      title: 'Total Transactions',
      value: stats?.transactionCount || 0,
      icon: ClockHistory,
      color: 'info',
      bgColor: 'bg-info-subtle',
      change: '+15.7%',
      changeColor: 'success'
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h2 className="fw-bold mb-1">Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back, {user?.name}! Here's your financial overview
          </p>
        </div>
        <div className="d-flex gap-2 mt-2 mt-sm-0">
          <Button variant="outline-primary" size="sm">
            <i className="bi bi-download me-1"></i> Export
          </Button>
          <Button variant="primary" size="sm">
            <i className="bi bi-plus-circle me-1"></i> New Transaction
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="g-4 mb-4">
        {statCards.map((stat, index) => (
          <Col lg={3} md={6} key={index}>
            <Card className="h-100 shadow-sm border-0 stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted mb-1 small fw-medium">{stat.title}</p>
                    <h4 className="fw-bold mb-1">{stat.value}</h4>
                    <small className={`text-${stat.changeColor}`}>
                      <i className={`bi bi-arrow-${stat.change.startsWith('+') ? 'up' : 'down'}-circle me-1`}></i>
                      {stat.change}
                    </small>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-circle`}>
                    <stat.icon className={`fs-4 text-${stat.color}`} />
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-0">Income vs Expenses</h5>
                  <small className="text-muted">Last 6 months overview</small>
                </div>
                <div className="d-flex gap-2">
                  <Button 
                    variant={timeFrame === 'week' ? 'primary' : 'outline-secondary'} 
                    size="sm"
                    onClick={() => setTimeFrame('week')}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={timeFrame === 'month' ? 'primary' : 'outline-secondary'} 
                    size="sm"
                    onClick={() => setTimeFrame('month')}
                  >
                    Month
                  </Button>
                  <Button 
                    variant={timeFrame === 'year' ? 'primary' : 'outline-secondary'} 
                    size="sm"
                    onClick={() => setTimeFrame('year')}
                  >
                    Year
                  </Button>
                </div>
              </div>
              <div style={{ height: '300px' }}>
                {chartData && <Line data={chartData} options={lineOptions} />}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="fw-bold mb-3">Expense Distribution</h5>
              <div style={{ height: '300px' }}>
                {expenseData && <Doughnut data={expenseData} options={doughnutOptions} />}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Transactions */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold mb-0">Recent Transactions</h5>
              <small className="text-muted">Your latest financial activities</small>
            </div>
            <a href="/transactions" className="text-primary text-decoration-none">
              View All <i className="bi bi-chevron-right ms-1"></i>
            </a>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="ps-3">Transaction</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayTransactions.length > 0 ? (
                  displayTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center">
                          <div className={`transaction-icon bg-${getTransactionBadge(tx.type).bg}-subtle p-2 rounded-circle me-3`}>
                            <i className={getTransactionIcon(tx.type)}></i>
                          </div>
                          <div>
                            <div className="fw-medium">{tx.description || tx.type}</div>
                            <small className="text-muted">
                              {tx.type === 'deposit' ? 'Money In' : 'Money Out'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{new Date(tx.created_at).toLocaleDateString()}</div>
                        <small className="text-muted">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                      </td>
                      <td>
                        <Badge bg={getTransactionBadge(tx.type).bg}>
                          {getTransactionBadge(tx.type).text}
                        </Badge>
                      </td>
                      <td className={`fw-bold ${tx.type === 'deposit' ? 'text-success' : 'text-danger'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td>
                        <Badge bg="success" className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <i className="bi bi-check-circle-fill"></i>
                          Completed
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <i className="bi bi-inbox fs-1 d-block text-muted mb-3"></i>
                      <p className="text-muted mb-0">No transactions found</p>
                      <small className="text-muted">Start making transactions to see them here</small>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-top">
            <div className="d-flex gap-3 flex-wrap">
              <Button variant="outline-primary" size="sm">
                <i className="bi bi-arrow-down-circle me-1"></i> Deposit
              </Button>
              <Button variant="outline-success" size="sm">
                <i className="bi bi-arrow-up-circle me-1"></i> Withdraw
              </Button>
              <Button variant="outline-info" size="sm">
                <i className="bi bi-send me-1"></i> Send Money
              </Button>
              <Button variant="outline-warning" size="sm">
                <i className="bi bi-clock-history me-1"></i> View History
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CustomerDashboard;