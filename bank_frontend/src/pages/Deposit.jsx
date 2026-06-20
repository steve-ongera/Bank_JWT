import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { biCreditCard, biWallet2, biArrowUpCircle } from 'react-bootstrap-icons';

const Deposit = () => {
  const { user, deposit } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('bank');

  const quickAmounts = [100, 200, 500, 1000, 2000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deposit(depositAmount);
      if (result.success) {
        setSuccess(`Successfully deposited $${depositAmount.toFixed(2)}`);
        setAmount('');
      } else {
        setError(result.message || 'Deposit failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Deposit Funds</h2>
          <p className="text-muted">Add money to your account</p>
        </div>
        <div className="d-flex align-items-center">
          <i className="bi bi-wallet2 text-primary me-2"></i>
          <span className="fw-bold">Balance: ${parseFloat(user?.balance || 0).toFixed(2)}</span>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Select Deposit Method</Form.Label>
                  <div className="d-flex gap-3 flex-wrap">
                    {['bank', 'card', 'crypto'].map((method) => (
                      <div
                        key={method}
                        className={`payment-method p-3 border rounded-3 cursor-pointer ${
                          selectedMethod === method ? 'border-primary bg-primary-subtle' : ''
                        }`}
                        onClick={() => setSelectedMethod(method)}
                        style={{ cursor: 'pointer', flex: 1, minWidth: '120px' }}
                      >
                        <div className="text-center">
                          <i className={`bi bi-${
                            method === 'bank' ? 'bank2' : 
                            method === 'card' ? 'credit-card' : 'currency-bitcoin'
                          } fs-2 d-block mb-2`}></i>
                          <div className="fw-medium text-capitalize">{method}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Amount to Deposit</Form.Label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light">$</span>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="form-control-lg"
                    />
                  </div>
                </Form.Group>

                <div className="mb-4">
                  <Form.Label className="fw-bold">Quick Amounts</Form.Label>
                  <div className="d-flex gap-2 flex-wrap">
                    {quickAmounts.map((qAmount) => (
                      <Button
                        key={qAmount}
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setAmount(qAmount.toString())}
                        className="quick-amount-btn"
                      >
                        ${qAmount}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 py-3 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-up-circle me-2"></i>
                      Deposit ${parseFloat(amount || 0).toFixed(2) || '0.00'}
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Deposit Information</h5>
              <div className="info-item d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                <i className="bi bi-check-circle-fill text-success fs-4"></i>
                <div>
                  <div className="fw-medium">Instant Processing</div>
                  <small className="text-muted">Funds available immediately</small>
                </div>
              </div>
              <div className="info-item d-flex align-items-center gap-3 mb-3 p-3 bg-light rounded-3">
                <i className="bi bi-shield-check text-primary fs-4"></i>
                <div>
                  <div className="fw-medium">Secure Transaction</div>
                  <small className="text-muted">256-bit encryption</small>
                </div>
              </div>
              <div className="info-item d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                <i className="bi bi-clock-history text-warning fs-4"></i>
                <div>
                  <div className="fw-medium">24/7 Support</div>
                  <small className="text-muted">Dedicated support team</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Deposit;