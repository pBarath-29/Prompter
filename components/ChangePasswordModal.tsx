

import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFriendlyFirebaseAuthError } from '../utils/firebaseErrors';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { changePassword } = useAuth();

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
        await changePassword(currentPassword, newPassword);
        setIsSuccess(true);
        resetForm();
    } catch (err: any) {
        setError(getFriendlyFirebaseAuthError(err));
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={isSuccess ? "Success" : "Change Your Password"}>
      {isSuccess ? (
        <div className="text-center p-6 flex flex-col items-center space-y-4">
            <CheckCircle size={56} className="text-green-500" />
            <h3 className="text-2xl font-bold">Password Updated!</h3>
            <p className="text-gray-600 dark:text-gray-300">
                Your password has been changed successfully.
            </p>
            <Button onClick={handleClose} className="mt-4">
                Close
            </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <div className="relative">
                    <input
                        id="currentPassword"
                        type={isCurrentPasswordVisible ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}
                        className="absolute inset-y-0 right-0 z-20 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label={isCurrentPasswordVisible ? "Hide password" : "Show password"}
                        >
                        {isCurrentPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                 <div className="relative">
                    <input
                        id="newPassword"
                        type={isNewPasswordVisible ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                        required
                    />
                     <button
                        type="button"
                        onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                        className="absolute inset-y-0 right-0 z-20 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label={isNewPasswordVisible ? "Hide password" : "Show password"}
                        >
                        {isNewPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                <div className="relative">
                    <input
                        id="confirmPassword"
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                        required
                    />
                     <button
                        type="button"
                        onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                        className="absolute inset-y-0 right-0 z-20 flex items-center px-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label={isConfirmPasswordVisible ? "Hide password" : "Show password"}
                        >
                        {isConfirmPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div className="flex justify-end pt-4 border-t dark:border-gray-700 space-x-2">
                <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>Update Password</Button>
            </div>
        </form>
      )}
    </Modal>
  );
};

export default ChangePasswordModal;
