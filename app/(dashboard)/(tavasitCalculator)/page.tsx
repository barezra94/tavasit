"use client"

import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
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
  [OliveSensitivityType.HS]: [12,18],
  [OliveSensitivityType.MS]: [13,18],
  [OliveSensitivityType.MR]: [14,18],
  [OliveSensitivityType.HR]: [],
  [OliveSensitivityType.I]: [],
}

const oliveTypes = {
  'נבאלי בלאדי': OliveSensitivityType.HS,
  'סורי': OliveSensitivityType.HS,
  'מנזילו':OliveSensitivityType.MS,
  'קורטינה':OliveSensitivityType.MS,
  'פישולין מרוקאי':OliveSensitivityType.MS,
  'פיקואל':OliveSensitivityType.MS,
  'ברנע': OliveSensitivityType.MR,
  'קורנייקי': OliveSensitivityType.HR,
  'הוכיבלנקה': OliveSensitivityType.HR,
  'פישולין לגדוק': OliveSensitivityType.HR,
  'סבלינו': OliveSensitivityType.HR,
  'ארבקינה': OliveSensitivityType.HR,
  'אוליאסטר': OliveSensitivityType.HR,
  'מיסיון': OliveSensitivityType.HR,
  'גמליק': OliveSensitivityType.I,
  'קדש': OliveSensitivityType.I,
  'מעלות': OliveSensitivityType.I,
  'מעיליה': OliveSensitivityType.I,
  
}

