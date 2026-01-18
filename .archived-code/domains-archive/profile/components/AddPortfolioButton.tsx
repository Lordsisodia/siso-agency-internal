import React from 'react';

export const AddPortfolioButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={onClick}>Add Portfolio</button>
);

export default AddPortfolioButton;
