import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import PhotoUpload from './components/PhotoUpload';
import PostSubmission from './components/PostSubmission';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>📚 AI 辞海助手</h1>
          <p>上传辞海照片，获取AI生成的小红书内容</p>
        </header>
        
        <main className="App-main">
                  <Routes>
          <Route path="/" element={<PhotoUpload />} />
          <Route path="/submit-post" element={<PostSubmission />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        </main>
        
        <footer className="App-footer">
          <p>AI驱动 • 辞海UGC</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

