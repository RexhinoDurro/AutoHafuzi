import { useState, useEffect } from "react";
import { getStoredAuth } from "../utils/auth";

interface OptionFormProps {
    onOptionAdded?: (data: any) => void;
}

interface Category {
    value: string;
    label: string;
}

const OptionForm: React.FC<OptionFormProps> = ({ onOptionAdded }) => {
    const [optionName, setOptionName] = useState("");
    const [category, setCategory] = useState("EXTRAS");
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { token } = getStoredAuth();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/option-categories/", {
                headers: {
                    "Authorization": `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }

            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error("Error fetching categories:", err);
            // Set default categories in case API fails
            setCategories([
                { value: 'COMFORT', label: 'Comfort & Convenience' },
                { value: 'ENTERTAINMENT', label: 'Entertainment & Media' },
                { value: 'SAFETY', label: 'Safety & Security' },
                { value: 'EXTRAS', label: 'Extras' },
            ]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!optionName.trim()) {
            setError("Option name cannot be empty.");
            setLoading(false);
            return;
        }

        if (!token) {
            setError("Authentication token not found. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/options/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`,
                },
                body: JSON.stringify({ 
                    name: optionName,
                    category: category 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to add option");
            }

            const data = await response.json();
            setOptionName(""); // Reset input field
            if (onOptionAdded) onOptionAdded(data); // Refresh parent component options
        } catch (err) {
            setError(`Error adding option: ${err instanceof Error ? err.message : "Unknown error"}`);
            console.error("Option adding error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-semibold mb-2">Add New Option</h2>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            
            <div className="mb-3">
                <label className="block text-gray-700 text-sm font-bold mb-1">
                    Option Name
                </label>
                <input
                    type="text"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    placeholder="Enter option name"
                    className="border p-2 w-full rounded"
                />
            </div>
            
            <div className="mb-3">
                <label className="block text-gray-700 text-sm font-bold mb-1">
                    Category
                </label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border p-2 w-full rounded"
                >
                    {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>
            
            <button
                type="submit"
                disabled={loading}
                className={`w-full mt-2 ${
                    loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-700"
                } text-white p-2 rounded`}
            >
                {loading ? "Adding..." : "Add Option"}
            </button>
        </form>
    );
};

export default OptionForm;