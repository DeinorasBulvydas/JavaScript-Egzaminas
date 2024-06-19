const { ApolloServer, gql, UserInputError } = require('apollo-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://deinorasbulvydas:HmU3sCfW8031clWh@cluster0.5fjtage.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Define Mongoose schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  token: String
});

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: { type: Number, default: 0 },
  category: String,
  time: String,
  location: String
});

const adminSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Define Mongoose models
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Admin = mongoose.model('Admin', adminSchema);


// GraphQL schema definition
const typeDefs = gql`
  type Query {
    hello: String
    currentUser: User
    getUser(token: String!): User
    getPosts(time: String): [Post]  
    GetCurrentUserWithPosts(user_id: ID!): User
    checkAdmin(userId: ID!): Boolean
  }

  type Mutation {
    signup(username: String!, password: String!, admin: Boolean!): String
    login(username: String!, password: String!): AuthPayload
    createPost(title: String!, content: String!, user_id: ID!, category: String!, time: String!, location: String!): Post 
    editPost(post_id: ID!, title: String, content: String, category: String, time: String, location: String): Post 
    deletePost(post_id: ID!): Post
    likePost(postId: ID!): Post
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    author: User!
    likes: Int!
    category: String!
    time: String!
    location: String!
  }

  type User {
    _id: ID!
    username: String!
    posts: [Post]!
    token: String!
  }

`;


// Resolvers/mutations
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    currentUser: async (_, __, context) => {
      const { userId } = context;
      if (userId) {
        try {
          return await User.findById(userId);
        } catch (error) {
          console.error('Error fetching current user:', error.message);
          throw new Error('Failed to fetch current user');
        }
      }
      return null;
    },
    getUser: async (_, { token }) => {
      try {
        const user = await User.findOne({ token }).populate('posts');
        return user;
      } catch (error) {
        console.error('Error fetching user:', error.message);
        throw new Error('Failed to fetch user');
      }
    },
    getPosts: async (_, { time }) => {
      try {
        let filter = {};
        if (time) {
          filter = { time };
        }
        const posts = await Post.find(filter).populate('author');
        return posts;
      } catch (error) {
        console.error('Error fetching posts:', error.message);
        throw new Error('Failed to fetch posts');
      }
    },
    GetCurrentUserWithPosts: async (_, { user_id }) => {
      try {
        const user = await User.findById(user_id).populate('posts');
        return user;
      } catch (error) {
        console.error('Error fetching user with posts:', error.message);
        throw new Error('Failed to fetch user with posts');
      }
    },
    checkAdmin: async (_, { userId }) => {
      try {
        const admin = await Admin.findOne({ userId });
        return !!admin;
      } catch (error) {
        console.error('Error checking admin:', error.message);
        throw new Error('Failed to check admin status');
      }
    }
  },
  Mutation: {
    signup: async (_, { username, password, admin }) => {
      try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new UserInputError('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
          username, 
          password: hashedPassword 
        });
        await newUser.save();

        if (admin) {
          const newAdmin = new Admin({ userId: newUser._id });
          await newAdmin.save();
        }

        return 'User signed up successfully';
      } catch (error) {
        console.error('Error in signup:', error.message);
        throw new Error(error.message);
      }
    },
    login: async (_, { username, password }) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new UserInputError('User not found');
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          throw new UserInputError('Invalid password');
        }
        const token = jwt.sign({ userId: user._id }, 'your_secret_key_here');
        user.token = token;
        await user.save();
        return { token, user };
      } catch (error) {
        console.error('Error in login:', error.message);
        throw new Error(error.message);
      }
    },
    createPost: async (_, { title, content, user_id, category, time, location }) => {
      try {
        const user = await User.findById(user_id);
        if (!user) {
          throw new UserInputError('User not found');
        }

        const newPost = new Post({
          title,
          content,
          author: user_id,
          category,
          time,
          location
        });

        await newPost.save();

        user.posts.push(newPost._id);
        await user.save();

        return newPost;
      } catch (error) {
        console.error('Error creating post:', error.message);
        throw new Error(error.message);
      }
    },
    editPost: async (_, { post_id, title, content, category, time, location }) => {
      try {
        const post = await Post.findById(post_id);
        if (!post) {
          throw new UserInputError('Post not found');
        }

        if (title !== undefined) post.title = title;
        if (content !== undefined) post.content = content;
        if (category !== undefined) post.category = category;
        if (time !== undefined) post.time = time;
        if (location !== undefined) post.location = location;

        await post.save();
        return post;
      } catch (error) {
        console.error('Error editing post:', error.message);
        throw new Error(error.message);
      }
    },
    deletePost: async (_, { post_id }) => {
      try {
        const post = await Post.findById(post_id);
        if (!post) {
          throw new UserInputError('Post not found');
        }

        const author = await User.findById(post.author);
        if (author) {
          author.posts = author.posts.filter(id => id.toString() !== post_id);
          await author.save();
        }

        await post.deleteOne();

        return post;
      } catch (error) {
        console.error('Error deleting post:', error.message);
        throw new Error(error.message);
      }
    },
    likePost: async (_, { postId }) => {
      try {
        const post = await Post.findById(postId);
        if (!post) {
          throw new UserInputError('Post not found');
        }
        post.likes += 1;
        await post.save();
        return post;
      } catch (error) {
        console.error('Error liking post:', error.message);
        throw new Error(error.message);
      }
    }
  }
};

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('Apollo Server Error:', error.message);
    return error;
  },
  context: async ({ req }) => {
    const token = req.headers.authorization || '';
    let userId = '';

    return { userId };
  }
});

// Start the server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
