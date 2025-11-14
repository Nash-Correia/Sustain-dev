// frontend/components/product/comparison/details/FundDetails.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { CompanyDataRow, FundDataRow } from "@/lib/excel-data";
import {
  formatNumber,
  // getColumnStats, // Removed, no longer needed
  // getExtremeChipClass, // Removed, no longer needed
} from "../../productUtils";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import FundCompanyHoldingsTable from "../FundCompanyHoldingsTable"; // NEW IMPORT

type Props = {
  fund: FundDataRow | null;
  allCompanyData: CompanyDataRow[];
  handleAddFundToList: (fund: FundDataRow) => void; // kept for parity, not used here now
};

export default function FundDetails({ fund, allCompanyData }: Props) {
// add this near the top of the component (after props)
const hasFund = !!(fund?.fundName && fund.fundName.trim());

// REMOVED: isExpanded state, useEffect, rows, totalCompanies, pageStats

const avgScore = fund?.score ?? 0;

// REMOVED: pageStats calculation

  // Header helper: label and tooltip icon are now inline.
  const Header = ({
    children,
    tip,
    align = "center",
  }: {
    children: React.ReactNode;
    tip:
      | "esgPillarScore"
      | "esgCompositeScore"
      | "esgRating"
      | "environmentalPillar"
      | "socialPillar"
      | "governancePillar"
      | "positiveScreen"
      | "negativeScreen"
      | "controversyRating";
    align?: "left" | "center" | "right";
  }) => {
    const alignCls =
      align === "left"
        ? "justify-start text-left"
        : align === "right"
        ? "justify-end text-right"
        : "justify-center text-center";
    return (
      <div
        className={`relative flex flex-row items-center gap-1 ${alignCls} px-2 py-2 leading-snug`}
      >
        <span className="font-bold text-gray-700 whitespace-normal">
          {children}
        </span>
        <InfoTooltip id={tip} align="center" panelWidthClass="w-72" />
      </div>
    );
  };
if (!hasFund) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-large p-2 sm:p-6">
      {/* Overview tiles */}
<div className="mx-auto max-w-3xl">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 auto-rows-fr">
    {/* Average ESG Composite Score */}
    <div className="group h-full flex items-center gap-4 p-5 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex-shrink-0 rounded-full p-3 sm:p-3.5 bg-teal-100 ring-1 ring-teal-200/60">
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-teal-600"
        >
          <path d="M0 0h24v24H0z" stroke="none" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
          <path d="M13.41 10.59l4.59 -4.59" />
          <path d="M7 12a5 5 0 0 1 5 -5" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tabular-nums">
          {formatNumber(avgScore)}
        </p>
        <p className="mt-1 text-sm text-gray-600 font-medium inline-flex items-center gap-1 leading-snug">
          <span className="truncate">Weighted ESG Composite Score</span>
          <span className="-translate-y-[1px] inline-flex">
            <InfoTooltip
              id="fundWeightedCompositeScore"
              align="left"
              panelWidthClass="w-72"
            />
          </span>
        </p>
      </div>
    </div>

    {/* ESG Rating */}
    <div className="group h-full flex items-center gap-4 p-5 sm:p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex-shrink-0 rounded-full p-3 sm:p-3.5 bg-cyan-100 ring-1 ring-cyan-200/60">
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cyan-600"
        >
          <path d="M3 21h18" />
          <path d="M5 21v-14l8 -4v18" />
          <path d="M19 21v-10l-6 -4" />
          <path d="M9 9v0" />
          <path d="M9 12v0" />
          <path d="M9 15v0" />
          <path d="M9 18v0" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          {fund.grade}
        </p>
        <p className="mt-1 text-sm text-gray-600 font-medium leading-snug">ESG Rating</p>
      </div>
    </div>
  </div>
</div>


      {/* Removed Toggle button, as the new table handles its own content visibility */}

      {/* NEW: Companies holdings table driven by ISIN list */}
      {fund && (
        <FundCompanyHoldingsTable fund={fund} allCompanyData={allCompanyData} />
      )}
    </div>
  );
}