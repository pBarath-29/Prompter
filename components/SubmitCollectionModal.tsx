import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Collection, Prompt, AIModel, Category } from '../types';
import { AI_MODELS, CATEGORIES } from '../types';
import { PlusCircle, Trash2, CheckCircle, ArrowLeft, ArrowRight, Package } from 'lucide-react';
import ImageUpload from './ImageUpload';
import CustomDropdown from './CustomDropdown';

type NewPromptData = Omit<Prompt, 'id' | 'author' | 'upvotes' | 'downvotes' | 'comments' | 'createdAt' | 'isPublic' | 'status'>;
type NewCollectionData = Omit<Collection, 'id' | 'creator' | 'promptCount' | 'promptIds' | 'status'>;

interface SubmitCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (collectionData: NewCollectionData, newPromptsData: NewPromptData[]) => void;
}

const initialCollectionData = { name: '', description: '', price: '' as number | '', coverImage: '' };
const initialPromptData = {
    title: '', prompt: '', description: '',
    category: 'Education' as Category, model: 'Gemini' as AIModel,
    tags: '', exampleOutput: '', outputType: 'text' as 'text' | 'image'
};

const ProgressBar: React.FC<{ title: string }> = ({ title }) => (
    <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    </div>
);


const SubmitCollectionModal: React.FC<SubmitCollectionModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [step, setStep] = useState(1);
    const [collectionData, setCollectionData] = useState(initialCollectionData);
    const [prompts, setPrompts] = useState<NewPromptData[]>([]);
    const [currentPrompt, setCurrentPrompt] = useState(initialPromptData);
    const [submitted, setSubmitted] = useState(false);

    const totalCollectionSteps = 5;
    const totalPromptSteps = 6;

    const resetForm = () => {
        setStep(1);
        setCollectionData(initialCollectionData);
        setPrompts([]);
        setCurrentPrompt(initialPromptData);
    };

    const handleClose = () => {
        resetForm();
        setSubmitted(false);
        onClose();
    };

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleAddPrompt = () => {
        // FIX: Convert the `tags` string from the form state into a `string[]` to match the `NewPromptData` type.
        setPrompts(prev => [...prev, {
            ...currentPrompt,
            tags: currentPrompt.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }]);
        setCurrentPrompt(initialPromptData);
        setStep(5); // Go back to manage prompts view
    };

    const handleRemovePrompt = (index: number) => {
        setPrompts(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleStartAddPrompt = () => {
        setCurrentPrompt(initialPromptData); // Ensure clean state
        setStep(6); // Move to first prompt step
    };

    const handleSubmit = () => {
        onSubmit(
            { ...collectionData, price: Number(collectionData.price) },
            prompts
        );
        setSubmitted(true);
    };

    const isStepValid = () => {
        if (step <= 4) { // Collection details
            switch(step) {
                case 1: return collectionData.name.trim() !== '';
                case 2: return collectionData.description.trim() !== '';
                case 3: return collectionData.price !== '' && Number(collectionData.price) >= 0;
                default: return true;
            }
        } else { // Prompt details
            const promptStep = step - 5;
             switch(promptStep) {
                case 1: return currentPrompt.title.trim() !== '';
                case 2: return currentPrompt.prompt.trim() !== '';
                case 3: return currentPrompt.description.trim() !== '';
                default: return true;
            }
        }
    };
    
    const categoryOptions = CATEGORIES.map(c => ({ value: c, label: c }));
    const modelOptions = AI_MODELS.map(m => ({ value: m, label: m }));

    const renderContent = () => {
        // Collection Steps
        if (step <= 5) {
            switch(step) {
                case 1: return (
                    <div>
                        <ProgressBar title="Name Your Collection" />
                        <input type="text" value={collectionData.name} onChange={e => setCollectionData(p => ({...p, name: e.target.value}))} placeholder="e.g., AI Artistry Master Pack" className="w-full mt-4 p-3 border rounded-lg text-center border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" autoFocus/>
                    </div>
                );
                case 2: return (
                    <div>
                        <ProgressBar title="Describe Your Collection" />
                        <textarea rows={4} value={collectionData.description} onChange={e => setCollectionData(p => ({...p, description: e.target.value}))} placeholder="What is this collection about?" className="w-full mt-4 p-3 border rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" autoFocus/>
                    </div>
                );
                case 3: return (
                    <div>
                        <ProgressBar title="Set a Price (USD)" />
                        <input type="number" value={collectionData.price} onChange={e => setCollectionData(p => ({...p, price: e.target.value === '' ? '' : Number(e.target.value)}))} placeholder="e.g., 19.99" min="0" step="0.01" className="w-full mt-4 p-3 border rounded-lg text-center border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" autoFocus/>
                    </div>
                );
                case 4: return (
                    <div>
                        <ProgressBar title="Upload a Cover Image" />
                        <div className="mt-4">
                           <ImageUpload label="" onImageSelect={val => setCollectionData(p => ({...p, coverImage: val}))} initialImageUrl={collectionData.coverImage} />
                        </div>
                    </div>
                );
                case 5: return (
                    <div className="text-center">
                        <ProgressBar title={`Add Prompts (${prompts.length} Added)`} />
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg min-h-[120px] max-h-48 overflow-y-auto space-y-2">
                            {prompts.length > 0 ? prompts.map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm">
                                    <span>{p.title}</span>
                                    <button type="button" onClick={() => handleRemovePrompt(i)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 size={16}/></button>
                                </div>
                            )) : <p className="text-gray-500">Your collection needs at least one prompt.</p>}
                        </div>
                        <Button type="button" onClick={handleStartAddPrompt} icon={<PlusCircle size={16}/>} className="mt-4">Add a New Prompt</Button>
                    </div>
                );
            }
        }
        // Prompt Steps (step > 5)
        const promptStep = step - 5;
        switch(promptStep) {
            case 1: return (
                <div>
                    <ProgressBar title={`New Prompt (${promptStep}/${totalPromptSteps}): Title`} />
                    <input type="text" value={currentPrompt.title} onChange={e => setCurrentPrompt(p => ({...p, title: e.target.value}))} placeholder="Prompt Title" className="w-full mt-4 p-3 border rounded-lg text-center border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" autoFocus/>
                </div>
            );
            case 2: return (
                <div>
                    <ProgressBar title={`New Prompt (${promptStep}/${totalPromptSteps}): Prompt Text`} />
                    <textarea rows={6} value={currentPrompt.prompt} onChange={e => setCurrentPrompt(p => ({...p, prompt: e.target.value}))} placeholder="Full prompt text..." className="w-full mt-4 p-3 border rounded-lg font-mono text-sm border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" autoFocus/>
                </div>
            );
            case 3: return (
                <div>
                    <ProgressBar title={`New Prompt (${promptStep}/${totalPromptSteps}): Description`} />
                    <textarea rows={3} value={currentPrompt.description} onChange={e => setCurrentPrompt(p => ({...p, description: e.target.value}))} placeholder="Prompt description..." className="w-full mt-4 p-3 border rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" autoFocus/>
                </div>
            );
            case 4: return (
                <div>
                     <ProgressBar title={`New Prompt (${promptStep}/${totalPromptSteps}): Category & Model`} />
                     <div className="grid grid-cols-2 gap-4 mt-4">
                        <CustomDropdown
                            options={categoryOptions}
                            value={currentPrompt.category}
                            onChange={v => setCurrentPrompt(p => ({...p, category: v as Category}))}
                        />
                        <CustomDropdown
                            options={modelOptions}
                            value={currentPrompt.model}
                            onChange={v => setCurrentPrompt(p => ({...p, model: v as AIModel}))}
                        />
                     </div>
                </div>
            );
            case 5: return (
                 <div>
                    <ProgressBar title={`New Prompt (${promptStep}/${totalPromptSteps}): Tags`} />
                    <input type="text" value={currentPrompt.tags} onChange={e => setCurrentPrompt(p => ({...p, tags: e.target.value}))} placeholder="Tags, separated by commas" className="w-full mt-4 p-3 border rounded-lg text-center border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" autoFocus/>
                 </div>
            );
            case 6: return (
                <div>
                    <ProgressBar title={`New Prompt (${promptStep}/${totalPromptSteps}): Example Output`} />
                     <div className="flex items-center justify-center space-x-4 my-4">
                        <label className="flex items-center cursor-pointer text-gray-900 dark:text-gray-300"><input type="radio" name="p-outputType" value="text" checked={currentPrompt.outputType === 'text'} onChange={() => setCurrentPrompt(p=>({...p, outputType: 'text', exampleOutput: ''}))} /><span className="ml-2">Text</span></label>
                        <label className="flex items-center cursor-pointer text-gray-900 dark:text-gray-300"><input type="radio" name="p-outputType" value="image" checked={currentPrompt.outputType === 'image'} onChange={() => setCurrentPrompt(p=>({...p, outputType: 'image', exampleOutput: ''}))} /><span className="ml-2">Image</span></label>
                    </div>
                    {currentPrompt.outputType === 'image' ? (
                        <ImageUpload label="" onImageSelect={(val) => setCurrentPrompt(p => ({...p, exampleOutput: val}))} />
                    ) : (
                        <textarea rows={4} value={currentPrompt.exampleOutput} onChange={(e) => setCurrentPrompt(p => ({...p, exampleOutput: e.target.value}))} placeholder="Paste example output text." className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                    )}
                </div>
            );
            default: return null;
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={submitted ? "Submission Successful" : "Submit a New Collection"}>
            {submitted ? (
                <div className="text-center p-6 flex flex-col items-center space-y-4">
                    <CheckCircle size={56} className="text-green-500" />
                    <h3 className="text-2xl font-bold">Submitted for Review!</h3>
                    <p className="text-gray-600 dark:text-gray-300">Your collection will be available on the Marketplace once approved.</p>
                    <Button onClick={handleClose} className="mt-4">Close</Button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="min-h-[300px] flex items-center justify-center p-4">
                        {renderContent()}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                        <Button variant="secondary" onClick={step === 6 ? () => setStep(5) : handleBack} disabled={step === 1} icon={<ArrowLeft size={16} />}>Back</Button>
                        
                        {step < 5 && <Button onClick={handleNext} disabled={!isStepValid()} icon={<ArrowRight size={16}/>} className="!flex-row-reverse">Next</Button>}
                        {step === 5 && <Button onClick={handleSubmit} disabled={prompts.length === 0} icon={<Package size={16}/>}>Submit Collection</Button>}
                        {step > 5 && step < (5 + totalPromptSteps) && <Button onClick={handleNext} disabled={!isStepValid()} icon={<ArrowRight size={16}/>} className="!flex-row-reverse">Next</Button>}
                        {step === (5 + totalPromptSteps) && <Button onClick={handleAddPrompt} disabled={!isStepValid()}>Add Prompt to Collection</Button>}
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default SubmitCollectionModal;