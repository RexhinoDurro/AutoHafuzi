import React, { useState } from 'react';
import axios from 'axios';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error',
    text: string
  } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    try {
      const response = await axios.post('/api/contact/submit/', formData);
      
      // Clear the form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      setSubmitMessage({
        type: 'success',
        text: response.data.message || 'Your message has been sent successfully!'
      });
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      
      setSubmitMessage({
        type: 'error',
        text: 'There was a problem sending your message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const contactInfo = {
    address: '123 Auto Avenue, Car City, CC 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@cardealer.com',
    workingHours: 'Monday to Friday: 9:00 AM - 6:00 PM, Saturday: 10:00 AM - 4:00 PM'
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Our Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-1 mr-4 text-blue-600">
                <FaMapMarkerAlt size={20} />
              </div>
              <div>
                <h3 className="font-medium">Address</h3>
                <p className="text-gray-600">{contactInfo.address}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-4 text-blue-600">
                <FaPhone size={20} />
              </div>
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-gray-600">{contactInfo.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-4 text-blue-600">
                <FaEnvelope size={20} />
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600">{contactInfo.email}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-4 text-blue-600">
                <FaClock size={20} />
              </div>
              <div>
                <h3 className="font-medium">Working Hours</h3>
                <p className="text-gray-600">{contactInfo.workingHours}</p>
              </div>
            </div>
          </div>
          
          {/* Add a Google Maps embed or a static map image here */}
          <div className="mt-6 bg-gray-200 h-48 rounded flex items-center justify-center">
            <p className="text-gray-500">Map will be displayed here</p>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Send Us a Message</h2>
          
          {submitMessage && (
            <div className={`p-4 mb-6 rounded ${
              submitMessage.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {submitMessage.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-red-600">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;