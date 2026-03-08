"use client"

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DebugPanel } from '@/components/DebugPanel';

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export enum PageNumber {
  WELCOME = 1,
  RAIN_EVENT = 2,
  OLIVE_TYPE = 3,
  RESELINCE_QUESTION = 4,
  MR_QUESTION_SEASON = 5,
  MR_QUESTION_CONTAMIATION = 6,
  RAIN_TEMP = 7,
  SPRAYING_QUESTION = 8,
  HARVEST_QUESTION = 9,
  POST_HARVEST_QUESTION = 10,
  RAIN_FORECAST_QUESTION = 11,
  FINAL_WITH_CALC = 12,
  FINAL_NO_CALC = 13,
  FINAL_CONTINUE_TWO_WEEKS = 14,
  THANK_YOU = 15,
}

// Helper function to get page name for debugging
const getPageName = (pageNumber: PageNumber): string => {
  switch (pageNumber) {
    case PageNumber.WELCOME: return 'WELCOME';
    case PageNumber.RAIN_EVENT: return 'RAIN_EVENT';
    case PageNumber.OLIVE_TYPE: return 'OLIVE_TYPE';
    case PageNumber.RESELINCE_QUESTION: return 'RESELINCE_QUESTION';
    case PageNumber.MR_QUESTION_SEASON: return 'MR_QUESTION_SEASON';
    case PageNumber.MR_QUESTION_CONTAMIATION: return 'MR_QUESTION_CONTAMIATION';
    case PageNumber.RAIN_TEMP: return 'RAIN_TEMP';
    case PageNumber.SPRAYING_QUESTION: return 'SPRAYING_QUESTION';
    case PageNumber.HARVEST_QUESTION: return 'HARVEST_QUESTION';
    case PageNumber.POST_HARVEST_QUESTION: return 'POST_HARVEST_QUESTION';
    case PageNumber.RAIN_FORECAST_QUESTION: return 'RAIN_FORECAST_QUESTION';
    case PageNumber.FINAL_WITH_CALC: return 'FINAL_WITH_CALC';
    case PageNumber.FINAL_NO_CALC: return 'FINAL_NO_CALC';
    case PageNumber.FINAL_CONTINUE_TWO_WEEKS: return 'FINAL_CONTINUE_TWO_WEEKS';
    case PageNumber.THANK_YOU: return 'THANK_YOU';
    default: return `UNKNOWN(${pageNumber})`;
  }
};

interface RainTempPair {
  rainAmount: string;
  minTemp: string;
}

interface FormData {
  rainEvent: boolean;
  contamination: boolean;
  endOfSeason: boolean;
  oliveType: OliveSensitivityType;
  oliveTypeName: string;
  rainTempPairs: RainTempPair[];
  sprayingInPastTwoWeeks?: boolean;
  harvestPlanned?: boolean;
  moreRainExpected?: boolean;
  twoWeeksPassedSinceInfection?: boolean;
}

enum OliveSensitivityType {
  HS = 'HS',
  MS = 'MS',
  MR = 'MR',
  HR = 'HR',
  I = 'I'
}

const minTempsForType: Record<OliveSensitivityType, number[]> = {
  [OliveSensitivityType.HS]: [12, 18],
  [OliveSensitivityType.MS]: [13, 17],
  [OliveSensitivityType.MR]: [14, 16],
  [OliveSensitivityType.HR]: [],
  [OliveSensitivityType.I]: [],
}

const oliveTypes = {
  'אוליאסטר': OliveSensitivityType.HR,
  'אקסל': OliveSensitivityType.I,
  'ארבקינה': OliveSensitivityType.HR,
  'ברנע': OliveSensitivityType.MR,
  'גמליק': OliveSensitivityType.I,
  'הוכיבלנקה': OliveSensitivityType.HR,
  'לצינו': OliveSensitivityType.I,
  'מיסיון': OliveSensitivityType.HR,
  'מנזנילו': OliveSensitivityType.MS,
  'מעיליה': OliveSensitivityType.I,
  'מעלות': OliveSensitivityType.I,
  'נבאלי בלאדי': OliveSensitivityType.HS,
  'סבלינו': OliveSensitivityType.HR,
  'סורי': OliveSensitivityType.HS,
  'פיקואל': OliveSensitivityType.MS,
  'פישולין לנגדוק': OliveSensitivityType.HR,
  'פישולין מרוקאי': OliveSensitivityType.MS,
  'קדש': OliveSensitivityType.I,
  'קורטינה': OliveSensitivityType.MS,
  'קורנייקי': OliveSensitivityType.HR,
}

