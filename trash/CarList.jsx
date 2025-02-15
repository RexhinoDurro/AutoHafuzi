import React, { useEffect, useState } from "react";
import { getCars, deleteCar } from "../front-end/src/api/carApi";
import EditCarForm from "../front-end/src/components/EditCarForm";

const CarList = ({ refreshTrigger }) => {
  const [cars, setCars] = useState([]);
  const [editingCarId, setEditingCarId] = useState(null);

  useEffect(() => {
    fetchCars();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  const fetchCars = async () => {
    try {
      const data = await getCars();
      setCars(data);
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const handleDelete = async (carId) => {
    try {
      await deleteCar(carId);
      setCars(cars.filter(car => car.id !== carId)); // Remove deleted car from UI
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  };

  return (
    <div>
      <h2>Car List</h2>
      <ul>
        {cars.map((car) => (
          <li key={car.id}>
            {car.brand} {car.model} ({car.year}) - {car.color}
            <button onClick={() => setEditingCarId(car.id)}>Edit</button>
            <button onClick={() => handleDelete(car.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {editingCarId && (
        <EditCarForm carId={editingCarId} onUpdateSuccess={() => { fetchCars(); setEditingCarId(null); }} />
      )}
    </div>
  );
};

export default CarList;
