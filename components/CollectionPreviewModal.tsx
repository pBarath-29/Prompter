

import React from 'react';
import { Collection, Prompt } from '../types';
import Modal from './Modal';
import Button from './Button';
import { Lock, ShoppingCart, Cpu, Book, Tag as TagIcon } from 'lucide-react';
import { usePrompts } from '../contexts/PromptContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CollectionPreviewModalProps {
  collection: Collection | null;
  isOpen: boolean;
  onClose: () => void;
  isAdminPreview?: boolean;
}

const PromptPreviewCard: React.FC<{ prompt: Prompt, isAdminPreview?: boolean }> = ({ prompt, isAdminPreview }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700 shadow-sm transition-transform duration-300 hover:scale-[1.02]">
        <h4 className="font-bold text-gray-900 dark:text-white">{prompt.title}</h4>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 my-2">
            <span className="flex items-center"><Cpu size={14} className="mr-1.5" /> {prompt.model}</span>
            <span className="flex items-center"><Book size={14} className="mr-1.5" /> {prompt.category}</span>
        </div>
        
        <div className={`relative mt-2 ${!isAdminPreview ? 'max-h-64' : ''} overflow-hidden`}>
            <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {prompt.prompt}
            </p>
            {!isAdminPreview && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 dark:from-gray-800 dark:via-gray-800/20 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center justify-center text-center">
                     <div className="flex items-center justify-center text-center p-2 bg-gray-200/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full shadow">
                        <Lock size={16} className="text-gray-600 dark:text-gray-400 mr-2" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Purchase to Reveal Full Prompt</span>
                    </div>
                </div>
              </>
            )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t dark:border-gray-700">
          {prompt.tags.slice(0, 3).map(tag => (
            <span key={tag} className="flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-full">
              <TagIcon size={12} className="mr-1.5"/>
              {tag}
            </span>
          ))}
        </div>
    </div>
);


const CollectionPreviewModal: React.FC<CollectionPreviewModalProps> = ({ collection, isOpen, onClose, isAdminPreview = false }) => {
    const { prompts } = usePrompts();
    const { user, purchaseCollection } = useAuth();
    const navigate = useNavigate();

    if (!collection) return null;
    
    const promptIdsToShow = isAdminPreview ? collection.promptIds : collection.promptIds.slice(0, 2);
    const promptsToShow = prompts.filter(p => promptIdsToShow.includes(p.id));

    const allModels = [...new Set(prompts.filter(p => collection.promptIds.includes(p.id)).map(p => p.model))];
    const allCategories = [...new Set(prompts.filter(p => collection.promptIds.includes(p.id)).map(p => p.category))];


    const handlePurchase = () => {
        if (!user) {
            navigate('/login');
        } else {
            purchaseCollection(collection.id);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isAdminPreview ? `Admin Preview: ${collection.name}` : `Preview: ${collection.name}`}>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 -mr-4">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b dark:border-gray-700">
                    <div className="md:col-span-1">
                        <img src={collection.coverImage} alt={collection.name} className="w-full h-full object-cover rounded-lg shadow-md" />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                         <div className="flex items-center space-x-3">
                            <img src={collection.creator.avatar} alt={collection.creator.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary-400" />
                            <div>
                                <p className="font-semibold text-lg text-gray-900 dark:text-white">{collection.creator.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Creator</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{collection.description}</p>
                        
                        <div>
                            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">Includes models like:</h4>
                            <div className="flex flex-wrap gap-2">
                                {allModels.map(model => (
                                    <span key={model} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs font-medium rounded-full">{model}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                             <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">Covers categories like:</h4>
                             <div className="flex flex-wrap gap-2">
                                {allCategories.map(cat => (
                                    <span key={cat} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs font-medium rounded-full">{cat}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        What's Inside? 
                        {!isAdminPreview && ` (${promptsToShow.length} of ${collection.promptCount} shown)`}
                        {isAdminPreview && ` (All ${collection.promptCount} prompts shown)`}
                    </h3>
                    <div className="space-y-4">
                        {promptsToShow.map(prompt => (
                            <PromptPreviewCard key={prompt.id} prompt={prompt} isAdminPreview={isAdminPreview} />
                        ))}
                    </div>
                </div>

            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 mt-4 border-t dark:border-gray-700">
                {!isAdminPreview ? (
                    <>
                        <span className="text-3xl font-bold text-primary-500">${collection.price.toFixed(2)}</span>
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">Close</Button>
                            <Button icon={<ShoppingCart size={16} />} onClick={handlePurchase} className="w-full sm:w-auto">
                                Get Full Access
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="w-full flex justify-end">
                         <Button variant="secondary" onClick={onClose}>Close</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CollectionPreviewModal;