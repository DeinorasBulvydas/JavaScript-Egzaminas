import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from '../components/auth/Register';
import Login from '../components/auth/Login';
import PostsList from '../components/auth/postlist';
import PostCreate from '../components/auth/postcreate';
import Admin from '../components/auth/Admin';
import 'bootstrap/dist/css/bootstrap.min.css';

function Index() {
  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link to="/register" className="nav-link">Register</Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">Login</Link>
                </li>
                <li className="nav-item">
                  <Link to="/post/create" className="nav-link">Create Post</Link>
                </li>
                <li className="nav-item">
                  <Link to="/posts" className="nav-link">Posts List</Link>
                </li>
                <li className="nav-item">
                  <Link to="/admin" className="nav-link">Admin</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/post/create" element={<PostCreate />} />
          <Route path="/posts" element={<PostsList />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default Index;
