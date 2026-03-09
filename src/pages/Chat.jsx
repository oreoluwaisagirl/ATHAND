import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { resolveAvatar } from '../lib/avatars';

const Chat = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { messages, addMessage } = useData();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const conversationMessages = useMemo(() => {
    return messages
      .filter((message) => String(message.conversationId || '') === String(conversationId || ''))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages, conversationId]);

  const participantName = conversationMessages[0]?.senderName || 'Support';
  const participantAvatar = resolveAvatar(conversationMessages[0]?.avatar, participantName);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    addMessage({
      senderId: user?.id || user?._id,
      senderName: user?.fullName || user?.name || 'User',
      senderPhone: user?.phone || user?.phoneNumber,
      senderEmail: user?.email,
      content: newMessage.trim(),
      conversationId,
      toAdmin: true,
    });

    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <div className="bg-container shadow-sm px-4 py-3 flex items-center justify-between border-b border-border">
        <button onClick={() => navigate('/messages')} className="text-text-secondary hover:text-text-primary">←</button>
        <div className="flex items-center space-x-3">
          <img
            src={participantAvatar}
            alt={participantName}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => { e.currentTarget.src = '/images/provider-fallback.svg'; }}
          />
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{participantName}</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="xs">Online</Badge>
            </div>
          </div>
        </div>
        <button className="text-text-secondary hover:text-text-primary">⋯</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversationMessages.length === 0 && (
          <div className="text-center py-10 text-text-secondary">
            No messages yet. Start the conversation.
          </div>
        )}

        {conversationMessages.map((message) => {
          const isCurrentUser = String(message.senderId) === String(user?.id || user?._id);
          return (
            <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isCurrentUser ? 'bg-primary text-white' : 'bg-container border border-border'}`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-text-tertiary'}`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-container border-t border-border px-4 py-3">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-border rounded-full focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="rounded-full w-10 h-10 p-0">
            ➤
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
