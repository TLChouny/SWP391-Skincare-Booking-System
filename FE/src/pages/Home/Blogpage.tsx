// src/components/blog/BlogDetails.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const Blog = () => {
  const { id } = useParams();

  // Fetch blog details using the ID from params
  // Display detailed blog content here

  return (
    <div>
      <h1>Blog Details for ID: {id}</h1>
      {/* Render blog details */}
    </div>
  );
};

export default Blog;
