import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item'
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    if (confirmationStep === 1) {
      setConfirmationStep(2);
      return;
    }
    
    if (confirmationStep === 2) {
      if (confirmText !== 'DELETE') {
        return;
      }
      setConfirmationStep(3);
      return;
    }
    
    // Final confirmation
    setIsDeleting(true);
    setTimeout(() => {
      onConfirm();
      resetModal();
    }, 500);
  };

  const resetModal = () => {
    setConfirmText('');
    setConfirmationStep(1);
    setIsDeleting(false);
    onClose();
  };

  // Calculate button colors based on confirmation step
  const buttonColors = () => {
    if (isDeleting) return "bg-gray-400 cursor-not-allowed";
    
    switch (confirmationStep) {
      case 1:
        return "bg-yellow-500 hover:bg-yellow-600";
      case 2:
        return confirmText === 'DELETE' 
          ? "bg-orange-500 hover:bg-orange-600" 
          : "bg-gray-400 cursor-not-allowed";
      case 3:
        return "bg-red-600 hover:bg-red-700";
      default:
        return "bg-red-500 hover:bg-red-600";
    }
  };

  // Get the confirmation message based on the step
  const getConfirmationMessage = () => {
    switch (confirmationStep) {
      case 1:
        return `Are you sure you want to delete this ${itemType}?`;
      case 2:
        return `Type "DELETE" to confirm removal of this ${itemType}:`;
      case 3:
        return `This is your final warning! This action cannot be undone.`;
      default:
        return `Delete this ${itemType}?`;
    }
  };

  // Get the button text based on the step
  const getButtonText = () => {
    if (isDeleting) return "Deleting...";
    
    switch (confirmationStep) {
      case 1:
        return "I want to delete this";
      case 2:
        return "Continue with deletion";
      case 3:
        return "Yes, permanently delete";
      default:
        return "Delete";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md m-4 relative">
        <button
          onClick={resetModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          disabled={isDeleting}
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center mb-4 text-red-600">
          <AlertTriangle size={24} className="mr-2" />
          <h3 className="text-xl font-bold">Delete Confirmation</h3>
        </div>
        
        <div className="mb-6">
          <p className="mb-2">{getConfirmationMessage()}</p>
          <p className="font-bold">{itemName}</p>
          
          {confirmationStep === 2 && (
            <div className="mt-4">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full p-2 border rounded"
                disabled={isDeleting}
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={resetModal}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800"
            disabled={isDeleting}
          >
            Cancel
          </button>
          
          <button
            onClick={handleConfirmClick}
            className={`px-4 py-2 rounded text-white ${buttonColors()} transition-colors duration-200`}
            disabled={(confirmationStep === 2 && confirmText !== 'DELETE') || isDeleting}
          >
            {isDeleting && (
              <span className="inline-block animate-spin mr-2">↻</span>
            )}
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;