

import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { getFriendlyFirebaseAuthError } from '../utils/firebaseErrors';
import { Eye, EyeOff } from 'lucide-react';

interface ReauthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title: string;
  message: string;
  confirmButtonText?: string;
}

const ReauthenticationModal: React.FC<ReauthenticationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
}) => {
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!password) {
        setError('Password is required.');
        return;
    }
    setError('');
    setIsLoading(true);
    try {
      await onConfirm(password);
      // On success, the parent component will handle closing the modal or navigating away.
    } catch (err: any) {
      setError(getFriendlyFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
        <div>
            <label htmlFor="reauth-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Password</label>
            <div className="relative">
              <input
                  id="reauth-password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                  required
                  autoFocus
              />
              <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 z-20 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  >
                  {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div className="flex justify-end pt-2 space-x-2">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              isLoading={isLoading}
            >
              {confirmButtonText}
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReauthenticationModal;
