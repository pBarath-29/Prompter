import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';
import { KeyRound, Zap, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { auth } from '../services/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { getFriendlyFirebaseAuthError } from '../utils/firebaseErrors';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import LogoSpinner from '../components/LogoSpinner';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verificationState, setVerificationState] = useState<'verifying' | 'valid' | 'invalid'>('verifying');

  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const checkCode = async () => {
        if (!oobCode) {
            setVerificationState('invalid');
            return;
        }
        try {
            await verifyPasswordResetCode(auth, oobCode);
            setVerificationState('valid');
        } catch (err) {
            setVerificationState('invalid');
        }
    };
    checkCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!oobCode) {
        setError("Invalid or expired password reset link.");
        return;
    }
    setError('');
    setIsLoading(true);
    try {
        await confirmPasswordReset(auth, oobCode, password);
        setIsSuccess(true);
    } catch (err: any) {
        setError(getFriendlyFirebaseAuthError(err));
    } finally {
        setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center animate-pop-in">
          <CheckCircle size={56} className="mx-auto text-green-500" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Password Reset Successfully
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You can now use your new password to sign in to your account.
          </p>
          <div className="mt-5">
            <Link to="/login">
                <Button>Return to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (verificationState) {
        case 'verifying':
            return <div className="flex justify-center p-8"><LogoSpinner size={32} /></div>;
        case 'invalid':
            return (
                <div className="text-center animate-fade-in">
                    <AlertTriangle size={48} className="mx-auto text-red-500" />
                    <h3 className="mt-4 text-xl font-bold">Invalid Link</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <div className="mt-6">
                        <Link to="/forgot-password">
                            <Button>Request a New Link</Button>
                        </Link>
                    </div>
                </div>
            );
        case 'valid':
            return (
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                        <label htmlFor="password" className="sr-only">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={isPasswordVisible ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                          <PasswordStrengthIndicator password={password} />
                        </div>
                        <div>
                        <label htmlFor="confirm-password" className="sr-only">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type={isConfirmPasswordVisible ? 'text' : 'password'}
                                autoComplete="new-password"
                                required
                                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <Button type="submit" className="w-full" isLoading={isLoading} icon={<KeyRound size={20}/>}>
                        Reset Password
                        </Button>
                    </div>
                </form>
            );
    }
  }


  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-slide-in-up">
        <div>
           <div className="flex justify-center items-center space-x-2 text-3xl font-bold text-primary-600 dark:text-primary-400">
                <Zap size={32} />
                <span>Prompter</span>
            </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Set a new password
          </h2>
          { verificationState === 'valid' && (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Please create a new, secure password for your account.
            </p>
          )}
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default ResetPasswordPage;