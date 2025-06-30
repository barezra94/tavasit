// Simple test to verify navigation logic
// This can be run in the browser console to test the navigation flow

export const testNavigationFlow = () => {
  console.log('🧪 Testing navigation flow...');
  
  // Simulate the navigation history
  let history: number[] = [1]; // Start at WELCOME
  
  const addToHistory = (page: number) => {
    history.push(page);
    console.log(`📚 History after adding page ${page}:`, history);
  };
  
  const goBack = () => {
    if (history.length <= 1) {
      console.log('⚠️ Cannot go back from first page');
      return null;
    }
    history.pop();
    const previousPage = history[history.length - 1];
    console.log(`➡️ Went back to page ${previousPage}, history:`, history);
    return previousPage;
  };
  
  // Test scenario: WELCOME -> RAIN_EVENT -> OLIVE_TYPE -> RAIN_TEMP -> FINAL_WITH_CALC
  console.log('=== Testing forward navigation ===');
  addToHistory(2); // RAIN_EVENT
  addToHistory(3); // OLIVE_TYPE
  addToHistory(7); // RAIN_TEMP (skipping some pages for MR flow)
  addToHistory(8); // FINAL_WITH_CALC
  
  console.log('=== Testing backward navigation ===');
  goBack(); // Should go to RAIN_TEMP
  goBack(); // Should go to OLIVE_TYPE
  goBack(); // Should go to RAIN_EVENT
  goBack(); // Should go to WELCOME
  goBack(); // Should fail (already at first page)
  
  console.log('✅ Navigation test completed');
};

// Run this in browser console: testNavigationFlow() 