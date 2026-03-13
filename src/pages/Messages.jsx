import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Card, CardContent } from '../components/Card';
import AppIcon from '../components/AppIcon';
import { useData } from '../context/DataContext';
import { resolveAvatar } from '../lib/avatars';

const Messages = () => {
  const navigate = useNavigate();
  const { messages } = useData();
  const [filter, setFilter] = useState('all');

  const conversations = useMemo(() => {
    const groups = {};

    messages.forEach((message) => {
      const roomId = message.conversationId || `conv-${message.senderId || 'unknown'}`;
      if (!groups[roomId]) groups[roomId] = [];
      groups[roomId].push(message);
    });

    return Object.entries(groups)
      .map(([roomId, group]) => {
        const sorted = [...group].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latest = sorted[0];
        const unreadCount = sorted.filter((item) => !item.read).length;
        return {
          roomId,
          latest,
          unreadCount,
          hasBooking: !!latest.bookingRef,
        };
      })
      .sort((a, b) => new Date(b.latest.createdAt) - new Date(a.latest.createdAt));
  }, [messages]);

  const filteredConversations = conversations.filter((conversation) => {
    if (filter === 'unread') return conversation.unreadCount > 0;
    if (filter === 'bookings') return conversation.hasBooking;
    return true;
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return 'Just now';
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 24) return `${Math.max(1, Math.floor(diffInHours))}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <h1 className="text-xl font-semibold text-text-primary">Messages</h1>
        <div className="flex space-x-2">
          <button onClick={() => navigate('/house-help-search')} className="text-text-secondary hover:text-text-primary">🔍</button>
          <button onClick={() => navigate('/notification-settings')} className="text-text-secondary hover:text-text-primary">⚙️</button>
        </div>
      </div>

      <div className="bg-container border-b border-border px-4 py-2">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'bookings', label: 'Bookings' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 rounded-full text-sm ${filter === tab.key ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-secondary'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <Card
              key={conversation.roomId}
              className="mb-3 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/chat/${encodeURIComponent(conversation.roomId)}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={resolveAvatar(conversation.latest.avatar, conversation.latest.senderName || conversation.roomId)}
                    alt={conversation.latest.senderName || 'Conversation'}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => { e.currentTarget.src = '/images/provider-fallback.svg'; }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-text-primary">{conversation.latest.senderName || 'Conversation'}</h3>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && <div className="w-2 h-2 bg-primary rounded-full" />}
                        <span className="text-xs text-text-tertiary">{formatTime(conversation.latest.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="primary" size="xs">Live</Badge>
                      {conversation.hasBooking && <Badge variant="success" size="xs">Booking</Badge>}
                    </div>
                    <p className="text-sm text-text-secondary">{conversation.latest.content || 'No message body'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-background text-text-primary">
              <AppIcon name="chat" className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No conversations yet</h3>
            <p className="text-text-secondary mb-4">Start a conversation from any provider profile.</p>
            <Button onClick={() => navigate('/house-help-search')}>Browse Providers</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
