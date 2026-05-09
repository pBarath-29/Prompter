import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCollections } from '../contexts/CollectionContext';
import { usePrompts } from '../contexts/PromptContext';
import PromptCard from '../components/PromptCard';
import PromptDetailModal from '../components/PromptDetailModal';
import { Prompt } from '../types';
import { ArrowLeft, Package } from 'lucide-react';

const CollectionPage: React.FC = () => {
    const { collectionId } = useParams<{ collectionId: string }>();
    const { collections } = useCollections();
    const { prompts } = usePrompts();
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

    const collection = useMemo(() => 
        collections.find(c => c.id === collectionId),
        [collectionId, collections]
    );

    const collectionPrompts = useMemo(() =>
        prompts.filter(p => collection?.promptIds.includes(p.id)),
        [prompts, collection]
    );

    if (!collection) {
        return (
            <div className="text-center py-10">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Collection not found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    We couldn't find the collection you're looking for.
                </p>
                <Link to="/marketplace" className="text-primary-500 hover:underline">
                    Back to Marketplace
                </Link>
            </div>
        );
    }
    
    const handlePromptClick = (prompt: Prompt) => {
        setSelectedPrompt(prompt);
    };

    const handleCloseDetailModal = () => {
        setSelectedPrompt(null);
    };

    return (
        <div className="space-y-8">
            <div className="relative p-8 md:p-12 rounded-2xl overflow-hidden bg-gray-900">
                <img src={collection.coverImage} alt={collection.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />
                <div className="relative z-10 text-center text-white">
                    <Link to="/marketplace" className="absolute top-0 left-0 -m-4 md:-m-8 text-sm flex items-center space-x-2 bg-black/30 p-2 rounded-br-lg hover:bg-black/50 transition-colors">
                        <ArrowLeft size={16} />
                        <span>Back to Marketplace</span>
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{collection.name}</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">{collection.description}</p>
                    <div className="mt-4 flex items-center justify-center space-x-2 text-sm">
                        <img src={collection.creator.avatar} alt={collection.creator.name} className="w-8 h-8 rounded-full border-2 border-primary-400"/>
                        <span>Created by <strong>{collection.creator.name}</strong></span>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold">Prompts in this collection ({collectionPrompts.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collectionPrompts.map(prompt => (
                    <PromptCard key={prompt.id} prompt={prompt} onClick={handlePromptClick} />
                ))}
            </div>
            
            <PromptDetailModal
                isOpen={!!selectedPrompt}
                onClose={handleCloseDetailModal}
                prompt={selectedPrompt}
            />
        </div>
    );
};

export default CollectionPage;
