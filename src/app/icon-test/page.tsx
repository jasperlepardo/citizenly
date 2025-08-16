'use client';

import Icon from '@/components/atoms/Icon/Icon';

export default function IconTestPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">FontAwesome Icon Test Page</h1>
      
      {/* Test 1: Direct FontAwesome HTML */}
      <div className="mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Test 1: Direct FontAwesome HTML</h2>
        <div className="flex items-center space-x-4">
          <i className="fas fa-home text-3xl text-blue-600"></i>
          <i className="fas fa-users text-3xl text-green-600"></i>
          <i className="fas fa-tachometer-alt text-3xl text-yellow-600"></i>
          <i className="fas fa-cog text-3xl text-purple-600"></i>
          <i className="fas fa-chart-bar text-3xl text-red-600"></i>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          These should show FontAwesome icons if the CDN is loaded correctly.
        </p>
      </div>

      {/* Test 2: Our Icon Component */}
      <div className="mb-8 p-6 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Test 2: Our Icon Component</h2>
        <div className="flex items-center space-x-4">
          <Icon name="home" size="3xl" color="primary" />
          <Icon name="users" size="3xl" color="success" />
          <Icon name="dashboard" size="3xl" color="warning" />
          <Icon name="settings" size="3xl" color="secondary" />
          <Icon name="chart-bar" size="3xl" color="danger" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          These should show our Icon component with FontAwesome classes.
        </p>
      </div>

      {/* Test 3: Different FontAwesome Styles */}
      <div className="mb-8 p-6 border rounded-lg bg-green-50 dark:bg-green-900/20">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Test 3: Different FontAwesome Styles</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <Icon name="home" style="solid" size="2xl" color="inherit" />
            <p className="text-sm mt-2">Solid</p>
          </div>
          <div className="text-center">
            <Icon name="home" style="regular" size="2xl" color="inherit" />
            <p className="text-sm mt-2">Regular</p>
          </div>
          <div className="text-center">
            <Icon name="home" style="light" size="2xl" color="inherit" />
            <p className="text-sm mt-2">Light</p>
          </div>
          <div className="text-center">
            <Icon name="home" style="duotone" size="2xl" color="inherit" />
            <p className="text-sm mt-2">Duotone</p>
          </div>
        </div>
      </div>

      {/* Test 4: FontAwesome Loading Check */}
      <div className="mb-8 p-6 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Test 4: FontAwesome Loading Check</h2>
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Window.FontAwesome:</strong> {typeof window !== 'undefined' && (window as any).FontAwesome ? 'Loaded ✅' : 'Not loaded ❌'}
          </p>
          <p className="text-sm">
            <strong>FontAwesome Kit Script:</strong> {typeof document !== 'undefined' && document.querySelector('script[src*="fontawesome.com"]') ? 'Found ✅' : 'Not found ❌'}
          </p>
          <p className="text-sm">
            <strong>CSS Classes Check:</strong> 
            <span className="ml-2">
              <i className="fas fa-check text-green-600"></i> fas
              <i className="far fa-check text-green-600 ml-2"></i> far
              <i className="fal fa-check text-green-600 ml-2"></i> fal
              <i className="fad fa-check text-green-600 ml-2"></i> fad
            </span>
          </p>
          <p className="text-sm">
            <strong>Network Test:</strong>
            <button 
              className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
              onClick={() => {
                fetch('https://kit.fontawesome.com/ccbd88a632.js', {mode: 'no-cors'})
                  .then(() => console.log('FontAwesome CDN accessible'))
                  .catch(e => console.error('FontAwesome CDN error:', e));
              }}
            >
              Test CDN
            </button>
          </p>
        </div>
      </div>

      {/* Test 5: Philippine Government Icons */}
      <div className="mb-8 p-6 border rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Test 5: Philippine Government Icons</h2>
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center">
            <Icon name="barangay" size="xl" color="gov-blue" />
            <p className="text-xs mt-1">Barangay</p>
          </div>
          <div className="text-center">
            <Icon name="resident" size="xl" color="gov-blue" />
            <p className="text-xs mt-1">Resident</p>
          </div>
          <div className="text-center">
            <Icon name="household" size="xl" color="gov-blue" />
            <p className="text-xs mt-1">Household</p>
          </div>
          <div className="text-center">
            <Icon name="certificate" size="xl" color="gov-red" />
            <p className="text-xs mt-1">Certificate</p>
          </div>
          <div className="text-center">
            <Icon name="gavel" size="xl" color="gov-red" />
            <p className="text-xs mt-1">Legal</p>
          </div>
          <div className="text-center">
            <Icon name="flag" size="xl" color="gov-yellow" />
            <p className="text-xs mt-1">Flag</p>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Debug Information</h2>
        <div className="text-sm space-y-2 font-mono">
          <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}</p>
          <p><strong>FontAwesome Kit URL:</strong> https://kit.fontawesome.com/ccbd88a632.js</p>
          <p><strong>Expected FA Version:</strong> 6.x</p>
        </div>
      </div>
    </div>
  );
}