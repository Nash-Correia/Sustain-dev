
// FILE: components/portfolio/PortfolioTabs.tsx
import React from 'react';

interface PortfolioTabsProps {
  activePortfolioName: string;
  onPortfolioChange: (name: string) => void;
}

const PortfolioTabs: React.FC<PortfolioTabsProps> = ({ 
  activePortfolioName, 
  onPortfolioChange 
}) => {
  const portfolioNames = ['Portfolio 1', 'Portfolio 2', 'Portfolio 3'];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-2 flex gap-2">
      {portfolioNames.map(name => (
        <button
          key={name}
          onClick={() => onPortfolioChange(name)}
          className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            activePortfolioName === name
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default PortfolioTabs;
