import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageGallery from '../components/ImageGallery';
import { Car } from '../types/car';

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/cars/${id}/`);
        if (!response.ok) {
          throw new Error('Car not found');
        }
        const data = await response.json();
        setCar(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error || !car) {
    return <div className="flex justify-center items-center h-screen text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-blue-600 hover:text-blue-800"
      >
        ← Back to listings
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="space-y-6">
            <ImageGallery images={car.images} />
          </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{car.brand} {car.model_name}</h1>
              <h2 className="text-2xl font-semibold text-blue-600">${car.price.toLocaleString()}</h2>
            </div>
          

          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Year</p>
                  <p className="font-medium">{car.year}</p>
                </div>
                <div>
                  <p className="text-gray-600">Body Type</p>
                  <p className="font-medium">{car.body_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Color</p>
                  <p className="font-medium">{car.color}</p>
                </div>
                <div>
                  <p className="text-gray-600">Condition</p>
                  <p className="font-medium">{car.is_used ? 'Used' : 'New'}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Engine Power</p>
                  <p className="font-medium">{car.power} HP</p>
                </div>
                <div>
                  <p className="text-gray-600">Engine Size</p>
                  <p className="font-medium">{car.engine_size}L</p>
                </div>
                <div>
                  <p className="text-gray-600">Transmission</p>
                  <p className="font-medium">{car.gearbox}</p>
                </div>
                <div>
                  <p className="text-gray-600">Drivetrain</p>
                  <p className="font-medium">{car.drivetrain}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fuel Type</p>
                  <p className="font-medium">{car.fuel_type}</p>
                </div>
                <div>
                  <p className="text-gray-600">Emission Class</p>
                  <p className="font-medium">{car.emission_class}</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Vehicle History</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Mileage</p>
                  <p className="font-medium">{car.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-gray-600">First Registration</p>
                  <p className="font-medium">{car.first_registration}</p>
                </div>
                <div>
                  <p className="text-gray-600">Service History</p>
                  <p className="font-medium">{car.full_service_history ? 'Full' : 'Partial'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Inspection Date</p>
                  <p className="font-medium">{car.general_inspection_date}</p>
                </div>
              </div>
            </section>

            {car.options.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xl font-semibold">Additional Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {car.options.map((option, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      {option}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="p-6 border-t">
          <h3 className="text-xl font-semibold mb-4">Description</h3>
          <p className="text-gray-700 whitespace-pre-line">{car.description}</p>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;