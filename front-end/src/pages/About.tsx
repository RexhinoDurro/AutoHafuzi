import React, { useState, useEffect } from 'react';
import { Users, Award, Car } from 'lucide-react';

const AboutPage = () => {
  const [companyDescription, setCompanyDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch company information
    const fetchAboutData = async () => {
      try {
        const response = await fetch('/api/about/');
        const data = await response.json();
        
        setCompanyDescription(data.company_description);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching about page data:', error);
        setIsLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Company Overview */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-6 text-gray-900">About Our Dealership</h1>
        <div className="max-w-3xl mx-auto flex flex-col space-y-4">
          <p className="text-xl text-gray-700">{companyDescription}</p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-center">Expert Team</h3>
              <p className="text-center text-gray-600">Passionate professionals dedicated to your satisfaction</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Car className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-center">Quality Vehicles</h3>
              <p className="text-center text-gray-600">Carefully selected and maintained cars</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Award className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold text-center">Customer Satisfaction</h3>
              <p className="text-center text-gray-600">Committed to delivering the best car buying experience</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;