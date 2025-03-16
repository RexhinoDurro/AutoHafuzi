import { useState, useEffect } from 'react';
import { Users, Award, Car, Clock, Settings, Sparkles, Map, Phone, Mail, Shield } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const AboutPage = () => {
  const [companyDescription, setCompanyDescription] = useState('Driven by passion, committed to quality. We\'ve been helping customers find their perfect ride since 2010.');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible] = useState({
    'overview': true,
    'history': true,
    'services': true,
    'testimonials': true,
    'why-us': true,
    'contact': true
  });

  useEffect(() => {
    // Fetch company information
    const fetchAboutData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.ABOUT);
        const data = await response.json();
        
        setCompanyDescription(data.company_description);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching about page data:', error);
        setCompanyDescription('Driven by passion, committed to quality. We\'ve been helping customers find their perfect ride since 2010.');
        setIsLoading(false);
      }
    };

    fetchAboutData();

    // Set all sections to visible immediately for now
    // We'll keep this commented code for when you want to re-enable scroll animations
    /*
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    // Observe all sections with animation
    setTimeout(() => {
      const sections = document.querySelectorAll('.animate-on-scroll');
      sections.forEach(section => {
        if (section) observer.observe(section);
      });
    }, 500);

    return () => {
      const sections = document.querySelectorAll('.animate-on-scroll');
      sections.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
    */
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Parallax Effect */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url('/api/placeholder/1920/1080')",
            transform: "translateZ(-10px) scale(2)",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white animate-fade-in-up">
            Auto Hafuzi
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Your Trusted Partner in Automotive Excellence
          </p>
          <button className="bg-white text-blue-600 hover:bg-blue-100 font-bold py-3 px-8 rounded-full transition duration-300 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            Discover Our Collection
          </button>
        </div>
      </section>

      {/* Company Overview with Animated Background */}
      <section id="overview" className="relative py-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-700"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className="absolute rounded-full bg-white" 
                style={{
                  width: `${Math.random() * 300 + 50}px`,
                  height: `${Math.random() * 300 + 50}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 20}s linear infinite`,
                  opacity: Math.random() * 0.5 + 0.1,
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['overview'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-white">About Auto Hafuzi</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-white max-w-3xl mx-auto">
              {companyDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Users className="h-12 w-12 text-yellow-400" />, 
                title: "Expert Team", 
                description: "Our dedicated team of automotive specialists brings years of experience and passion to serve you better.", 
                delay: 0 
              },
              { 
                icon: <Car className="h-12 w-12 text-yellow-400" />, 
                title: "Premium Selection", 
                description: "Every vehicle in our inventory is carefully selected and thoroughly inspected to ensure quality.", 
                delay: 0.2 
              },
              { 
                icon: <Award className="h-12 w-12 text-yellow-400" />, 
                title: "Customer First", 
                description: "We prioritize your satisfaction and work tirelessly to make your car buying experience exceptional.", 
                delay: 0.4 
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`bg-white p-8 rounded-lg shadow-xl transform transition-all duration-1000 hover:shadow-2xl hover:-translate-y-2 ${isVisible['overview'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`} 
                style={{ transitionDelay: `${item.delay}s` }}
              >
                <div className="flex justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-semibold text-center mb-4 text-gray-800">{item.title}</h3>
                <p className="text-center text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our History Timeline */}
      <section id="history" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['history'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Our Journey</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From humble beginnings to becoming a trusted name in the automotive industry
            </p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-600"></div>
            
            {/* Timeline items */}
            {[
              { year: "2010", title: "Founded", description: "Auto Hafuzi opened its doors with a small collection of premium vehicles." },
              { year: "2015", title: "Expansion", description: "We expanded our inventory and moved to a larger showroom to better serve our growing customer base." },
              { year: "2018", title: "Service Center", description: "Launched our state-of-the-art service center to provide comprehensive maintenance and repair services." },
              { year: "2023", title: "Digital Transformation", description: "Embraced the latest technology to enhance the car buying experience both online and in-person." }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`relative flex md:items-center mb-16 transition-all duration-1000 ${isVisible['history'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 text-right' : 'md:pl-12 md:ml-auto'}`}>
                  <div className={`p-6 rounded-lg shadow-lg bg-white ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                    <span className="inline-block px-4 py-2 rounded bg-blue-600 text-white font-bold mb-4">{item.year}</span>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white border-4 border-blue-600 z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services with Animated Cards */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['services'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Our Services</h2>
            <div className="w-24 h-1 bg-green-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive automotive solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Car className="h-12 w-12 text-white" />, title: "Vehicle Sales", description: "Browse our extensive selection of new and pre-owned vehicles.", color: "bg-blue-600" },
              { icon: <Settings className="h-12 w-12 text-white" />, title: "Maintenance", description: "Keep your vehicle in optimal condition with our expert maintenance services.", color: "bg-green-600" },
              { icon: <Clock className="h-12 w-12 text-white" />, title: "Financing", description: "Flexible financing options to make your dream car affordable.", color: "bg-purple-600" },
              { icon: <Sparkles className="h-12 w-12 text-white" />, title: "Detailing", description: "Professional detailing services to make your car look brand new.", color: "bg-red-600" }
            ].map((service, index) => (
              <div 
                key={index} 
                className={`rounded-lg overflow-hidden transform transition-all duration-1000 hover:scale-105 ${isVisible['services'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{ transitionDelay: `${index * 0.15}s` }}
              >
                <div className={`${service.color} p-8 flex flex-col items-center`}>
                  <div className="mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white text-center">{service.title}</h3>
                  <p className="text-white opacity-80 text-center">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with Moving Background */}
      <section id="testimonials" className="relative py-20">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('/api/placeholder/1920/1080')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-80"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['testimonials'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-white">What Our Customers Say</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Ahmed Kovačević", role: "Business Owner", quote: "Auto Hafuzi provided exceptional service throughout my car buying journey. Their team was knowledgeable and patient in helping me find the perfect vehicle for my needs." },
              { name: "Maja Popović", role: "Software Engineer", quote: "I've been maintaining my car at Auto Hafuzi for years. Their attention to detail and technical expertise has kept my vehicle running perfectly." },
              { name: "Emir Hodžić", role: "Doctor", quote: "The financing options offered by Auto Hafuzi made it possible for me to purchase my dream car. The process was straightforward and transparent." }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className={`bg-white p-8 rounded-lg shadow-lg transition-all duration-1000 ${isVisible['testimonials'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <div className="mb-6">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mr-4">
                    <span className="text-gray-600 font-bold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['why-us'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Why Choose Auto Hafuzi</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We differentiate ourselves through commitment to excellence in every aspect
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Shield className="h-10 w-10 text-blue-600" />, title: "Warranty Protection", description: "All our vehicles come with comprehensive warranty options for your peace of mind." },
              { icon: <Award className="h-10 w-10 text-blue-600" />, title: "Quality Certified", description: "Every vehicle undergoes a rigorous 150-point inspection before joining our inventory." },
              { icon: <Users className="h-10 w-10 text-blue-600" />, title: "Experienced Staff", description: "Our team brings decades of automotive expertise to serve you better." },
              { icon: <Settings className="h-10 w-10 text-blue-600" />, title: "Complete Service", description: "From purchase to maintenance, we provide end-to-end automotive solutions." },
              { icon: <Sparkles className="h-10 w-10 text-blue-600" />, title: "Transparent Pricing", description: "No hidden fees or surprises - just honest, straightforward pricing." },
              { icon: <Clock className="h-10 w-10 text-blue-600" />, title: "Flexible Financing", description: "Tailored financial solutions that work with your budget and circumstances." }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600 flex transition-all duration-1000 hover:shadow-lg ${isVisible['why-us'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="mr-4 mt-1">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section id="contact" className="py-20 bg-blue-900">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${isVisible['contact'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-6 text-white">Get In Touch</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mb-8"></div>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Visit our showroom or reach out to us directly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Map className="h-12 w-12 text-yellow-400" />, title: "Our Location", description: "Sarajevska ulica 123, Sarajevo 71000, Bosnia and Herzegovina", color: "bg-blue-800" },
              { icon: <Phone className="h-12 w-12 text-yellow-400" />, title: "Phone Number", description: "+387 33 123 456", color: "bg-blue-800" },
              { icon: <Mail className="h-12 w-12 text-yellow-400" />, title: "Email Address", description: "info@autohafuzi.ba", color: "bg-blue-800" }
            ].map((contact, index) => (
              <div 
                key={index} 
                className={`${contact.color} p-8 rounded-lg transition-all duration-1000 ${isVisible['contact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                style={{ transitionDelay: `${index * 0.2}s` }}
              >
                <div className="flex justify-center mb-4">
                  {contact.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white text-center">{contact.title}</h3>
                <p className="text-blue-100 text-center">{contact.description}</p>
              </div>
            ))}
          </div>

          <div className={`mt-16 text-center transition-all duration-1000 ${isVisible['contact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.6s' }}>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-8 rounded-full transition duration-300">
              Contact Us Today
            </button>
          </div>
        </div>
      </section>

      {/* Add global CSS animations using a standard style element */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      ` }} />
    </div>
  );
};

export default AboutPage;