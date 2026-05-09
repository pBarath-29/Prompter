import React, { useState, useMemo, useEffect } from 'react';
import { usePrompts } from '../contexts/PromptContext';
import PromptCard from '../components/PromptCard';
import PromptDetailModal from '../components/PromptDetailModal';
import { Prompt, AIModel, Category } from '../types';
import { AI_MODELS, CATEGORIES } from '../types';
import { Search, PlusCircle, ArrowLeft, ArrowRight, Inbox } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import SubmitPromptModal from '../components/SubmitPromptModal';
import { useNavigate } from 'react-router-dom';
import LimitReachedModal from '../components/LimitReachedModal';
import CustomDropdown from '../components/CustomDropdown';


const CommunityPage: React.FC = () => {
    const { prompts, promptsLoading, addPrompt } = usePrompts();
    const { user, addSubmittedPrompt, getSubmissionsLeft, incrementSubmissionCount } = useAuth();
    const navigate = useNavigate();
    
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
    const [selectedModel, setSelectedModel] = useState<AIModel | 'all'>('all');
    const [sortBy, setSortBy] = useState<'popular' | 'newest'>('popular');
    const [currentPage, setCurrentPage] = useState(1);
    const promptsPerPage = 9;

    const isBanned = user?.status === 'banned';

    const filteredPrompts = useMemo(() => {
        return prompts
            .filter(p => p.isPublic && p.status === 'approved') // Only show approved public prompts
            .filter(p => {
                const searchLower = searchTerm.toLowerCase();
                const searchMatch = 
                    p.title.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower) ||
                    p.author.name.toLowerCase().includes(searchLower) ||
                    p.tags.some(tag => tag.toLowerCase().includes(searchLower));
                
                const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
                const modelMatch = selectedModel === 'all' || p.model === selectedModel;
                return searchMatch && categoryMatch && modelMatch;
            })
            .sort((a, b) => {
                if (sortBy === 'popular') {
                    const scoreA = a.upvotes - a.downvotes;
                    const scoreB = b.upvotes - b.downvotes;
                    return scoreB - scoreA;
                }
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }, [prompts, searchTerm, selectedCategory, selectedModel, sortBy]);
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedModel, sortBy]);
    
    // Pagination logic
    const totalPages = Math.ceil(filteredPrompts.length / promptsPerPage);
    const indexOfLastPrompt = currentPage * promptsPerPage;
    const indexOfFirstPrompt = indexOfLastPrompt - promptsPerPage;
    const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt);

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handlePromptClick = (prompt: Prompt) => setSelectedPrompt(prompt);
    const handleCloseDetailModal = () => setSelectedPrompt(null);
    
    const handleOpenSubmitModal = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (isBanned) return;

        if (getSubmissionsLeft() > 0) {
            setIsSubmitModalOpen(true);
        } else {
            setIsLimitModalOpen(true);
        }
    };

    const handlePromptSubmit = (newPromptData: Omit<Prompt, 'id' | 'author' | 'upvotes' | 'downvotes' | 'comments' | 'createdAt' | 'status'>) => {
        if (!user) return;
        const newPrompt: Prompt = {
            id: `p${Date.now()}`,
            ...newPromptData,
            author: user,
            upvotes: 0,
            downvotes: 0,
            comments: [],
            createdAt: new Date().toISOString(),
            status: 'pending',
        };
        addPrompt(newPrompt);
        addSubmittedPrompt(newPrompt.id);
        incrementSubmissionCount();
    };

    const categoryOptions = [{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))];
    const modelOptions = [{ value: 'all', label: 'All Models' }, ...AI_MODELS.map(m => ({ value: m, label: m }))];
    const sortOptions = [
        { value: 'popular', label: 'Popular' },
        { value: 'newest', label: 'Newest' },
    ];

    return (
        <div className="space-y-8">
            <section className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Community Prompts</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                    Discover, share, and vote on the best AI prompts from our growing community.
                </p>
                <div className="mt-6">
                    <Button onClick={handleOpenSubmitModal} icon={<PlusCircle size={18}/>} disabled={isBanned} title={isBanned ? "Submissions are disabled for banned accounts" : "Submit a new prompt"}>
                        Submit Your Prompt
                    </Button>
                </div>
            </section>
            
            <div className="sticky top-16 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm py-4 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by keyword, tag, author..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    
                    <CustomDropdown
                        className="w-full md:w-48"
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={v => setSelectedCategory(v as Category | 'all')}
                    />
                    
                    <CustomDropdown
                        className="w-full md:w-48"
                        options={modelOptions}
                        value={selectedModel}
                        onChange={v => setSelectedModel(v as AIModel | 'all')}
                    />

                    <CustomDropdown
                        className="w-full md:w-48"
                        options={sortOptions}
                        value={sortBy}
                        onChange={v => setSortBy(v as 'popular' | 'newest')}
                    />
                </div>
            </div>

            {promptsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 space-y-3 animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                            <div className="flex gap-2 pt-2">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : currentPrompts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentPrompts.map((prompt, index) => (
                            <div key={prompt.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 75}ms`}}>
                                <PromptCard 
                                    prompt={prompt} 
                                    onClick={handlePromptClick}
                                />
                             </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 pt-4">
                            <Button 
                                variant="secondary" 
                                onClick={handlePrevPage} 
                                disabled={currentPage === 1} 
                                icon={<ArrowLeft size={16}/>}
                            >
                                Previous
                            </Button>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                Page {currentPage} of {totalPages}
                            </span>
                             <Button 
                                variant="secondary" 
                                onClick={handleNextPage} 
                                disabled={currentPage === totalPages}
                                className="!flex-row-reverse"
                                icon={<ArrowRight size={16}/>}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <Inbox size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No prompts found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters, or be the first to submit one.</p>
                    <Button className="mt-4" onClick={() => setIsSubmitModalOpen(true)} icon={<PlusCircle size={16} />}>Submit a Prompt</Button>
                </div>
            )}


            <PromptDetailModal
                isOpen={!!selectedPrompt}
                onClose={handleCloseDetailModal}
                prompt={selectedPrompt}
            />

            <SubmitPromptModal 
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onSubmit={handlePromptSubmit}
            />

            <LimitReachedModal
                isOpen={isLimitModalOpen}
                onClose={() => setIsLimitModalOpen(false)}
                isPro={user?.subscriptionTier === 'pro'}
            />
        </div>
    );
};

export default CommunityPage;