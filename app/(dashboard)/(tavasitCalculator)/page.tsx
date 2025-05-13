"use client"

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export enum PageNumber {
  WELCOME = 1,
  RAIN_EVENT,
  OLIVE_TYPE,
  RESELINCE_QUESTION,
  MR_QUESTION_SEASON,
  MR_QUESTION_CONTAMIATION,
  RAIN_TEMP,
  FINAL_WITH_CALC,
  FINAL_NO_CALC,

}

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
  const [previousPage, setPreviousPage] = useState(PageNumber.WELCOME);
  const [formData, setFormData] = useState<FormData>({
    rainEvent: true,
    contamination: true,
    endOfSeason: false,
    oliveType: oliveTypes[Object.keys(oliveTypes)[0] as keyof typeof oliveTypes],
    oliveTypeName: Object.keys(oliveTypes)[0],
    rainTempPairs: [],
  });

  const [rainAmount, setRainAmount] = useState('');
  const [minTemp, setMinTemp] = useState('');

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
    }
  }, [formData]);


  const calcTavasit = () => {
    const temps = minTempsForType[formData.oliveType]
    const totalAmountOfRain = formData.rainTempPairs.reduce((total, pair) => {
      return total + parseFloat(pair.rainAmount);
    }, 0);

    if (totalAmountOfRain < 15) {
      return <div>על פי הנתונים נראה שאין צורך לטפל כנגד עין טווס</div>
    }

    if (!temps) {
      return <div>יש לפנות למדריך</div>
    }

    const enteredTemps = formData.rainTempPairs.map(pair => parseFloat(pair.minTemp));
    const sumOfAllTemps = formData.rainTempPairs.reduce((total, pair) => {
      return total + parseFloat(pair.minTemp);
    }, 0);
    const temp = sumOfAllTemps / enteredTemps.length;
    if (temp > temps[1] || temp < temps[0]) {
      return <div>על פי הנתונים נראה שאין צורך לטפל כנגד עין טווס</div>
    }

    return <div>על פי הנתונים התקיים אירוע הדבקה ויש לרסס כנגד עין טווס.</div>

  }

  const handleNext = () => {
    console.log('handleNext fired at page:', currentPage);
    setPreviousPage(currentPage)
    if (currentPage === PageNumber.RAIN_EVENT) {
      if (!formData.rainEvent) {
        setCurrentPage(PageNumber.FINAL_NO_CALC);
      } else {
        setCurrentPage(currentPage + 1);
      }
    } else if (currentPage === PageNumber.RAIN_TEMP) {
      if (formData.rainTempPairs) {
        setCurrentPage(currentPage + 1);
      }
    } else if (currentPage === PageNumber.OLIVE_TYPE) {
      if (formData.oliveType === OliveSensitivityType.HR || formData.oliveType === OliveSensitivityType.I) {
        setCurrentPage(PageNumber.RESELINCE_QUESTION);
      } else if (formData.oliveType === OliveSensitivityType.MR) {
        setCurrentPage(PageNumber.MR_QUESTION_SEASON)
      }
      else {
        setCurrentPage(PageNumber.RAIN_TEMP)
      }
    } else if (currentPage === PageNumber.RESELINCE_QUESTION) {
      setCurrentPage(PageNumber.FINAL_NO_CALC);
    } else if (currentPage === PageNumber.MR_QUESTION_CONTAMIATION) {
      if (formData.contamination) {
        setCurrentPage(PageNumber.RAIN_TEMP)
      } else {
        setCurrentPage(PageNumber.FINAL_NO_CALC)
      }
    }
    else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage === PageNumber.FINAL_NO_CALC || currentPage === PageNumber.FINAL_WITH_CALC) {
      setFormData({
        rainEvent: true,
        contamination: true,
        endOfSeason: false,
        oliveType: oliveTypes[Object.keys(oliveTypes)[0] as keyof typeof oliveTypes],
        oliveTypeName: Object.keys(oliveTypes)[0],
        rainTempPairs: []
      })
      setCurrentPage(PageNumber.WELCOME)
    } else {
      setCurrentPage(previousPage);
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
      <div>מהו הזמן העיקרי בחלקה?</div>
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
      <div>רשום את כמות הגשם שירדה וטמפרטורת המינימום בכל יום באירוע הגשם. </div>
      <div>הזן את כמות הגשם שירדה ביום הראשון ואת טמפרטורת המינימום של היום הראשון ולחץ ״הוסף״ על מנת להזין את הנתונים של היום הבא באירוע. בסיום הזנת הנתונים יש ללחוץ על ״חשב״.</div>
      <input
        className='m-5 no-spinner'
        type="number"
        name="rainAmount"
        placeholder="הכנס כמות גשם (מ״מ)"
        value={rainAmount}
        onChange={e => setRainAmount(e.target.value)}
      />
      <input
        className='m-5 no-spinner'
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
    return <div>
      {!formData.rainEvent ? <div className='bg-sky-300 p-5 rounded-md'>על פי הנתונים נראה שכרגע אין צורך לטפל כנגד עין טווס, המשך לאחר סיום אירוע הגשם הבא</div> : formData.contamination ? "יש להתייעץ עם מדריך" : "אין צורך לרסס"}
    </div>
  }

  const renderFinalCalc = () => { return calcTavasit() }

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
    </Card >
  );
}
