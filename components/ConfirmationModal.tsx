import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  confirmButtonVariant?: 'primary' | 'danger' | 'success';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  confirmButtonVariant = 'primary',
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start sm:items-center space-x-3">
          <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${confirmButtonVariant === 'danger' ? 'bg-red-100 dark:bg-red-900/50' : 'bg-primary-100 dark:bg-primary-900/50'}`}>
              <AlertTriangle className={`${confirmButtonVariant === 'danger' ? 'text-red-600 dark:text-red-300' : 'text-primary-600 dark:text-primary-300'}`} size={20} />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end pt-2 gap-2 sm:space-x-2">
            <Button
              variant={confirmButtonVariant}
              onClick={handleConfirm}
              className="w-full sm:w-auto"
            >
              {confirmButtonText}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;