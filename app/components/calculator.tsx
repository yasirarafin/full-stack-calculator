'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

interface CalculatorProps {
  theme?: 'dark' | 'light';
}

export default function Calculator({ theme = 'dark' }: CalculatorProps) {
  const { isSignedIn, user } = useUser();
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isDark = theme === 'dark';

  // Load history based on auth state
  useEffect(() => {
    console.log('Auth state changed - isSignedIn:', isSignedIn);
    if (isSignedIn) {
      fetchDatabaseHistory();
      syncSessionHistory();
    } else {
      loadSessionHistory();
    }
  }, [isSignedIn]);

  const loadSessionHistory = () => {
    const savedHistory = sessionStorage.getItem('calculatorHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        console.log('Loaded session history:', parsed.length);
        setHistory(parsed);
      } catch (error) {
        console.error('Failed to load session history:', error);
      }
    }
  };

  const fetchDatabaseHistory = async () => {
    try {
      console.log('Fetching database history...');
      const response = await fetch('/api/calculations');

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched calculations:', data.length);

        const formatted = data.map((calc: any) => ({
          id: calc.id,
          expression: calc.expression,
          result: calc.result,
          timestamp: new Date(calc.createdAt).toLocaleString(),
        }));
        setHistory(formatted);
        setErrorMessage('');
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch:', errorData);
        setErrorMessage('Failed to load history');
      }
    } catch (error) {
      console.error('Failed to fetch database history:', error);
      setErrorMessage('Failed to load history');
    }
  };

  const syncSessionHistory = async () => {
    const savedHistory = sessionStorage.getItem('calculatorHistory');
    if (!savedHistory) {
      console.log('No session history to sync');
      return;
    }

    try {
      setIsSyncing(true);
      const sessionHistory = JSON.parse(savedHistory);

      console.log('Syncing session history:', sessionHistory.length);

      const response = await fetch('/api/calculations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionHistory }),
      });

      if (response.ok) {
        const { synced } = await response.json();
        console.log(`Synced ${synced} calculations`);
        sessionStorage.removeItem('calculatorHistory');
        await fetchDatabaseHistory();
      } else {
        console.error('Sync failed:', await response.json());
      }
    } catch (error) {
      console.error('Failed to sync session history:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const saveToHistory = async (expr: string, res: string) => {
    const newEntry: CalculationHistory = {
      id: Date.now().toString(),
      expression: expr,
      result: res,
      timestamp: new Date().toLocaleString(),
    };

    if (isSignedIn) {
      // Save to database
      try {
        console.log('Saving to database:', expr, '=', res);

        const response = await fetch('/api/calculations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expression: expr, result: res }),
        });

        console.log('Save response status:', response.status);

        if (response.ok) {
          await fetchDatabaseHistory();
          setErrorMessage('');
        } else {
          const errorData = await response.json();
          console.error('Failed to save:', errorData);
          setErrorMessage('Failed to save calculation');
        }
      } catch (error) {
        console.error('Failed to save to database:', error);
        setErrorMessage('Failed to save calculation');
      }
    } else {
      // Save to sessionStorage
      console.log('Saving to session storage');
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      sessionStorage.setItem(
        'calculatorHistory',
        JSON.stringify(updatedHistory)
      );
    }
  };

  const clearHistory = async () => {
    if (isSignedIn) {
      try {
        const response = await fetch('/api/calculations', {
          method: 'DELETE',
        });
        if (response.ok) {
          setHistory([]);
          setErrorMessage('');
        }
      } catch (error) {
        console.error('Failed to clear database history:', error);
        setErrorMessage('Failed to clear history');
      }
    } else {
      setHistory([]);
      sessionStorage.removeItem('calculatorHistory');
    }
  };

  const handleNumber = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
      setExpression(num);
    } else {
      setDisplay(display + num);
      setExpression(expression + num);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    setDisplay(display + ' ' + op + ' ');
    setExpression(expression + op);
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleEquals = () => {
    try {
      const result = Function('"use strict"; return (' + expression + ')')();
      const resultStr = result.toString();
      setDisplay(resultStr);
      saveToHistory(expression, resultStr);
      setExpression(resultStr);
    } catch (error) {
      setDisplay('Error');
      setExpression('');
    }
  };

  const handlePercent = () => {
    try {
      const result = parseFloat(display) / 100;
      setDisplay(result.toString());
      setExpression(result.toString());
    } catch (error) {
      setDisplay('Error');
    }
  };

  const handleToggleSign = () => {
    if (display === '0' || display === 'Error') return;
    const newValue = parseFloat(display) * -1;
    setDisplay(newValue.toString());
    setExpression(newValue.toString());
  };

  const loadFromHistory = (expr: string, res: string) => {
    setExpression(res);
    setDisplay(res);
  };

  const buttons = [
    { label: 'C', onClick: handleClear, type: 'function' },
    { label: '+/−', onClick: handleToggleSign, type: 'function' },
    { label: '%', onClick: handlePercent, type: 'function' },
    { label: '÷', onClick: () => handleOperator('/'), type: 'operator' },
    { label: '7', onClick: () => handleNumber('7'), type: 'number' },
    { label: '8', onClick: () => handleNumber('8'), type: 'number' },
    { label: '9', onClick: () => handleNumber('9'), type: 'number' },
    { label: '×', onClick: () => handleOperator('*'), type: 'operator' },
    { label: '4', onClick: () => handleNumber('4'), type: 'number' },
    { label: '5', onClick: () => handleNumber('5'), type: 'number' },
    { label: '6', onClick: () => handleNumber('6'), type: 'number' },
    { label: '−', onClick: () => handleOperator('-'), type: 'operator' },
    { label: '1', onClick: () => handleNumber('1'), type: 'number' },
    { label: '2', onClick: () => handleNumber('2'), type: 'number' },
    { label: '3', onClick: () => handleNumber('3'), type: 'number' },
    { label: '+', onClick: () => handleOperator('+'), type: 'operator' },
    {
      label: '0',
      onClick: () => handleNumber('0'),
      type: 'number',
      wide: true,
    },
    { label: '.', onClick: () => handleNumber('.'), type: 'number' },
    { label: '=', onClick: handleEquals, type: 'operator' },
  ];

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-sm rounded-[40px] p-6 shadow-2xl ${
          isDark
            ? 'bg-gradient-to-br from-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-gray-100 to-white'
        }`}
      >
        {/* Header */}
        <div className='mb-6 flex justify-between items-center'>
          <button
            className={`p-3 rounded-full ${
              isDark ? 'bg-slate-700/50' : 'bg-gray-200/50'
            }`}
          >
            <svg
              className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path d='M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z' />
              <path d='M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z' />
            </svg>
          </button>

          <div className='flex items-center gap-2'>
            {isSyncing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              >
                ⟳
              </motion.div>
            )}

            {history.length > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isDark
                    ? 'bg-slate-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {isSignedIn ? '☁️' : '💾'} {history.length}
              </motion.div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-xl text-xs ${
              isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
            }`}
          >
            ⚠️ {errorMessage}
          </motion.div>
        )}

        {/* Display */}
        <div className='mb-6'>
          <div
            className={`text-right text-sm mb-2 h-6 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {expression.replace(/\*/g, '×').replace(/\//g, '÷') || '0'}
          </div>
          <div
            className={`text-right text-6xl font-light ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {parseFloat(display).toLocaleString()}
          </div>
        </div>

        {/* Buttons */}
        <div className='grid grid-cols-4 gap-3'>
          {buttons.map((button, index) => {
            const isWide = button.wide;
            const isOperator = button.type === 'operator';
            const isFunction = button.type === 'function';

            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={button.onClick}
                className={`
                  ${isWide ? 'col-span-2' : ''}
                  h-20 rounded-3xl text-2xl font-light
                  transition-all duration-200
                  ${
                    isOperator
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : isFunction
                        ? isDark
                          ? 'bg-slate-700 text-white hover:bg-slate-600'
                          : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
                        : isDark
                          ? 'bg-slate-700/70 text-white hover:bg-slate-600'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }
                `}
              >
                {button.label}
              </motion.button>
            );
          })}
        </div>

        {/* History Button */}
        <div className='mt-6'>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`w-full py-3 rounded-2xl text-sm font-medium transition-all ${
              isDark
                ? 'bg-slate-700/50 text-gray-300 hover:bg-slate-700'
                : 'bg-gray-200/50 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {showHistory ? '📊 Hide' : '📊 Show'}{' '}
            {isSignedIn ? 'Cloud' : 'Session'} History
            {history.length > 0 && ` (${history.length})`}
          </button>
        </div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-4 rounded-2xl overflow-hidden ${
                isDark ? 'bg-slate-700/30' : 'bg-gray-200/30'
              }`}
            >
              <div className='p-4'>
                <div className='flex justify-between items-center mb-3'>
                  <h3
                    className={`text-sm font-semibold ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {isSignedIn ? '☁️ Cloud History' : '💾 Session History'}
                  </h3>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${
                        isDark
                          ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {!isSignedIn && (
                  <div
                    className={`text-xs mb-3 p-2 rounded-lg ${
                      isDark
                        ? 'bg-blue-900/20 text-blue-300'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    💡 Sign in to save history permanently
                  </div>
                )}

                {history.length === 0 ? (
                  <p
                    className={`text-sm text-center py-8 ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    No calculations yet
                  </p>
                ) : (
                  <div className='space-y-2 max-h-64 overflow-y-auto'>
                    {history.map((calc, index) => (
                      <motion.div
                        key={calc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() =>
                          loadFromHistory(calc.expression, calc.result)
                        }
                        className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                          isDark
                            ? 'bg-slate-700/50 hover:bg-slate-700/70'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      >
                        <div className='flex justify-between items-start mb-1'>
                          <div
                            className={`text-xs ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {calc.timestamp}
                          </div>
                        </div>
                        <div
                          className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {calc.expression
                            .replace(/\*/g, '×')
                            .replace(/\//g, '÷')}
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          = {parseFloat(calc.result).toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
