import React, { useState, useEffect } from 'react';
import { useMutation, gql, useLazyQuery } from '@apollo/client';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

const CHECK_ADMIN = gql`
  query CheckAdmin($userId: ID!) {
    checkAdmin(userId: $userId)
  }
`;

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    onError: (error) => {
      setError(error.message);
    },
    onCompleted: async (data) => {
      localStorage.setItem('token', data.login.token);
      setSuccessMessage(`Logged in successfully as ${data.login.user.username}`);

      try {
        const { data: adminData } = await checkAdminQuery({ variables: { userId: data.login.user._id } });
        setIsAdmin(adminData.checkAdmin);
      } catch (err) {
        console.error('Error checking admin status:', err.message);
        setIsAdmin(false);
      }
    }
  });

  const [checkAdminQuery] = useLazyQuery(CHECK_ADMIN, {
    fetchPolicy: 'network-only'
  });


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser({
        variables: { username, password },
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Login</h2>
      <Form onSubmit={handleLogin}>
        <Form.Group controlId="username">
          <Form.Label>Username:</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>Password:</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
        {error && <Alert variant="danger" className="mt-3">Error: {error}</Alert>}
        {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}
      </Form>
      {isAdmin && <p className="mt-3">Admin privileges granted!</p>}
    </Container>
  );
};

export default Login;
