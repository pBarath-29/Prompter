import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { AI_MODELS, CATEGORIES, AIModel, Category, Prompt } from '../types';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import ImageUpload from './ImageUpload';
import CustomDropdown from './CustomDropdown';

interface SubmitPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Prompt, 'id' | 'author' | 'upvotes' | 'downvotes' | 'comments' | 'createdAt' | 'status'>) => void;
}

const initialFormData = {
  title: '',
  prompt: '',
  description: '',
  category: 'Education' as Category,
  model: 'Gemini' as AIModel,
  tags: '',
  exampleOutput: '',
  outputType: 'text' as 'text' | 'image',
};

const ProgressBar: React.FC<{ current: number, total: number }> = ({ current, total }) => {
    const percentage = ((current -1) / (total -1)) * 100;
    return (
        <div>
            <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Step {current} of {total}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const SubmitPromptModal: React.FC<SubmitPromptModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 7;

  useEffect(() => {
    if (isOpen) {
        const isTraditionallyImageModel = formData.model === 'MidJourney' || formData.model === 'DALL-E';
        if (isTraditionallyImageModel && formData.outputType !== 'image') {
            setFormData(prev => ({ ...prev, outputType: 'image', exampleOutput: '' }));
        } else if (!isTraditionallyImageModel && formData.outputType !== 'text') {
            setFormData(prev => ({ ...prev, outputType: 'text', exampleOutput: '' }));
        }
    }
  }, [step, formData.model, isOpen]);

  const resetForm = () => {
    setFormData(initialFormData);
    setStep(1);
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    onSubmit({
      title: formData.title,
      prompt: formData.prompt,
      description: formData.description,
      category: formData.category,
      model: formData.model,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isPublic: true,
      exampleOutput: formData.exampleOutput.trim(),
    });
    setSubmitted(true);
  };
  
  const handleClose = () => {
    resetForm();
    setSubmitted(false);
    onClose();
  };
  
  const isStepValid = () => {
      switch(step) {
          case 1: return formData.title.trim() !== '';
          case 2: return formData.prompt.trim() !== '';
          case 3: return formData.description.trim() !== '';
          case 6: return formData.exampleOutput.trim() !== '';
          default: return true;
      }
  }
  
  const categoryOptions = CATEGORIES.map(c => ({ value: c, label: c }));
  const modelOptions = AI_MODELS.map(m => ({ value: m, label: m }));

  const renderStep = () => {
      switch(step) {
          case 1:
              return (
                  <div>
                      <h3 className="text-xl font-semibold mb-4 text-center">What's a catchy title for your prompt?</h3>
                      <input 
                          id="title" 
                          type="text" 
                          value={formData.title} 
                          onChange={e => setFormData(prev => ({...prev, title: e.target.value}))} 
                          placeholder="e.g., Ultimate Essay Writing Assistant"
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 text-center dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          autoFocus
                      />
                  </div>
              );
          case 2:
              return (
                  <div>
                      <h3 className="text-xl font-semibold mb-4 text-center">Great. Now, what's the full prompt text?</h3>
                      <textarea
                          id="prompt"
                          rows={8}
                          value={formData.prompt}
                          onChange={(e) => setFormData(prev => ({...prev, prompt: e.target.value}))}
                          placeholder="Enter the full prompt text here..."
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 font-mono text-sm dark:text-white dark:placeholder-gray-400"
                          autoFocus
                      />
                  </div>
              );
          case 3:
              return (
                  <div>
                      <h3 className="text-xl font-semibold mb-4 text-center">Perfect. Briefly describe what this prompt does.</h3>
                      <textarea
                          id="description"
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                          placeholder="This helps others understand its purpose."
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          autoFocus
                      />
                  </div>
              );
          case 4:
              return (
                  <div>
                      <h3 className="text-xl font-semibold mb-4 text-center">Let's categorize it.</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <CustomDropdown
                            label="Category"
                            options={categoryOptions}
                            value={formData.category}
                            onChange={v => setFormData(prev => ({...prev, category: v as Category}))}
                           />
                           <CustomDropdown
                            label="AI Model"
                            options={modelOptions}
                            value={formData.model}
                            onChange={v => setFormData(prev => ({...prev, model: v as AIModel}))}
                           />
                      </div>
                  </div>
              );
          case 5:
               return (
                  <div>
                      <h3 className="text-xl font-semibold mb-4 text-center">Add some tags to help others find it.</h3>
                       <input 
                          id="tags" 
                          type="text" 
                          value={formData.tags} 
                          onChange={e => setFormData(prev => ({...prev, tags: e.target.value}))}
                          placeholder="e.g., Academic, Students, Writing"
                          className="w-full p-3 border rounded-lg text-center border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                          autoFocus
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Separate tags with a comma.</p>
                  </div>
              );
          case 6:
              return (
                  <div>
                      <h3 className="text-xl font-semibold mb-2 text-center">Provide an example output.</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">This is required and helps others understand what to expect.</p>
                      <div className="flex items-center justify-center space-x-4 mb-4">
                          <label className="flex items-center cursor-pointer text-gray-900 dark:text-gray-300">
                              <input type="radio" name="outputType" value="text" checked={formData.outputType === 'text'} onChange={() => setFormData(prev=>({...prev, outputType: 'text', exampleOutput: ''}))} />
                              <span className="ml-2">Text</span>
                          </label>
                          <label className="flex items-center cursor-pointer text-gray-900 dark:text-gray-300">
                              <input type="radio" name="outputType" value="image" checked={formData.outputType === 'image'} onChange={() => setFormData(prev=>({...prev, outputType: 'image', exampleOutput: ''}))} />
                              <span className="ml-2">Image</span>
                          </label>
                      </div>
                      {formData.outputType === 'image' ? (
                          <ImageUpload label="" onImageSelect={(val) => setFormData(prev => ({...prev, exampleOutput: val}))} />
                      ) : (
                          <textarea rows={4} value={formData.exampleOutput} onChange={(e) => setFormData(prev => ({...prev, exampleOutput: e.target.value}))} placeholder="Paste or write an example output text." className="w-full p-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                      )}
                  </div>
              );
          case 7:
              return (
                  <div>
                      <h3 className="text-xl font-semibold mb-4 text-center">Ready to submit?</h3>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-3 text-sm max-h-64 overflow-y-auto">
                          <p><strong>Title:</strong> {formData.title}</p>
                          <p><strong>Category:</strong> {formData.category}</p>
                          <p><strong>Model:</strong> {formData.model}</p>
                          <p><strong>Description:</strong> {formData.description}</p>
                          <p><strong>Tags:</strong> {formData.tags}</p>
                      </div>
                  </div>
              );
          default:
              return null;
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={submitted ? "Submission Successful" : "Submit a New Prompt"}>
      {submitted ? (
        <div className="text-center p-6 flex flex-col items-center space-y-4">
            <CheckCircle size={56} className="text-green-500" />
            <h3 className="text-2xl font-bold">Submitted for Review!</h3>
            <p className="text-gray-600 dark:text-gray-300">
                Your prompt will appear on the community page once approved.
            </p>
            <Button onClick={handleClose} className="mt-4">Close</Button>
        </div>
      ) : (
        <div className="space-y-6">
            <ProgressBar current={step} total={totalSteps} />
            <div className="min-h-[250px] flex items-center justify-center p-4">
                {renderStep()}
            </div>
            <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                <Button variant="secondary" onClick={handleBack} disabled={step === 1} icon={<ArrowLeft size={16}/>}>
                    Back
                </Button>
                {step < totalSteps ? (
                    <Button onClick={handleNext} disabled={!isStepValid()} icon={<ArrowRight size={16} />} className="!flex-row-reverse">
                        Next
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={!isStepValid()}>
                        Submit for Review
                    </Button>
                )}
            </div>
        </div>
      )}
    </Modal>
  );
};

export default SubmitPromptModal;