import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css'; 

const REGISTER_USER = gql`
  mutation SignUp($username: String!, $password: String!, $admin: Boolean!) {
    signup(username: $username, password: $password, admin: $admin)
  }
`;

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [admin, setAdmin] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [registerUser, { loading }] = useMutation(REGISTER_USER, {
    onError: (error) => {
      setError(error.message);
    },
    onCompleted: () => {
      setSuccessMessage('You have successfully registered');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setAdmin(false);
    },
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await registerUser({
        variables: { username, password, admin }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username:</label>
          <input
            type="text"
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            id="adminCheckbox"
            className="form-check-input"
            checked={admin}
            onChange={(e) => setAdmin(e.target.checked)}
          />
          <label htmlFor="adminCheckbox" className="form-check-label">Admin</label>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Register
        </button>
        {error && <p className="text-danger mt-2">Error: {error}</p>}
        {successMessage && <p className="text-success mt-2">{successMessage}</p>}
      </form>
    </div>
  );
};

export default Register;
