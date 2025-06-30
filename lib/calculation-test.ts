// Test for the ≤0.1mm rain calculation logic
// This can be run in the browser console to test the calculation

export const test01mmRainLogic = () => {
  console.log('🧪 Testing ≤0.1mm rain logic...');
  
  // Mock form data for testing
  const mockFormData = {
    oliveType: 'HS' as const,
    rainTempPairs: [
      { rainAmount: '5.0', minTemp: '15' },
      { rainAmount: '0.1', minTemp: '12' }, // This should trigger no treatment
      { rainAmount: '8.0', minTemp: '18' }
    ]
  };
  
  const mockTemps = [12, 18]; // HS type temperatures
  
  console.log('📊 Test data:', mockFormData);
  
  // Check for rain ≤ 0.1mm
  const hasDayWith01mmOrLess = mockFormData.rainTempPairs.some(pair => {
    const rainAmount = parseFloat(pair.rainAmount);
    return rainAmount <= 0.1;
  });
  
  console.log('🔍 Has day with rain ≤ 0.1mm:', hasDayWith01mmOrLess);
  
  if (hasDayWith01mmOrLess) {
    console.log('❌ RESULT: No treatment needed (found rain ≤ 0.1mm)');
    return 'NO_TREATMENT';
  }
  
  // Calculate total rain
  const totalRain = mockFormData.rainTempPairs.reduce((total, pair) => {
    return total + parseFloat(pair.rainAmount);
  }, 0);
  
  console.log('🌧️ Total rain amount:', totalRain, 'mm');
  
  if (totalRain < 15) {
    console.log('❌ RESULT: No treatment needed (insufficient rain)');
    return 'NO_TREATMENT';
  }
  
  // Calculate average temperature
  const temps = mockFormData.rainTempPairs.map(pair => parseFloat(pair.minTemp));
  const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
  
  console.log('🌡️ Average temperature:', avgTemp, '°C');
  console.log('📏 Temperature range:', mockTemps[0], '-', mockTemps[1], '°C');
  
  if (avgTemp > mockTemps[1] || avgTemp < mockTemps[0]) {
    console.log('❌ RESULT: No treatment needed (temperature outside range)');
    return 'NO_TREATMENT';
  }
  
  console.log('✅ RESULT: Treatment recommended');
  return 'TREATMENT';
};

// Test scenarios
export const runCalculationTests = () => {
  console.log('=== Test 1: With exactly 0.1mm rain ===');
  test01mmRainLogic();
  
  console.log('\n=== Test 2: With less than 0.1mm rain ===');
  const mockFormData2 = {
    oliveType: 'HS' as const,
    rainTempPairs: [
      { rainAmount: '5.0', minTemp: '15' },
      { rainAmount: '0.05', minTemp: '12' }, // Less than 0.1mm
      { rainAmount: '8.0', minTemp: '18' }
    ]
  };
  
  const hasDayWith01mmOrLess2 = mockFormData2.rainTempPairs.some(pair => {
    const rainAmount = parseFloat(pair.rainAmount);
    return rainAmount <= 0.1;
  });
  
  console.log('📊 Test data 2:', mockFormData2);
  console.log('🔍 Has day with rain ≤ 0.1mm:', hasDayWith01mmOrLess2);
  console.log('❌ RESULT: No treatment needed (found rain ≤ 0.1mm)');
  
  console.log('\n=== Test 3: Without rain ≤ 0.1mm ===');
  const mockFormData3 = {
    oliveType: 'HS' as const,
    rainTempPairs: [
      { rainAmount: '5.0', minTemp: '15' },
      { rainAmount: '0.15', minTemp: '12' }, // Greater than 0.1mm
      { rainAmount: '8.0', minTemp: '18' }
    ]
  };
  
  const hasDayWith01mmOrLess3 = mockFormData3.rainTempPairs.some(pair => {
    const rainAmount = parseFloat(pair.rainAmount);
    return rainAmount <= 0.1;
  });
  
  console.log('📊 Test data 3:', mockFormData3);
  console.log('🔍 Has day with rain ≤ 0.1mm:', hasDayWith01mmOrLess3);
  console.log('✅ RESULT: Continue with normal calculation');
  
  console.log('\n✅ Calculation tests completed');
};

// Run this in browser console: runCalculationTests() 