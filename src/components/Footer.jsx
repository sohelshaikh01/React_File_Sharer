import React from 'react';

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="w-full flex flex-col ">
        <div className="px-10 py-14 pb-10 flex flex-row bg-slate-50 items-end justify-between">

            <div className='flex flex-col'>
                <Link className='text-lg font-bold text-gray-900'>SyncShare</Link>
                <p className="text-md text-gray-500 font-semibold">@ 2026 SyncShare. The Fuild Architect.</p>
            </div>

            <ul className='flex flex-row space-x-8'>
                <Link to="#">Privacy Policy</Link>
                <Link to="#">Terms of service</Link>
                <Link to="#">Security</Link>
                <Link to="#">Help Center</Link>
            </ul>

        </div>
    </div>
  )
}

export default Footer;
