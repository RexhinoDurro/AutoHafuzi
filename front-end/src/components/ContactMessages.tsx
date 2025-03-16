import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaFilter, FaGoogle } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth } from '../utils/auth';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const navigate = useNavigate();
  const { token } = getStoredAuth();
  
  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    
    fetchMessages();
  }, [token, filter, navigate]);
  
  const fetchMessages = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Authentication required');
      }
      
      let url = API_ENDPOINTS.CONTACT.MESSAGES;
      
      if (filter === 'unread') {
        url += '?read=false';
      } else if (filter === 'read') {
        url += '?read=true';
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (Array.isArray(response.data)) {
        setMessages(response.data);
      } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.results)) {
        setMessages(response.data.results);
      } else {
        console.error('Unexpected response format:', response.data);
        setMessages([]);
        setError('Received unexpected data format from server');
      }
    } catch (error: any) {
      console.error('Error fetching contact messages:', error);
      setMessages([]);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/auth/login');
      } else {
        setError('Failed to load messages. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleMarkAsRead = async (id: number) => {
    try {
      if (!token) return;
      
      await axios.put(API_ENDPOINTS.CONTACT.MARK_READ(id), {}, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === id ? { ...msg, is_read: true } : msg
        )
      );
      
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, is_read: true } : null);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };
  
  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }
    
    try {
      if (!token) return;
      
      await axios.delete(API_ENDPOINTS.CONTACT.DELETE(id), {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== id)
      );
      
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  
  const handleSelectMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    
    if (!message.is_read) {
      handleMarkAsRead(message.id);
    }
  };
  
  // Function to create Gmail compose URL with pre-filled fields
  const createGmailComposeUrl = (email: string, subject: string, body: string = '') => {
    const params = new URLSearchParams({
      to: email,
      subject: `Re: ${subject}`,
      body: body
    });
    
    return `https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&${params.toString()}`;
  };
  
  // Function to reply via Gmail
  const handleReplyWithGmail = (email: string, subject: string, message: string) => {
    // Create a message template with the original message quoted
    const originalMessageDate = selectedMessage ? format(new Date(selectedMessage.created_at), 'MMM dd, yyyy HH:mm') : '';
    const replyBody = `\n\n\n---------- Original Message ----------\nFrom: ${selectedMessage?.name}\nDate: ${originalMessageDate}\n\n${message}`;
    
    // Open Gmail compose window in a new tab
    window.open(createGmailComposeUrl(email, subject, replyBody), '_blank');
  };
  
  if (loading && messages.length === 0) {
    return <div className="flex justify-center items-center h-64">Loading messages...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <FaEnvelope className="mx-auto text-gray-400 text-5xl mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-1">No messages yet</h3>
          <p className="text-gray-500">
            When customers submit messages through the contact form, they will appear here.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contact Messages</h2>
        
        <div className="flex items-center">
          <FaFilter className="text-gray-500 mr-2" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
            className="border rounded p-1"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
        {/* Message List */}
        <div className="md:col-span-1 border-r overflow-y-auto">
          {messages.map(message => (
            <div
              key={message.id}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedMessage?.id === message.id ? 'bg-blue-50' : ''
              } ${!message.is_read ? 'font-semibold' : ''}`}
              onClick={() => handleSelectMessage(message)}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center">
                  {message.is_read ? (
                    <FaEnvelopeOpen className="text-gray-400 mr-2" />
                  ) : (
                    <FaEnvelope className="text-blue-500 mr-2" />
                  )}
                  <span className="truncate">{message.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(message.created_at), 'MM/dd/yyyy')}
                </span>
              </div>
              <div className="text-sm text-gray-600 truncate">{message.subject}</div>
            </div>
          ))}
        </div>
        
        {/* Message Detail */}
        <div className="md:col-span-2 p-6 overflow-y-auto">
          {selectedMessage ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-semibold">{selectedMessage.subject}</h3>
                <div>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage.id)}
                    className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded"
                    title="Delete message"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold block">From:</span>
                    <span>{selectedMessage.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold block">Date:</span>
                    <span>{format(new Date(selectedMessage.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  <div>
                    <span className="font-semibold block">Email:</span>
                    <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline">
                      {selectedMessage.email}
                    </a>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <span className="font-semibold block">Phone:</span>
                      <a href={`tel:${selectedMessage.phone}`} className="text-blue-600 hover:underline">
                        {selectedMessage.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Message:</h4>
                <div className="whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleReplyWithGmail(
                      selectedMessage.email, 
                      selectedMessage.subject, 
                      selectedMessage.message
                    )}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"
                  >
                    <FaGoogle className="mr-2" /> Reply with Gmail
                  </button>
                  
                  <button
                    onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Reply with Default Email
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FaEnvelope size={48} className="mb-4" />
              <p>Select a message to view its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;