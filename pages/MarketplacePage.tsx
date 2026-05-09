import React, { useState, useMemo, useEffect } from 'react';
import CollectionCard from '../components/CollectionCard';
import { Search, PackagePlus, Inbox } from 'lucide-react';
import { useCollections } from '../contexts/CollectionContext';
import { useAuth } from '../contexts/AuthContext';
import { usePrompts } from '../contexts/PromptContext';
import SubmitCollectionModal from '../components/SubmitCollectionModal';
import { Collection, Prompt } from '../types';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import CollectionPreviewModal from '../components/CollectionPreviewModal';
import Pagination from '../components/Pagination';
import CustomDropdown from '../components/CustomDropdown';

type NewPromptData = Omit<Prompt, 'id' | 'author' | 'upvotes' | 'downvotes' | 'comments' | 'createdAt' | 'isPublic' | 'status'>;
type NewCollectionData = Omit<Collection, 'id' | 'creator' | 'promptCount' | 'promptIds' | 'status'>;

const COLLECTIONS_PER_PAGE = 9;

const MarketplacePage: React.FC = () => {
    const { collections, collectionsLoading, addCollection } = useCollections();
    const { addPrompt } = usePrompts();
    const { user, addCreatedCollection, addSubmittedPrompt } = useAuth();
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'prompts-desc' | 'price-asc' | 'price-desc'>('prompts-desc');
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [collectionToPreview, setCollectionToPreview] = useState<Collection | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const isBanned = user?.status === 'banned';

    const filteredCollections = useMemo(() => {
        return collections
            .filter(c => c.status === 'approved') // Only show approved collections
            .filter(c => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    c.name.toLowerCase().includes(searchLower) ||
                    c.description.toLowerCase().includes(searchLower) ||
                    c.creator.name.toLowerCase().includes(searchLower)
                );
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'price-asc':
                        return a.price - b.price;
                    case 'price-desc':
                        return b.price - a.price;
                    case 'prompts-desc':
                    default:
                        return b.promptCount - a.promptCount;
                }
            });
    }, [collections, searchTerm, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy]);

    const totalPages = Math.ceil(filteredCollections.length / COLLECTIONS_PER_PAGE);
    const paginatedCollections = filteredCollections.slice(
        (currentPage - 1) * COLLECTIONS_PER_PAGE,
        currentPage * COLLECTIONS_PER_PAGE
    );

    const handleOpenSubmitModal = () => {
        if (!user) {
            navigate('/login');
        } else if (!isBanned) {
            setIsSubmitModalOpen(true);
        }
    };

    const handleCollectionSubmit = (collectionData: NewCollectionData, newPromptsData: NewPromptData[]) => {
        if (!user) return;
        
        const newPromptIds: string[] = [];
        newPromptsData.forEach((promptData, index) => {
            const newPrompt: Prompt = {
                ...promptData,
                id: `p${Date.now()}-${index}`,
                author: user,
                upvotes: 0,
                downvotes: 0,
                comments: [],
                createdAt: new Date().toISOString(),
                isPublic: false, // Mark as exclusive to the collection
                status: 'approved', // Prompts inside a collection are implicitly approved if the collection is.
            };
            addPrompt(newPrompt);
            addSubmittedPrompt(newPrompt.id);
            newPromptIds.push(newPrompt.id);
        });
        
        const newCollection: Collection = {
            ...collectionData,
            id: `c${Date.now()}`,
            creator: user,
            promptIds: newPromptIds,
            promptCount: newPromptIds.length,
            status: 'pending',
        };

        addCollection(newCollection);
        addCreatedCollection(newCollection.id);
    };

    const handlePreviewClick = (collection: Collection) => {
        setCollectionToPreview(collection);
    };
    
    const handleClosePreview = () => {
        setCollectionToPreview(null);
    };

    const sortOptions = [
        { value: 'prompts-desc', label: 'Most Prompts' },
        { value: 'price-asc', label: 'Price: Low to High' },
        { value: 'price-desc', label: 'Price: High to Low' },
    ];

    return (
        <div className="space-y-8">
            <section className="text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Prompt Marketplace</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                    Browse and purchase curated collections of high-quality prompts from expert creators.
                </p>
                <div className="mt-6">
                    <Button onClick={handleOpenSubmitModal} icon={<PackagePlus size={18}/>} disabled={isBanned} title={isBanned ? "Submissions are disabled for banned accounts" : "Submit a new collection"}>
                        Submit a Collection
                    </Button>
                </div>
            </section>
            
            <div className="sticky top-16 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm py-4 z-40 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search collections by name, creator..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500 dark:text-white dark:placeholder-gray-400"
                        />
                    </div>
                    
                    <CustomDropdown
                        className="w-full md:w-56"
                        options={sortOptions}
                        value={sortBy}
                        onChange={v => setSortBy(v as 'prompts-desc' | 'price-asc' | 'price-desc')}
                    />
                </div>
            </div>

            {collectionsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : paginatedCollections.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedCollections.map((collection, index) => (
                            <div key={collection.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 75}ms` }}>
                                <CollectionCard 
                                collection={collection} 
                                onPreview={handlePreviewClick}
                                />
                            </div>
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            ) : (
                <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                    <Inbox size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No collections found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search, or submit your own collection.</p>
                    <Button className="mt-4" onClick={() => setIsSubmitModalOpen(true)} icon={<PackagePlus size={16} />}>Submit a Collection</Button>
                </div>
            )}

            <CollectionPreviewModal
                isOpen={!!collectionToPreview}
                onClose={handleClosePreview}
                collection={collectionToPreview}
            />

            <SubmitCollectionModal
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                onSubmit={handleCollectionSubmit}
            />
        </div>
    );
};

export default MarketplacePage;