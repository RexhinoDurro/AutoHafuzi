import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/api';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  working_hours: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: 'Fushë-Kruje, Albania, E762, Fushë Krujë',
    phone: '069 931 1111',
    email: 'info@auto.ch',
    working_hours: 'E hënë deri të premte: 9:00 - 18:00, E shtunë: 10:00 - 16:00'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error',
    text: string
  } | null>(null);
  
  // Fetch contact information from the API
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        // Using INFO endpoint instead of PAGE which doesn't exist in your API structure
        const response = await axios.get(API_ENDPOINTS.CONTACT.INFO, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.data) {
          setContactInfo(response.data);
        }
      } catch (error) {
        console.error('Error fetching contact information:', error);
        // Use default values if fetch fails
      }
    };
    
    fetchContactInfo();
  }, []);
  
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
      const response = await axios.post(API_ENDPOINTS.CONTACT.SUBMIT, formData);
      
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
        text: response.data.message || 'Mesazhi juaj është dërguar me sukses!'
      });
      
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      
      setSubmitMessage({
        type: 'error',
        text: error.response?.data?.error || 'Kishte një problem me dërgimin e mesazhit tuaj. Ju lutemi provoni përsëri më vonë.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Na Kontaktoni</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information Card */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Informacioni Ynë</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-1 mr-4 text-blue-600">
                <FaMapMarkerAlt size={20} />
              </div>
              <div>
                <h3 className="font-medium">Adresa</h3>
                <p className="text-gray-600">{contactInfo.address}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 mr-4 text-blue-600">
                <FaPhone size={20} />
              </div>
              <div>
                <h3 className="font-medium">Telefoni</h3>
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
                <h3 className="font-medium">Orari i Punës</h3>
                <p className="text-gray-600">{contactInfo.working_hours}</p>
              </div>
            </div>
          </div>
          
          {/* Add a Google Maps embed or a static map image here */}
          <div className="mt-6 h-48 rounded overflow-hidden">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.5435566562167!2d15.933348674891367!3d-19.14164415031907!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1bdf3c7d9d5ec4c5%3A0xefdcd0ee83c540e!2sEtosha%20National%20Park!5e0!3m2!1sen!2sus!4v1692309321501!5m2!1sen!2sus" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Auto  Location Map"
            aria-label="Google Maps showing the location of Auto  in Fushe-Kruje, Albania"
          ></iframe>
        </div>
        </div>
        
        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">Na Dërgoni një Mesazh</h2>
          
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
                  Emri i Plotë <span className="text-red-600">*</span>
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
                  Adresa Email <span className="text-red-600">*</span>
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
                  Numri i Telefonit
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
                  Subjekti <span className="text-red-600">*</span>
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
                Mesazhi <span className="text-red-600">*</span>
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
                {isSubmitting ? 'Duke dërguar...' : 'Dërgo Mesazhin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;