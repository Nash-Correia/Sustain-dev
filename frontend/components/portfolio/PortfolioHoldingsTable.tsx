// FILE: components/portfolio/PortfolioHoldingsTable.tsx
import React from 'react';
import { Loader2, Trash2, Edit, Save, X } from 'lucide-react';
import { type PortfolioHolding } from '../../lib/auth';
import Button from '../ui/Button';
import Input from '../ui/Input';
import PortfolioTotals from './PortfolioTotals';

interface PortfolioHoldingsTableProps {
  activePortfolioName: string;
  currentHoldings: PortfolioHolding[];
  isEditing: boolean;
  onAUMChange: (id: number, value: string) => void;
  onRemoveHolding: (holdingId: number) => Promise<void>;
  onEditToggle: () => void;
  onSaveEdit: () => Promise<void>;
  onCancelEdit: () => void;
}

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
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState<number | null>(null);

  // Calculate portfolio totals
  const calculateTotals = () => {
    if (currentHoldings.length === 0) {
      return {
        totalAUM: '0.00',
        averageScore: 'N/A',
        averageRating: 'N/A'
      };
    }

    // Calculate total AUM percentage
    const totalAUM = currentHoldings.reduce((sum, holding) => {
      return sum + (holding.aum_value ?? 0);
    }, 0);

    // Calculate weighted average ESG score
    let weightedScoreSum = 0;
    let totalWeight = 0;

    currentHoldings.forEach(holding => {
      const score = Number(holding.esg_composite) || 0;
      const weight = holding.aum_value ?? 0;
      
      if (score > 0 && weight > 0) {
        weightedScoreSum += score * weight;
        totalWeight += weight;
      }
    });

    const averageScore = totalWeight > 0 
      ? (weightedScoreSum / totalWeight).toFixed(2)
      : 'N/A';

    // Determine overall rating based on average score
    const getOverallRating = (avgScore: number): string => {
      if (avgScore >= 90) return 'A+';
      if (avgScore >= 80) return 'A';
      if (avgScore >= 70) return 'B+';
      if (avgScore >= 60) return 'B';
      if (avgScore >= 50) return 'C+';
      if (avgScore >= 40) return 'C';
      return 'D';
    };

    const averageRating = averageScore !== 'N/A' 
      ? getOverallRating(parseFloat(averageScore))
      : 'N/A';

    return {
      totalAUM: totalAUM.toFixed(2),
      averageScore,
      averageRating
    };
  };

  const totals = calculateTotals();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveEdit();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (holdingId: number) => {
    setIsDeleting(holdingId);
    try {
      await onRemoveHolding(holdingId);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (currentHoldings.length === 0 && !isEditing) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 text-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          {activePortfolioName} is Empty
        </h3>
        <p className="text-slate-500">
          Use the form above to add your first company to the portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
      <div className="p-4 sm:p-6 flex justify-between items-center border-b border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">{activePortfolioName} Holdings</h2>
        <div className="flex space-x-2">
          {!isEditing && (
            <Button variant="outline" onClick={onEditToggle} className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit AUM
            </Button>
          )}
          {isEditing && (
            <>
              <Button onClick={handleSave} disabled={isSaving} className="flex items-center bg-green-600 hover:bg-green-700 text-white">
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="secondary" onClick={onCancelEdit} disabled={isSaving} className="flex items-center">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/3">
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/6">
                ISIN
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-1/6">
                ESG Score
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-1/6">
                ESG Rating
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-1/12">
                AUM %
              </th>
              {isEditing && (
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-1/12">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {currentHoldings.map((holding) => (
              <tr key={holding.id} className="hover:bg-green-50/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {holding.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {holding.isin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                  {holding.esg_composite !== null && holding.esg_composite !== undefined 
                    ? Number(holding.esg_composite).toFixed(2) 
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {holding.esg_rating ?? 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={holding.aum_value?.toString() ?? '0'}
                      onChange={(e) => onAUMChange(holding.id, e.target.value)}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-20 text-right p-1 text-sm border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      disabled={isSaving}
                    />
                  ) : (
                    <span className="font-semibold text-slate-700">
                      {holding.aum_value !== null ? holding.aum_value.toFixed(2) : '0.00'}%
                    </span>
                  )}
                </td>
                {isEditing && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(holding.id)}
                      disabled={isSaving || isDeleting === holding.id}
                      className="p-2 h-auto"
                    >
                      {isDeleting === holding.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PortfolioTotals 
        totalAUM={totals.totalAUM}
        averageScore={totals.averageScore}
        averageRating={totals.averageRating}
      />
    </div>
  );
};

export default PortfolioHoldingsTable;