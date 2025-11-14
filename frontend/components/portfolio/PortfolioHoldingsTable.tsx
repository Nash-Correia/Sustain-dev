
// FILE: components/portfolio/PortfolioHoldingsTable.tsx
import React from "react";
import { Edit, Save, Trash2, PieChart } from "lucide-react";
import type { PortfolioHolding } from "../../lib/auth";
import { getEsgCompositeAsNumber } from "./portfolioUtils";

export interface PortfolioHoldingsTableProps {
  activePortfolioName: string;
  currentHoldings: PortfolioHolding[];
  isEditing: boolean;
  onAUMChange: (id: number, value: string) => void;
  onRemoveHolding: (holdingId: number) => void;
  onEditToggle: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

const ratingColors: Record<string, string> = {
  "A+": "bg-rating-a-plus",
  "A": "bg-rating-a",
  "B+": "bg-rating-b-plus",
  "B": "bg-rating-b",
  "C+": "bg-rating-c-plus",
  "C": "bg-rating-c",
  "D": "bg-rating-d",
};

const PortfolioHoldingsTable: React.FC<PortfolioHoldingsTableProps> = ({
  activePortfolioName,
  currentHoldings,
  isEditing,
  onAUMChange,
  onRemoveHolding,
  onEditToggle,
  onSaveEdit,
  onCancelEdit,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Holdings</h2>
          <p className="text-sm text-slate-500">
            {currentHoldings.length} companies in &quot;{activePortfolioName}&quot;
          </p>
        </div>
        
        {currentHoldings.length > 0 && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={onSaveEdit}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:bg-green-700 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-5 py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={onEditToggle}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 hover:bg-slate-200"
              >
                <Edit className="w-4 h-4" />
                Edit Allocations
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {currentHoldings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  ISIN
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  ESG Score
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Allocation
                </th>
                {isEditing && (
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentHoldings.map((holding) => {
                const score = getEsgCompositeAsNumber(holding.esg_composite);
                const ratingClass = ratingColors[holding.esg_rating ?? "D"] || ratingColors["D"];

                return (
                  <tr 
                    key={holding.id} 
                    className={`transition-colors duration-150 ${
                      isEditing ? 'hover:bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{holding.company_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {holding.isin}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-800">
                        {score !== null ? score.toFixed(2) : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span 
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${ratingClass}`}
                      >
                        {holding.esg_rating || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end">
                          <div className="relative w-28">
                            <input
                              type="number"
                              value={
                                typeof holding.aum_value === "number"
                                  ? holding.aum_value
                                  : ""
                              }
                              onChange={(e) => onAUMChange(holding.id, e.target.value)}
                              min="0"
                              max="100"
                              step="0.01"
                              title="Enter the AUM value" // Add a title attribute
                              placeholder="Enter the AUM value"
                              className="w-full px-3 py-1.5 pr-8 text-sm border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                              %
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-slate-800">
                          {typeof holding.aum_value === "number" 
                            ? holding.aum_value.toFixed(2) 
                            : "0.00"
                          }%
                        </span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => onRemoveHolding(holding.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          type="button"
                          title="Remove Holding"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <PieChart className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">No Holdings Yet</h3>
          <p className="text-slate-500 mb-6">Start building your portfolio by adding companies above</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioHoldingsTable;
