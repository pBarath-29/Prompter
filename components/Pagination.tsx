import React from 'react';
import Button from './Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrev = () => {
    onPageChange(Math.max(currentPage - 1, 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(currentPage + 1, totalPages));
  };

  return (
    <div className="flex justify-center items-center space-x-2 sm:space-x-4 pt-4">
      <Button
        variant="secondary"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline ml-2">Previous</span>
      </Button>
      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="secondary"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        <span className="hidden sm:inline mr-2">Next</span>
        <ArrowRight size={16} />
      </Button>
    </div>
  );
};

export default Pagination;