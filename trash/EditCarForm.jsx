import React, { useState, useEffect } from "react";
import { getCarById, updateCar } from "../front-end/src/api/carApi";

const EditCarForm = ({ carId, onUpdateSuccess }) => {
  const [car, setCar] = useState({
    brand: "",
    model: "",
    year: "",
    color: "",
    price: "",
  });

  useEffect(() => {
    fetchCarDetails();
  }, []);

  const fetchCarDetails = async () => {
    try {
      const carData = await getCarById(carId);
      setCar(carData);
    } catch (error) {
      console.error("Error fetching car details:", error);
    }
  };

  const handleChange = (e) => {
    setCar({ ...car, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCar(carId, car);
      alert("Car updated successfully!");
      onUpdateSuccess(); // Refresh the car list after update
    } catch (error) {
      console.error("Error updating car:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Edit Car</h3>
      <input type="text" name="brand" placeholder="Brand" value={car.brand} onChange={handleChange} required />
      <input type="text" name="model" placeholder="Model" value={car.model} onChange={handleChange} required />
      <input type="number" name="year" placeholder="Year" value={car.year} onChange={handleChange} required />
      <input type="text" name="color" placeholder="Color" value={car.color} onChange={handleChange} required />
      <input type="number" name="price" placeholder="Price" value={car.price} onChange={handleChange} required />
      <button type="submit">Update Car</button>
    </form>
  );
};

export default EditCarForm;
