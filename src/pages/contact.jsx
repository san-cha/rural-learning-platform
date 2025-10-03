import { Mail, Phone, MapPin, Send, Loader } from 'lucide-react';
import React, { useState, useEffect } from 'react'; // Added useEffect
import Header from '../components/Header.jsx';

export default function Contact() {
  
  // State for form data, submission status, and user feedback message
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });

    if (submissionMessage.text) setSubmissionMessage({ text: '', type: '' });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage({ text: '', type: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      console.log("Form data ready to send:", formData);
      
      setSubmissionMessage({ 
        text: 'Thank you for your message!', 
        type: 'success' 
      });
      setFormData({ name: '', email: '', message: '' }); // Clear form on success
      
    } catch (error) {
      // In a real app, handle connection errors here
      setSubmissionMessage({ 
        text: 'Failed to send message. Please try again later or email us directly.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const contactInfo = [
    { icon: Mail, label: "Email Support", value: "support@sarvashiksha.org" },
    { icon: Phone, label: "Phone Helpline", value: "+91 800 555 1234" },
    { icon: MapPin, label: "Regional Office", value: "Digital Education Hub, Mumbai, India" },
  ];

  // Helper class for message display
  const messageClass = submissionMessage.type === 'success' 
    ? 'bg-green-100 border-green-400 text-green-700' 
    : 'bg-red-100 border-red-400 text-red-700';

  const [language, setLanguage] = useState("en");
  return (
    <div>
      <Header
        user={{ name: "Sanjana", role: "Student" }}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />
    <div className="w-full bg-gray-50 pb-20">
      
      {/* 1. Dynamic Header Section (Blue Background) */}
      <div className="bg-blue-600 pt-16 pb-20 px-4 text-white shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-xl sm:text-2xl font-light opacity-90 max-w-4xl">
            We value your feedback and are here to assist with any questions regarding modules, quizzes, or partnerships.
          </p>
        </div>
      </div>

      {/* 2. Main Content Card (Overlapping White Section) */}
      <div className="px-4 -mt-16">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8 lg:p-12 transform transition duration-300 hover:scale-[1.005]">
          
          <div className="grid md:grid-cols-12 gap-10 items-start">
            
            {/* Single Column: Contact Form and Info (Now full width) */}
            <div className="md:col-span-12 text-gray-800 max-w-3xl mx-auto w-full"> 
              <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Send Us a Message</h2>
              
              {/* Submission Message Display */}
              {submissionMessage.text && (
                <div className={`p-4 mb-6 border-l-4 rounded-lg ${messageClass}`} role="alert">
                  <p className="font-bold">{submissionMessage.type === 'success' ? 'Success!' : 'Error!'}</p>
                  <p>{submissionMessage.text}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 transition duration-150 disabled:bg-gray-100 disabled:text-gray-500" 
                    placeholder="Your Name" 
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 transition duration-150 disabled:bg-gray-100 disabled:text-gray-500" 
                    placeholder="you@example.com" 
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1">Your Message</label>
                  <textarea 
                    id="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-3 transition duration-150 disabled:bg-gray-100 disabled:text-gray-500" 
                    rows="4" 
                    placeholder="Tell us about your query or feedback..."
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-md hover:bg-blue-700 transition duration-200 transform hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
              
              {/* Contact Information Section below the form */}
              <div className="mt-12 pt-6 border-t border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">Direct Contact Details</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                      <item.icon className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                      <p className="text-base text-gray-900 font-medium break-all text-center">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Project Photo Placeholder below the contact details */}
              <div className="mt-5 pt-6 border-t border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">Our Mission in Action</h3>
                 <div className="w-full rounded-xl shadow-xl overflow-hidden p-0">
                  <img 
                    src="https://i.pinimg.com/736x/bd/43/ad/bd43addc7c1b186de0e85d4bdc0c83db.jpg" 
                    alt="Photo showing rural students learning online" 
                    className="w-full h-auto object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/1000x400/2563eb/ffffff?text=General+Photo'; }}
                  />
                 </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}