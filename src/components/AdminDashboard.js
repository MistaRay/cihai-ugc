import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, RefreshCw, Download } from 'lucide-react';

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/submissions');
      const data = await response.json();
      
      if (data.success) {
        setSubmissions(data.submissions);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (err) {
      setError('Network error while fetching submissions');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/update-status?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setSubmissions(prev => 
          prev.map(sub => 
            sub._id === id 
              ? { ...sub, status: newStatus, updatedAt: new Date().toISOString() }
              : sub
          )
        );
        
        // Close modal if open
        if (selectedSubmission && selectedSubmission._id === id) {
          setSelectedSubmission(null);
        }
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (err) {
      alert('Error updating status');
      console.error('Error:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-400" />;
      case 'processing':
        return <RefreshCw size={16} className="text-yellow-400" />;
      default:
        return <Clock size={16} className="text-blue-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-900/20 border-green-500/30 text-green-400';
      case 'rejected':
        return 'bg-red-900/20 border-red-500/30 text-red-400';
      case 'processing':
        return 'bg-yellow-900/20 border-yellow-500/30 text-yellow-400';
      default:
        return 'bg-blue-900/20 border-blue-500/30 text-blue-400';
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    filterStatus === 'all' || sub.status === filterStatus
  );

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Post Link', 'Status', 'Timestamp', 'Title', 'Main Text'];
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(sub => [
        `"${sub.name}"`,
        `"${sub.email}"`,
        `"${sub.postLink}"`,
        sub.status,
        sub.timestamp,
        `"${sub.generatedContent?.title || ''}"`,
        `"${sub.generatedContent?.mainText?.substring(0, 100) || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ugc-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4 text-blue-400" size={48} />
          <p className="text-gray-300">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">辞海UGC Admin Dashboard</h1>
          <p className="text-gray-400">Manage user submissions and content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Total Submissions</h3>
            <p className="text-2xl font-bold text-white">{submissions.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Pending</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {submissions.filter(s => s.status === 'pending').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Approved</h3>
            <p className="text-2xl font-bold text-green-400">
              {submissions.filter(s => s.status === 'approved').length}
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-gray-400 text-sm font-medium">Rejected</h3>
            <p className="text-2xl font-bold text-red-400">
              {submissions.filter(s => s.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={16} />
            Export CSV
          </button>
          
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Submissions Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Content Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Post Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">{submission.name}</div>
                        <div className="text-sm text-gray-400">{submission.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-white font-medium mb-1">
                          {submission.generatedContent?.title || 'No title'}
                        </div>
                        <div className="text-sm text-gray-400 line-clamp-2">
                          {submission.generatedContent?.mainText?.substring(0, 100) || 'No content'}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={submission.postLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm truncate block max-w-xs"
                      >
                        {submission.postLink}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(submission.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-blue-400 hover:text-blue-300"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {submission.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(submission._id, 'approved')}
                              className="text-green-400 hover:text-green-300"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => updateStatus(submission._id, 'rejected')}
                              className="text-red-400 hover:text-red-300"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No submissions found</p>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Submission Details</h2>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400">User Information</h3>
                  <p className="text-white">Name: {selectedSubmission.name}</p>
                  <p className="text-white">Email: {selectedSubmission.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400">Post Link</h3>
                  <a
                    href={selectedSubmission.postLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 break-all"
                  >
                    {selectedSubmission.postLink}
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400">Generated Content</h3>
                  <div className="bg-gray-700 p-3 rounded">
                    <p className="text-white font-medium mb-2">
                      {selectedSubmission.generatedContent?.title || 'No title'}
                    </p>
                    <p className="text-gray-300 text-sm mb-2">
                      {selectedSubmission.generatedContent?.mainText || 'No content'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubmission.generatedContent?.hashtags?.map((tag, index) => (
                        <span key={index} className="text-blue-400 text-sm">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400">Status</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedSubmission.status)}`}>
                    {getStatusIcon(selectedSubmission.status)}
                    <span className="ml-1 capitalize">{selectedSubmission.status}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-400">Actions</h3>
                  <div className="flex gap-2">
                    {selectedSubmission.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(selectedSubmission._id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(selectedSubmission._id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
