// main.tsx

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import MainRouter from "./router/MainRouter.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Create an Apollo Client instance
const client = new ApolloClient({
  uri: 'http://localhost:4000', // Replace with your GraphQL server URL
  cache: new InMemoryCache()
});

// Render your app wrapped with ApolloProvider
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <MainRouter />
    </ApolloProvider>
  </React.StrictMode>
);
