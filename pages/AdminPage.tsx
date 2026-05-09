import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { performMultiPathUpdate } from '../services/firebaseService';
import { usePrompts } from '../contexts/PromptContext';
import { useCollections } from '../contexts/CollectionContext';
import Button from '../components/Button';
import { CheckCircle, XCircle, Eye, Inbox, Package, Clock, MessageSquare, Trash2, Tag, Users, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Prompt, Collection, FeedbackItem, User } from '../types';
import PromptDetailModal from '../components/PromptDetailModal';
import CollectionPreviewModal from '../components/CollectionPreviewModal';
import Pagination from '../components/Pagination';
import { useFeedback } from '../contexts/FeedbackContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { usePromoCodes } from '../contexts/PromoCodeContext';
import { useAuth } from '../contexts/AuthContext';
import LogoSpinner from '../components/LogoSpinner';
import CustomDropdown from '../components/CustomDropdown';
import { useToast } from '../contexts/ToastContext';

const ITEMS_PER_PAGE = 5;

const AdminPage: React.FC = () => {
    const { prompts, updatePromptStatus, deletePrompt } = usePrompts();
    const { collections, updateCollectionStatus, deleteCollection } = useCollections();
    const { feedback, updateFeedbackStatus: updateFeedbackItemStatus, deleteFeedback } = useFeedback();
    const { promoCodes, addPromoCode, deletePromoCode } = usePromoCodes();
    const { getAllUsers, updateUserStatus } = useAuth();
    const { showToast } = useToast();
    
    const [activeTab, setActiveTab] = useState<'prompts' | 'collections' | 'feedback' | 'promoCodes' | 'users'>('prompts');
    const [promptToPreview, setPromptToPreview] = useState<Prompt | null>(null);
    const [collectionToPreview, setCollectionToPreview] = useState<Collection | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'prompt' | 'collection' | 'feedback' | 'promo', id: string, name?: string } | null>(null);
    const [userToConfirm, setUserToConfirm] = useState<{ user: User; action: 'ban' | 'unban' } | null>(null);
    
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');

    // Form states for new promo code
    const [newCodeName, setNewCodeName] = useState('');
    const [newCodeDiscount, setNewCodeDiscount] = useState<number | ''>('');
    const [newCodeLimit, setNewCodeLimit] = useState<number | ''>('');
    const [promoCodeError, setPromoCodeError] = useState('');
    
    // Filters
    const [promptStatusFilter, setPromptStatusFilter] = useState<'pending' | 'all'>('pending');
    const [collectionStatusFilter, setCollectionStatusFilter] = useState<'pending' | 'all'>('pending');


    useEffect(() => {
        if (activeTab === 'users') {
            setUsersLoading(true);
            getAllUsers()
                .then(setUsers)
                .finally(() => setUsersLoading(false));
        }
    }, [activeTab, getAllUsers]);

    // Pagination states
    const [promptsPage, setPromptsPage] = useState(1);
    const [collectionsPage, setCollectionsPage] = useState(1);
    const [feedbackPage, setFeedbackPage] = useState(1);
    const [promoCodesPage, setPromoCodesPage] = useState(1);
    const [usersPage, setUsersPage] = useState(1);

    const filteredPrompts = prompts
        .filter(p => p.isPublic) // Only show community prompts
        .filter(p => promptStatusFilter === 'all' || p.status === promptStatusFilter);

    const filteredCollections = collections.filter(c => collectionStatusFilter === 'all' || c.status === collectionStatusFilter);
    const pendingFeedback = feedback.filter(f => f.status === 'pending');
    const filteredUsers = users
        .filter(u => u.role !== 'admin')
        .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));

    const paginate = <T,>(items: T[], page: number): { totalPages: number, paginatedItems: T[] } => {
        const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
        const paginatedItems = items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
        return { totalPages, paginatedItems };
    };
    
    const { totalPages: promptsTotalPages, paginatedItems: paginatedPrompts } = paginate(filteredPrompts, promptsPage);
    const { totalPages: collectionsTotalPages, paginatedItems: paginatedCollections } = paginate(filteredCollections, collectionsPage);
    const { totalPages: feedbackTotalPages, paginatedItems: paginatedFeedback } = paginate(pendingFeedback, feedbackPage);
    const { totalPages: promoCodesTotalPages, paginatedItems: paginatedPromoCodes } = paginate(promoCodes, promoCodesPage);
    const { totalPages: usersTotalPages, paginatedItems: paginatedUsers } = paginate(filteredUsers, usersPage);

    const handleConfirmDelete = () => {
        if (!itemToDelete) return;

        if (itemToDelete.type === 'feedback') {
            deleteFeedback(itemToDelete.id);
        } else if (itemToDelete.type === 'promo') {
            deletePromoCode(itemToDelete.id);
        } else if (itemToDelete.type === 'prompt') {
            deletePrompt(itemToDelete.id);
        } else if (itemToDelete.type === 'collection') {
            const collection = collections.find(c => c.id === itemToDelete.id);
            if (collection) {
                const updates: Record<string, null> = {};
                (collection.promptIds || []).forEach(promptId => {
                    updates[`/prompts/${promptId}`] = null;
                });
                updates[`/collections/${collection.id}`] = null;
                performMultiPathUpdate(updates).then(() => {
                    // Update local state after atomic Firebase write
                    (collection.promptIds || []).forEach(promptId => deletePrompt(promptId));
                    deleteCollection(collection.id);
                }).catch(err => console.error('Failed to delete collection atomically', err));
            }
        }
        setItemToDelete(null);
    };

    const handleCreatePromoCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setPromoCodeError('');
        if (!newCodeName.trim() || !newCodeDiscount || !newCodeLimit) {
            setPromoCodeError('All fields are required.');
            return;
        }
        if (!/^[A-Z0-9_-]{1,20}$/.test(newCodeName.trim().toUpperCase())) {
            setPromoCodeError('Code name must be 1–20 characters: letters, numbers, hyphens, or underscores only.');
            return;
        }
        if (newCodeDiscount <= 0 || newCodeDiscount > 100) {
            setPromoCodeError('Discount must be between 1 and 100.');
            return;
        }
        if (newCodeLimit <= 0) {
            setPromoCodeError('Usage limit must be greater than 0.');
            return;
        }

        try {
            await addPromoCode({
                id: newCodeName,
                discountPercentage: newCodeDiscount,
                usageLimit: newCodeLimit
            });
            // Reset form
            setNewCodeName('');
            setNewCodeDiscount('');
            setNewCodeLimit('');
        } catch (error) {
            setPromoCodeError('Failed to create promo code. It might already exist.');
            console.error(error);
        }
    };

    const handleUpdateUserStatus = async (user: User, status: 'active' | 'banned') => {
        await updateUserStatus(user.id, status);
        setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? { ...u, status } : u));
        setUserToConfirm(null); // Close modal after action
    };

    const promptFilterOptions = [
        { value: 'pending' as const, label: 'Pending' },
        { value: 'all' as const, label: 'All Prompts' },
    ];
    const collectionFilterOptions = [
        { value: 'pending' as const, label: 'Pending' },
        { value: 'all' as const, label: 'All Collections' },
    ];

    const TabButton: React.FC<{
        label: string;
        count?: number;
        isActive: boolean;
        onClick: () => void;
        icon: React.ReactNode;
    }> = ({ label, count, isActive, onClick, icon }) => (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${
                isActive
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
        >
            {icon}
            <span>{label}</span>
            {count !== undefined && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                {count}
            </span>}
        </button>
    );
    
    return (
      <div className="space-y-8">
        <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Admin Panel</h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                Review and moderate user-submitted content and manage users.
            </p>
        </div>
        
        <div className="border-b border-gray-200 dark:border-gray-700 flex flex-wrap">
          <TabButton 
            label="Prompts" 
            count={prompts.filter(p=> p.isPublic && p.status === 'pending').length}
            isActive={activeTab === 'prompts'}
            onClick={() => setActiveTab('prompts')}
            icon={<Inbox size={18} />}
          />
          <TabButton 
            label="Collections" 
            count={collections.filter(p=> p.status === 'pending').length} 
            isActive={activeTab === 'collections'}
            onClick={() => setActiveTab('collections')}
            icon={<Package size={18} />}
          />
           <TabButton 
            label="Feedback" 
            count={pendingFeedback.length} 
            isActive={activeTab === 'feedback'}
            onClick={() => setActiveTab('feedback')}
            icon={<MessageSquare size={18} />}
          />
          <TabButton 
            label="Promo Codes" 
            isActive={activeTab === 'promoCodes'}
            onClick={() => setActiveTab('promoCodes')}
            icon={<Tag size={18} />}
          />
           <TabButton 
            label="Users" 
            isActive={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users size={18} />}
          />
        </div>
        
        <div key={activeTab} className="animate-fade-in">
            {activeTab === 'prompts' && (
            <div className="space-y-4">
                 <div className="flex justify-end">
                    <CustomDropdown
                        options={promptFilterOptions}
                        value={promptStatusFilter}
                        onChange={setPromptStatusFilter}
                        className="w-48"
                    />
                 </div>
                {paginatedPrompts.map(prompt => (
                <div key={prompt.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="font-bold text-lg">{prompt.title} <span className="text-sm font-normal text-gray-500">({prompt.status})</span></p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                By <span className="font-medium text-gray-700 dark:text-gray-300">{prompt.author.name}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center"><Clock size={12} className="mr-1.5"/> Submitted on {new Date(prompt.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 self-stretch sm:self-auto">
                            <Button variant="secondary" onClick={() => setPromptToPreview(prompt)} icon={<Eye size={16}/>}>Preview</Button>
                            {prompt.status === 'pending' && (
                                <>
                                    <Button onClick={() => { updatePromptStatus(prompt.id, 'approved'); showToast('Prompt approved.'); }} icon={<CheckCircle size={16}/>}>Approve</Button>
                                    <Button variant="danger" onClick={() => { updatePromptStatus(prompt.id, 'rejected'); showToast('Prompt rejected.', 'error'); }} icon={<XCircle size={16}/>}>Reject</Button>
                                </>
                            )}
                             <Button variant="danger" onClick={() => setItemToDelete({ type: 'prompt', id: prompt.id, name: prompt.title })} icon={<Trash2 size={16}/>}/>
                        </div>
                    </div>
                </div>
                ))}
                {filteredPrompts.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">No prompts match the current filter.</p>
                ) : (
                    <Pagination currentPage={promptsPage} totalPages={promptsTotalPages} onPageChange={setPromptsPage} />
                )}
            </div>
            )}
            
            {activeTab === 'collections' && (
            <div className="space-y-4">
                 <div className="flex justify-end">
                    <CustomDropdown
                        options={collectionFilterOptions}
                        value={collectionStatusFilter}
                        onChange={setCollectionStatusFilter}
                        className="w-48"
                    />
                 </div>
                {paginatedCollections.map(collection => (
                <div key={collection.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between md:items-center">
                         <div className="mb-4 md:mb-0">
                            <p className="font-bold text-lg">{collection.name} <span className="text-sm font-normal text-gray-500">({collection.status})</span></p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                By <span className="font-medium text-gray-700 dark:text-gray-300">{collection.creator.name}</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1 flex items-center"><Clock size={12} className="mr-1.5"/> Submitted on {new Date(collection.creator.lastSubmissionDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 self-stretch sm:self-auto">
                            <Button variant="secondary" onClick={() => setCollectionToPreview(collection)} icon={<Eye size={16}/>}>Preview</Button>
                            {collection.status === 'pending' && (
                                <>
                                    <Button onClick={() => updateCollectionStatus(collection.id, 'approved')} icon={<CheckCircle size={16}/>}>Approve</Button>
                                    <Button variant="danger" onClick={() => updateCollectionStatus(collection.id, 'rejected')} icon={<XCircle size={16}/>}>Reject</Button>
                                </>
                            )}
                            <Button variant="danger" onClick={() => setItemToDelete({ type: 'collection', id: collection.id, name: collection.name })} icon={<Trash2 size={16}/>}/>
                        </div>
                    </div>
                </div>
                ))}
                {filteredCollections.length === 0 ? (
                    <p className="text-center py-8 text-gray-500 dark:text-gray-400">No collections match the current filter.</p>
                ) : (
                    <Pagination currentPage={collectionsPage} totalPages={collectionsTotalPages} onPageChange={setCollectionsPage} />
                )}
            </div>
            )}

            {activeTab === 'feedback' && (
                <div className="space-y-4">
                    {paginatedFeedback.map(item => (
                        <div key={item.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                    <img src={item.user.avatar} alt={item.user.name} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">{item.user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">{item.type}</span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 my-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">{item.message}</p>
                            <div className="flex justify-end space-x-2">
                                <Button onClick={() => updateFeedbackItemStatus(item.id, 'reviewed')} icon={<CheckCircle size={16}/>}>Mark Reviewed</Button>
                                <Button variant="danger" onClick={() => setItemToDelete({ type: 'feedback', id: item.id })} icon={<Trash2 size={16}/>}>Delete</Button>
                            </div>
                        </div>
                    ))}
                    {pendingFeedback.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">No pending feedback to review.</p>
                    ) : (
                        <Pagination currentPage={feedbackPage} totalPages={feedbackTotalPages} onPageChange={setFeedbackPage} />
                    )}
                </div>
            )}

            {activeTab === 'promoCodes' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold mb-4">Create New Promo Code</h3>
                        <form onSubmit={handleCreatePromoCode} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 space-y-4">
                            <div>
                                <label htmlFor="codeName" className="block text-sm font-medium mb-1">Code Name</label>
                                <input id="codeName" type="text" value={newCodeName} onChange={e => setNewCodeName(e.target.value.toUpperCase())} placeholder="e.g., SAVE25" className="w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"/>
                            </div>
                            <div>
                                <label htmlFor="discount" className="block text-sm font-medium mb-1">Discount (%)</label>
                                <input id="discount" type="number" value={newCodeDiscount} onChange={e => setNewCodeDiscount(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="e.g., 25" className="w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"/>
                            </div>
                            <div>
                                <label htmlFor="limit" className="block text-sm font-medium mb-1">Usage Limit</label>
                                <input id="limit" type="number" value={newCodeLimit} onChange={e => setNewCodeLimit(e.target.value === '' ? '' : parseInt(e.target.value))} placeholder="e.g., 100" className="w-full p-2 border rounded-md bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"/>
                            </div>
                            {promoCodeError && <p className="text-sm text-red-500">{promoCodeError}</p>}
                            <Button type="submit" className="w-full">Create Code</Button>
                        </form>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xl font-bold mb-4">Existing Promo Codes</h3>
                        {paginatedPromoCodes.length > 0 ? paginatedPromoCodes.map(code => (
                            <div key={code.id} className="flex flex-col md:flex-row justify-between md:items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                                <div>
                                    <p className="font-bold text-lg font-mono">{code.id}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-medium text-primary-500">{code.discountPercentage}% OFF</span>
                                        <span className="mx-2">|</span>
                                        <span>Usage: {code.timesUsed} / {code.usageLimit}</span>
                                    </p>
                                </div>
                                <div className="mt-2 md:mt-0">
                                    <Button variant="danger" onClick={() => setItemToDelete({ type: 'promo', id: code.id, name: code.id })} icon={<Trash2 size={16}/>}>Delete</Button>
                                </div>
                            </div>
                        )) : (
                           <p className="text-center py-8 text-gray-500 dark:text-gray-400">No promo codes have been created.</p>
                        )}
                        {promoCodes.length > 0 && (
                            <Pagination currentPage={promoCodesPage} totalPages={promoCodesTotalPages} onPageChange={setPromoCodesPage} />
                        )}
                    </div>
                </div>
            )}
            
             {activeTab === 'users' && (
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:border-gray-700 focus:ring-primary-500 focus:border-primary-500 dark:text-white dark:placeholder-gray-400"
                    />
                    {usersLoading ? <div className="flex justify-center py-8"><LogoSpinner size={40} /></div> : (
                        paginatedUsers.map((user: User) => (
                            <div key={user.id} className={`p-4 rounded-lg shadow-sm border transition-colors ${
                                user.status === 'banned' 
                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                                : 'bg-white dark:bg-gray-800 dark:border-gray-700'
                            }`}>
                                <div className="flex flex-col md:flex-row justify-between md:items-center">
                                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <p className="font-bold text-lg">{user.name}</p>
                                                {user.status === 'banned' ? (
                                                    <span className="flex items-center text-xs font-semibold text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50 px-2 py-0.5 rounded-full">
                                                        <ShieldAlert size={12} className="mr-1" />
                                                        Banned
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-xs font-semibold text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                                                        <ShieldCheck size={12} className="mr-1" />
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 self-stretch sm:self-auto">
                                        {user.status === 'active' ? (
                                            <Button variant="danger" onClick={() => setUserToConfirm({ user, action: 'ban' })} icon={<ShieldAlert size={16} />}>Ban User</Button>
                                        ) : (
                                            <Button variant="success" onClick={() => setUserToConfirm({ user, action: 'unban' })} icon={<ShieldCheck size={16} />}>Unban User</Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {filteredUsers.length === 0 && !usersLoading ? (
                        <p className="text-center py-8 text-gray-500 dark:text-gray-400">No users found.</p>
                    ) : (
                        <Pagination currentPage={usersPage} totalPages={usersTotalPages} onPageChange={setUsersPage} />
                    )}
                </div>
            )}

        </div>

        <PromptDetailModal isOpen={!!promptToPreview} onClose={() => setPromptToPreview(null)} prompt={promptToPreview} isAdminPreview={true} />
        <CollectionPreviewModal 
            isOpen={!!collectionToPreview} 
            onClose={() => setCollectionToPreview(null)} 
            collection={collectionToPreview}
            isAdminPreview={true}
        />
        <ConfirmationModal
            isOpen={!!itemToDelete}
            onClose={() => setItemToDelete(null)}
            onConfirm={handleConfirmDelete}
            title={`Delete ${itemToDelete?.type}`}
            message={`Are you sure you want to permanently delete this ${itemToDelete?.type}: "${itemToDelete?.name || itemToDelete?.id}"? This action cannot be undone.`}
            confirmButtonText="Delete"
            confirmButtonVariant="danger"
        />
        <ConfirmationModal
            isOpen={!!userToConfirm}
            onClose={() => setUserToConfirm(null)}
            onConfirm={() => {
                if (userToConfirm) {
                    handleUpdateUserStatus(userToConfirm.user, userToConfirm.action === 'ban' ? 'banned' : 'active');
                }
            }}
            title={`${userToConfirm?.action === 'ban' ? 'Ban' : 'Unban'} User`}
            message={
                userToConfirm?.action === 'ban'
                ? `Are you sure you want to ban ${userToConfirm?.user.name}? They will lose the ability to generate prompts, submit content, and comment.`
                : `Are you sure you want to unban ${userToConfirm?.user.name}? They will regain full access to their account.`
            }
            confirmButtonText={userToConfirm?.action === 'ban' ? 'Yes, Ban User' : 'Yes, Unban User'}
            confirmButtonVariant={userToConfirm?.action === 'ban' ? 'danger' : 'success'}
        />
      </div>
    );
}

export default AdminPage;