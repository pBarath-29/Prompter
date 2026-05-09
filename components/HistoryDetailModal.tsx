import React, { useState } from 'react';
// FIX: Changed import from '../constants' to '../types' as types are now consolidated in types.ts.
import { HistoryItem } from '../types';
import Modal from './Modal';
import Button from './Button';
import { Copy, Check, Tag as TagIcon } from 'lucide-react';

interface HistoryDetailModalProps {
  item: HistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ item, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.title}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {item.tags.map(tag => (
            <span key={tag} className="flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-xs rounded-md">
              <TagIcon size={12} className="mr-1.5"/>
              {tag}
            </span>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Prompt</h3>
          <div className="relative p-4 bg-gray-100 dark:bg-gray-900 rounded-lg max-h-64 overflow-y-auto">
            <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{item.prompt}</p>
            <button
              onClick={() => handleCopy(item.prompt)}
              className={`absolute top-2 right-2 p-2 rounded-lg transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              title={copied ? "Copied!" : "Copy prompt"}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 mt-2 border-t dark:border-gray-700">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
};

export default HistoryDetailModal;