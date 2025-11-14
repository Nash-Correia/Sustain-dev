// FILE: components/portfolio/PortfolioSection.tsx
"use client";

import React, { useState } from "react";
import PortfolioTabs from "./PortfolioTabs";
import PortfolioInputForm from "./PortfolioInputForm";
import type { CompanyListItem } from "../../lib/auth";

const PORTFOLIO_NAMES = ["Portfolio 1", "Portfolio 2", "Portfolio 3"] as const;
type PortfolioName = (typeof PORTFOLIO_NAMES)[number];

type PortfolioState = {
  createBy: "name" | "isin";
  aumOption: "with_aum" | "without_aum";
  isinInput: string;
  aumInput: string;
  selectedCompanies: CompanyListItem[];
};

type PortfolioSectionProps = {
  allCompanies: CompanyListItem[];          // full company list
  availableCompanyNames: string[];          // names only
  companyNameToIsin: Map<string, string>;   // name -> ISIN
  isLoadingData: boolean;
};

const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  allCompanies,
  availableCompanyNames,
  companyNameToIsin,
  isLoadingData,
}) => {
  const [activePortfolioName, setActivePortfolioName] =
    useState<PortfolioName>("Portfolio 1");

  const [portfolioStates, setPortfolioStates] = useState<
    Record<PortfolioName, PortfolioState>
  >(() => ({
    "Portfolio 1": {
      createBy: "name",
      aumOption: "without_aum",
      isinInput: "",
      aumInput: "",
      selectedCompanies: [],
    },
    "Portfolio 2": {
      createBy: "name",
      aumOption: "without_aum",
      isinInput: "",
      aumInput: "",
      selectedCompanies: [],
    },
    "Portfolio 3": {
      createBy: "name",
      aumOption: "without_aum",
      isinInput: "",
      aumInput: "",
      selectedCompanies: [],
    },
  }));

  const current = portfolioStates[activePortfolioName];

  const updateCurrentPortfolio = (patch: Partial<PortfolioState>) => {
    setPortfolioStates((prev) => ({
      ...prev,
      [activePortfolioName]: {
        ...prev[activePortfolioName],
        ...patch,
      },
    }));
  };

  const handleAddHolding = () => {
    // plug your save logic here
    console.log(
      "Add holdings for",
      activePortfolioName,
      current.selectedCompanies
    );
  };

  return (
    <div className="space-y-6">
      {/* Tabs with working state */}
      <PortfolioTabs
        activePortfolioName={activePortfolioName}
        //portfolioNames={[...PORTFOLIO_NAMES]}
        onPortfolioChange={(name) =>
          setActivePortfolioName(name as PortfolioName)
        }
      />

      {/* Form bound to active portfolio’s state */}
      <PortfolioInputForm
        activePortfolioName={activePortfolioName}
        createBy={current.createBy}
        aumOption={current.aumOption}
        isinInput={current.isinInput}
        aumInput={current.aumInput}
        selectedCompanies={current.selectedCompanies}
        availableCompanyNames={availableCompanyNames}
        companyNameToIsin={companyNameToIsin}
        initialCompanies={allCompanies}
        isLoadingData={isLoadingData}
        onCreateByChange={(value) => updateCurrentPortfolio({ createBy: value })}
        onAumOptionChange={(value) =>
          updateCurrentPortfolio({ aumOption: value })
        }
        onIsinInputChange={(value) =>
          updateCurrentPortfolio({ isinInput: value })
        }
        onAumInputChange={(value) =>
          updateCurrentPortfolio({ aumInput: value })
        }
        onSelectedCompaniesChange={(companies) =>
          updateCurrentPortfolio({ selectedCompanies: companies })
        }
        onAddHolding={handleAddHolding}
      />
    </div>
  );
};

export default PortfolioSection;
