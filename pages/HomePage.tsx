import React, { useState, useEffect, useRef } from 'react';
import { Zap, Mic, Copy, Eraser, Check, ListOrdered, Share2, Code, PenSquare, ShieldAlert } from 'lucide-react';
import { TONES, CATEGORIES, Tone, Category } from '../types';
import Button from '../components/Button';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { generateOptimizedPrompt, validateUserInput, refinePrompt } from '../services/geminiService';
import { Sparkles } from 'lucide-react';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import UpgradeModal from '../components/UpgradeModal';
import { FREE_TIER_LIMIT } from '../config';
import AdModal from '../components/AdModal';
import TutorialGuide from '../components/TutorialGuide';
import CustomDropdown from '../components/CustomDropdown';
import LogoSpinner from '../components/LogoSpinner';
import Modal from '../components/Modal';

const templates = [
    {
        icon: ListOrdered,
        title: "Blog Post Outline",
        description: "Generate a structured outline for your next article.",
        request: "Create a detailed blog post outline for an article titled '[Your Title Here]'.",
        context: "The target audience is [Your Audience Here], and the key takeaways should be [Key Takeaway 1], [Key Takeaway 2].",
        tone: 'Professional' as Tone,
        category: 'Marketing' as Category,
    },
    {
        icon: Share2,
        title: "Social Media Post",
        description: "Craft an engaging post for your social media channels.",
        request: "Write a short, engaging social media post for [Platform, e.g., Twitter, LinkedIn] about [Your Topic Here].",
        context: "The goal is to drive engagement and clicks to our website. Include a call to action to 'Learn More'.",
        tone: 'Casual' as Tone,
        category: 'Marketing' as Category,
    },
    {
        icon: Code,
        title: "Code Explainer",
        description: "Get a simple explanation for a complex code snippet.",
        request: "Explain the following code snippet in simple terms, line by line: [Paste Your Code Here].",
        context: "Assume the reader is a beginner programmer.",
        tone: 'Academic' as Tone,
        category: 'Coding' as Category,
    },
    {
        icon: PenSquare,
        title: "Creative Story Idea",
        description: "Brainstorm a unique plot for a short story.",
        request: "Generate a unique story plot based on the theme of [Your Theme Here].",
        context: "The story should be set in a [Your Setting, e.g., futuristic city] and feature a protagonist who is a [Protagonist's Role].",
        tone: 'Creative' as Tone,
        category: 'Fun' as Category,
    }
];


