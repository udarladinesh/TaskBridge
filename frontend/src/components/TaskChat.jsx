import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { getAvatarUrl } from '../utils/avatar';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  X,
  MessageSquare,
  Shield,
  CheckCheck,
  Clock,
  Sparkles
} from 'lucide-react';

const QUICK_CHIPS = [
  '👋 Hi! I am coordinating on this task.',
  '📍 I have arrived at the location.',
  '📸 Could you clarify what specific angle you need?',
  '✅ Task proof is uploaded for your review.',
  '👍 Looks good, thank you!'
];

const TaskChat = ({ taskId, currentUser, requester, tasker, taskStatus }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const chatListRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchMessages = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/tasks/${taskId}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(false);
    const interval = setInterval(() => fetchMessages(true), 3500);
    return () => clearInterval(interval);
  }, [taskId]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + attachedFiles.length > 3) {
      alert('You can attach up to 3 images at once.');
      return;
    }
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputText.trim() && attachedFiles.length === 0) || sending) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('text', inputText.trim() || 'Attached files');
      attachedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await api.post(`/tasks/${taskId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        setInputText('');
        setAttachedFiles([]);
        setTimeout(() => {
          if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
          }
        }, 50);
      }
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUserRequester = requester?._id === currentUser?._id;
  const otherParty = isUserRequester ? tasker : requester;

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '520px',
        overflow: 'hidden',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        padding: 0
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          padding: '0.9rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
          >
            <MessageSquare size={18} color="var(--cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Task Coordination Thread
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--emerald)',
                  fontWeight: 700
                }}
              >
                Live
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', margin: 0 }}>
              Chatting with {otherParty?.name || 'Assigned Member'} ({isUserRequester ? 'Tasker' : 'Requester'})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Shield size={13} color="var(--emerald)" /> End-to-End Logged
          </span>
        </div>
      </div>

      {/* Message List */}
      <div
        ref={chatListRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'rgba(11, 15, 25, 0.3)'
        }}
      >
        {loading ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading message thread...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              maxWidth: '300px',
              color: 'var(--text-sub)'
            }}
          >
            <Sparkles size={32} color="var(--primary-light)" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              Start the Conversation
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Coordinate task details, confirm arrival at the location, or ask for extra instructions here.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === currentUser?._id;
            const isSenderRequester = msg.sender?._id === requester?._id;

            return (
              <div
                key={msg._id}
                style={{
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: '0.65rem'
                }}
              >
                {!isMe && (
                  <img
                    src={getAvatarUrl(msg.sender?.profileImage, msg.sender?.name)}
                    alt={msg.sender?.name}
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}
                  />
                )}

                <div
                  style={{
                    maxWidth: '75%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* Sender Name & Role Badge */}
                  {!isMe && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem', paddingLeft: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-sub)' }}>
                        {msg.sender?.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.05rem 0.35rem',
                          borderRadius: '6px',
                          background: isSenderRequester ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: isSenderRequester ? 'var(--primary-light)' : 'var(--emerald)',
                          fontWeight: 700
                        }}
                      >
                        {isSenderRequester ? 'Requester' : 'Tasker'}
                      </span>
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div
                    style={{
                      padding: '0.65rem 0.95rem',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMe
                        ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                        : 'rgba(30, 41, 59, 0.85)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      boxShadow: isMe
                        ? '0 4px 12px rgba(99, 102, 241, 0.25)'
                        : '0 2px 6px rgba(0, 0, 0, 0.2)',
                      border: isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {msg.text}

                    {/* Image Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginTop: '0.5rem'
                        }}
                      >
                        {msg.attachments.map((att, idx) => (
                          <img
                            key={idx}
                            src={getAvatarUrl(att)}
                            alt={`attachment-${idx}`}
                            onClick={() => setPreviewImage(getAvatarUrl(att))}
                            style={{
                              width: '90px',
                              height: '90px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0 0.25rem'
                    }}
                  >
                    <span>{formatTime(msg.createdAt)}</span>
                    {isMe && <CheckCheck size={12} color="var(--cyan)" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Suggestion Chips */}
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          padding: '0.4rem 0.75rem',
          overflowX: 'auto',
          background: 'rgba(15, 23, 42, 0.8)',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)'
        }}
      >
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(chip)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-sub)',
              fontSize: '0.72rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--cyan)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-sub)';
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Attached Files Previews */}
      {attachedFiles.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(30, 41, 59, 0.5)',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          {attachedFiles.map((file, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(99, 102, 241, 0.15)',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: 'var(--primary-light)'
              }}
            >
              <ImageIcon size={13} />
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                style={{ background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--border-color)',
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept="image/*"
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-sub)',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease'
          }}
          title="Attach photo/screenshot"
        >
          <Paperclip size={18} />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message to coordinate..."
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: '#fff',
            padding: '0.55rem 0.85rem',
            fontSize: '0.875rem',
            outline: 'none'
          }}
        />

        <button
          type="submit"
          disabled={sending || (!inputText.trim() && attachedFiles.length === 0)}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            border: 'none',
            color: '#fff',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            opacity: (!inputText.trim() && attachedFiles.length === 0) ? 0.5 : 1,
            transition: 'all 0.15s ease'
          }}
        >
          <Send size={16} />
        </button>
      </form>

      {/* Lightbox image preview modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: '8px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TaskChat;
