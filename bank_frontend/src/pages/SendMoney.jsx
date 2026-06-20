import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { Card, Form, Button, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { biPerson, biEnvelope, biCurrencyDollar, biArrowRight } from 'react-bootstrap-icons';

const SendMoney = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    recipientEmail: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [recipient, setRecipient] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sendAmount = parseFloat(formData.amount);
    if (!sendAmount || sendAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (sendAmount > parseFloat(user.balance)) {
      setError('Insufficient balance');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userService.sendMoney({
        recipient_email: formData.recipientEmail,
        amount: sendAmount,
        description: formData.description || 'Money transfer',
      });

      setSuccess(`Successfully sent $${sendAmount.toFixed(2)} to ${formData.recipientEmail}`);
      setFormData({
        recipientEmail: '',
        amount: '',
        description: '',
      });
      setRecipient(null);
      
      // Update user balance
      user.balance = response.data.newBalance;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="send-money-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Send Money</h2>
          <p className="text-muted">Transfer funds to other users</p>
        </div>
        <div className="d-flex align-items-center">
          <i className="bi bi-wallet2 text-primary me-2"></i>
          <span className="fw-bold">Balance: ${parseFloat(user?.balance || 0).toFixed(2)}</span>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={7}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <i className="bi bi-envelope me-2"></i>
                    Recipient Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="recipientEmail"
                    placeholder="Enter recipient's email"
                    value={formData.recipientEmail}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Amount
                  </Form.Label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light">$</span>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0.01"
                      name="amount"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <small className="text-muted">
                    Available balance: ${parseFloat(user?.balance || 0).toFixed(2)}
                  </small>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Description (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    placeholder="What's this for?"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>

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
                      <i className="bi bi-arrow-right-circle me-2"></i>
                      Send Money
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Transfer Summary</h5>
              {formData.recipientEmail && formData.amount && (
                <div className="summary-box bg-light p-4 rounded-3">
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">From</span>
                    <span className="fw-bold">{user?.email}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">To</span>
                    <span className="fw-bold">{formData.recipientEmail}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Amount</span>
                    <span className="fw-bold text-danger">
                      -${parseFloat(formData.amount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between pt-3 border-top">
                    <span className="fw-bold">New Balance</span>
                    <span className="fw-bold text-success">
                      ${(parseFloat(user?.balance || 0) - parseFloat(formData.amount || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SendMoney;