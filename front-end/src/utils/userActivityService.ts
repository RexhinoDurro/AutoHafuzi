// userActivityService.ts - Tracks user activity for car recommendations

interface CarActivity {
  makes: Record<string, number>;
  models: Record<string, number>;
}

interface LastSearch {
  [key: string]: string | number | boolean | string[] | undefined;
}

const MAX_RECENT_VIEWS = 20;

/**
 * Track when a user views a car detail page
 * @param carId The ID of the car being viewed
 * @param make The make of the car
 * @param model The model of the car
 */
export const trackCarView = (carId: number, make: string, model: string): void => {
  try {
    // Track this car as recently viewed
    const recentViews = localStorage.getItem('recentCarViews');
    let recentViewIds: number[] = recentViews ? JSON.parse(recentViews) : [];
    
    // Remove this car ID if it already exists (to move it to the front)
    recentViewIds = recentViewIds.filter(id => id !== carId);
    
    // Add the car ID to the front of the array
    recentViewIds.unshift(carId);
    
    // Keep only the most recent views
    if (recentViewIds.length > MAX_RECENT_VIEWS) {
      recentViewIds = recentViewIds.slice(0, MAX_RECENT_VIEWS);
    }
    
    localStorage.setItem('recentCarViews', JSON.stringify(recentViewIds));
    
    // Update make and model activity counters
    const activity = localStorage.getItem('userCarActivity');
    const activityData: CarActivity = activity 
      ? JSON.parse(activity) 
      : { makes: {}, models: {} };
    
    // Store make ID or name
    if (typeof make === 'number' || !isNaN(Number(make))) {
      // It's an ID, store it directly
      activityData.makes[make.toString()] = (activityData.makes[make.toString()] || 0) + 1;
    } else {
      // It's a name, mark it with 'name:' prefix to distinguish from IDs
      const makeKey = `name:${make}`;
      activityData.makes[makeKey] = (activityData.makes[makeKey] || 0) + 1;
    }
    
    // Store model ID or name
    if (typeof model === 'number' || !isNaN(Number(model))) {
      // It's an ID, store it directly
      activityData.models[model.toString()] = (activityData.models[model.toString()] || 0) + 1;
    } else {
      // It's a name, mark it with 'name:' prefix to distinguish from IDs
      const modelKey = `name:${model}`;
      activityData.models[modelKey] = (activityData.models[modelKey] || 0) + 1;
    }
    
    localStorage.setItem('userCarActivity', JSON.stringify(activityData));
  } catch (error) {
    console.error('Error tracking car view:', error);
  }
};

/**
 * Save the last search parameters
 * @param searchParams The search parameters used
 */
export const saveLastSearch = (searchParams: LastSearch): void => {
  try {
    localStorage.setItem('lastCarSearch', JSON.stringify(searchParams));
  } catch (error) {
    console.error('Error saving last search:', error);
  }
};

/**
 * Get recently viewed car IDs
 * @returns Array of recently viewed car IDs
 */
export const getRecentlyViewedCarIds = (): number[] => {
  try {
    const recentViews = localStorage.getItem('recentCarViews');
    return recentViews ? JSON.parse(recentViews) : [];
  } catch (error) {
    console.error('Error getting recently viewed cars:', error);
    return [];
  }
};

/**
 * Get the user's last search parameters
 * @returns The last search parameters or an empty object if none exists
 */
export const getLastSearch = (): LastSearch => {
  try {
    const lastSearch = localStorage.getItem('lastCarSearch');
    return lastSearch ? JSON.parse(lastSearch) : {};
  } catch (error) {
    console.error('Error getting last search:', error);
    return {};
  }
};