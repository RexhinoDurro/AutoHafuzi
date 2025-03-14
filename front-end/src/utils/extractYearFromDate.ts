// extractYearFromDate.ts
/**
 * Utility function to extract the year from a date string
 * @param dateString Date string in format YYYY-MM-DD
 * @returns The extracted year as a number, or null if extraction fails
 */
export const extractYearFromDate = (dateString: string | null): number | null => {
  if (!dateString) return null;
  
  try {
    // Extract year from the date format YYYY-MM-DD
    const year = parseInt(dateString.split('-')[0], 10);
    
    // Validate that the extracted year is a reasonable value (e.g., between 1900 and current year + 1)
    const currentYear = new Date().getFullYear();
    if (year >= 1900 && year <= currentYear + 1) {
      return year;
    }
    return null;
  } catch (error) {
    console.error('Error extracting year from date:', error);
    return null;
  }
};

// Example of how to use this in a React component (not actual code):
/*
// In your component:
import { extractYearFromDate } from './path/to/extractYearFromDate';

// Inside the component function:
const handleFirstRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const registrationDate = e.target.value;
  
  // Update first_registration field
  setFormData({
    ...formData,
    first_registration: registrationDate
  });
  
  // If year is not set, extract it from the registration date
  if (!formData.year || formData.year === 0) {
    const extractedYear = extractYearFromDate(registrationDate);
    if (extractedYear) {
      setFormData(prevState => ({
        ...prevState,
        year: extractedYear
      }));
    }
  }
};

// Then in your JSX:
<input
  type="date"
  name="first_registration"
  value={formData.first_registration || ''}
  onChange={handleFirstRegistrationChange}
  className="form-input"
/>
*/