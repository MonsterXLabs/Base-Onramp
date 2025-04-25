'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const WelcomeMessage = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const localValue = sessionStorage.getItem('showWelcomeMessage');
    console.log(localValue);
    if (localValue !== null) {
      const parsedValue = JSON.parse(localValue);
      console.log(parsedValue, localValue);
      setShow(parsedValue);
    } else {
      setShow(true);
    }
  }, []);

  return (
    show && (
      <div className="fixed top-0 left-0 w-full h-screen flex justify-center items-center bg-black sm:hidden z-[100000000] overflow-hidden">
        <div className="text-white p-6 rounded-lg shadow-lg max-w-sm w-full">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-6 text-yellow-400" />
            <h2 className="text-2xl font-semibold">Notice</h2>
          </div>
          <p className="mt-4 text-lg font-manrope">
            VaultX is currently optimized for{' '}
            <span className="font-bold text-yellow-400">desktop viewing</span>.
            Some designs may not render perfectly on mobile devices. We are
            working on optimization to provide a better user experience.
          </p>
          <button
            // href={'/'}
            onClick={() => {
              sessionStorage.setItem('showWelcomeMessage', 'false');
              setShow(false);
            }}
            className="block w-full  mt-6 text-center bg-yellow-400 text-black p-2 rounded-full font-semibold hover:bg-yellow-500 transition duration-300"
          >
            Go to VaultX
          </button>
        </div>
      </div>
    )
  );
};

export default WelcomeMessage;
