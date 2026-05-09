import React from 'react';
import { ShieldAlert } from 'lucide-react';

const BanBanner: React.FC = () => {
  return (
    <div className="bg-red-600 text-white p-3 text-center text-sm font-semibold flex items-center justify-center space-x-2">
      <ShieldAlert size={18} />
      <span>
        Your account has been banned due to a violation of our terms. You have limited access to the platform.
      </span>
    </div>
  );
};

export default BanBanner;
