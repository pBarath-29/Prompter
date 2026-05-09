import React, { useState, useEffect } from 'react';
import { Prompt } from '../types';
import Modal from './Modal';
import Button from './Button';
import { Copy, Sparkles, Check, Book, Cpu, Tag as TagIcon, MessageSquare } from 'lucide-react';
import { generateExampleOutput, generateExampleImage } from '../services/geminiService';
import { usePrompts } from '../contexts/PromptContext';
import { useAuth } from '../contexts/AuthContext';
import RatingControl from './StarRating';
import { useNavigate, Link } from 'react-router-dom';
import LogoSpinner from './LogoSpinner';

interface PromptDetailModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  isAdminPreview?: boolean;
}

type ExampleOutput = {
    type: 'text' | 'image';
    content: string;
}

const PromptDetailModal: React.FC<PromptDetailModalProps> = ({ prompt, isOpen, onClose, isAdminPreview = false }) => {
  const [example, setExample] = useState<ExampleOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const { handlePromptVote, addComment } = usePrompts();
  const { user, handleVote: handleUserVote } = useAuth();
  const navigate = useNavigate();
  const isBanned = user?.status === 'banned';

  useEffect(() => {
    // Reset state on open or prompt change to avoid showing stale data
    setExample(null);
    setError(null);
    setIsLoading(false);
    
    if (isOpen && prompt) {
      // If the prompt has a user-submitted example, use it.
      if (prompt.exampleOutput) {
        const isUrl = prompt.exampleOutput.startsWith('http') || prompt.exampleOutput.startsWith('data:image');
        if (isUrl) {
            setExample({ type: 'image', content: prompt.exampleOutput });
        } else {
            setExample({ type: 'text', content: prompt.exampleOutput });
        }
        return; // Don't generate anything
      }

      // Otherwise, generate an example.
      const isImageModel = prompt.model === 'MidJourney' || prompt.model === 'DALL-E';
      const generateExample = async () => {
        setIsLoading(true);
        try {
          if (isImageModel) {
            const imageUrl = await generateExampleImage(prompt.prompt);
            setExample({ type: 'image', content: imageUrl });
          } else {
            const result = await generateExampleOutput(prompt);
            setExample({ type: 'text', content: result });
          }
        } catch (err) {
          setError((err as Error).message);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };
      generateExample();
    }
  }, [isOpen, prompt]);

  if (!prompt) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) {
      navigate('/login');
      onClose();
      return;
    }
    const previousVote = user.votes?.[prompt.id];
    handleUserVote(prompt.id, voteType);
    handlePromptVote(prompt.id, voteType, previousVote);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isBanned) return;
    addComment(prompt.id, { author: user, text: newComment });
    setNewComment('');
  };
  
  const handleLoginClick = () => {
      navigate('/login');
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={prompt.title}>
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 -mr-4">
        
        <div className="pb-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
                {user?.id !== prompt.author.id ? (
                    <Link to={`/profile/${prompt.author.id}`} onClick={onClose} className="group">
                        <img src={prompt.author.avatar} alt={prompt.author.name} className="w-12 h-12 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary-400 transition-all" />
                    </Link>
                ) : (
                    <img src={prompt.author.avatar} alt={prompt.author.name} className="w-12 h-12 rounded-full object-cover" />
                )}
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{prompt.author.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Author</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                 <div className="flex items-center space-x-2">
                    <Book size={16} className="text-primary-500" />
                    <span className="font-semibold">{prompt.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Cpu size={16} className="text-primary-500" />
                    <span className="font-semibold">{prompt.model}</span>
                </div>
            </div>
             <div className="flex flex-wrap gap-2 mt-4">
                {prompt.tags.map(tag => (
                  <span key={tag} className="flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-md">
                    <TagIcon size={12} className="mr-1.5"/>
                    {tag}
                  </span>
                ))}
            </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Prompt</h3>
          <div className="relative p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{prompt.prompt}</p>
            <button
              onClick={() => handleCopy(prompt.prompt)}
              className={`absolute top-2 right-2 p-2 rounded-lg transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              title={copied ? "Copied!" : "Copy prompt"}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
            <Sparkles size={20} className="mr-2 text-primary-500"/>
            Example Output
          </h3>
          <div className="p-4 border-2 border-dashed rounded-lg min-h-[150px] flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 relative">
            {!prompt.exampleOutput && !isLoading && example && (
                <div className="absolute top-2 right-2 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full font-semibold flex items-center space-x-1">
                    <Sparkles size={12} />
                    <span>AI-Generated</span>
                </div>
            )}
            {isLoading && (
              <div className="text-center flex flex-col items-center justify-center space-y-2 animate-fade-in">
                <LogoSpinner size={32} />
                <p className="text-sm text-gray-500 dark:text-gray-400">Generating example...</p>
              </div>
            )}
            {error && <p className="text-red-500 text-sm text-center animate-fade-in">{error}</p>}
            {!isLoading && !error && example && (
              <div className="animate-fade-in w-full flex justify-center">
                {example.type === 'text' && (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">{example.content}</p>
                )}
                {example.type === 'image' && (
                  <img src={example.content} alt="Generated example" className="rounded-lg max-w-full max-h-80 object-contain"/>
                )}
              </div>
            )}
             {!isLoading && !error && !example && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No example output was provided for this prompt.</p>
            )}
          </div>
        </div>

        {!isAdminPreview && (
          <>
            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Feedback</h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">Vote on this prompt</p>
                  <RatingControl
                    upvotes={prompt.upvotes}
                    downvotes={prompt.downvotes}
                    userVote={user?.votes?.[prompt.id]}
                    onVote={handleVote}
                    size={28}
                    disabled={isBanned}
                  />
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {prompt.upvotes} upvotes, {prompt.downvotes} downvotes
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <MessageSquare size={20} className="mr-2 text-primary-500"/>
                Comments ({prompt.comments?.length || 0})
              </h3>
              <div className="space-y-4">
                {(prompt.comments || []).map(comment => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    {user?.id !== comment.author.id ? (
                      <Link to={`/profile/${comment.author.id}`} onClick={onClose} className="group flex-shrink-0">
                        <img src={comment.author.avatar} alt={comment.author.name} className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary-400 transition-all"/>
                      </Link>
                    ) : (
                      <img src={comment.author.avatar} alt={comment.author.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0"/>
                    )}
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                       <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                        {comment.author.name}
                        {' '}
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))}
                {(prompt.comments?.length || 0) === 0 && (
                  <p className="text-sm text-center py-4 text-gray-500 dark:text-gray-400">No comments yet. Be the first to leave feedback!</p>
                )}
              </div>
              
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mt-6 flex items-start space-x-3">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder={isBanned ? "Commenting is disabled for banned accounts." : "Add your comment..."}
                      rows={2}
                      disabled={isBanned}
                    />
                    <div className="flex justify-end mt-2">
                      <Button type="submit" disabled={!newComment.trim() || isBanned}>Post Comment</Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="mt-6 text-center p-4 border-2 border-dashed rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400">You must be logged in to comment.</p>
                  <Button onClick={handleLoginClick} className="mt-2">Login</Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end pt-4 mt-2 border-t dark:border-gray-700">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default PromptDetailModal;