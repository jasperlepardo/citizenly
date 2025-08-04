'use client'

/**
 * Header Component
 * Main navigation header for RBI System
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import UserProfile from '@/components/auth/UserProfile'

// Simple logout button component
function LogoutButton() {
  const { signOut } = useAuth()
  
  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      Logout
    </button>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RBI</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">RBI System</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/dashboard" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/residents" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Residents
            </Link>
            <Link 
              href="/addresses" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Addresses
            </Link>
            <Link 
              href="/reports" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Reports
            </Link>
            <Link 
              href="/address-demo" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Demo
            </Link>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <UserProfile compact={true} showBarangay={false} />
                <LogoutButton />
              </div>
            ) : (
              <Link 
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            <Link 
              href="/dashboard" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Dashboard
            </Link>
            <Link 
              href="/residents" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Residents
            </Link>
            <Link 
              href="/addresses" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Addresses
            </Link>
            <Link 
              href="/reports" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Reports
            </Link>
            <Link 
              href="/address-demo" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              Demo
            </Link>
            
            {/* Mobile User Menu */}
            {user ? (
              <div className="border-t border-gray-200 mt-2 pt-2">
                <div className="px-3 py-2">
                  <UserProfile compact={false} showBarangay={false} className="w-full" />
                </div>
                <div className="px-3 py-2">
                  <LogoutButton />
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Link 
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}