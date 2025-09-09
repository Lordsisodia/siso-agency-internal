/**
 * 📦 Modal Component
 */

import React from 'react';

export const AI_INTERFACE = {
  purpose: "Generic modal component",
  exports: ["Modal"],
  patterns: ["ui-component"]
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
