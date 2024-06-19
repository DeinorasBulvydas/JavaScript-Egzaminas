import React, { useState } from 'react';
import { useMutation, gql, useQuery } from '@apollo/client';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const GET_USER = gql`
  query GetUser($token: String!) {
    getUser(token: $token) {
      _id
      username
      posts {
        _id
        title
        content
      }
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $user_id: ID!, $time: String!, $category: String!, $location: String!) {
    createPost(title: $title, content: $content, user_id: $user_id, time: $time, category: $category, location: $location) {
      _id
      title
      content
      author {
        _id
      }
      time
      category
      location
    }
  }
`;

const PostCreate: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('convention');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { loading, data } = useQuery(GET_USER, {
    variables: {
      token: localStorage.getItem('token') || '',
    },
    onError: (error) => {
      console.error('GraphQL error:', error.message);
    },
  });

  const [createPostMutation] = useMutation(CREATE_POST, {
    onError: (error) => {
      setError(error.message);
    },
    onCompleted: (data) => {
      console.log('Post created:', data.createPost);
      setSuccessMessage('Post successfully created');
    },
    update: (cache, { data: { createPost } }) => {
      const cachedUser = cache.readQuery({
        query: GET_USER,
        variables: { token: localStorage.getItem('token') || '' },
      });

      if (cachedUser && cachedUser.getUser) {
        const updatedPosts = [...cachedUser.getUser.posts, createPost];
        cache.writeQuery({
          query: GET_USER,
          variables: { token: localStorage.getItem('token') || '' },
          data: {
            getUser: {
              ...cachedUser.getUser,
              posts: updatedPosts,
            },
          },
        });
      }
    },
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data || !data.getUser || !data.getUser._id) {
      setError('User ID not found');
      return;
    }

    try {
      await createPostMutation({
        variables: {
          title,
          content,
          user_id: data.getUser._id,
          time,
          category,
          location,
        },
      });
      setTitle('');
      setContent('');
      setTime('');
      setCategory('convention');
      setLocation('');
      setSuccessMessage('Post successfully created');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!data || !data.getUser) {
    return <p>No user data found</p>;
  }

  return (
    <Container className="mt-5">
      <h2>Create Post</h2>
      <Form onSubmit={handleCreatePost}>
        <Form.Group controlId="title">
          <Form.Label>Title:</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="content">
          <Form.Label>Content:</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="time">
          <Form.Label>Time:</Form.Label>
          <Form.Control
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="category">
          <Form.Label>Category:</Form.Label>
          <Form.Control
            as="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="convention">Convention</option>
            <option value="festival">Festival</option>
            <option value="exhibition">Exhibition</option>
            <option value="fair">Fair</option>
          </Form.Control>
        </Form.Group>
        <Form.Group controlId="location">
          <Form.Label>Location:</Form.Label>
          <Form.Control
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Creating Post...' : 'Create Post'}
        </Button>
        {error && <Alert variant="danger" className="mt-3">Error: {error}</Alert>}
        {successMessage && <Alert variant="success" className="mt-3">{successMessage}</Alert>}
      </Form>
    </Container>
  );
};

export default PostCreate;
