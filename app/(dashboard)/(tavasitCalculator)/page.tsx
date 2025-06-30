"use client"

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DebugPanel } from '@/components/DebugPanel';

export enum PageNumber {
  WELCOME = 1,
  RAIN_EVENT,
  OLIVE_TYPE,
  RESELINCE_QUESTION,
  MR_QUESTION_SEASON,
  MR_QUESTION_CONTAMIATION,
  RAIN_TEMP,
  SPRAYING_QUESTION,
  FINAL_WITH_CALC,
  FINAL_NO_CALC,
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
    case PageNumber.FINAL_WITH_CALC: return 'FINAL_WITH_CALC';
    case PageNumber.FINAL_NO_CALC: return 'FINAL_NO_CALC';
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
  [OliveSensitivityType.MS]: [13, 18],
  [OliveSensitivityType.MR]: [14, 18],
  [OliveSensitivityType.HR]: [],
  [OliveSensitivityType.I]: [],
}

const oliveTypes = {
  'אוליאסטר': OliveSensitivityType.HR,
  'ארבקינה': OliveSensitivityType.HR,
  'ברנע': OliveSensitivityType.MR,
  'גמליק': OliveSensitivityType.I,
  'הוכיבלנקה': OliveSensitivityType.HR,
  'מיסיון': OliveSensitivityType.HR,
  'מנזנילו': OliveSensitivityType.MS,
  'מעיליה': OliveSensitivityType.I,
  'מעלות': OliveSensitivityType.I,
  'נבאלי בלאדי': OliveSensitivityType.HS,
  'סבלינו': OliveSensitivityType.HR,
  'סורי': OliveSensitivityType.HS,
  'פיקואל': OliveSensitivityType.MS,
  'פישולין לגדוק': OliveSensitivityType.HR,
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

    // Check if any day has rain equal to or less than 0.1mm
    const hasDayWith01mmOrLess = formData.rainTempPairs.some(pair => {
      const rainAmount = parseFloat(pair.rainAmount);
      return rainAmount <= 0.1;
    });

    // Log all rain amounts for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('🌧️ Daily rain amounts:', formData.rainTempPairs.map((pair, index) =>
        `Day ${index + 1}: ${pair.rainAmount}mm`
      ));
    }

    if (hasDayWith01mmOrLess) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Found day with rain ≤ 0.1mm, no treatment needed');
      }
      return { type: 'NO_TREATMENT', message: 'על פי הנתונים נראה שאין צורך לטפל כנגד עין טווס' };
    }

    const totalAmountOfRain = formData.rainTempPairs.reduce((total, pair) => {
      return total + parseFloat(pair.rainAmount);
    }, 0);
    if (process.env.NODE_ENV === 'development') {
      console.log('🌧️ Total rain amount:', totalAmountOfRain, 'mm');
    }

    if (totalAmountOfRain < 15) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Insufficient rain (< 15mm), no treatment needed');
      }
      return { type: 'NO_TREATMENT', message: 'על פי הנתונים נראה שאין צורך לטפל כנגד עין טווס' };
    }

    if (!temps) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ No temperature thresholds available, consult guide');
      }
      return { type: 'CONSULT_GUIDE', message: 'יש לפנות למדריך' };
    }

    const enteredTemps = formData.rainTempPairs.map(pair => parseFloat(pair.minTemp));
    const sumOfAllTemps = formData.rainTempPairs.reduce((total, pair) => {
      return total + parseFloat(pair.minTemp);
    }, 0);
    const temp = sumOfAllTemps / enteredTemps.length;
    if (process.env.NODE_ENV === 'development') {
      console.log('🌡️ Average temperature:', temp, '°C');
      console.log('📏 Temperature range:', temps[0], '-', temps[1], '°C');
    }

    if (temp > temps[1] || temp < temps[0]) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Temperature outside range, no treatment needed');
      }
      return {
        type: 'NO_TREATMENT',
        message: 'על פי הנתונים נראה שאין צורך לטפל כנגד עין טווס. בדוק שוב לאחר אירוע הגשם הבא.'
      };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Treatment recommended - infection event occurred');
    }
    return { type: 'TREATMENT_RECOMMENDED', message: 'על פי הנתונים התקיים אירוע הדבקה ויש לרסס כנגד עין טווס.' };
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
          console.log('➡️ Going to FINAL_WITH_CALC (spraying recommended)');
        }
        nextPage = PageNumber.FINAL_WITH_CALC;
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('➡️ Going to next page (default)');
      }
      nextPage = currentPage + 1;
    }

    // Update navigation history and current page
    setNavigationHistory(prevHistory => [...prevHistory, nextPage]);
    setCurrentPage(nextPage);
    if (process.env.NODE_ENV === 'development') {
      console.log('📚 Updated navigation history:', [...navigationHistory, nextPage].map(p => `${p}(${getPageName(p)})`));
    }
  };

  const handlePrevious = () => {
    if (currentPage === PageNumber.FINAL_NO_CALC || currentPage === PageNumber.FINAL_WITH_CALC) {
      // Reset everything when going back from final pages
      setFormData({
        rainEvent: true,
        contamination: true,
        endOfSeason: false,
        oliveType: oliveTypes[Object.keys(oliveTypes)[0] as keyof typeof oliveTypes],
        oliveTypeName: Object.keys(oliveTypes)[0],
        rainTempPairs: [],
        sprayingInPastTwoWeeks: undefined,
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
          טווזית משתמשת בנתונים מטאורולוגים (גשם וטמפרטורה) ובמידע מקומי (זן נטוע, נגיעות בעין טווס והיסטוריית ריסוסים קודמים) לחיזוי הסבירות להתרחשות הדבקה.
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
        className='m-5 no-spinner'
        type="number"
        name="rainAmount"
        placeholder="הכנס כמות גשם (מ״מ)"
        value={rainAmount}
        onChange={e => setRainAmount(e.target.value)}
      />
      <input
        className='m-5 no-spinner w-64'
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
        return <div className='bg-sky-300 p-5 rounded-md'>כבר בוצע ריסוס בשבועיים האחרונים, אין צורך לרסס שוב</div>;
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
    }
  }

  return (
    <Card>
      <CardContent >
        <div className='flex w-full justify-center items-center m-5'>
          {renderCurrentPage()}
        </div>
      </CardContent>
      <CardFooter className={[PageNumber.RAIN_EVENT, PageNumber.WELCOME].includes(currentPage) ? 'invisible' : 'visible'}>
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
              disabled={currentPage === PageNumber.FINAL_NO_CALC || currentPage === PageNumber.FINAL_WITH_CALC}
              className={`bg-green-700 text-white ${(currentPage !== PageNumber.RAIN_TEMP && currentPage !== PageNumber.WELCOME && currentPage !== PageNumber.RAIN_EVENT) ? 'visible' : 'invisible'}`}
            >
              הבא
            </Button>
          </div>
          <div className="flex">
            <Button
              onClick={() => { calcTavasit(); handleNext() }}
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
  );
}
