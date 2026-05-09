import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFeedback } from '../contexts/FeedbackContext';
import { FeedbackType } from '../types';
import { FEEDBACK_TYPES } from '../types';
import Button from '../components/Button';
import { CheckCircle, Send } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';

const FeedbackPage: React.FC = () => {
    const { user } = useAuth();
    const { addFeedback } = useFeedback();
    
    const [type, setType] = useState<FeedbackType>('General Feedback');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setError('Please enter your feedback message.');
            return;
        }
        if (!user) {
            setError('You must be logged in to submit feedback.');
            return;
        }
        
        setError('');
        addFeedback({ user, type, message });
        setSubmitted(true);
        setMessage('');
        setType('General Feedback');
    };
    
    if (submitted) {
        return (
            <div className="text-center p-8 flex flex-col items-center space-y-4 max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <CheckCircle size={56} className="text-green-500" />
                <h2 className="text-3xl font-bold">Thank You!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
                </p>
                <Button onClick={() => setSubmitted(false)} className="mt-4">
                    Submit More Feedback
                </Button>
            </div>
        )
    }

    const feedbackTypeOptions = FEEDBACK_TYPES.map(t => ({ value: t, label: t }));

    return (
        <div className="space-y-8">
            <section className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Submit Feedback</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                    Have a suggestion, bug report, or general feedback? We'd love to hear from you!
                </p>
            </section>
            
            <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CustomDropdown
                        label="Feedback Type"
                        options={feedbackTypeOptions}
                        value={type}
                        onChange={v => setType(v as FeedbackType)}
                    />
                    
                    <div>
                        <label htmlFor="feedback-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Message
                        </label>
                        <textarea
                            id="feedback-message"
                            rows={6}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            placeholder="Please provide as much detail as possible..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full !py-3 !text-base" icon={<Send size={18} />}>
                        Submit Feedback
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackPage;