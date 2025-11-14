// components/portfolio/PortfolioTotals.tsx
import React from "react";

export interface PortfolioTotalsProps {
  totalAUM: string;       // now total allocation %, prop name preserved
  averageScore: string;
  averageRating: string;
}

const PortfolioTotals: React.FC<PortfolioTotalsProps> = ({
  totalAUM,
  averageScore,
  averageRating,
}) => {
  return ( 
    <div className="bg-green-50 p-4 rounded-lg mt-4 flex justify-between items-center shadow-md">
      <div className="text-lg font-bold text-gray-800">Portfolio Totals:</div>
      <div className="grid grid-cols-3 gap-4 text-gray-700 font-semibold">
        <div>
          Total Allocation: <span className="text-green-700">{Number(totalAUM).toFixed(2)}%</span>
        </div>
        <div>
          Weighted Avg. Score: <span className="text-green-700">{averageScore}</span>
        </div>
        <div>
          Overall Rating:{" "}
          <span
            className={
              "px-3 py-1 rounded-full text-white " +
              (averageRating === "A+"
                ? "bg-rating-a-plus"
                : averageRating === "A"
                ? "bg-rating-a"
                : averageRating === "B+"
                ? "bg-rating-b-plus"
                : averageRating === "B"
                ? "bg-rating-b"
                : averageRating === "C+"
                ? "bg-rating-c-plus"
                : averageRating === "C"
                ? "bg-rating-c"
                : "bg-rating-d")
            }
          >
            {averageRating}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioTotals;
