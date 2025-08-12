import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PhotoUpload from './components/PhotoUpload';
import PostSubmission from './components/PostSubmission';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>📚 AI Book Agent</h1>
          <p>Upload a book photo and get AI-generated social media content</p>
        </header>
        
        <main className="App-main">
          <Routes>
            <Route path="/" element={<PhotoUpload />} />
            <Route path="/submit-post" element={<PostSubmission />} />
          </Routes>
        </main>
        
        <footer className="App-footer">
          <p>Powered by AI • 辞海UGC</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