const HomePage: React.FC = () => {
    const [request, setRequest] = useState('');
    const [context, setContext] = useState('');
    const [tone, setTone] = useState<Tone>('Professional');
    const [category, setCategory] = useState<Category>('Coding');
    const [generatedPrompt, setGeneratedPrompt] = useState<{ title: string; prompt: string; tags: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Generating your masterpiece...');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { addToHistory } = useHistory();
    const { user, getGenerationsLeft, incrementGenerationCount, completeTutorial } = useAuth();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [isTutorialActive, setIsTutorialActive] = useState(false);
    const resultsContainerRef = useRef<HTMLDivElement>(null);
    
    // Ref to track the current user state to prevent race conditions on logout
    const userRef = useRef(user);
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const isBanned = user?.status === 'banned';

    useEffect(() => {
        if (user) {
            // Launch tutorial for new users
            if (!user.hasCompletedTutorial) {
                // A small delay to ensure the page has rendered
                setTimeout(() => setIsTutorialActive(true), 500);
            }
        } else {
            // When user logs out, clear the generator state
            setRequest('');
            setContext('');
            setGeneratedPrompt(null);
            setError(null);
        }
    }, [user]);
    
    useEffect(() => {
        // Scroll to results when a prompt is generated successfully
        if (generatedPrompt && !isLoading) {
            resultsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [generatedPrompt, isLoading]);

    const generationsLeft = user ? getGenerationsLeft() : 0;
    const canGenerate = generationsLeft > 0;

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
    } = useSpeechRecognition({ onResult: setRequest });

    const handleClear = () => {
        setRequest('');
        setContext('');
        setGeneratedPrompt(null);
        setError(null);
    };

    const proceedWithGeneration = async () => {
        setIsLoading(true);
        setLoadingText('Generating your masterpiece...');
        setError(null);
        setGeneratedPrompt(null);
        try {
            const result = await generateOptimizedPrompt(request, tone, category, context);
            // CRITICAL CHECK: After the API call returns, check if the user is still logged in.
            if (userRef.current) {
                setGeneratedPrompt(result);
                addToHistory(result);
                incrementGenerationCount();
            } else {
                console.log("User logged out during generation. Aborting state update.");
            }
        } catch (err) {
            // Also check before showing an error
            if (userRef.current) {
                setError((err as Error).message);
                console.error(err);
            } else {
                console.log("User logged out during generation. Suppressing error for logged-out state.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!user) {
            setError("Please log in to generate prompts.");
            return;
        }
        if (isBanned) {
            setError("Your account is banned. You cannot generate prompts.");
            return;
        }
        if (!canGenerate) {
            setIsUpgradeModalOpen(true);
            return;
        }
        if (!request.trim()) {
            setError('Please describe what kind of prompt you want.');
            return;
        }
        
        if (request.trim().length < 15) {
            setError('Please provide a more detailed description (at least 15 characters).');
            return;
        }
        
        // Start validation phase
        setIsLoading(true);
        setLoadingText('Validating your request...');
        setError(null);
        setGeneratedPrompt(null);

        try {
            const validationResult = await validateUserInput(request);

            if (!validationResult.isValid) {
                setError("Your request seems unclear. Please try describing your goal in more detail.");
                setIsLoading(false); // Stop loading on validation failure
                return;
            }

            // Validation successful, move to next step
            if (user.subscriptionTier === 'free') {
                setIsAdModalOpen(true);
                // Stop loading here, as user needs to interact with the ad modal.
                // The ad modal's close handler will trigger the generation.
                setIsLoading(false); 
            } else {
                // For Pro users, proceed directly to generation.
                // proceedWithGeneration will handle the loading state from here.
                await proceedWithGeneration();
            }
        } catch (err) {
            setError((err as Error).message);
            setIsLoading(false); // Stop loading on any error during validation
        }
    };
    
    const handleCopy = () => {
        if (generatedPrompt) {
            navigator.clipboard.writeText(generatedPrompt.prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleRefine = async (instruction: string) => {
        if (!generatedPrompt || isLoading) return;
        setIsLoading(true);
        setLoadingText('Refining your prompt...');
        try {
            const refined = await refinePrompt(generatedPrompt.prompt, instruction);
            setGeneratedPrompt(refined);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdClose = () => {
        setIsAdModalOpen(false);
        proceedWithGeneration();
    };

    const handleTutorialComplete = () => {
        setIsTutorialActive(false);
        completeTutorial();
    };
    
    const handleTemplateClick = (template: typeof templates[0]) => {
        if (!user || isBanned) return;
        setRequest(template.request);
        setContext(template.context);
        setTone(template.tone);
        setCategory(template.category);
    };

    const toneOptions = TONES.map(t => ({ value: t, label: t }));
    const categoryOptions = CATEGORIES.map(c => ({ value: c, label: c }));


    return (
        <div className="space-y-12">
            <TutorialGuide
                isOpen={isTutorialActive}
                onComplete={handleTutorialComplete}
            />
            <section className="text-center animate-slide-in-up">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Generate Smarter Prompts <span className="text-primary-500">Instantly</span>
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                    Describe your goal, choose your desired tone, and let our AI craft the perfect, optimized prompt for you.
                </p>
            </section>

            <div id="prompt-generator-card" className="max-w-4xl mx-auto p-4 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl space-y-6 animate-slide-in-up" style={{ animationDelay: '150ms' }}>
                <div className={`${!user || isBanned ? 'cursor-not-allowed' : ''}`}>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Need inspiration? Start with a template.</p>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            {templates.map((template) => (
                                <button
                                    key={template.title}
                                    onClick={() => handleTemplateClick(template)}
                                    disabled={!user || isBanned}
                                    className="flex flex-col items-center justify-center p-3 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    title={template.description}
                                    aria-label={template.title}
                                >
                                    <template.icon size={24} className="text-primary-500 mb-2 transition-transform group-hover:scale-110" />
                                    <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200">{template.title}</h4>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white dark:bg-gray-800 px-2 text-sm text-gray-500 dark:text-gray-400">OR</span>
                    </div>
                </div>

                <div className={`${!user || isBanned ? 'cursor-not-allowed' : ''}`}>
                    <div className="mb-1">
                        <label htmlFor="request" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Describe your goal</label>
                    </div>
                    <div className="relative">
                        <textarea
                            id="request"
                            rows={4}
                            className="w-full p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
                            placeholder="e.g., 'A marketing campaign slogan for a new coffee brand'"
                            value={request}
                            onChange={(e) => setRequest(e.target.value)}
                            disabled={!user || isLoading || isBanned}
                        />
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                            title={isListening ? 'Stop recording' : 'Start recording'}
                            aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
                            disabled={!user || isLoading || isBanned}
                        >
                            <Mic size={20} />
                        </button>
                    </div>
                </div>

                <div className={`${!user || isBanned ? 'cursor-not-allowed' : ''}`}>
                    <div className="mb-1">
                        <label htmlFor="context" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Context (optional)</label>
                    </div>
                    <div className="relative">
                        <textarea
                            id="context"
                            rows={2}
                            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
                            placeholder="e.g., 'The coffee brand is organic, fair-trade, and targets young professionals.'"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            disabled={!user || isLoading || isBanned}
                        />
                    </div>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!user || isBanned ? 'cursor-not-allowed' : ''}`}>
                    <CustomDropdown
                        label="Tone"
                        options={toneOptions}
                        value={tone}
                        onChange={(newTone) => setTone(newTone as Tone)}
                        disabled={!user || isLoading || isBanned}
                    />
                    <CustomDropdown
                        label="Category"
                        options={categoryOptions}
                        value={category}
                        onChange={(newCategory) => setCategory(newCategory as Category)}
                        disabled={!user || isLoading || isBanned}
                    />
                </div>

                {user && !isBanned && user.subscriptionTier === 'free' && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        You have <span className="font-bold text-primary-500">{generationsLeft}</span> of {FREE_TIER_LIMIT} free generations left this month.
                    </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
                    <Button
                        variant="secondary"
                        onClick={handleClear}
                        disabled={!user || isLoading || !request.trim() || isBanned}
                        icon={<Eraser size={18} />}
                        className="w-full sm:w-auto"
                    >
                        Clear
                    </Button>
                    <Button 
                        onClick={handleGenerate} 
                        isLoading={isLoading} 
                        className="w-full sm:flex-1 !py-3 !text-base" 
                        icon={<Zap size={20}/>}
                        disabled={!user || isLoading || !request.trim() || isBanned}
                    >
                        {user ? (isBanned ? 'Generator Disabled' : 'Generate Prompt') : 'Login to Generate Prompts'}
                    </Button>
                </div>

                 {!user && (
                    <p className="text-center text-sm text-yellow-600 dark:text-yellow-400 mt-2 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-lg">
                        Please <Link to="/login" className="font-bold underline hover:text-yellow-500">log in</Link> or <Link to="/signup" className="font-bold underline hover:text-yellow-500">sign up</Link> to generate prompts.
                    </p>
                )}
                {isBanned && (
                    <p className="text-center text-sm text-red-600 dark:text-red-400 mt-2 p-3 bg-red-100/50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <ShieldAlert size={16} className="mr-2"/> Your account is banned. You cannot generate prompts.
                    </p>
                )}
            </div>
            
            <div ref={resultsContainerRef} className="scroll-mt-8">
                {error && <div role="alert" aria-live="assertive" className="text-center text-red-500">{error}</div>}

                {isLoading && (
                    <div className="text-center flex flex-col items-center justify-center space-y-4 animate-fade-in">
                        <LogoSpinner size={48} />
                        <p className="text-lg">{loadingText}</p>
                    </div>
                )}

                {generatedPrompt && !isLoading && (
                    <div className="animate-fade-in">
                        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">{generatedPrompt.title}</h2>
                            <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{generatedPrompt.prompt}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {generatedPrompt.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">{tag}</span>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                <div className="mb-3">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                                        <Sparkles size={12} className="text-primary-500" />
                                        Refine this prompt
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Make it more specific', 'Make it shorter', 'Add step-by-step format', 'Make it more creative'].map(instruction => (
                                            <button
                                                key={instruction}
                                                onClick={() => handleRefine(instruction)}
                                                disabled={isLoading}
                                                className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {instruction}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleCopy}
                                        icon={copied ? <Check size={16}/> : <Copy size={16}/>}
                                        className="w-full sm:w-auto"
                                    >
                                        {copied ? 'Copied!' : 'Copy Prompt'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <UpgradeModal 
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
            />
            <AdModal
                isOpen={isAdModalOpen}
                onClose={handleAdClose}
            />
        </div>
    );
};

export default HomePage;
