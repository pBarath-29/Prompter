


import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { LogIn, Zap, Eye, EyeOff } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { getFriendlyFirebaseAuthError } from '../utils/firebaseErrors';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();

  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<FirebaseUser | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setShowVerificationMessage(false);
    setUnverifiedUser(null);
    setResendStatus('idle');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
       if (err.code === 'auth/email-not-verified') {
        setError("Please verify your email before logging in. Check your inbox for the verification link.");
        setShowVerificationMessage(true);
        setUnverifiedUser(err.unverifiedUser);
      } else {
        // Handle other errors like wrong password, user not found, etc.
        setError(getFriendlyFirebaseAuthError(err));
        setShowVerificationMessage(false);
        setUnverifiedUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    setResendStatus('sending');
    try {
        await resendVerificationEmail(unverifiedUser);
        setResendStatus('sent');
        // Clear the general error to avoid confusion
        setError("A new verification email has been sent to your inbox.");
    } catch (err) {
        setError("Failed to resend email. Please try again in a few minutes.");
        setResendStatus('idle');
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-slide-in-up">
        <div>
           <div className="flex justify-center items-center space-x-2 text-3xl font-bold text-primary-600 dark:text-primary-400">
                <Zap size={32} />
                <span>Prompter</span>
            </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Password"
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
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          {error && (
            <div className={`text-sm text-center p-3 rounded-lg ${showVerificationMessage ? 'bg-yellow-100/50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' : 'bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-300'}`}>
              {error}
            </div>
          )}

          {showVerificationMessage && (
              <div className="text-center">
                  <Button
                      type="button"
                      variant="secondary"
                      onClick={handleResendVerification}
                      isLoading={resendStatus === 'sending'}
                      disabled={resendStatus !== 'idle'}
                  >
                      {resendStatus === 'sent' ? 'Verification Sent!' : 'Resend Verification Email'}
                  </Button>
              </div>
          )}


          <div>
            <Button type="submit" className="w-full" isLoading={isLoading} icon={<LogIn size={20}/>}>
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;