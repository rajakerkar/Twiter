import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { TweetProvider } from './context/TweetContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Notifications from './pages/Notifications';

function App() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <Router>
        <AuthProvider>
          <TweetProvider>
            <NotificationProvider>
              <div className="min-vh-100 bg-light">
                <Navbar />
                <div className="pt-5 mt-5"> {/* Add padding for fixed navbar */}
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      <Route path="/settings/profile" element={<Settings />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/explore" element={<Search />} />
                      <Route path="/notifications" element={<Notifications />} />
                    </Route>

                    {/* Redirect any unknown routes to home */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </div>
            </NotificationProvider>
          </TweetProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
