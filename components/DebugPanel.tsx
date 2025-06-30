"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DebugPanelProps {
    currentPage: number;
    navigationHistory: number[];
    formData: any;
    rainAmount: string;
    minTemp: string;
    rainTempPairs: any[];
    calculationResult?: any;
}

// Helper function to get page name (duplicated from main component for now)
const getPageName = (pageNumber: number): string => {
    switch (pageNumber) {
        case 1: return 'WELCOME';
        case 2: return 'RAIN_EVENT';
        case 3: return 'OLIVE_TYPE';
        case 4: return 'RESELINCE_QUESTION';
        case 5: return 'MR_QUESTION_SEASON';
        case 6: return 'MR_QUESTION_CONTAMIATION';
        case 7: return 'RAIN_TEMP';
        case 8: return 'FINAL_WITH_CALC';
        case 9: return 'FINAL_NO_CALC';
        default: return `UNKNOWN(${pageNumber})`;
    }
};

export function DebugPanel({ currentPage, navigationHistory, formData, rainAmount, minTemp, rainTempPairs, calculationResult }: DebugPanelProps) {
    const [isVisible, setIsVisible] = useState(false);

    if (!isVisible) {
        return (
            <Button
                onClick={() => setIsVisible(true)}
                variant="outline"
                size="sm"
                className="fixed bottom-4 right-4 z-50 bg-yellow-100 hover:bg-yellow-200"
            >
                🐛 Debug
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto z-50 bg-yellow-50 border-yellow-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm flex justify-between items-center">
                    <span>🐛 Debug Panel</span>
                    <Button
                        onClick={() => setIsVisible(false)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                    >
                        ✕
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
                <div>
                    <strong>Current Page:</strong> {currentPage} ({getPageName(currentPage)})
                </div>
                <div>
                    <strong>Navigation History:</strong>
                    <div className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-16">
                        {navigationHistory.map((page, index) => (
                            <div key={index} className={index === navigationHistory.length - 1 ? 'font-bold text-blue-600' : ''}>
                                {index + 1}. Page {page} ({getPageName(page)}) {index === navigationHistory.length - 1 ? '(current)' : ''}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <strong>Form Data:</strong>
                    <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                </div>
                <div>
                    <strong>Rain Amount:</strong> {rainAmount || 'empty'}
                </div>
                <div>
                    <strong>Min Temp:</strong> {minTemp || 'empty'}
                </div>
                <div>
                    <strong>Rain-Temp Pairs:</strong>
                    <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-24">
                        {JSON.stringify(rainTempPairs, null, 2)}
                    </pre>
                </div>
                <div>
                    <strong>Daily Rain Analysis:</strong>
                    <div className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-20">
                        {rainTempPairs.map((pair, index) => {
                            const rainAmount = parseFloat(pair.rainAmount);
                            const is01mmOrLess = rainAmount <= 0.1;
                            return (
                                <div key={index} className={is01mmOrLess ? 'text-red-600 font-bold' : ''}>
                                    Day {index + 1}: {pair.rainAmount}mm {is01mmOrLess ? '⚠️ (≤0.1mm - no treatment)' : ''}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {calculationResult && (
                    <div>
                        <strong>Calculation Result:</strong>
                        <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-16">
                            {JSON.stringify(calculationResult, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 