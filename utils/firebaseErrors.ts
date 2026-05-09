export const getFriendlyFirebaseAuthError = (error: any): string => {
  const defaultMessage = "An unexpected error occurred. Please try again.";
  if (!error || !error.code) {
    return error.message || defaultMessage;
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or sign up.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please log in instead.';
    case 'auth/weak-password':
      return 'Your password is too weak. It must be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. You can try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'A network error occurred. Please check your internet connection and try again.';
    case 'auth/requires-recent-login':
      return 'This action is sensitive and requires recent authentication. Please log out and log back in before trying again.';
    case 'auth/invalid-oob-code':
      return 'The password reset link is invalid or has expired. Please request a new one.';
    default:
      // Fallback for other Firebase errors that might not be covered.
      return error.message.replace('Firebase: ', '').replace(/ \(.+\)\.$/, '') || defaultMessage;
  }
};
