import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { adminApi } from '../lib/dataApi';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';
import { resolveAvatar } from '../lib/avatars';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();
  const { 
    getAllWorkers, 
    addWorker, 
    updateWorker, 
    deleteWorker,
    users,
    bookings,
    categories,
    syncStatus
  } = useData();
  
  const [activeTab, setActiveTab] = useState('workers');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingWorker, setEditingWorker] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [chatConversations, setChatConversations] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatLastUpdatedAt, setChatLastUpdatedAt] = useState('');
  const [providerRequests, setProviderRequests] = useState([]);
  const [providerRequestsLoading, setProviderRequestsLoading] = useState(false);
  const [providerRequestsError, setProviderRequestsError] = useState('');

  // New worker form state
  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    password: '',
    categoryId: 'cleaner',
    phoneNumber: '',
    homeAddress: '',
    location: 'Lagos - Lekki',
    rate: 2500,
    bio: '',
    skills: '',
    age: '',
    experience: '',
    languages: 'English',
    availability: 'Available Today',
    verified: false
  });

  const allWorkers = getAllWorkers();
  
  const filteredWorkers = allWorkers.filter(w => {
    const matchesCategory = selectedCategory === 'all' || w.categoryId === selectedCategory;
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddWorker = async () => {
    if (!newWorker.name || !newWorker.email || !newWorker.phoneNumber || !newWorker.homeAddress) {
      alert('Please fill in name, email, phone number, and home address.');
      return;
    }

    const workerData = {
      ...newWorker,
      skills: newWorker.skills.split(',').map(s => s.trim()),
      languages: newWorker.languages.split(',').map(l => l.trim()),
      experience: newWorker.experience || '1 year'
    };

    await addWorker(workerData);
    
    setNewWorker({
      name: '',
      email: '',
      password: '',
      categoryId: 'cleaner',
      phoneNumber: '',
      homeAddress: '',
      location: 'Lagos - Lekki',
      rate: 2500,
      bio: '',
      skills: '',
      age: '',
      experience: '',
      languages: 'English',
      availability: 'Available Today',
      verified: false
    });
    setShowAddForm(false);
    alert('Worker added successfully!');
  };

  const handleUpdateWorker = async (worker) => {
    await updateWorker(worker.id, worker);
    setEditingWorker(null);
    alert('Worker updated successfully!');
  };

  const availabilityOptions = [
    'Available Today',
    'Available This Week',
    'Next Week',
    'Not Available'
  ];

  const normalizedUsers = useMemo(() => {
    return users.map((userRecord) => ({
      id: userRecord.id || userRecord._id,
      name: userRecord.name || userRecord.fullName || 'User',
      email: userRecord.email || '',
      phoneNumber: userRecord.phoneNumber || userRecord.phone || '',
      createdAt: userRecord.createdAt,
      role: userRecord.role || 'user',
      isActive: userRecord.isActive !== false,
    }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return normalizedUsers;
    const query = userSearch.trim().toLowerCase();
    return normalizedUsers.filter((u) =>
      [u.name, u.email, u.phoneNumber].some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [normalizedUsers, userSearch]);

  const normalizedBookings = useMemo(() => {
    return bookings.map((booking) => ({
      id: booking.id || booking._id,
      createdAt: booking.createdAt,
      status: booking.status || 'pending',
      userName: booking.userId?.fullName || booking.userName || 'User',
      workerName: booking.workerId?.userId?.fullName || booking.workerName || 'Worker',
      serviceName: booking.serviceId?.name || booking.serviceName || 'Service',
    }));
  }, [bookings]);

  const unreadMessages = chatConversations.filter((conversation) => !conversation.lastMessage?.read).length;
  const verifiedWorkers = allWorkers.filter((worker) => worker.verified).length;
  const pendingWorkers = allWorkers.length - verifiedWorkers;
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length;
  const pendingProviderRequests = providerRequests.filter((request) => request.status === 'pending').length;
  const usersThisWeek = normalizedUsers.filter((u) => {
    if (!u.createdAt) return false;
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return new Date(u.createdAt).getTime() >= sevenDaysAgo;
  }).length;

  const selectedConversation = chatConversations.find((conversation) => conversation.roomId === selectedRoomId);

  const loadProviderRequests = useCallback(async () => {
    setProviderRequestsLoading(true);
    setProviderRequestsError('');
    try {
      const response = await adminApi.providerSignupRequests({ status: 'all' });
      setProviderRequests(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setProviderRequestsError(error?.message || 'Failed to load provider signup requests');
    } finally {
      setProviderRequestsLoading(false);
    }
  }, []);

  const approveProviderRequest = useCallback(async (requestId) => {
    try {
      await adminApi.approveProviderSignupRequest(requestId);
      await loadProviderRequests();
      alert('Provider request approved. An approval email has been sent.');
    } catch (error) {
      alert(error?.message || 'Failed to approve provider request.');
    }
  }, [loadProviderRequests]);

  const loadChatConversations = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setConversationsLoading(true);
    setChatError('');
    try {
      const response = await adminApi.chatConversations({ limit: 100 });
      const records = Array.isArray(response?.data) ? response.data : [];
      setChatConversations(records);
      setChatLastUpdatedAt(new Date().toISOString());
      setSelectedRoomId((prevRoomId) => prevRoomId || records[0]?.roomId || '');
    } catch (error) {
      setChatError(error?.message || 'Failed to load conversations');
    } finally {
      if (!silent) setConversationsLoading(false);
    }
  }, []);

  const loadRoomMessages = useCallback(async (roomId, { silent = false } = {}) => {
    if (!roomId) {
      setChatMessages([]);
      return;
    }
    if (!silent) setMessagesLoading(true);
    setChatError('');
    try {
      const response = await adminApi.chatMessages(roomId, { limit: 300 });
      setChatMessages(Array.isArray(response?.data) ? response.data : []);
      setChatLastUpdatedAt(new Date().toISOString());
    } catch (error) {
      setChatError(error?.message || 'Failed to load chat messages');
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || activeTab !== 'messages') return;
    loadChatConversations();
  }, [activeTab, isAdmin, loadChatConversations]);

  useEffect(() => {
    if (!isAdmin || activeTab !== 'messages' || !selectedRoomId) return;
    loadRoomMessages(selectedRoomId);
  }, [activeTab, selectedRoomId, isAdmin, loadRoomMessages]);

  useEffect(() => {
    if (!isAdmin || activeTab !== 'messages') return;
    const timer = setInterval(() => {
      loadChatConversations({ silent: true });
      if (selectedRoomId) {
        loadRoomMessages(selectedRoomId, { silent: true });
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [activeTab, selectedRoomId, isAdmin, loadChatConversations, loadRoomMessages]);

  useEffect(() => {
    if (!isAdmin || activeTab !== 'workers') return;
    loadProviderRequests();
  }, [activeTab, isAdmin, loadProviderRequests]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-background text-text-primary">
            <AppIcon name="lock" className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
          <p className="text-text-secondary mb-6">You do not have permission to access this page.</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="text-text-secondary hover:text-text-primary text-2xl mr-3"
          >
            ←
          </button>
          <h1 className="text-xl font-semibold text-text-primary">👑 Admin Panel</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="text-error text-sm hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Ops Dashboard */}
      <div className="grid grid-cols-2 gap-3 px-4 py-4 sm:grid-cols-4">
        <Card><CardContent className="p-3"><p className="text-xs text-text-tertiary">Workers</p><p className="text-xl font-semibold">{allWorkers.length}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-text-tertiary">Verified</p><p className="text-xl font-semibold">{verifiedWorkers}</p><p className="text-xs text-text-tertiary">{pendingWorkers} pending</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-text-tertiary">Pending Bookings</p><p className="text-xl font-semibold">{pendingBookings}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p className="text-xs text-text-tertiary">Provider Requests</p><p className="text-xl font-semibold">{pendingProviderRequests}</p><p className="text-xs text-text-tertiary">{usersThisWeek} users this week</p></CardContent></Card>
      </div>
      <div className="px-4 pb-2 text-xs text-text-tertiary">
        Backend sync: {syncStatus.backendConnected ? 'connected' : 'local fallback'}
      </div>

      {/* Tabs */}
      <div className="bg-container border-b border-border">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('workers')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'workers' ? 'text-amber border-b-2 border-amber' : 'text-text-secondary'}`}
          >
            Workers ({allWorkers.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'users' ? 'text-amber border-b-2 border-amber' : 'text-text-secondary'}`}
          >
            Users ({normalizedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'bookings' ? 'text-amber border-b-2 border-amber' : 'text-text-secondary'}`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'messages' ? 'text-amber border-b-2 border-amber' : 'text-text-secondary'}`}
          >
            Messages ({unreadMessages} new)
          </button>
        </div>
      </div>

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <div className="px-4 py-4">
          <Card className="bg-container mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Provider Signup Requests</h3>
                  <p className="text-sm text-text-secondary">Approve provider applications before worker accounts are created.</p>
                </div>
                <Button variant="outline" size="sm" onClick={loadProviderRequests}>Refresh</Button>
              </div>

              {providerRequestsError ? <p className="text-sm text-error mb-3">{providerRequestsError}</p> : null}

              {providerRequestsLoading ? (
                <p className="text-sm text-text-secondary">Loading provider requests...</p>
              ) : providerRequests.length === 0 ? (
                <p className="text-sm text-text-secondary">No provider signup requests yet.</p>
              ) : (
                <div className="space-y-3">
                  {providerRequests.map((request) => (
                    <div key={request._id} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-text-primary">{request.fullName}</p>
                          <p className="text-sm text-text-secondary">{request.email}</p>
                          <p className="text-sm text-text-tertiary">{request.phone}</p>
                          <p className="text-xs text-text-tertiary mt-1">
                            Requested {request.createdAt ? new Date(request.createdAt).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                        <Badge variant={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'} size="sm">
                          {request.status}
                        </Badge>
                      </div>
                      {request.status === 'pending' ? (
                        <div className="mt-3">
                          <Button size="sm" onClick={() => approveProviderRequest(request._id)}>Approve Request</Button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3 mb-4">
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full"
            >
              {showAddForm ? '✕ Cancel' : '+ Add New Worker'}
            </Button>

            {/* Search */}
            <input
              type="text"
              placeholder="Search workers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-container text-text-primary placeholder-text-tertiary"
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-container text-text-primary"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Add Worker Form */}
          {showAddForm && (
            <div className="border-t border-border bg-container p-4 mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Add New Worker</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={newWorker.email}
                  onChange={(e) => setNewWorker({...newWorker, email: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                />
                <input
                  type="password"
                  placeholder="Temporary Password (optional)"
                  value={newWorker.password}
                  onChange={(e) => setNewWorker({...newWorker, password: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={newWorker.phoneNumber}
                  onChange={(e) => setNewWorker({...newWorker, phoneNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                />
                <input
                  type="text"
                  placeholder="Home Address *"
                  value={newWorker.homeAddress}
                  onChange={(e) => setNewWorker({...newWorker, homeAddress: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                />
                <select
                  value={newWorker.categoryId}
                  onChange={(e) => setNewWorker({...newWorker, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Location (e.g., Lekki, Lagos)"
                  value={newWorker.location}
                  onChange={(e) => setNewWorker({...newWorker, location: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                />
                <input
                  type="number"
                  placeholder="Hourly Rate (₦)"
                  value={newWorker.rate}
                  onChange={(e) => setNewWorker({...newWorker, rate: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                />
                <textarea
                  placeholder="Bio/Description"
                  value={newWorker.bio}
                  onChange={(e) => setNewWorker({...newWorker, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="Skills (comma separated)"
                  value={newWorker.skills}
                  onChange={(e) => setNewWorker({...newWorker, skills: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Age"
                    value={newWorker.age}
                    onChange={(e) => setNewWorker({...newWorker, age: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                  />
                  <input
                    type="text"
                    placeholder="Experience"
                    value={newWorker.experience}
                    onChange={(e) => setNewWorker({...newWorker, experience: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                  />
                </div>
                <select
                  value={newWorker.availability}
                  onChange={(e) => setNewWorker({...newWorker, availability: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary"
                >
                  {availabilityOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newWorker.verified}
                    onChange={(e) => setNewWorker({...newWorker, verified: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-text-primary">NIN Verified</span>
                </label>
                <Button onClick={handleAddWorker} className="w-full">
                  Save Worker
                </Button>
              </div>
            </div>
          )}

          {/* Worker List */}
          <div className="space-y-3">
            {filteredWorkers.map(worker => (
              <Card key={worker.id} className="bg-container">
                <CardContent className="p-4">
                  {editingWorker?.id === worker.id ? (
                    // Edit Mode
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingWorker.name}
                        onChange={(e) => setEditingWorker({...editingWorker, name: e.target.value})}
                        className="w-full px-2 py-1 border border-border rounded bg-background text-text-primary text-sm"
                      />
                      <input
                        type="tel"
                        value={editingWorker.phoneNumber || ''}
                        onChange={(e) => setEditingWorker({...editingWorker, phoneNumber: e.target.value})}
                        className="w-full px-2 py-1 border border-border rounded bg-background text-text-primary text-sm"
                      />
                      <input
                        type="text"
                        value={editingWorker.homeAddress || ''}
                        onChange={(e) => setEditingWorker({...editingWorker, homeAddress: e.target.value})}
                        className="w-full px-2 py-1 border border-border rounded bg-background text-text-primary text-sm"
                      />
                      <select
                        value={editingWorker.availability}
                        onChange={(e) => setEditingWorker({...editingWorker, availability: e.target.value})}
                        className="w-full px-2 py-1 border border-border rounded bg-background text-text-primary text-sm"
                      >
                        {availabilityOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleUpdateWorker(editingWorker)}
                        >
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setEditingWorker(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <img
                            src={resolveAvatar(worker.avatar, worker.name)}
                            alt={worker.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                          <h4 className="font-semibold text-text-primary">{worker.name}</h4>
                          <p className="text-sm text-text-secondary">
                            {categories.find(c => c.id === worker.categoryId)?.name} • {worker.location}
                          </p>
                          </div>
                        </div>
                        <Badge variant={worker.verified ? 'success' : 'warning'} size="sm">
                          {worker.verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="text-sm text-text-tertiary mb-2 space-y-1">
                        <p>Phone: {worker.phoneNumber || 'Not set'}</p>
                        <p>Address: {worker.homeAddress || 'Not set'}</p>
                        <p>Status: {worker.availability}</p>
                        <p>Rate: ₦{worker.rate}/hr</p>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setEditingWorker({...worker})}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-error border-error"
                          onClick={() => {
                            if (window.confirm('Delete this worker?')) {
                              deleteWorker(worker.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {filteredWorkers.length === 0 && (
              <p className="text-center text-text-secondary py-8">No workers found</p>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Registered Users</h3>
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-border rounded-lg bg-container text-text-primary text-sm"
            />
          </div>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">No users registered yet.</p>
              <p className="text-text-tertiary text-sm">Users will appear here when they sign up.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map(u => (
                <Card key={u.id} className="bg-container">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-text-primary">{u.name}</h4>
                        <p className="text-sm text-text-secondary">{u.phoneNumber || u.email || 'No contact'}</p>
                        <p className="text-xs text-text-tertiary">
                          Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                        <p className="text-xs text-text-tertiary">Role: {u.role}</p>
                      </div>
                      <Badge variant={u.isActive ? 'primary' : 'warning'} size="sm">
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="px-4 py-4">
          <h3 className="text-lg font-semibold text-text-primary mb-4">All Bookings</h3>
          {normalizedBookings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary">No bookings yet.</p>
              <p className="text-text-tertiary text-sm">Bookings will appear here when users make them.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {normalizedBookings.map(booking => (
                <Card key={booking.id} className="bg-container">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-text-primary">Booking #{booking.id}</h4>
                        <p className="text-sm text-text-secondary">{booking.userName} → {booking.workerName}</p>
                        <p className="text-xs text-text-tertiary">{booking.serviceName}</p>
                      </div>
                      <Badge 
                        variant={
                          booking.status === 'completed' ? 'success' : 
                          booking.status === 'confirmed' ? 'primary' : 'warning'
                        } 
                        size="sm"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-tertiary">
                      {new Date(booking.createdAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h3 className="text-lg font-semibold text-text-primary">Conversation Monitor</h3>
            <div className="flex items-center gap-2">
              {chatLastUpdatedAt && (
                <span className="text-xs text-text-tertiary">
                  Updated {new Date(chatLastUpdatedAt).toLocaleTimeString()}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  loadChatConversations();
                  if (selectedRoomId) loadRoomMessages(selectedRoomId);
                }}
              >
                Refresh
              </Button>
            </div>
          </div>

          {chatError && <p className="text-sm text-error mb-3">{chatError}</p>}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-1 space-y-3">
              {chatConversations.length === 0 ? (
                <Card className="bg-container">
                  <CardContent className="p-4 text-sm text-text-secondary">
                    {conversationsLoading ? 'Loading conversations...' : 'No conversations found yet.'}
                  </CardContent>
                </Card>
              ) : chatConversations.map((conversation) => {
                const participantNames = (conversation.participants || [])
                  .map((participant) => participant.fullName || 'User')
                  .join(' • ');
                const hasUnread = !conversation.lastMessage?.read;

                return (
                  <Card
                    key={conversation.roomId}
                    className={`bg-container cursor-pointer ${selectedRoomId === conversation.roomId ? 'border-amber' : ''} ${hasUnread ? 'border-l-4 border-l-amber' : ''}`}
                  >
                    <CardContent className="p-3" onClick={() => setSelectedRoomId(conversation.roomId)}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-text-primary line-clamp-1">{participantNames || 'Conversation'}</p>
                        <Badge variant={hasUnread ? 'warning' : 'success'} size="sm">
                          {hasUnread ? 'Unread' : 'Read'}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {conversation.lastMessage?.content || 'No messages'}
                      </p>
                      <p className="text-xs text-text-tertiary mt-2">
                        {conversation.messageCount} msgs • {conversation.lastMessage?.createdAt ? new Date(conversation.lastMessage.createdAt).toLocaleString() : 'No timestamp'}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="md:col-span-2">
              {!selectedConversation ? (
                <Card className="bg-container">
                  <CardContent className="p-6 text-text-secondary text-sm">
                    Select a conversation to view full worker-user messages.
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-container">
                  <CardContent className="p-4">
                    <div className="mb-3 pb-3 border-b border-border">
                      <h4 className="font-semibold text-text-primary">
                        {(selectedConversation.participants || [])
                          .map((participant) => participant.fullName || 'User')
                          .join(' • ')}
                      </h4>
                      <p className="text-xs text-text-tertiary">
                        Room: {selectedConversation.roomId}
                      </p>
                    </div>

                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                      {chatMessages.length === 0 ? (
                        <p className="text-sm text-text-secondary">
                          {messagesLoading ? 'Loading messages...' : 'No messages in this room yet.'}
                        </p>
                      ) : chatMessages.map((message) => {
                        const senderName = message.senderId?.fullName || 'Unknown';
                        const senderIsWorker = selectedConversation.participants?.find(
                          (participant) => String(participant._id) === String(message.senderId?._id || message.senderId)
                        )?.isWorker;
                        return (
                          <div key={message._id} className="rounded-lg border border-border p-3">
                            <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
                              <span className="font-medium text-text-primary">
                                {senderName} {senderIsWorker ? '(Worker)' : '(User)'}
                              </span>
                              <span>{new Date(message.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-text-primary whitespace-pre-wrap">{message.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
