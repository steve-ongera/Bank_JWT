import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { 
  Card, 
  Form, 
  Button, 
  Alert, 
  Row, 
  Col,
  Spinner,
  Image
} from 'react-bootstrap';
import { 
  Person, 
  Envelope, 
  Wallet2, 
  Calendar, 
  Pencil,
  CheckCircle
} from 'react-bootstrap-icons';

const Profile = () => {
  const { user, fetchProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.updateProfile(formData);
      await fetchProfile();
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const InfoItem = ({ icon, label, value, className = '' }) => (
    <div className={`info-item d-flex align-items-center gap-3 p-3 border rounded-3 ${className}`}>
      <div className="bg-primary-subtle p-2 rounded-circle">
        <i className={`bi bi-${icon} text-primary`}></i>
      </div>
      <div>
        <div className="text-muted small">{label}</div>
        <div className="fw-bold">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Profile</h2>
          <p className="text-muted">Manage your account information</p>
        </div>
        {!isEditing && (
          <Button 
            variant="outline-primary"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="me-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm border-0 text-center">
            <Card.Body className="p-4">
              <div className="profile-avatar mx-auto mb-3">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                     style={{ width: '120px', height: '120px', margin: '0 auto' }}>
                  <Person className="fs-1" />
                </div>
              </div>
              <h4 className="fw-bold">{user?.name}</h4>
              <p className="text-muted">{user?.email}</p>
              <div className="d-flex justify-content-center gap-2">
                <span className="badge bg-success">Verified</span>
                <span className="badge bg-primary">Active</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <Person className="me-2" />
                      Full Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      <Envelope className="me-2" />
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button type="submit" variant="primary" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <div className="mb-4">
                    <InfoItem 
                      icon="person"
                      label="Full Name"
                      value={user?.name}
                    />
                    <InfoItem 
                      icon="envelope"
                      label="Email Address"
                      value={user?.email}
                      className="mt-3"
                    />
                    <InfoItem 
                      icon="wallet"
                      label="Balance"
                      value={`$${parseFloat(user?.balance || 0).toFixed(2)}`}
                      className="mt-3"
                    />
                    <InfoItem 
                      icon="calendar"
                      label="Member Since"
                      value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                      className="mt-3"
                    />
                  </div>

                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-bold mb-3">Account Statistics</h6>
                    <Row className="g-3">
                      <Col sm={6}>
                        <div className="bg-light p-3 rounded-3 text-center">
                          <div className="text-muted small">Total Deposits</div>
                          <div className="fw-bold text-success">$2,450.00</div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="bg-light p-3 rounded-3 text-center">
                          <div className="text-muted small">Total Withdrawals</div>
                          <div className="fw-bold text-danger">$1,200.00</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;