export default function TavasitCalculator() {
  const [currentPage, setCurrentPage] = useState(PageNumber.WELCOME);
  const [progress, setProgress] = useState(PageNumber.WELCOME);
  const [formData, setFormData] = useState<FormData>({
    rainEvent: true,
    contamination: true,
    endOfSeason: false,
    oliveType: OliveSensitivityType.HS,
    oliveTypeName:  'נבאלי בלאדי',
    rainTempPairs: [],
  });

  const [rainAmount, setRainAmount] = useState('');
  const [minTemp, setMinTemp] = useState('');

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);


  useEffect(()=>{
    increaseProgress()
  },[currentPage])

  useEffect(() => {
    if (currentPage === PageNumber.RAIN_EVENT 
      || currentPage === PageNumber.RESELINCE_QUESTION 
      || currentPage === PageNumber.MR_QUESTION_SEASON 
      || currentPage === PageNumber.MR_QUESTION_CONTAMIATION) {
        handleNext();
      }
  }, [formData])

  const increaseProgress = () => {
    setProgress(Math.min(currentPage * 20, 100));
    // Increase by the current page
  };

  const calcTavasit = () => {
    const temps = minTempsForType[formData.oliveType]
    const totalAmountOfRain = formData.rainTempPairs.reduce((total, pair) => {
      return total + parseFloat(pair.rainAmount);
    }, 0);

    if (totalAmountOfRain < 15) {
      return <div>לא ירד מספיק גשם - אין הדבקה</div>
    }
    
    if (!temps){
      return <div>יש לפנות למדריך</div>
    }

    const enteredTemps = formData.rainTempPairs.map(pair => parseFloat(pair.minTemp));
    if (enteredTemps.some(temp => temp > temps[1] || temp < temps[0])) {
      return <div>לא היה אירוע הדבקה מכיוון שהטמפרטורה אינה בטווח</div>
    }

    return <div>היה אירוע הדבקה - במידה ולא רוסס בשבועיים האחרונים, יש לבצע ריסוס</div>

  }

  const handleNext = () => {
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
    } else if (currentPage === PageNumber.OLIVE_TYPE){
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
    if (currentPage === PageNumber.FINAL_NO_CALC || currentPage === PageNumber.FINAL_WITH_CALC){
      setFormData({rainEvent: true,
        contamination: true,
        endOfSeason: false,
        oliveType: OliveSensitivityType.HS,
        oliveTypeName:  'נבאלי בלאדי',
        rainTempPairs: []})
      setCurrentPage(PageNumber.WELCOME)
    } else {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderWelcome = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div>ברוכים הבאים למחשבון הטווזית. במחשבון זה תתבקשו לענות על מספר שאלות כדי לדעת אם המטע נגוע בעין טווס. כדי להתחיל יש ללחוץ על ״התחל״.</div>
      <Button className="w-1/3 mt-5" 
        onClick={handleNext}>התחל</Button>
    </div>
  }

  const renderRainEvent = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div>
האם ירדו לפחות 15 מ״מ גשם ביום אחד או מספר ימים רצופים?      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => {setFormData({...formData, rainEvent: true})}}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => {setFormData({...formData, rainEvent: false})}}>לא</Button>
      </div>
    </div>
  }

  const renderOliveType = () => {return <div>
    <div>יש לבחור זן זית</div>
      <div className="mt-2 grid grid-cols-1">
        <select value={hasMounted ? formData.oliveTypeName : ''}
        onChange={(e) => setFormData({...formData, oliveType: oliveTypes[e.target.value as keyof typeof oliveTypes], oliveTypeName: e.target.value})} 
        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
          {Object.entries(oliveTypes).map(pairs => <option value={pairs[0]}>{pairs[0]}</option>)}
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
  
  const renderRainTemp = () =>{return <div>
    <div>יש להזין טמפרטורת מינימום וכמות גשם ולאחר מכן הוסף.
       לאחר סיום הזנה יש ללחוץ חשב.</div>
    <div className="mt-3 grid grid-cols-3">
    <input
        type="number"
        name="rainAmount"
        placeholder="הכנס כמות גשם"
        value={rainAmount}
        onChange={e => setRainAmount(e.target.value)}
      />

    <input
        type="number"
        name="temp"
        placeholder="הכנס טממפרטורת מינימום"
        value={minTemp}
        onChange={e => setMinTemp(e.target.value)}
      />
    <Button className='m-5 ml-2' onClick={addRainTempPair}>הוסף</Button>
    </div>
    <div>
    <ul>
        {formData.rainTempPairs.map((pair, index) => (
          <li key={index}>{pair.rainAmount}  מ״מ גשם - {pair.minTemp} מעלות</li>
        ))}
      </ul>
    </div>
  </div>}
  
  const renderNoCalc = () => {
    return <div>
      {!formData.rainEvent ? " יש לנסות שוב כאשר יהיה אירוע גשם": formData.contamination ? "יש להתייעץ עם מדריך" : "אין צורך לרסס"}
    </div>
  }
  
  const renderFinalCalc = () => {return calcTavasit()}

  const renderReselinceQuestion = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div>
        האם יש נגיעות בחלקה?
      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => {setFormData({...formData, contamination: true})}}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => {setFormData({...formData, contamination: false})}}>לא</Button>
      </div>
    </div>
  }

  const renderSeason = () => {return <div className='flex justify-center flex-col items-center'>
    <div>
      מה העונה?
    </div>
    <div>
      <Button className='m-5 ml-2' onClick={() => {setFormData({...formData, endOfSeason: false})}}>סתיו</Button>
      <Button className='m-5 mr-2' onClick={() => {setFormData({...formData, endOfSeason: false})}}>חורף</Button>
      <Button className='m-5 mr-2' onClick={() => {setFormData({...formData, endOfSeason: true})}}>אביב</Button>
    </div>
  </div>}

  const renderMRContamination = () => {
    return <div className='flex justify-center flex-col items-center'>
      <div>
        {formData.endOfSeason ? "האם הייתה השנה נגיעות בחלקה?" : "האם הייתה נגיעות בעונה הקודמת?"}
      </div>
      <div>
        <Button className='m-5 ml-2' onClick={() => {setFormData({...formData, contamination: true})}}>כן</Button>
        <Button className='m-5 mr-2' onClick={() => {setFormData({...formData, contamination: false})}}>לא</Button>
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
      <CardHeader>
        <CardTitle>מחשבון טווזית</CardTitle>
      </CardHeader>
      <CardContent >
      <div className='flex w-full justify-center items-center mb-20 mt-10'>
        {renderCurrentPage()}
      </div>
      <div className="mb-8">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
          <div id="progress-bar" style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 w-1/4 transition-all duration-500 ease-in-out">
          </div>
        </div>
      </div>
      </CardContent>
      <CardFooter className={[PageNumber.RAIN_EVENT, PageNumber.WELCOME].includes(currentPage) ? 'invisible' : 'visible' }>
        <form className="flex items-center w-full justify-between">
          <div className="text-xs text-muted-foreground">
          <Button
              onClick={handlePrevious}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={currentPage === PageNumber.WELCOME}
            >
              הקודם
            </Button>
          <Button
              onClick={handleNext}
              variant="ghost"
              size="sm"
              type="submit"
              disabled={currentPage === PageNumber.FINAL_NO_CALC  || currentPage === PageNumber.FINAL_WITH_CALC}
              className={currentPage !== PageNumber.RAIN_TEMP ? 'visible' : 'invisible' }
            >
              הבא
            </Button>
          </div>
          <div className="flex">
            <Button
              onClick={() => {calcTavasit(); handleNext()}}
              variant="ghost"
              size="sm"
              type="submit"
              className={currentPage === PageNumber.RAIN_TEMP ? 'visible' : 'invisible' }
            >
              חשב
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
