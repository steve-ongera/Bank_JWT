import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { 
  Card, 
  Form, 
  Row, 
  Col, 
  Spinner, 
  Alert,
  Badge,
  Pagination,
  InputGroup
} from 'react-bootstrap';
import { Search, Filter, Download } from 'react-bootstrap-icons';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [filter, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await userService.getTransactions({
        type: filter !== 'all' ? filter : undefined,
        page: currentPage,
        limit: itemsPerPage,
      });
      setTransactions(response.data.transactions || []);
      setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      tx.description?.toLowerCase().includes(search) ||
      tx.type?.toLowerCase().includes(search) ||
      parseFloat(tx.amount).toString().includes(search)
    );
  });

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'deposit': return 'bi-arrow-down-circle text-success';
      case 'withdrawal': return 'bi-arrow-up-circle text-danger';
      case 'transfer': return 'bi-arrow-right-circle text-warning';
      case 'payment': return 'bi-credit-card text-info';
      default: return 'bi-circle text-secondary';
    }
  };

  const getTransactionBadge = (type) => {
    const badges = {
      deposit: { bg: 'success', text: 'Deposit' },
      withdrawal: { bg: 'danger', text: 'Withdrawal' },
      transfer: { bg: 'warning', text: 'Transfer' },
      payment: { bg: 'info', text: 'Payment' },
    };
    return badges[type] || { bg: 'secondary', text: type };
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

  return (
    <div className="transactions-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Transactions</h2>
          <p className="text-muted">View all your transaction history</p>
        </div>
        <button className="btn btn-outline-primary">
          <Download className="me-2" />
          Export
        </button>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <InputGroup>
                <span className="input-group-text bg-light">
                  <Search />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="transfer">Transfers</option>
                <option value="payment">Payments</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Select>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>This year</option>
              </Form.Select>
            </Col>
            <Col md={2} className="text-end">
              <span className="text-muted small">
                {filteredTransactions.length} transactions
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Transaction</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th className="text-end">Amount</th>
                  <th className="text-end pe-4">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="transaction-icon bg-light p-2 rounded-circle me-3">
                            <i className={getTransactionIcon(tx.type)}></i>
                          </div>
                          <div>
                            <div className="fw-medium">{tx.description || tx.type}</div>
                            <small className="text-muted">Transaction #{tx.id?.slice(0, 8)}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{new Date(tx.created_at).toLocaleDateString()}</div>
                        <small className="text-muted">{new Date(tx.created_at).toLocaleTimeString()}</small>
                      </td>
                      <td>
                        <Badge bg={getTransactionBadge(tx.type).bg}>
                          {getTransactionBadge(tx.type).text}
                        </Badge>
                      </td>
                      <td className={`text-end fw-bold ${
                        tx.type === 'deposit' ? 'text-success' : 'text-danger'
                      }`}>
                        {tx.type === 'deposit' ? '+' : '-'}$
                        {parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td className="text-end pe-4">
                        ${parseFloat(tx.balance_after).toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <i className="bi bi-inbox fs-1 d-block text-muted mb-3"></i>
                      <p className="text-muted">No transactions found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
        <Card.Footer className="bg-white border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
            {totalPages > 1 && (
              <Pagination size="sm" className="mb-0">
                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} />
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  if (page <= totalPages) {
                    return (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  }
                  return null;
                })}
                <Pagination.Next onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            )}
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Transactions;