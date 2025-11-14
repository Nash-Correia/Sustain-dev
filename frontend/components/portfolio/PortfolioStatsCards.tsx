
// FILE: components/portfolio/PortfolioStatsCards.tsx
import React from "react";
import { PieChart, TrendingUp, Award } from "lucide-react";

export interface PortfolioStatsCardsProps {
  totalAUM: string;
  averageScore: string;
  averageRating: string;
}

const PortfolioStatsCards: React.FC<PortfolioStatsCardsProps> = ({
  totalAUM,
  averageScore,
  averageRating,
}) => {
  const totalAllocation = Number(totalAUM);
  const avgScore = Number(averageScore);
  
  const getRatingCategory = (rating: string) => {
    const categories: Record<string, string> = {
      "A+": "Leadership",
      "A": "Advanced",
      "B+": "Good",
      "B": "Progressing",
      "C+": "Average",
      "C": "Basic",
      "D": "Nascent"
    };
    return categories[rating] || "N/A";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Allocation Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-2">
          <PieChart className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-90">Total Allocation</span>
        </div>
        <div className="text-3xl font-bold">{totalAllocation.toFixed(2)}%</div>
        <div className={`text-xs mt-1 ${totalAllocation <= 100 ? 'text-blue-100' : 'text-yellow-200'}`}>
          {totalAllocation <= 100 ? 'Within limit' : '⚠ Exceeds 100%'}
        </div>
      </div>

      {/* Average ESG Score Card */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-90">Average ESG Score</span>
        </div>
        <div className="text-3xl font-bold">{avgScore.toFixed(2)}</div>
        <div className="text-xs mt-1 text-purple-100">Weighted by allocation</div>
      </div>

      {/* Portfolio Rating Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-5 h-5 opacity-80" />
          <span className="text-sm font-medium opacity-90">Portfolio Rating</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold">{averageRating}</span>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {getRatingCategory(averageRating)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioStatsCards;

