import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePrompts } from '../contexts/PromptContext';
import { useCollections } from '../contexts/CollectionContext';
import { useHistory } from '../contexts/HistoryContext';
import { Award, BookOpen, ShoppingBag, Bookmark, Package, History, CreditCard, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import Button from '../components/Button';
import PromptCard from '../components/PromptCard';
import { Prompt, HistoryItem } from '../types';
import PromptDetailModal from '../components/PromptDetailModal';
import CollectionCard from '../components/CollectionCard';
import EditPromptModal from '../components/EditPromptModal';
import ConfirmationModal from '../components/ConfirmationModal';
import HistoryDetailModal from '../components/HistoryDetailModal';
import ImageUpload from '../components/ImageUpload';
import Pagination from '../components/Pagination';
import ChangePasswordModal from '../components/ChangePasswordModal';
import UserProfileHeader from '../components/UserProfileHeader';
import { useFeedback } from '../contexts/FeedbackContext';
import ReauthenticationModal from '../components/ReauthenticationModal';
import { useToast } from '../contexts/ToastContext';

const HISTORY_PER_PAGE = 5;
const PROMPTS_PER_PAGE = 6;
const COLLECTIONS_PER_PAGE = 4;

const ProfilePage: React.FC = () => {
  const { user, updateUserProfile, removeSubmittedPrompt, cancelSubscription, deleteAccount } = useAuth();
  const { prompts, updatePrompt, deletePrompt, anonymizeUserPrompts, propagateUserUpdates: propagateToPrompts } = usePrompts();
  const { collections, anonymizeUserCollections, propagateUserUpdates: propagateToCollections } = useCollections();
  const { history } = useHistory();
  const { deleteUserFeedback, propagateUserUpdates: propagateToFeedback } = useFeedback();
  const { showToast } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isCancelSubModalOpen, setIsCancelSubModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [isReauthModalOpen, setIsReauthModalOpen] = useState(false);

  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  // Pagination states
  const [historyPage, setHistoryPage] = useState(1);
  const [communityPromptsPage, setCommunityPromptsPage] = useState(1);
  const [createdCollectionsPage, setCreatedCollectionsPage] = useState(1);
  const [savedPromptsPage, setSavedPromptsPage] = useState(1);
  const [purchasedCollectionsPage, setPurchasedCollectionsPage] = useState(1);


  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setAvatar(user.avatar);
    }
  }, [user, isEditModalOpen]);

  if (!user) {
    return <div className="text-center text-lg">Please log in to view your profile.</div>;
  }

  const handleProfileUpdate = async () => {
    const updatedUser = await updateUserProfile({ bio, avatar });
    setIsEditModalOpen(false);
    showToast('Profile updated successfully!');

    if (updatedUser) {
        // Run propagations in parallel in the background
        Promise.all([
            propagateToPrompts(updatedUser),
            propagateToCollections(updatedUser),
            propagateToFeedback(updatedUser)
        ]).catch(error => {
            console.error("Failed to propagate user updates across all contexts:", error);
        });
    }
  };
  
  const handlePromptClick = (prompt: Prompt) => setSelectedPrompt(prompt);
  const handleCloseDetailModal = () => setSelectedPrompt(null);
  const handleEditClick = (prompt: Prompt) => setPromptToEdit(prompt);
  const handleDeleteClick = (promptId: string) => setPromptToDelete(promptId);

  const handlePromptUpdate = (updatedData: Omit<Prompt, 'author' | 'upvotes' | 'downvotes' | 'comments' | 'createdAt'>) => {
    if (!promptToEdit) return;
    const updatedPrompt = { 
      ...promptToEdit, 
      ...updatedData,
      upvotes: 0,
      downvotes: 0,
    };
    updatePrompt(updatedPrompt);
    setPromptToEdit(null);
  };

  const handleConfirmDelete = () => {
      if (!promptToDelete) return;
      deletePrompt(promptToDelete);
      removeSubmittedPrompt(promptToDelete);
      setPromptToDelete(null);
  };

  const handleCancelSubscription = () => {
    cancelSubscription();
    setIsCancelSubModalOpen(false);
  };

  const handleStartDeleteProcess = () => {
      setIsDeleteConfirmModalOpen(false);
      setIsReauthModalOpen(true);
  };

  const handleDeleteAccount = async (password: string) => {
    if (!user) {
        throw new Error("User not found");
    }
    await anonymizeUserPrompts(user.id);
    await anonymizeUserCollections(user.id);
    await deleteUserFeedback(user.id);
    await deleteAccount(password);
    // On success, the AuthProvider will handle logout and redirect.
  };
  
  // Data for sections
  const userCommunityPrompts = prompts.filter(p => user.submittedPrompts?.includes(p.id) && p.status === 'approved' && p.isPublic);
  const userCreatedCollections = collections.filter(c => user.createdCollections?.includes(c.id));
  const userPurchasedCollections = collections.filter(c => user.purchasedCollections?.includes(c.id));
  const savedPrompts = prompts.filter(p => user.savedPrompts?.includes(p.id));

  // Pagination Logic
  const paginate = (items: any[], page: number, perPage: number) => {
    const totalPages = Math.ceil(items.length / perPage);
    const paginatedItems = items.slice((page - 1) * perPage, page * perPage);
    return { totalPages, paginatedItems };
  };

  const { totalPages: historyTotalPages, paginatedItems: paginatedHistory } = paginate(history, historyPage, HISTORY_PER_PAGE);
  const { totalPages: communityPromptsTotalPages, paginatedItems: paginatedCommunityPrompts } = paginate(userCommunityPrompts, communityPromptsPage, PROMPTS_PER_PAGE);
  const { totalPages: createdCollectionsTotalPages, paginatedItems: paginatedCreatedCollections } = paginate(userCreatedCollections, createdCollectionsPage, COLLECTIONS_PER_PAGE);
  const { totalPages: savedPromptsTotalPages, paginatedItems: paginatedSavedPrompts } = paginate(savedPrompts, savedPromptsPage, PROMPTS_PER_PAGE);
  const { totalPages: purchasedCollectionsTotalPages, paginatedItems: paginatedPurchasedCollections } = paginate(userPurchasedCollections, purchasedCollectionsPage, COLLECTIONS_PER_PAGE);


  return (
    <div className="space-y-12">
      <UserProfileHeader 
        user={user} 
        isEditable={true} 
        onEditProfileClick={() => setIsEditModalOpen(true)}
        onChangePasswordClick={() => setIsChangePasswordModalOpen(true)}
      />

      <section className="animate-slide-in-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-2xl font-bold mb-4 flex items-center"><CreditCard className="mr-3 text-primary-500"/> My Subscription</h2>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {user.subscriptionTier === 'pro' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                <p className="text-xl font-bold text-primary-500 flex items-center">
                  <Award size={20} className="mr-2"/> Pro Plan
                </p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <p><span className="font-semibold">Renewal Date:</span> Managed externally</p>
                <p><span className="font-semibold">Billing Cycle:</span> Monthly</p>
                <p><span className="font-semibold">Amount:</span> $9.90 / month</p>
              </div>
              <div className="md:text-right">
                <Button variant="danger" onClick={() => setIsCancelSubModalOpen(true)}>
                  Cancel Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
                <p className="text-xl font-bold">Free Plan</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Unlock unlimited generations and an ad-free experience.</p>
              </div>
              <Link to="/upgrade">
                <Button icon={<ArrowRight size={16}/>} className="!flex-row-reverse">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-2xl font-bold mb-4 flex items-center"><History className="mr-3 text-primary-500"/> My Generation History</h2>
        {history.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginatedHistory.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedHistoryItem(item)} 
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.tags.join(', ')}</p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4">{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <Pagination currentPage={historyPage} totalPages={historyTotalPages} onPageChange={setHistoryPage} />
          </>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">You haven't generated any prompts yet.</p>
            <Link to="/">
                <Button className="mt-4">Generate Your First Prompt</Button>
            </Link>
          </div>
        )}
      </section>
      
      <section className="animate-slide-in-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-2xl font-bold mb-4 flex items-center"><BookOpen className="mr-3 text-primary-500"/> My Community Prompts</h2>
        {userCommunityPrompts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCommunityPrompts.map(prompt => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onClick={handlePromptClick}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
            <Pagination currentPage={communityPromptsPage} totalPages={communityPromptsTotalPages} onPageChange={setCommunityPromptsPage} />
          </>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">You haven't submitted any approved community prompts yet.</p>
            <Link to="/community">
                <Button className="mt-4">Submit a Prompt</Button>
            </Link>
          </div>
        )}
      </section>

      <section className="animate-slide-in-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-2xl font-bold mb-4 flex items-center"><Package className="mr-3 text-primary-500"/> My Created Collections</h2>
        {userCreatedCollections.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedCreatedCollections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
            <Pagination currentPage={createdCollectionsPage} totalPages={createdCollectionsTotalPages} onPageChange={setCreatedCollectionsPage} />
          </>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">You haven't created any collections yet.</p>
             <Link to="/marketplace">
                <Button className="mt-4">Create Your First Collection</Button>
            </Link>
          </div>
        )}
      </section>

      <section className="animate-slide-in-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-2xl font-bold mb-4 flex items-center"><Bookmark className="mr-3 text-primary-500"/> My Saved Prompts</h2>
        {savedPrompts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedSavedPrompts.map(prompt => (
                <PromptCard 
                  key={prompt.id} 
                  prompt={prompt} 
                  onClick={handlePromptClick}
                />
              ))}
            </div>
            <Pagination currentPage={savedPromptsPage} totalPages={savedPromptsTotalPages} onPageChange={setSavedPromptsPage} />
          </>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">You haven't saved any prompts yet.</p>
             <Link to="/community">
                <Button className="mt-4">Explore Prompts</Button>
            </Link>
          </div>
        )}
      </section>

      <section className="animate-slide-in-up" style={{ animationDelay: '600ms' }}>
        <h2 className="text-2xl font-bold mb-4 flex items-center"><ShoppingBag className="mr-3 text-primary-500"/> My Purchased Collections</h2>
        {userPurchasedCollections.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paginatedPurchasedCollections.map(collection => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
            <Pagination currentPage={purchasedCollectionsPage} totalPages={purchasedCollectionsTotalPages} onPageChange={setPurchasedCollectionsPage} />
          </>
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">You haven't purchased any collections yet.</p>
             <Link to="/marketplace">
                <Button className="mt-4">Explore Marketplace</Button>
            </Link>
          </div>
        )}
      </section>
      
      <section className="animate-slide-in-up" style={{ animationDelay: '700ms' }}>
        <h2 className="text-2xl font-bold mb-4 flex items-center text-red-600 dark:text-red-400"><AlertTriangle className="mr-3"/> Danger Zone</h2>
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm border border-red-200 dark:border-red-800 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <h3 className="font-bold">Delete Account</h3>
                <p className="text-sm text-red-700 dark:text-red-300">Once you delete your account, all personal data will be removed, and your content will be anonymized. This action is irreversible.</p>
            </div>
            <Button variant="danger" onClick={() => setIsDeleteConfirmModalOpen(true)}>
                Delete My Account
            </Button>
        </div>
      </section>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Your Profile">
        <div className="space-y-4">
          <ImageUpload
              label="Avatar Image"
              initialImageUrl={avatar}
              onImageSelect={setAvatar}
          />
           <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
            <textarea 
              id="bio"
              rows={4}
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              className="w-full p-2 border rounded-md bg-gray-100 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} className="mr-2">Cancel</Button>
            <Button onClick={handleProfileUpdate}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      
      <PromptDetailModal
        isOpen={!!selectedPrompt}
        onClose={handleCloseDetailModal}
        prompt={selectedPrompt}
      />

      <EditPromptModal
          isOpen={!!promptToEdit}
          onClose={() => setPromptToEdit(null)}
          onSubmit={handlePromptUpdate}
          prompt={promptToEdit}
      />

      <ConfirmationModal
          isOpen={!!promptToDelete}
          onClose={() => setPromptToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Prompt"
          message="Are you sure you want to delete this prompt? This action cannot be undone."
          confirmButtonText="Delete"
          confirmButtonVariant="danger"
      />

      <ConfirmationModal
        isOpen={isCancelSubModalOpen}
        onClose={() => setIsCancelSubModalOpen(false)}
        onConfirm={handleCancelSubscription}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your Pro subscription? You will lose access to Pro benefits at the end of your current billing cycle."
        confirmButtonText="Confirm Cancellation"
        confirmButtonVariant="danger"
      />
      
      <ConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={handleStartDeleteProcess}
        title="Delete Your Account"
        message="This is a permanent action. Are you absolutely sure you want to delete your account?"
        confirmButtonText="Yes, Delete My Account"
        confirmButtonVariant="danger"
      />
      
      <ReauthenticationModal
        isOpen={isReauthModalOpen}
        onClose={() => setIsReauthModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Confirm Account Deletion"
        message="For your security, please enter your password to confirm."
        confirmButtonText="Permanently Delete Account"
      />

      <HistoryDetailModal
        isOpen={!!selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
        item={selectedHistoryItem}
      />
    </div>
  );
};

export default ProfilePage;