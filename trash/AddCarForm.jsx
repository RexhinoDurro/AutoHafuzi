import React, { useState } from "react";
import { addCar } from "../front-end/src/api/carApi";

const AddCarForm = () => {
  const [car, setCar] = useState({
    brand: "",
    model: "",
    year: "",
    color: "",
    price: "",
  });

  const handleChange = (e) => {
    setCar({ ...car, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCar(car);
      alert("Car added successfully!");
      setCar({ brand: "", model: "", year: "", color: "", price: "" });
    } catch (error) {
      console.error("Error adding car:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="brand" placeholder="Brand" value={car.brand} onChange={handleChange} required />
      <input type="text" name="model" placeholder="Model" value={car.model} onChange={handleChange} required />
      <input type="number" name="year" placeholder="Year" value={car.year} onChange={handleChange} required />
      <input type="text" name="color" placeholder="Color" value={car.color} onChange={handleChange} required />
      <input type="number" name="price" placeholder="Price" value={car.price} onChange={handleChange} required />
      <button type="submit">Add Car</button>
    </form>
  );
};

export default AddCarForm;
