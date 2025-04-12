import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Image } from 'react-bootstrap';
import { FaTwitter, FaHome, FaUser, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import NotificationBadge from './NotificationBadge';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <BootstrapNavbar expand="lg" className="navbar py-2 fixed-top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="text-primary d-flex align-items-center">
          <FaTwitter size={28} />
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className="d-flex align-items-center px-3 py-2 rounded-pill hover-bg-light"
            >
              <FaHome className="me-2" size={20} />
              <span className="fw-medium">Home</span>
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/search"
              className="d-flex align-items-center px-3 py-2 rounded-pill hover-bg-light"
            >
              <FaSearch className="me-2" size={20} />
              <span className="fw-medium">Find People</span>
            </Nav.Link>
            <NotificationBadge />
            <Nav.Link
              as={Link}
              to={`/profile/${currentUser?.id}`}
              className="d-flex align-items-center px-3 py-2 rounded-pill hover-bg-light"
            >
              <FaUser className="me-2" size={20} />
              <span className="fw-medium">Profile</span>
            </Nav.Link>
          </Nav>
          {currentUser && (
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <Image
                  src={currentUser.profilePicture || 'https://via.placeholder.com/32?text=No+Photo'}
                  alt={currentUser.name}
                  roundedCircle
                  width={36}
                  height={36}
                  className="me-2 border"
                />
                <div className="d-none d-lg-block">
                  <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{currentUser.name}</div>
                  <div className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '-4px' }}>
                    @{currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '')}
                  </div>
                </div>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleLogout}
                className="rounded-pill px-3 py-2 d-flex align-items-center gap-2"
              >
                <FaSignOutAlt size={16} />
                <span className="d-none d-lg-inline">Logout</span>
              </Button>
            </div>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
