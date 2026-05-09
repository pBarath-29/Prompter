import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePrompts } from '../contexts/PromptContext';
import { Prompt, User } from '../types';
import PromptCard from '../components/PromptCard';
import PromptDetailModal from '../components/PromptDetailModal';
import { BookOpen, UserX } from 'lucide-react';
import Button from '../components/Button';
import Pagination from '../components/Pagination';
import UserProfileHeader from '../components/UserProfileHeader';
import LogoSpinner from '../components/LogoSpinner';

const PROMPTS_PER_PAGE = 6;

const UserProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { getUserById, user: loggedInUser } = useAuth();
    const { prompts } = usePrompts();

    const [userProfile, setUserProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        if (userId === loggedInUser?.id) {
            navigate('/profile', { replace: true });
        }
    }, [userId, loggedInUser, navigate]);

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                setIsLoading(false);
                return;
            };
            setIsLoading(true);
            try {
                const user = await getUserById(userId);
                setUserProfile(user || null);
            } catch (error) {
                console.error("Failed to fetch user profile", error);
                setUserProfile(null);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (userId !== loggedInUser?.id) {
            fetchUser();
        }
    }, [userId, getUserById, loggedInUser?.id]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LogoSpinner size={48} />
            </div>
        )
    }

    if (!userProfile) {
        return (
            <div className="text-center py-20">
                <UserX size={64} className="mx-auto text-gray-400 mb-4" />
                <h1 className="text-4xl font-bold">User Not Found</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    The profile you are looking for does not exist.
                </p>
                <Link to="/community">
                    <Button className="mt-6">Back to Community</Button>
                </Link>
            </div>
        );
    }

    const handlePromptClick = (prompt: Prompt) => setSelectedPrompt(prompt);
    const handleCloseDetailModal = () => setSelectedPrompt(null);

    const userPublicPrompts = prompts.filter(p =>
        p.author.id === userProfile.id && p.isPublic && p.status === 'approved'
    );
    
    const totalPages = Math.ceil(userPublicPrompts.length / PROMPTS_PER_PAGE);
    const paginatedPrompts = userPublicPrompts.slice(
        (currentPage - 1) * PROMPTS_PER_PAGE,
        currentPage * PROMPTS_PER_PAGE
    );

    return (
        <div className="space-y-12">
            <UserProfileHeader user={userProfile} isEditable={false} />

            <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <BookOpen className="mr-3 text-primary-500" /> Public Prompts by {userProfile.name}
                </h2>
                {userPublicPrompts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedPrompts.map(prompt => (
                                <PromptCard
                                    key={prompt.id}
                                    prompt={prompt}
                                    onClick={handlePromptClick}
                                />
                            ))}
                        </div>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">{userProfile.name} hasn't shared any public prompts yet.</p>
                    </div>
                )}
            </section>

            <PromptDetailModal
                isOpen={!!selectedPrompt}
                onClose={handleCloseDetailModal}
                prompt={selectedPrompt}
            />
        </div>
    );
};

export default UserProfilePage;
