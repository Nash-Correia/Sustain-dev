// frontend/components/product/comparison/details/FundCompanyHoldingsTable.tsx

"use client";

import React, { useMemo, useState } from "react";
import type { CompanyDataRow, FundDataRow } from "@/lib/excel-data";
import { formatNumber, getColumnStats, getExtremeChipClass } from "../productUtils";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface FundCompanyHoldingsTableProps {
  fund: FundDataRow;
  allCompanyData: CompanyDataRow[];
}

export default function FundCompanyHoldingsTable({
  fund,
  allCompanyData,
}: FundCompanyHoldingsTableProps) {
  // hooks first
  const [isExpanded, setIsExpanded] = useState(false);

  // map ISIN -> company
  const companyMap = useMemo(() => {
    const map = new Map<string, CompanyDataRow>();
    for (const c of allCompanyData) {
      if (c.isin) map.set(c.isin.trim().toUpperCase(), c);
    }
    return map;
  }, [allCompanyData]);

  // parse ISINs and collect companies
  const fundCompanies = useMemo<CompanyDataRow[]>(() => {
    if (!fund.companyIsins) return [];
    const isinList = fund.companyIsins
      .split(",")
      .map((x) => x.trim().toUpperCase())
      .filter((v, i, a) => v && a.indexOf(v) === i);

    const rows: CompanyDataRow[] = [];
    for (const isin of isinList) {
      const row = companyMap.get(isin);
      if (row) rows.push(row);
    }
    return rows;
  }, [fund.companyIsins, companyMap]);

  // ---- STATS HOOKS MUST BE BEFORE ANY RETURN ----
  const numericColumns = [
    "composite",
    "esgScore",
    "e_score",
    "s_score",
    "g_score",
  ] as const satisfies readonly (keyof CompanyDataRow)[];

  const pageStats = useMemo(
    () => getColumnStats(fundCompanies, numericColumns),
    [fundCompanies, numericColumns]
  );
  // ------------------------------------------------

  const hasCompanies = fundCompanies.length > 0;
  if (!hasCompanies) {
    return (
      <section className="bg-white sm:p-8 mt-4">

        <div className="text-center py-8 text-lg text-gray-500">
          No company data available for this fund.
        </div>
      </section>
    );
  }

  // Header (same as Sector Details)
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
      <div className={`relative flex flex-row items-center gap-1 ${alignCls} px-2 py-2 leading-snug`}>
        <span className="font-bold text-gray-700 whitespace-normal">{children}</span>
        <InfoTooltip id={tip} align="center" panelWidthClass="w-72" />
      </div>
    );
  };

  return (
    <section className="bg-white rounded-large ">
      {/* <h3 className="text-xl font-bold text-brand-dark mb-4">
        Company Holdings for {fund.fundName}
      </h3> */}

      {/* Toggle (same as Sector Details) */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all"
        >
          {isExpanded ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {/* Table (collapsed/expanded like Sector Details) */}
      <div className="relative h-[400px] overflow-auto rounded-lg border border-gray-200 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-600">
        <table className={`w-full table-auto ${isExpanded ? "text-xs" : "text-sm"}`}>
          {!isExpanded ? (
            <thead className="sticky top-0 bg-gray-100">
              <tr className="align-middle">
                <th className="text-left p-3 font-bold text-gray-700">Company</th>
                <th className="text-center p-2">
                  <Header tip="esgPillarScore">ESG Pillar Score</Header>
                </th>
                <th className="text-center p-2">
                  <Header tip="esgCompositeScore">ESG Composite Score</Header>
                </th>
                <th className="text-center p-2">
                  <Header tip="esgRating">ESG Rating</Header>
                </th>
              </tr>
            </thead>
          ) : (
            <thead className="sticky top-0 bg-gray-100">
              <tr className="align-middle">
                <th className="text-left p-2 font-bold text-gray-700">Company</th>
                <th className="text-center p-1">
                  <Header tip="environmentalPillar">E-Pillar Score</Header>
                </th>
                <th className="text-center p-1">
                  <Header tip="socialPillar">S-Pillar Score</Header>
                </th>
                <th className="text-center p-1">
                  <Header tip="governancePillar">G-Pillar Score</Header>
                </th>
                <th className="text-center p-1">
                  <Header tip="esgPillarScore">ESG Pillar Score</Header>
                </th>
                <th className="text-center p-1">
                  <Header tip="positiveScreen">Positive Screen</Header>
                </th>
                <th className="text-center p-1">
                  <Header tip="negativeScreen">Negative Screen</Header>
                </th>
                <th className="text-center p-1">
                  <Header tip="controversyRating">Controversy Rating</Header>
                </th>
                <th className="text-center p-1">
                  <Header tip="esgCompositeScore">ESG Composite Score</Header>
                </th>
                <th className="text-center p-1">
                  <Header tip="esgRating">ESG Rating</Header>
                </th>
              </tr>
            </thead>
          )}

          <tbody>
            {fundCompanies.map((row, index) =>
              !isExpanded ? (
                <tr
                  key={`${row.isin || row.companyName}-${index}-collapsed`}
                  className="border-b border-gray-100 hover:bg-gray-50 h-12"
                >
                  <td className="p-3 font-medium text-gray-800">{row.companyName}</td>
                  <td className="p-3 text-center">
                    <span className={getExtremeChipClass("esgScore", row.esgScore, pageStats)}>
                      {formatNumber(row.esgScore ?? 0)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={getExtremeChipClass("composite", row.composite, pageStats)}>
                      {formatNumber(row.composite ?? 0)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {row.grade ?? "-"}
                    </span>
                  </td>
                </tr>
              ) : (
                <tr
                  key={`${row.isin || row.companyName}-${index}-expanded`}
                  className="border-b border-gray-100 hover:bg-gray-50 h-12"
                >
                  <td className="p-2 font-medium text-gray-800">{row.companyName}</td>
                  <td className="p-2 text-center">
                    <span className={getExtremeChipClass("e_score", row.e_score, pageStats)}>
                      {formatNumber(row.e_score ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={getExtremeChipClass("s_score", row.s_score, pageStats)}>
                      {formatNumber(row.s_score ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={getExtremeChipClass("g_score", row.g_score, pageStats)}>
                      {formatNumber(row.g_score ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className={getExtremeChipClass("esgScore", row.esgScore, pageStats)}>
                      {formatNumber(row.esgScore ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">{row.positive || "-"}</td>
                  <td className="p-2 text-center">{row.negative || "-"}</td>
                  <td className="p-2 text-center">{row.controversy || "-"}</td>
                  <td className="p-2 text-center">
                    <span className={getExtremeChipClass("composite", row.composite, pageStats)}>
                      {formatNumber(row.composite ?? 0)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className="px-2 py-1 rounded-full font-semibold bg-gray-100 text-gray-700">
                      {row.grade ?? "-"}
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Only companies with data in the IiAS rated universe are displayed.
      </p>
    </section>
  );
}