export default function TavasitCalculator() {
  const [currentPage, setCurrentPage] = useState(PageNumber.WELCOME);
  const [navigationHistory, setNavigationHistory] = useState<PageNumber[]>([PageNumber.WELCOME]);
  const [calculationResult, setCalculationResult] = useState<{ type: string; message: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    rainEvent: true,
    contamination: true,
    endOfSeason: false,
    oliveType: oliveTypes[Object.keys(oliveTypes)[0] as keyof typeof oliveTypes],
    oliveTypeName: Object.keys(oliveTypes)[0],
    rainTempPairs: [],
    sprayingInPastTwoWeeks: undefined,
    harvestPlanned: undefined,
    moreRainExpected: undefined,
    twoWeeksPassedSinceInfection: undefined,
  });

  const [rainAmount, setRainAmount] = useState('');
  const [minTemp, setMinTemp] = useState('');

  // Debug logging for state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debug - Current page:', currentPage, `(${getPageName(currentPage)})`);
      console.log('🔍 Debug - Navigation history:', navigationHistory.map(p => `${p}(${getPageName(p)})`));
      console.log('🔍 Debug - Form data:', formData);
    }
  }, [currentPage, navigationHistory, formData]);

  // Add the style tag here
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      /* Add a CSS class to hide number input spinners */
      .no-spinner::-webkit-outer-spin-button,
      .no-spinner::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .no-spinner {
        -moz-appearance: textfield;
      }
    `;
    // Append to head
    document.head.appendChild(styleElement);

    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    if (currentPage === PageNumber.RAIN_EVENT && formData.rainEvent !== undefined) {
      handleNext();
    } else if (currentPage === PageNumber.RESELINCE_QUESTION && formData.contamination !== undefined) {
      handleNext();
    } else if (currentPage === PageNumber.MR_QUESTION_SEASON && formData.endOfSeason !== undefined) {
      handleNext();
    } else if (currentPage === PageNumber.MR_QUESTION_CONTAMIATION && formData.contamination !== undefined) {
      handleNext();
    } else if (currentPage === PageNumber.SPRAYING_QUESTION && formData.sprayingInPastTwoWeeks !== undefined) {
      handleNext();
    } else if (currentPage === PageNumber.HARVEST_QUESTION && formData.harvestPlanned !== undefined) {
      handleNext();
    } else if (currentPage === PageNumber.POST_HARVEST_QUESTION && formData.twoWeeksPassedSinceInfection !== undefined) {
      handleNext();
    } else if (currentPage === PageNumber.RAIN_FORECAST_QUESTION && formData.moreRainExpected !== undefined) {
      handleNext();
    }
  }, [formData]);


  const calcTavasit = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🧮 Starting Tavasit calculation...');
      console.log('📊 Form data for calculation:', formData);
    }

    const temps = minTempsForType[formData.oliveType]
    if (process.env.NODE_ENV === 'development') {
      console.log('🌡️ Temperature thresholds for olive type:', formData.oliveType, temps);
    }

    // Log all rain amounts for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🌧️ Daily rain amounts:', formData.rainTempPairs.map((pair, index) =>
        `Day ${index + 1}: ${pair.rainAmount}mm`
      ));
    }

    if (!temps) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No temperature thresholds available, consult guide');
      }
      return { type: 'CONSULT_GUIDE', message: 'יש לפנות למדריך' };
    }

    // Check if all days are rain days (≥1mm)
    const allDaysAreRainDays = formData.rainTempPairs.every(pair => parseFloat(pair.rainAmount) >= 1.0);

    if (process.env.NODE_ENV === 'development') {
      console.log('🌧️ All days are rain days (≥1mm):', allDaysAreRainDays);
    }

    // Split into rain events (segments separated by days with <1mm rain)
    const rainEvents: RainTempPair[][] = [];
    let currentEvent: RainTempPair[] = [];

    for (const pair of formData.rainTempPairs) {
      const rainAmount = parseFloat(pair.rainAmount);

      if (rainAmount < 1.0) {
        // End current rain event if it has data
        if (currentEvent.length > 0) {
          rainEvents.push([...currentEvent]);
          currentEvent = [];
        }
        // Skip this day (not a rain day)
        if (process.env.NODE_ENV === 'development') {
          console.log(`💧 Day with ${rainAmount}mm rain is not a rain day (< 1.0mm)`);
        }
      } else {
        // Add to current rain event
        currentEvent.push(pair);
      }
    }

    // Add final rain event if it has data
    if (currentEvent.length > 0) {
      rainEvents.push(currentEvent);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Rain events found:', rainEvents.length);
      rainEvents.forEach((event, i) => {
        console.log(`  Event ${i + 1}: ${event.length} days, ${event.reduce((sum, p) => sum + parseFloat(p.rainAmount), 0).toFixed(1)}mm total`);
      });
    }

    // If no rain events, no treatment needed
    if (rainEvents.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No rain events found, no treatment needed');
      }
      return { type: 'NO_TREATMENT', message: 'על פי הנתונים נראה שאין צורך לטפל כנגד עין טווס' };
    }

    // If all days are rain days, treat as single event and calculate average temp across all days
    if (allDaysAreRainDays) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 All days are rain days - calculating as single event');
      }

      // Calculate total rain
      const totalRain = formData.rainTempPairs.reduce((sum, pair) => sum + parseFloat(pair.rainAmount), 0);

      if (totalRain < 15) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Insufficient total rain (${totalRain.toFixed(1)}mm < 15mm)`);
        }
        return { type: 'NO_TREATMENT', message: 'על פי הנתונים נראה שאין צורך לטפל כנגד עין טווס' };
      }

      // Calculate average temperature across all days
      const totalTemp = formData.rainTempPairs.reduce((sum, pair) => sum + parseFloat(pair.minTemp), 0);
      const avgTemp = totalTemp / formData.rainTempPairs.length;

      if (process.env.NODE_ENV === 'development') {
        console.log(`🌡️ Average temperature: ${avgTemp.toFixed(1)}°C (range: ${temps[0]}-${temps[1]}°C)`);
      }

      // Check if average temperature is within range
      if (avgTemp >= temps[0] && avgTemp <= temps[1]) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Infection criteria met! Rain: ${totalRain.toFixed(1)}mm, Avg Temp: ${avgTemp.toFixed(1)}°C`);
        }
        return { type: 'TREATMENT_RECOMMENDED', message: 'על פי הנתונים התקיים אירוע הדבקה ויש לרסס כנגד עין טווס.' };
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Average temperature outside range`);
        }
        return { type: 'NO_TREATMENT', message: 'על פי הנתונים נראה שאין צורך לטפל כנגד עין טווס. בדוק שוב לאחר אירוע הגשם הבא.' };
      }
    }

    // Not all days are rain days - check each rain event separately
    let hasInfectionEvent = false;

    for (let i = 0; i < rainEvents.length; i++) {
      const event = rainEvents[i];

      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Checking rain event ${i + 1}:`, event.map(p => `${p.rainAmount}mm@${p.minTemp}°C`));
      }

      // Calculate total rain in this event
      const eventRainTotal = event.reduce((sum, pair) => sum + parseFloat(pair.rainAmount), 0);

      if (eventRainTotal < 15) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Event ${i + 1}: Insufficient rain (${eventRainTotal.toFixed(1)}mm < 15mm)`);
        }
        continue; // Check next event
      }

      // Calculate average temperature for this rain event
      const eventTempSum = event.reduce((sum, pair) => sum + parseFloat(pair.minTemp), 0);
      const eventAvgTemp = eventTempSum / event.length;

      if (process.env.NODE_ENV === 'development') {
        console.log(`🌡️ Event ${i + 1}: Avg Temp: ${eventAvgTemp.toFixed(1)}°C (range: ${temps[0]}-${temps[1]}°C)`);
      }

      // Check if average temperature is within range
      if (eventAvgTemp >= temps[0] && eventAvgTemp <= temps[1]) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Event ${i + 1}: Infection criteria met! Rain: ${eventRainTotal.toFixed(1)}mm, Avg Temp: ${eventAvgTemp.toFixed(1)}°C`);
        }
        hasInfectionEvent = true;
        break; // Found infection event, no need to check other events
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Event ${i + 1}: Average temperature outside range`);
        }
      }
    }

    if (hasInfectionEvent) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Treatment recommended - infection event occurred in at least one rain event');
      }
      return { type: 'TREATMENT_RECOMMENDED', message: 'על פי הנתונים התקיים אירוע הדבקה ויש לרסס כנגד עין טווס.' };
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No infection events found in any rain event, no treatment needed');
      }
      return {
        type: 'NO_TREATMENT',
        message: 'על פי הנתונים נראה שאין צורך לטפל כנגד עין טווס. בדוק שוב לאחר אירוע הגשם הבא.'
      };
    }
  }

  const handleNext = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 handleNext fired at page:', currentPage, `(${getPageName(currentPage)})`);
      console.log('📊 Current form data:', formData);
    }

    let nextPage: PageNumber;

    if (currentPage === PageNumber.RAIN_EVENT) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌧️ Rain event decision:', formData.rainEvent);
      }
      if (!formData.rainEvent) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to FINAL_NO_CALC (no rain event)');
        }
        nextPage = PageNumber.FINAL_NO_CALC;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to next page (rain event confirmed)');
        }
        nextPage = currentPage + 1;
      }
    } else if (currentPage === PageNumber.RAIN_TEMP) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌡️ Rain temp pairs:', formData.rainTempPairs);
      }
      if (formData.rainTempPairs && formData.rainTempPairs.length > 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to calculation page');
        }
        nextPage = currentPage + 1;
      } else {
        return; // Don't navigate if no rain temp pairs
      }
    } else if (currentPage === PageNumber.OLIVE_TYPE) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🫒 Olive type selected:', formData.oliveType, formData.oliveTypeName);
      }
      if (formData.oliveType === OliveSensitivityType.HR || formData.oliveType === OliveSensitivityType.I) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to RESELINCE_QUESTION (HR or I type)');
        }
        nextPage = PageNumber.RESELINCE_QUESTION;
      } else if (formData.oliveType === OliveSensitivityType.MR) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to MR_QUESTION_SEASON (MR type)');
        }
        nextPage = PageNumber.MR_QUESTION_SEASON;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to RAIN_TEMP (HS or MS type)');
        }
        nextPage = PageNumber.RAIN_TEMP;
      }
    } else if (currentPage === PageNumber.RESELINCE_QUESTION) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🦠 Contamination question answered:', formData.contamination);
        console.log('➡️ Going to FINAL_NO_CALC');
      }
      nextPage = PageNumber.FINAL_NO_CALC;
    } else if (currentPage === PageNumber.MR_QUESTION_CONTAMIATION) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🦠 MR contamination question answered:', formData.contamination);
      }
      if (formData.contamination) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to RAIN_TEMP (contamination confirmed)');
        }
        nextPage = PageNumber.RAIN_TEMP;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to FINAL_NO_CALC (no contamination)');
        }
        nextPage = PageNumber.FINAL_NO_CALC;
      }
    } else if (currentPage === PageNumber.FINAL_WITH_CALC) {
      // Check calculation result to determine next step
      if (!calculationResult) {
        const result = calcTavasit();
        setCalculationResult(result);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🧮 Calculation result:', calculationResult);
      }

      if (calculationResult?.type === 'TREATMENT_RECOMMENDED') {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to SPRAYING_QUESTION (treatment recommended)');
        }
        nextPage = PageNumber.SPRAYING_QUESTION;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to FINAL_NO_CALC (no treatment needed)');
        }
        nextPage = PageNumber.FINAL_NO_CALC;
      }
    } else if (currentPage === PageNumber.SPRAYING_QUESTION) {
      if (process.env.NODE_ENV === 'development') {
        console.log('💦 Spraying question answered:', formData.sprayingInPastTwoWeeks);
      }
      if (formData.sprayingInPastTwoWeeks) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to FINAL_NO_CALC (sprayed recently)');
        }
        nextPage = PageNumber.FINAL_NO_CALC;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to HARVEST_QUESTION (no recent spraying)');
        }
        nextPage = PageNumber.HARVEST_QUESTION;
      }
    } else if (currentPage === PageNumber.HARVEST_QUESTION) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌾 Harvest question answered:', formData.harvestPlanned);
      }
      if (formData.harvestPlanned) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to POST_HARVEST_QUESTION (harvest planned)');
        }
        nextPage = PageNumber.POST_HARVEST_QUESTION;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to RAIN_FORECAST_QUESTION (no harvest planned, spray with approved product then check rain)');
        }
        nextPage = PageNumber.RAIN_FORECAST_QUESTION;
      }
    } else if (currentPage === PageNumber.POST_HARVEST_QUESTION) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏰ Post-harvest question answered:', formData.twoWeeksPassedSinceInfection);
      }
      if (formData.twoWeeksPassedSinceInfection) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to THANK_YOU (two weeks passed since infection)');
        }
        nextPage = PageNumber.THANK_YOU;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to RAIN_FORECAST_QUESTION (less than two weeks since infection)');
        }
        nextPage = PageNumber.RAIN_FORECAST_QUESTION;
      }
    } else if (currentPage === PageNumber.RAIN_FORECAST_QUESTION) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🌧️ Rain forecast question answered:', formData.moreRainExpected);
      }
      if (formData.moreRainExpected) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to FINAL_CONTINUE_TWO_WEEKS (more rain expected)');
        }
        nextPage = PageNumber.FINAL_CONTINUE_TWO_WEEKS;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to THANK_YOU (no more rain expected)');
        }
        nextPage = PageNumber.THANK_YOU;
      }
    } else {
      // Handle final pages that should go to THANK_YOU
      const finalPages = [PageNumber.FINAL_NO_CALC, PageNumber.FINAL_WITH_CALC, PageNumber.FINAL_CONTINUE_TWO_WEEKS];
      if (finalPages.includes(currentPage as PageNumber)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to THANK_YOU page');
        }
        nextPage = PageNumber.THANK_YOU;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('➡️ Going to next page (default)');
        }
        nextPage = currentPage + 1;
      }
    }

    // Update navigation history and current page
    setNavigationHistory(prevHistory => [...prevHistory, nextPage]);
    setCurrentPage(nextPage);
    if (process.env.NODE_ENV === 'development') {
      console.log('📚 Updated navigation history:', [...navigationHistory, nextPage].map(p => `${p}(${getPageName(p)})`));
    }
  };

  const handlePrevious = () => {
    if (currentPage === PageNumber.THANK_YOU) {
      // Reset everything when going back from thank you page
      setFormData({
        rainEvent: true,
        contamination: true,
        endOfSeason: false,
        oliveType: oliveTypes[Object.keys(oliveTypes)[0] as keyof typeof oliveTypes],
        oliveTypeName: Object.keys(oliveTypes)[0],
        rainTempPairs: [],
        sprayingInPastTwoWeeks: undefined,
        harvestPlanned: undefined,
        moreRainExpected: undefined,
        twoWeeksPassedSinceInfection: undefined,
      })
      setCalculationResult(null);
      setCurrentPage(PageNumber.WELCOME)
      setNavigationHistory([PageNumber.WELCOME])
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Reset to WELCOME page');
      }
    } else {
      // Get the previous page from history
      const newHistory = [...navigationHistory];

      // Safety check: if we're at the first page, stay there
      if (newHistory.length <= 1) {
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️ Already at first page, cannot go back');
        }
        return;
      }

      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1] || PageNumber.WELCOME;

      if (process.env.NODE_ENV === 'development') {
        console.log('➡️ Going to previous page:', previousPage, `(${getPageName(previousPage)})`);
        console.log('📚 Updated navigation history:', newHistory.map(p => `${p}(${getPageName(p)})`));
      }

      setCurrentPage(previousPage);
      setNavigationHistory(newHistory);
    }
  };

  const renderWelcome = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div className='flex flex-row items-center h-1/3'>
        <div>
          <div className='text-6xl font-bold mb-5 justify-center text-green-700'>
            טווזית
          </div>
          <div className='text-3xl font-bold mb-5 text-green-700'>
            מערכת תומכת החלטה לבקרת מחלת עין טווס בזית
          </div>
        </div>
        <div className='flex flex-col items-center'>
          <img src='/tavazit-logo.jpeg' alt="טווזית לוגו" />
        </div>
      </div>

      <div className='flex flex-col h-1/3 p-5'>
        <div className='text-2xl font-bold mb-5 justify-center'>
          מערכת טווזית משתמשת בנתונים מטאורולוגים (גשם וטמפרטורה) ובמידע מקומי (זן נטוע, נגיעות בעין טווס והיסטוריית ריסוסים קודמים) לחיזוי הסבירות להתרחשות הדבקה בעין טווס.
        </div>
        <div className='text-2xl font-bold mb-5 justify-center'>
          קבלת ההחלטה לגבי הצורך לרסס כנגד עין טווס היא באחריות המגדל.
        </div>
      </div>

      <div className='flex flex-row items-center'>
        <div> מערכת טווזית פותחה במחלקה לפתולוגיה של צמחים וחקר העשבים של מכון וולקני על ידי ד״ר דוד עזרא, דוד יגזאו, יותם גילת ופרופ׳ דני שטיינברג</div>
        <Button className="w-1/3 mt-5 bg-green-700" onClick={handleNext}>התחל</Button>
      </div>

      <div className='flex flex-row items-right'>
        <div> הפניה באתר זה הינה בשפת זכר, אבל פונה לכל המגזרים</div>
      </div>


    </div>
  }

  const renderRainEvent = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div>
        האם היה אירוע גשם שהסתיים בשבועיים האחרונים? </div>
      <div>אירוע גשם: יום או מספר ימים ברצף שבכל אחד מהם ירדו יותר מ 0.1 מ"מ גשם</div>
      <div>
        <Button className='m-5 ml-2' onClick={() => { setFormData({ ...formData, rainEvent: true }) }}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => { setFormData({ ...formData, rainEvent: false }) }}>לא</Button>
      </div>
    </div>
  }

  const renderOliveType = () => {
    return <div>
      <div>מהו הזן העיקרי בחלקה?</div>
      <div>בחר מהרשימה:</div>

      <div className="mt-2 grid grid-cols-1">
        <select value={formData.oliveTypeName}
          onChange={(e) => {
            const selectedOliveTypeName = e.target.value;
            const selectedOliveType = oliveTypes[selectedOliveTypeName as keyof typeof oliveTypes];
            setFormData({ ...formData, oliveType: selectedOliveType, oliveTypeName: selectedOliveTypeName });
          }}
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
          {Object.entries(oliveTypes).map(([key, _]) => <option key={key} value={key}>{key}</option>)}
        </select>
        <svg className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" data-slot="icon">
          <path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
  }

  const addRainTempPair = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      rainTempPairs: [...prevFormData.rainTempPairs, { 'rainAmount': rainAmount, 'minTemp': minTemp }],
    }));
    setRainAmount('');
    setMinTemp('');
  }

  const renderRainTemp = () => {
    return <div>
      <div>רשום את כמות הגשם שירדה וטמפרטורת המינימום בכל אחד מהימים של אירוע הגשם. </div>
      <div>הזן את כמות הגשם שירדה ביום הראשון ואת טמפרטורת המינימום של היום הראשון ולאחר מכן ״הוסף״ כדי להזין את הנתונים של היום הבא באירוע. בסיום הזנת הנתונים יש ללחוץ על ״חשב״.</div>
      <input
        className='m-5 no-spinner border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
        type="number"
        name="rainAmount"
        placeholder="הכנס כמות גשם (מ״מ)"
        value={rainAmount}
        onChange={e => setRainAmount(e.target.value)}
      />
      <input
        className='m-5 no-spinner w-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500'
        type="number"
        name="temp"
        placeholder="הכנס טמפרטורת מינימום (מעלות)"
        value={minTemp}
        onChange={e => setMinTemp(e.target.value)}
      />
      <Button className='m-5 ml-2' onClick={addRainTempPair}>הוסף</Button>
      <div>
        <ul>
          {formData.rainTempPairs.map((pair, index) => (
            <li key={index}>{pair.rainAmount}  מ״מ גשם - {pair.minTemp} מעלות</li>
          ))}
        </ul>
      </div>
    </div>
  }

  const renderNoCalc = () => {
    // If we have a calculation result, use that message
    if (calculationResult && (calculationResult.type === 'NO_TREATMENT' || calculationResult.type === 'CONSULT_GUIDE')) {
      return <div className='bg-sky-300 p-5 rounded-md'>{calculationResult.message}</div>;
    }

    // If we came from spraying question and user said they sprayed recently
    if (formData.sprayingInPastTwoWeeks === true) {
      return <div className='bg-sky-300 p-5 rounded-md'>אין צורך לרסס כרגע. חזור אחרי שעברו שבועיים מהריסוס.</div>;
    }

    // Default logic for other scenarios
    return <div className='bg-sky-300 p-5 rounded-md'>
      {!formData.rainEvent ? <div>על פי הנתונים נראה שכרגע אין צורך לטפל כנגד עין טווס, המשך לאחר סיום אירוע הגשם הבא</div> : formData.contamination ? "יש להתייעץ עם מדריך" : "אין צורך לרסס"}
    </div>
  }

  const renderFinalCalc = () => {
    if (!calculationResult) {
      const result = calcTavasit();
      setCalculationResult(result);
      return <div className='bg-sky-300 p-5 rounded-md'>{result.message}</div>;
    }

    // If we have a stored result, check spraying question
    if (calculationResult.type === 'TREATMENT_RECOMMENDED') {
      if (formData.sprayingInPastTwoWeeks === true) {
        return <div className='bg-sky-300 p-5 rounded-md'>אין צורך לרסס כרגע. חזור אחרי שעברו שבועיים מהריסוס.</div>;
      } else if (formData.sprayingInPastTwoWeeks === false) {
        return <div className='bg-sky-300 p-5 rounded-md'>על פי הנתונים התקיים אירוע הדבקה ויש לרסס כנגד עין טווס</div>;
      }
    }

    return <div className='bg-sky-300 p-5 rounded-md'>{calculationResult.message}</div>;
  }

  const renderReselinceQuestion = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div>
        האם יש נגיעות בחלקה?
      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => { setFormData({ ...formData, contamination: true }) }}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => { setFormData({ ...formData, contamination: false }) }}>לא</Button>
      </div>
    </div>
  }

  const renderSeason = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div>
        מה העונה?
      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => { setFormData({ ...formData, endOfSeason: false }) }}>סתיו</Button>
        <Button className='m-5 mr-2' onClick={() => { setFormData({ ...formData, endOfSeason: false }) }}>חורף</Button>
        <Button className='m-5 mr-2' onClick={() => { setFormData({ ...formData, endOfSeason: true }) }}>אביב</Button>
      </div>
    </div>
  }

  const renderMRContamination = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div>
        {formData.endOfSeason ? "האם הייתה השנה נגיעות בחלקה?" : "האם הייתה נגיעות בעונה הקודמת?"}
      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => { setFormData({ ...formData, contamination: true }) }}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => { setFormData({ ...formData, contamination: false }) }}>לא</Button>
      </div>
    </div>
  }

  const renderSprayingQuestion = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div className='bg-sky-300 p-5 rounded-md'>על פי הנתונים התקיים אירוע הדבקה ויש לרסס כנגד עין טווס</div>
      <div>
        האם בוצע ריסוס כנגד עין טווס בשבועיים האחרונים?
      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => { setFormData({ ...formData, sprayingInPastTwoWeeks: true }) }}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => { setFormData({ ...formData, sprayingInPastTwoWeeks: false }) }}>לא</Button>
      </div>
    </div>
  }

  const renderHarvestQuestion = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div>
        האם מתוכנן מסיק בתקופה המותרת לריסוס על פי התווית של התכשיר בו אתה מתכוון להשתמש?
      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => { setFormData({ ...formData, harvestPlanned: true }) }}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => { setFormData({ ...formData, harvestPlanned: false }) }}>לא</Button>
      </div>
    </div>
  }

  const renderPostHarvestQuestion = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div className='bg-sky-300 p-5 rounded-md mb-4'>המשך אחרי המסיק</div>
      <div>
        האם עברו יותר משבועיים מסיום אירוע ההדבקה?
      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => { setFormData({ ...formData, twoWeeksPassedSinceInfection: true }) }}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => { setFormData({ ...formData, twoWeeksPassedSinceInfection: false }) }}>לא</Button>
      </div>
    </div>
  }

  const renderRainForecastQuestion = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div className='bg-sky-300 p-5 rounded-md mb-4'>רסס בתכשיר מורשה מתאים</div>
      <div>
        האם קיימת סבירות שהשנה ירד עוד גשם?
      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => { setFormData({ ...formData, moreRainExpected: true }) }}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => { setFormData({ ...formData, moreRainExpected: false }) }}>לא</Button>
      </div>
    </div>
  }

  const renderFinalContinueTwoWeeks = () => {
    return <div className='bg-sky-300 p-5 rounded-md'>
      המשך אחרי שעברו שבועיים מהריסוס.</div>
  }


  const renderThankYou = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div className='text-6xl font-bold mb-5 justify-center text-green-700'>
        סיום
      </div>
      <div className='text-3xl font-bold mb-5 text-center'>
        תודה שהשתמשת במערכת טווזית
      </div>
      <div className='text-xl mb-5 text-center'>
        זכור כי קבלת ההחלטה לגבי הצורך לרסס כנגד עין טווס היא באחריות המגדל
      </div>
      <Button className="mt-5 bg-green-700" onClick={handlePrevious}>
        התחל מחדש
      </Button>
    </div>
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case PageNumber.WELCOME:
        return renderWelcome()
      case PageNumber.RAIN_EVENT:
        return renderRainEvent()
      case PageNumber.OLIVE_TYPE:
        return renderOliveType()
      case PageNumber.RESELINCE_QUESTION:
        return renderReselinceQuestion()
      case PageNumber.MR_QUESTION_SEASON:
        return renderSeason()
      case PageNumber.MR_QUESTION_CONTAMIATION:
        return renderMRContamination()
      case PageNumber.RAIN_TEMP:
        return renderRainTemp()
      case PageNumber.FINAL_NO_CALC:
        return renderNoCalc()
      case PageNumber.FINAL_WITH_CALC:
        return renderFinalCalc()
      case PageNumber.SPRAYING_QUESTION:
        return renderSprayingQuestion()
      case PageNumber.HARVEST_QUESTION:
        return renderHarvestQuestion()
      case PageNumber.POST_HARVEST_QUESTION:
        return renderPostHarvestQuestion()
      case PageNumber.RAIN_FORECAST_QUESTION:
        return renderRainForecastQuestion()
      case PageNumber.FINAL_CONTINUE_TWO_WEEKS:
        return renderFinalContinueTwoWeeks()
      case PageNumber.THANK_YOU:
        return renderThankYou()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        <Card>
          <CardContent >
            <div className='flex w-full justify-center items-center m-5'>
              {renderCurrentPage()}
            </div>
          </CardContent>
          <CardFooter className={[PageNumber.RAIN_EVENT, PageNumber.WELCOME, PageNumber.THANK_YOU].includes(currentPage) ? 'invisible' : 'visible'}>
            <form className="flex items-center w-full justify-between">
              <div className="text-xs text-muted-foreground">
                <Button
                  onClick={handlePrevious}
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={currentPage === PageNumber.WELCOME}
                >
                  הקודם
                </Button>
                <Button
                  onClick={handleNext}
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={currentPage === PageNumber.THANK_YOU}
                  className={`bg-green-700 text-white ${(currentPage !== PageNumber.RAIN_TEMP && currentPage !== PageNumber.WELCOME && currentPage !== PageNumber.RAIN_EVENT) ? 'visible' : 'invisible'}`}
                >
                  הבא
                </Button>
              </div>
              <div className="flex">
                <Button
                  onClick={() => {
                    const result = calcTavasit();
                    setCalculationResult(result);

                    // Navigate based on calculation result
                    if (result.type === 'TREATMENT_RECOMMENDED') {
                      setNavigationHistory(prevHistory => [...prevHistory, PageNumber.SPRAYING_QUESTION]);
                      setCurrentPage(PageNumber.SPRAYING_QUESTION);
                    } else {
                      setNavigationHistory(prevHistory => [...prevHistory, PageNumber.FINAL_NO_CALC]);
                      setCurrentPage(PageNumber.FINAL_NO_CALC);
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  type="button"
                  className={`bg-green-700 text-white ${currentPage === PageNumber.RAIN_TEMP ? 'visible' : 'invisible'}`}
                >
                  חשב
                </Button>
              </div>
            </form>
          </CardFooter>

          {/* Debug Panel - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <DebugPanel
              currentPage={currentPage}
              navigationHistory={navigationHistory}
              formData={formData}
              rainAmount={rainAmount}
              minTemp={minTemp}
              rainTempPairs={formData.rainTempPairs}
              calculationResult={calculationResult}
            />
          )}
        </Card >
      </div>

      {/* Footer with credit */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4 px-6 mt-8">
        <div className="text-center text-sm text-gray-600">
          <p>Website developed by <a href="https://github.com/barezra94" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-800 hover:text-green-700 transition-colors duration-200 underline decoration-dotted">Bar Ezra Gafniel</a></p>
          <p className="text-xs mt-1">© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
