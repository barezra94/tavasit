"use client"

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { Spinner } from '@/components/icons';
import { TavasitCalculator } from "./(tavasitCalculator)/page";


export default async function Page() {
    const Map = useMemo(() => dynamic(
        () => import('@/components/map/'),
        {
            loading: () => <Spinner />,
            ssr: false
        }
    ), [])

    return (
      <>
        <div className="bg-white-700 mx-auto my-5 w-[98%] h-[500px]">
            <Map posix={[32.95297301151571, 35.54596497528796]} />
        </div>
        <div>
          <TavasitCalculator/>
        </div>
      </>
      
    )
}