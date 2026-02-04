'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Calculator from './components/calculator';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { isSignedIn, user } = useUser();

  return (
    <main
      className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900'
          : 'bg-gradient-to-br from-orange-100 via-gray-100 to-blue-100'
      }`}
    >
      <div className='container mx-auto p-8'>
        {/* Header with Auth and Theme Toggle */}
        <div className='flex justify-between items-center mb-8'>
          {/* User Profile */}
          <div className='flex items-center gap-4'>
            {isSignedIn ? (
              <div className='flex items-center gap-3'>
                <UserButton afterSignOutUrl='/' />
                <div
                  className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  <div className='font-semibold'>Welcome back!</div>
                  <div className='text-xs opacity-70'>
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex gap-3'>
                <SignInButton mode='modal'>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-slate-700 text-white hover:bg-slate-600'
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode='modal'>
                  <button className='px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all'>
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <div className='flex items-center gap-3'>
            <span
              className={`text-sm font-semibold ${
                theme === 'light' ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              ☀️
            </span>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-orange-400'
              }`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                className='absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-lg'
                style={{
                  x: theme === 'dark' ? 32 : 0,
                }}
              />
            </button>

            <span
              className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-500'
              }`}
            >
              🌙
            </span>
          </div>
        </div>

        {/* Info Banner */}
        {!isSignedIn && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-2xl mx-auto mb-8 p-4 rounded-2xl ${
              theme === 'dark'
                ? 'bg-blue-900/20 border border-blue-800/30'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <div
              className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}
            >
              <strong>💡 Tip:</strong> Sign in with Google to save your
              calculation history permanently across all your devices!
            </div>
          </motion.div>
        )}

        {/* Calculator */}
        <div className='justify-center'>
          <Calculator theme={theme} />
        </div>
      </div>
    </main>
  );
}
