import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { AI_MODELS, CATEGORIES, AIModel, Category, Prompt } from '../types';
import ImageUpload from './ImageUpload';
import CustomDropdown from './CustomDropdown';

interface EditPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Prompt, 'author' | 'upvotes' | 'downvotes' | 'comments' | 'createdAt'>) => void;
  prompt: Prompt | null;
}

const EditPromptModal: React.FC<EditPromptModalProps> = ({ isOpen, onClose, onSubmit, prompt }) => {
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Education');
  const [model, setModel] = useState<AIModel>('Gemini');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [exampleOutput, setExampleOutput] = useState('');
  const [outputType, setOutputType] = useState<'text' | 'image'>('text');
  const [error, setError] = useState('');

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setPromptText(prompt.prompt);
      setDescription(prompt.description);
      setCategory(prompt.category);
      setModel(prompt.model);
      setTags(prompt.tags.join(', '));
      setIsPublic(prompt.isPublic);
      setExampleOutput(prompt.exampleOutput || '');

      const isUrl = prompt.exampleOutput?.startsWith('http') || prompt.exampleOutput?.startsWith('data:image');
      setOutputType(isUrl ? 'image' : 'text');
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim() || !description.trim() || !exampleOutput.trim()) {
      setError('Title, Prompt, Description, and Example Output are required fields.');
      return;
    }
    if (!prompt) return;

    setError('');
    onSubmit({
      id: prompt.id,
      title,
      prompt: promptText,
      description,
      category,
      model,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isPublic,
      status: 'pending',
      exampleOutput: exampleOutput.trim(),
    });
  };

  const categoryOptions = CATEGORIES.map(c => ({ value: c, label: c }));
  const modelOptions = AI_MODELS.map(m => ({ value: m, label: m }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Prompt">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input 
            id="edit-title" 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g., Ultimate Essay Writing Assistant"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div>
            <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt</label>
            <textarea
                id="edit-prompt"
                rows={5}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter the full prompt text here..."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 font-mono text-sm dark:text-white dark:placeholder-gray-400"
            />
        </div>

        <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
                id="edit-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this prompt does."
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Example Output Type
            </label>
            <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        name="editOutputType"
                        value="text"
                        checked={outputType === 'text'}
                        onChange={() => setOutputType('text')}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Text</span>
                </label>
                <label className="flex items-center cursor-pointer">
                    <input
                        type="radio"
                        name="editOutputType"
                        value="image"
                        checked={outputType === 'image'}
                        onChange={() => setOutputType('image')}
                        className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Image</span>
                </label>
            </div>
        </div>

        <div>
            {outputType === 'image' ? (
                 <ImageUpload
                    label="Example Output Image"
                    initialImageUrl={exampleOutput}
                    onImageSelect={setExampleOutput}
                />
            ) : (
                <>
                    <label htmlFor="edit-exampleOutput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Example Output Text
                    </label>
                    <textarea
                        id="edit-exampleOutput"
                        rows={4}
                        value={exampleOutput}
                        onChange={(e) => setExampleOutput(e.target.value)}
                        placeholder="Provide an example of what this prompt might generate."
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    />
                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        An example output is required to help others understand what to expect.
                    </p>
                </>
            )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomDropdown
                label="Category"
                options={categoryOptions}
                value={category}
                onChange={v => setCategory(v as Category)}
            />
            <CustomDropdown
                label="AI Model"
                options={modelOptions}
                value={model}
                onChange={v => setModel(v as AIModel)}
            />
        </div>
        
        <div>
          <label htmlFor="edit-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
          <input 
            id="edit-tags" 
            type="text" 
            value={tags} 
            onChange={e => setTags(e.target.value)}
            placeholder="e.g., Academic, Students, Writing"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate tags with a comma.</p>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="flex justify-end pt-4 border-t dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose} className="mr-2">Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPromptModal;