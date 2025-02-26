// src/components/CarListing.tsx
import React from 'react';

const CarListing: React.FC = () => {
  return (
    <div className="bg-as24-off-white min-h-screen">
      {/* Header */}
      <header className="bg-as24-dark-blue text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">AutoScout24</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Search Filters */}
        <section className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-xl font-semibold mb-2">Search Filters</h2>
          {/* Add filter controls here */}
        </section>

        {/* Car Listings */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Available Cars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Example Car Card */}
            <div className="bg-white p-4 rounded shadow">
              <img
                src="https://via.placeholder.com/400x300"
                alt="Car"
                className="w-full h-48 object-cover mb-2 rounded"
              />
              <h3 className="text-lg font-bold">2025 Audi A4</h3>
              <p className="text-as24-orange font-semibold">€19,500</p>
              <p className="text-gray-600">65,000 km • Gasoline • Automatic</p>
              <button className="mt-2 bg-as24-light-blue text-white py-1 px-4 rounded">
                View Details
              </button>
            </div>
            {/* Repeat car cards as needed */}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-as24-dark-blue text-white p-4 mt-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 AutoScout24. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CarListing;
