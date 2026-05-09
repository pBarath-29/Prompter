


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Mail, Zap, CheckCircle } from 'lucide-react';
import { auth } from '../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getFriendlyFirebaseAuthError } from '../utils/firebaseErrors';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(getFriendlyFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center animate-pop-in">
          <CheckCircle size={56} className="mx-auto text-green-500" />
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Check your inbox
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            If an account exists for <span className="font-medium">{email}</span>, you will receive an email with instructions on how to reset your password.
          </p>
          <div className="mt-5">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                &larr; Back to login
            </Link>
          </div>
        </div>
      </div>
    );
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div>
            <Button type="submit" className="w-full" isLoading={isLoading} icon={<Mail size={20}/>}>
              Send Reset Link
            </Button>
          </div>
          <div className="text-center">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                &larr; Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;