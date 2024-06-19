import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql, useLazyQuery } from '@apollo/client';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const GET_POSTS = gql`
  query GetPosts {
    getPosts {
      _id
      title
      content
      category
      time
      likes
      author {
        _id
        username
      }
    }
  }
`;

const EDIT_POST = gql`
  mutation EditPost($postId: ID!, $title: String, $content: String, $category: String, $time: String) {
    editPost(post_id: $postId, title: $title, content: $content, category: $category, time: $time) {
      _id
      title
      content
      category
      time
    }
  }
`;

const DELETE_POST = gql`
  mutation DeletePost($postId: ID!) {
    deletePost(post_id: $postId) {
      _id
    }
  }
`;

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

const AdminPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const { data: postData, loading: postLoading, error: postError, refetch: refetchPosts } = useQuery(GET_POSTS);
  const [editPost] = useMutation(EDIT_POST);
  const [deletePost] = useMutation(DELETE_POST);
  const [editingPost, setEditingPost] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [loginUser, { loading: loginLoading }] = useMutation(LOGIN_USER, {
    onError: (error) => {
      setError(error.message);
    },
    onCompleted: async (data) => {
      localStorage.setItem('token', data.login.token);
      setSuccessMessage(`Logged in successfully as ${data.login.user.username}`);
      setCurrentUser(data.login.user);

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

  const handleLogin = async (e) => {
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

  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const handleSave = async () => {
    const { _id, title, content, category, time } = editingPost;
    await editPost({ variables: { postId: _id, title, content, category, time } });
    refetchPosts();
    setEditingPost(null);
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost({ variables: { postId } });
      refetchPosts();
    }
  };

  if (!currentUser) {
    return (
      <Container className="mt-5">
        <Row>
          <Col>
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
              <Button variant="primary" type="submit" disabled={loginLoading}>
                Login
              </Button>
              {error && <p className="text-danger">Error: {error}</p>}
              {successMessage && <p className="text-success">{successMessage}</p>}
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container className="mt-5">
        <Row>
          <Col>
            <p>No Authorization</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h2>Admin Page</h2>
          {postLoading ? (
            <p>Loading...</p>
          ) : postError ? (
            <p>Error loading posts...</p>
          ) : (
            postData.getPosts.map((post) => (
              <div key={post._id} className="mb-4 border p-3">
                {editingPost && editingPost._id === post._id ? (
                  <div>
                    <Form.Control
                      type="text"
                      value={editingPost.title}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, title: e.target.value })
                      }
                    />
                    <Form.Control
                      as="textarea"
                      value={editingPost.content}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, content: e.target.value })
                      }
                    />
                    <Form.Control
                      type="text"
                      value={editingPost.category}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, category: e.target.value })
                      }
                    />
                    <Form.Control
                      type="text"
                      value={editingPost.time}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, time: e.target.value })
                      }
                    />
                    <Button variant="primary" onClick={handleSave} className="mt-3">
                      Save
                    </Button>
                  </div>
                ) : (
                  <div>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <p>Category: {post.category}</p>
                    <p>Time: {post.time}</p>
                    <p>Author: {post.author.username}</p>
                    <p>Likes: {post.likes}</p>
                    <Button variant="info" onClick={() => handleEdit(post)} className="mr-2">
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(post._id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminPage;
