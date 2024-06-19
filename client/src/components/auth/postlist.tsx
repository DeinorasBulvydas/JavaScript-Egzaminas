import React, { useState } from 'react';
import { useMutation, gql, useQuery } from '@apollo/client';
import 'bootstrap/dist/css/bootstrap.min.css';

const GET_POSTS = gql`
  query GetPosts($time: String) {
    getPosts(time: $time) {
      _id
      title
      content
      category
      time
      location
      likes
      author {
        _id
        username
      }
    }
  }
`;

const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      _id
      likes
    }
  }
`;

const PostList: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const { data: postsData, loading: postsLoading, error: postsError, refetch } = useQuery(GET_POSTS, {
    variables: {
      time: selectedTime || undefined,
    },
    onError: (error) => {
      console.error('GraphQL error:', error.message);
      setError('Error fetching posts');
    },
  });

  const [likePostMutation] = useMutation(LIKE_POST, {
    onError: (error) => {
      if (error.message === 'You must be logged in to like a post') {
        setError('Please log in to like this post');
      } else {
        setError('Error liking post');
      }
    },
    onCompleted: () => {
      refetch();
    },
  });

  const handleLikePost = async (postId: string) => {
    try {
      await likePostMutation({ variables: { postId } });
    } catch (err) {
      console.error(err);
      setError('Error liking post');
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
  };

  if (postsLoading) return <p>Loading...</p>;
  if (postsError) return <p>Error fetching posts: {postsError.message}</p>;

  let filteredPosts = postsData?.getPosts;
  if (selectedCategory) {
    filteredPosts = filteredPosts?.filter(post => post.category === selectedCategory);
  }

  return (
    <div className="container mt-5">
      <h2>Posts</h2>
      <div className="mb-3">
        <label htmlFor="categoryFilter" className="form-label">Filter by Category:</label>
        <select
          id="categoryFilter"
          className="form-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          <option value="convention">Convention</option>
          <option value="festival">Festival</option>
          <option value="exhibition">Exhibition</option>
          <option value="fair">Fair</option>
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="timeFilter" className="form-label">Filter by Time:</label>
        <input
          type="datetime-local"
          id="timeFilter"
          className="form-control"
          value={selectedTime}
          onChange={handleTimeChange}
        />
      </div>
      {error && <p className="text-danger">Error: {error}</p>}
      {filteredPosts?.map((post) => (
        <div key={post._id} className="border p-3 mb-3">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p>Category: {post.category}</p>
          <p>Time: {post.time}</p>
          <p>Location {post.location}</p>
          <p>Author: {post.author.username}</p>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="mb-0">Likes: {post.likes}</p>
            </div>
            <div>
              <button
                className="btn btn-outline-primary"
                onClick={() => handleLikePost(post._id)}
              >
                <i className="bi bi-star"></i> Like
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
