import React from 'react';
import { Collection } from '../types';
import { ShoppingCart, Zap, Eye } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const CollectionCard: React.FC<{ collection: Collection; onPreview?: (collection: Collection) => void }> = ({ collection, onPreview }) => {
  const { user, purchaseCollection } = useAuth();
  const navigate = useNavigate();
  const isOwned = user?.purchasedCollections?.includes(collection.id);
  const isCreator = user?.id === collection.creator.id;

  const handlePurchase = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    purchaseCollection(collection.id);
  }

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview?.(collection);
  }

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
    // If the card itself is clicked (and not a button/link), and it's owned, navigate to it.
    if (isOwned || isCreator) {
        navigate(`/collection/${collection.id}`);
    } else if (onPreview) { // Otherwise, trigger the preview
        onPreview(collection);
    }
  };

  return (
    <div onClick={handleCardClick} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer transform hover:-translate-y-1">
      <div className="relative">
        <img src={collection.coverImage} alt={collection.name} className="w-full h-48 object-cover" />
        <div className="absolute top-2 right-2 flex items-center bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
            <Zap size={14} className="mr-1 text-yellow-300"/>
            <span>{collection.promptCount} Prompts</span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2">{collection.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow">{collection.description}</p>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-300 mb-4 w-fit">
          {user?.id !== collection.creator.id ? (
            <Link to={`/profile/${collection.creator.id}`} onClick={(e) => e.stopPropagation()} className="group">
              <img src={collection.creator.avatar} alt={collection.creator.name} className="w-6 h-6 rounded-full group-hover:ring-2 group-hover:ring-primary-400 transition-all" />
            </Link>
          ) : (
            <img src={collection.creator.avatar} alt={collection.creator.name} className="w-6 h-6 rounded-full" />
          )}
          <span>by {collection.creator.name}</span>
        </div>

        <div className="flex justify-between items-center mt-auto pt-4 border-t dark:border-gray-700">
          <span className="text-2xl font-bold text-primary-500">${collection.price.toFixed(2)}</span>
          {(isOwned || isCreator) ? (
            <Link to={`/collection/${collection.id}`}>
                <Button icon={<Eye size={16} />}>
                    View
                </Button>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
                {onPreview && (
                    <Button variant="secondary" icon={<Eye size={16} />} onClick={handlePreviewClick}>
                        Preview
                    </Button>
                )}
                <Button 
                    icon={<ShoppingCart size={16} />}
                    onClick={handlePurchase}
                >
                    Purchase
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;