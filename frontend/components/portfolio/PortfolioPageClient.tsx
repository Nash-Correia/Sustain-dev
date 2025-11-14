
// FILE: components/portfolio/PortfolioPageClient.tsx
"use client";

import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  CompanyListItem,
  portfolioAPI,
  type PortfolioData,
  type PortfolioHolding,
} from "../../lib/auth";
import { AuthContext, type AuthContextType } from "../../components/auth/AuthProvider";
import { calculatePortfolioStats } from "./portfolioUtils";
import PortfolioTabs from "./PortfolioTabs";
import PortfolioStatsCards from "./PortfolioStatsCards";
import PortfolioInputForm from "./PortfolioInputForm";
import PortfolioHoldingsTable from "./PortfolioHoldingsTable";

export interface PortfolioPageClientProps {
  initialCompanies: CompanyListItem[];
}
 
const sumPct = (list: Pick<PortfolioHolding, "aum_value">[]) =>
  list.reduce((acc, h) => acc + (typeof h.aum_value === "number" ? h.aum_value : 0), 0);

const clampPct = (n: number) => Math.max(0, Math.min(100, n));

const PortfolioPageClient: React.FC<PortfolioPageClientProps> = ({ initialCompanies }) => {
  const { isAuthenticated, loading } = useContext(AuthContext as React.Context<AuthContextType>);
  const [portfolios, setPortfolios] = useState<PortfolioData[]>([]);
  const [activePortfolioName, setActivePortfolioName] = useState<string>("Portfolio 1");
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Input state
  const [createBy, setCreateBy] = useState<"name" | "isin">("name");
  const [aumOption, setAUMOption] = useState<"with_aum" | "without_aum">("without_aum");
  const [isinInput, setIsinInput] = useState<string>("");
  const [aumInput, setAUMInput] = useState<string>("");
  const [selectedCompanies, setSelectedCompanies] = useState<CompanyListItem[]>([]);

  // Editing state
  const [editingHoldings, setEditingHoldings] = useState<PortfolioHolding[]>([]);

  const availableCompanyNames = useMemo(
    () => initialCompanies.map((c) => c.company_name),
    [initialCompanies]
  );

  const companyNameToIsin = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of initialCompanies) map.set(c.company_name, c.isin);
    return map;
  }, [initialCompanies]);

  const activePortfolio = useMemo<PortfolioData | undefined>(() => {
    return portfolios.find((p) => p.name === activePortfolioName);
  }, [portfolios, activePortfolioName]);

  const activeHoldings = useMemo<PortfolioHolding[]>(
    () => activePortfolio?.companies ?? [],
    [activePortfolio]
  );

  const { totalAUM, averageScore, averageRating } = useMemo(() => {
    return calculatePortfolioStats(activeHoldings);
  }, [activeHoldings]);

  // --- Data Fetching ---
  const fetchPortfolios = useCallback(async () => {
    if (loading || !isAuthenticated) return;
    setIsLoadingData(true);
    setError("");
    try {
      const data = await portfolioAPI.getPortfolios();
      setPortfolios(data);
      if (data.length > 0 && !data.some((p) => p.name === activePortfolioName)) {
        setActivePortfolioName(data[0].name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolios.");
    } finally {
      setIsLoadingData(false);
    }
  }, [isAuthenticated, activePortfolioName, loading]);

  useEffect(() => {
    void fetchPortfolios();
  }, [fetchPortfolios]);

  // --- Handlers ---
  const handlePortfolioChange = (name: string) => {
    setActivePortfolioName(name);
    setIsEditing(false);
  };

  const handleAddHolding = async () => {
    setError("");

    let companiesToAdd: { id_key: string; aum: number }[] = [];

    if (createBy === "name") {
      if (selectedCompanies.length === 0) {
        setError("Select at least one company.");
        return;
      }
      const entered = aumOption === "with_aum" ? Number(aumInput || "0") : 0;
      const pct = Number.isFinite(entered) ? clampPct(entered) : 0;

      companiesToAdd = selectedCompanies.map((c) => ({
        id_key: c.isin,
        aum: pct,
      }));
    } else {
      const lines = isinInput
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) {
        setError("Enter at least one ISIN.");
        return;
      }

      companiesToAdd = lines.map((line) => {
        const parts = line
          .split(/[,\s]+/)
          .map((p) => p.trim())
          .filter(Boolean);
        const isin = parts[0];
        if (aumOption === "with_aum") {
          const fallback = Number(aumInput || "0");
          const raw = parts.length > 1 ? Number(parts[1]) : fallback;
          const pct = Number.isFinite(raw) ? clampPct(raw) : 0;
          return { id_key: isin, aum: pct };
        }
        return { id_key: isin, aum: 0 };
      });
    }

    const currentTotal = sumPct(activeHoldings);
    const additionsTotal = companiesToAdd.reduce((a, c) => a + c.aum, 0);
    if (currentTotal + additionsTotal > 100.0001) {
      setError(
        `Total allocation would exceed 100%. Current: ${currentTotal.toFixed(
          2
        )}%, adding: ${additionsTotal.toFixed(2)}%.`
      );
      return;
    }

    const companies_data = JSON.stringify(
      companiesToAdd.map((c) => ({ id_key: c.id_key, aum: c.aum }))
    );

    try {
      await portfolioAPI.updatePortfolio({
        name: activePortfolioName,
        companies_data,
      });
      await fetchPortfolios();

      setIsinInput("");
      setAUMInput("");
      setSelectedCompanies([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update portfolio holdings.");
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditingHoldings(activeHoldings.map((h) => ({ ...h })));
    }
    setIsEditing((prev) => !prev);
  };

  const handleAUMChange = (id: number, value: string) => {
    const num = Number(value);
    const pct = Number.isFinite(num) ? clampPct(num) : 0;
    setEditingHoldings((prev) => prev.map((h) => (h.id === id ? { ...h, aum_value: pct } : h)));
  };

  const handleSaveEdit = async () => {
    setError("");

    const totalEdited = sumPct(editingHoldings);
    if (totalEdited > 100.0001) {
      setError(`Total allocation exceeds 100% (${totalEdited.toFixed(2)}%). Reduce and try again.`);
      return;
    }

    setIsLoadingData(true);
    try {
      await Promise.all(
        editingHoldings.map((h) => portfolioAPI.updateHoldingAUM(h.id, h.aum_value ?? 0))
      );
      await fetchPortfolios();
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRemoveHolding = async (holdingId: number) => {
    if (!window.confirm("Remove this company from the portfolio?")) return;
    setError("");
    setIsLoadingData(true);
    try {
      await portfolioAPI.deleteHolding(holdingId);
      await fetchPortfolios();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove holding.");
    } finally {
      setIsLoadingData(false);
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-green-500" size={32} />
        <span className="ml-3 text-lg text-gray-600">Loading Portfolio Data...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div className="text-center p-10 text-xl text-red-600">Please log in to manage your portfolio.</div>;
  }

  const currentHoldings = isEditing ? editingHoldings : activeHoldings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
            ESG Portfolio Builder
          </h1>
          <p className="text-slate-600">Build and analyze your sustainable investment portfolio</p>
        </div>

        <PortfolioTabs 
          activePortfolioName={activePortfolioName} 
          onPortfolioChange={handlePortfolioChange} 
        />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fadeIn">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <PortfolioStatsCards
          totalAUM={totalAUM}
          averageScore={averageScore}
          averageRating={averageRating}
        />

        <PortfolioInputForm
          activePortfolioName={activePortfolioName}
          createBy={createBy}
          aumOption={aumOption}
          isinInput={isinInput}
          aumInput={aumInput}
          selectedCompanies={selectedCompanies}
          availableCompanyNames={availableCompanyNames}
          companyNameToIsin={companyNameToIsin}
          initialCompanies={initialCompanies}
          isLoadingData={isLoadingData}
          onCreateByChange={setCreateBy}
          onAumOptionChange={setAUMOption}
          onIsinInputChange={setIsinInput}
          onAumInputChange={setAUMInput}
          onSelectedCompaniesChange={setSelectedCompanies}
          onAddHolding={handleAddHolding}
        />

        <PortfolioHoldingsTable
          activePortfolioName={activePortfolioName}
          currentHoldings={currentHoldings}
          isEditing={isEditing}
          onAUMChange={handleAUMChange}
          onRemoveHolding={handleRemoveHolding}
          onEditToggle={handleEditToggle}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setIsEditing(false)}
        />
      </div>
    </div>
  );
};

export default PortfolioPageClient;

