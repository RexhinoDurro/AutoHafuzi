// userActivityService.ts - Tracks user activity for car recommendations

interface CarActivity {
  makes: Record<string, number>;
  models: Record<string, number>;
}

interface LastSearch {
  [key: string]: string | number | boolean | string[] | undefined;
}

interface ViewTimestamps {
  [carId: string]: number; // timestamp of last view
}

const MAX_RECENT_VIEWS = 20;
const VIEW_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Track when a user views a car detail page
 * This function ensures a view is only counted once per 30 minutes per car
 * 
 * @param carId The ID of the car being viewed
 * @param make The make of the car
 * @param model The model of the car
 * @returns boolean indicating if this view was counted (true) or ignored due to cooldown (false)
 */
export const trackCarView = (carId: number, make: string, model: string): boolean => {
  try {
    const now = Date.now();
    let shouldCountView = true;
    
    // Check if this car was viewed recently
    const viewTimestampsStr = localStorage.getItem('carViewTimestamps');
    let viewTimestamps: ViewTimestamps = viewTimestampsStr ? JSON.parse(viewTimestampsStr) : {};
    
    // Check if we're still in the cooldown period
    if (viewTimestamps[carId] && now - viewTimestamps[carId] < VIEW_COOLDOWN_MS) {
      shouldCountView = false;
      console.log(`Car ${carId} was viewed recently, still in cooldown period`);
    } else {
      // Update the timestamp for this car
      viewTimestamps[carId] = now;
      localStorage.setItem('carViewTimestamps', JSON.stringify(viewTimestamps));
      console.log(`Car ${carId} view tracked with timestamp ${now}`);
    }
    
    // Track this car as recently viewed (regardless of cooldown)
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
    
    // Only update make and model activity counters if we're counting this view
    if (shouldCountView) {
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
    }
    
    return shouldCountView;
  } catch (error) {
    console.error('Error tracking car view:', error);
    return false;
  }
};

/**
 * Check if a car view should be counted based on the 30-minute cooldown
 * @param carId The ID of the car to check
 * @returns boolean indicating if the view should be counted
 */
export const shouldCountCarView = (carId: number): boolean => {
  try {
    const now = Date.now();
    const viewTimestampsStr = localStorage.getItem('carViewTimestamps');
    if (!viewTimestampsStr) return true;
    
    const viewTimestamps: ViewTimestamps = JSON.parse(viewTimestampsStr);
    
    // If we don't have a timestamp for this car, or the cooldown has passed, count the view
    return !viewTimestamps[carId] || (now - viewTimestamps[carId] >= VIEW_COOLDOWN_MS);
  } catch (error) {
    console.error('Error checking car view cooldown:', error);
    return true; // Count the view if there's an error
  }
};

/**
 * Get the timestamp when a car was last viewed, or 0 if never viewed
 * @param carId The ID of the car to check
 * @returns timestamp in milliseconds or 0
 */
export const getLastViewTimestamp = (carId: number): number => {
  try {
    const viewTimestampsStr = localStorage.getItem('carViewTimestamps');
    if (!viewTimestampsStr) return 0;
    
    const viewTimestamps: ViewTimestamps = JSON.parse(viewTimestampsStr);
    return viewTimestamps[carId] || 0;
  } catch (error) {
    console.error('Error getting last view timestamp:', error);
    return 0;
  }
};

/**
 * Save the last search parameters
 * @param searchParams The search parameters used
 */
export const saveLastSearch = (searchParams: LastSearch): void => {
  try {
    localStorage.setItem('lastCarSearch', JSON.stringify(searchParams));
    // Update last activity timestamp
    localStorage.setItem('lastSearchActivityTime', Date.now().toString());
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