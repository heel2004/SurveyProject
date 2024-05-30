import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import SurveyCreator from './SurveyCreator';
import HomePage from './HomePage';
import FindSurvey from './FindSurvey';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SurveyForm from './SurveyForm';
import ErrorPage from './ErrorPage';
import SurveyStatistics from './SurveyStatistics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggedIn, setIsLoggedin] = useState(false);
  const [requestedPage, setRequestedPage] = useState(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const navbarRef = useRef(null);
  var userEmail = localStorage.getItem('email');

  useEffect(() => {
    // Check for authentication status in browser cookies on component mount
    const storedAuthStatus = document.cookie.includes('isAuthenticated=true');
    if (storedAuthStatus) {
      setIsAuthenticated(true);
      if (localStorage.getItem('email') === null) { setIsLoggedin(false); }
    }
  }, []);

  // Function to handle successful login and set the authentication status
  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsLoggedin(true);
    // Store the authentication status in browser cookies
    document.cookie = 'isAuthenticated=true; path=/';
    // Redirect the user to the requested page
    if (requestedPage) {
      setRequestedPage(null); // Reset requestedPage state
    }
  };

  // Function to handle logout and reset the authentication status
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('email');
    setIsAuthenticated(false);
    setIsNavbarOpen(false);
    setIsLoggedin(false);
  };

  // Function to toggle the navbar collapse on mobile screens
  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  // Function to close the navbar when a menu item is clicked
  const closeNavbar = () => {
    setIsNavbarOpen(false);
  };

  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top" ref={navbarRef}>
          <div className="container">
            <Link className="navbar-brand" to="/" onClick={closeNavbar}>
              Tech Insights
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
              onClick={toggleNavbar}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`collapse navbar-collapse${isNavbarOpen ? ' show' : ''}`} id="navbarNav">

              <div className={`collapse navbar-collapse${isNavbarOpen ? ' show' : ''} justify-content-start`} id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <NavLink className="nav-link" exact to="/" activeClassName="active" onClick={closeNavbar}>
                      Home
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/create" activeClassName="active" onClick={closeNavbar}>
                      Create Survey
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/sampleform" activeClassName="active" onClick={closeNavbar}>
                      Sample Form
                    </NavLink>
                  </li>
                </ul>
              </div>
              {isLoggedIn ? (
                <>
                  <div className={`collapse navbar-collapse${isNavbarOpen ? ' show' : ''} justify-content-end`} id="navbarNav">
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <span className="nav-link" style={{ color: "black" }}>
                          {"Welcome, " + userEmail}
                        </span>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link" to="/" onClick={handleLogout}>
                          <FontAwesomeIcon icon={faSignOutAlt} />
                        </Link>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className={`collapse navbar-collapse${isNavbarOpen ? ' show' : ''} justify-content-end`} id="navbarNav">
                    <ul className="navbar-nav">
                      <li className="nav-item">
                        <NavLink className="nav-link" to="/login" onClick={closeNavbar}>
                          Login
                        </NavLink>
                      </li>
                      <li className="nav-item">
                        <NavLink className="nav-link" to="/register" onClick={closeNavbar}>
                          Register
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="container mt-4">
          <Routes>
            <Route
              path="/login"
              element={<LoginForm handleLogin={handleLogin} setRequestedPage={setRequestedPage} />}
            />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/sampleform" element={<SurveyForm />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <HomePage />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/' }} />
                )
              }
            />
            <Route
              path="/FindSurvey/:surveyId"
              element={
                isAuthenticated ? (
                  <FindSurvey />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                    state={{ from: `${window.location.pathname}` }}
                  />
                )
              }
            />
            <Route
              path="/SurveyReport/:surveyId"
              element={
                isAuthenticated ? (
                  <SurveyStatistics />
                ) : (
                  <Navigate
                    to="/login"
                    replace
                    state={{ from: `${window.location.pathname}` }}
                  />
                )
              }
            />
            <Route
              path="/create"
              element={
                isAuthenticated ? (
                  <SurveyCreator />
                ) : (
                  <Navigate to="/login" replace state={{ from: '/create' }} />
                )
              }
            />
          </Routes>
        </div>
      </div >
    </Router >
  );
};

export default App;
