// FILE: components/portfolio/PortfolioInputForm.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, ChevronDown } from "lucide-react";
import type { CompanyListItem } from "../../lib/auth";

export interface PortfolioInputFormProps {
  activePortfolioName: string;
  createBy: "name" | "isin";
  aumOption: "with_aum" | "without_aum";
  isinInput: string;
  aumInput: string;
  selectedCompanies: CompanyListItem[];
  availableCompanyNames: string[];
  companyNameToIsin: Map<string, string>;
  initialCompanies: CompanyListItem[];
  isLoadingData: boolean;
  onCreateByChange: (value: "name" | "isin") => void;
  onAumOptionChange: (value: "with_aum" | "without_aum") => void;
  onIsinInputChange: (value: string) => void;
  onAumInputChange: (value: string) => void;
  onSelectedCompaniesChange: (companies: CompanyListItem[]) => void;
  onAddHolding: () => void;
}

const PortfolioInputForm: React.FC<PortfolioInputFormProps> = ({
  activePortfolioName,
  createBy,
  aumOption,
  isinInput,
  aumInput,
  selectedCompanies,
  availableCompanyNames,
  companyNameToIsin,
  initialCompanies,
  isLoadingData,
  onCreateByChange,
  onAumOptionChange,
  onIsinInputChange,
  onAumInputChange,
  onSelectedCompaniesChange,
  onAddHolding,
}) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm transition-all duration-300">
      {/* Header - Collapsible Toggle */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Plus
              className={`w-5 h-5 text-green-600 transition-transform duration-300 ${
                showForm ? "rotate-45" : ""
              }`}
            />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-slate-800">Add Holdings</h2>
            <p className="text-sm text-slate-500">
              Add companies to &quot;{activePortfolioName}&quot;
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transform transition-transform duration-300 ${
            showForm ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Form Content - Collapsible */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showForm
            ? "max-h-[800px] opacity-100 overflow-visible"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-6 border-t border-slate-100 space-y-6">
          {/* Input Method Selection - Radio Buttons */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Select Input Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  createBy === "name"
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="inputMethod"
                  value="name"
                  checked={createBy === "name"}
                  onChange={(e) =>
                    onCreateByChange(e.target.value as "name" | "isin")
                  }
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-700">
                  Company Name
                </span>
              </label>

              <label
                className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  createBy === "isin"
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="inputMethod"
                  value="isin"
                  checked={createBy === "isin"}
                  onChange={(e) =>
                    onCreateByChange(e.target.value as "name" | "isin")
                  }
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-3 text-sm font-medium text-slate-700">
                  ISIN Number
                </span>
              </label>
            </div>
          </div>

          {/* Company Name Input Mode */}
          {createBy === "name" && (
            <div className="space-y-4">
              <div className="relative z-[40]">
                <CompanyMultiSelect
                  label="Select Companies"
                  options={availableCompanyNames}
                  selectedNames={selectedCompanies.map((c) => c.company_name)}
                  onSelectedNamesChange={(names) => {
                    const newSelection = names
                      .map((name) => {
                        const isin = companyNameToIsin.get(name);
                        return initialCompanies.find(
                          (c) => c.isin === (isin ?? "")
                        );
                      })
                      .filter((c): c is CompanyListItem => !!c);
                    onSelectedCompaniesChange(newSelection);
                  }}
                  placeholder="Search companies..."
                />
              </div>
            </div>
          )}

          {/* ISIN Input Mode */}
          {createBy === "isin" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enter ISIN Numbers
                </label>
                <textarea
                  rows={5}
                  placeholder={
                    "INE002A01018, 5.5\nINE467B01029, 3.2\nINE040A01034"
                  }
                  value={isinInput}
                  onChange={(e) => onIsinInputChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-mono text-sm resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Format: ISIN, AUM% (one per line)
                </p>
              </div>

              {aumOption === "with_aum" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default AUM % (optional)
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      placeholder="2.5"
                      min="0"
                      max="100"
                      step="0.01"
                      value={aumInput}
                      onChange={(e) => onAumInputChange(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Overrides pasted values if provided
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onAddHolding}
              disabled={
                isLoadingData ||
                (createBy === "name" && selectedCompanies.length === 0)
              }
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Add Holdings
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioInputForm;

/* ====================== LOCAL MULTI-SELECT ====================== */

type CompanyMultiSelectProps = {
  label: string;
  options: string[];
  selectedNames: string[];
  onSelectedNamesChange: (names: string[]) => void;
  placeholder?: string;
};

function CompanyMultiSelect({
  label,
  options,
  selectedNames,
  onSelectedNamesChange,
  placeholder = "Search...",
}: CompanyMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  const safeOptions = useMemo(() => options ?? [], [options]);
  const safeSelected = useMemo(() => selectedNames ?? [], [selectedNames]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return safeOptions;
    const nq = q.toLowerCase();
    return safeOptions.filter((o) => o.toLowerCase().includes(nq));
  }, [safeOptions, q]);

  const allSelected =
    safeOptions.length > 0 && safeSelected.length === safeOptions.length;

  function toggleOne(value: string) {
    if (safeSelected.includes(value)) {
      onSelectedNamesChange(safeSelected.filter((v) => v !== value));
    } else {
      onSelectedNamesChange([...safeSelected, value]);
    }
  }

  function selectAll() {
    onSelectedNamesChange([...safeOptions]);
  }

  function clearAll() {
    onSelectedNamesChange([]);
  }

  return (
    <div ref={ref} className="inline-flex flex-col gap-1 relative w-full">
      <span className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </span>

      {/* Trigger */}
      <button
        type="button"
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-[14px] text-gray-900 hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 truncate">
            {safeSelected.length === 0 ? (
              <span className="text-gray-400">Select companies</span>
            ) : safeSelected.length === 1 ? (
              <span>{safeSelected[0]}</span>
            ) : (
              <span>{safeSelected.length} selected</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 mt-2 min-w-[280px] w-full rounded-xl border border-gray-200 bg-white shadow-xl z-50"
          role="menu"
        >
          {/* Search & actions */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2">
              <SearchIcon className="h-4 w-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              {q && (
                <button
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-700"
                  onClick={() => setQ("")}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={allSelected ? clearAll : selectAll}
                className="text-xs font-medium text-[#195D5D] hover:underline"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
              {safeSelected.length > 0 && (
                <span className="text-xs text-gray-500">
                  {safeSelected.length} selected
                </span>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="max-h-64 overflow-auto py-2">
            {filtered.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No matches</div>
            ) : (
              filtered.map((opt) => {
                const isChecked = safeSelected.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#195D5D] focus:ring-[#195D5D]"
                      checked={isChecked}
                      onChange={() => toggleOne(opt)}
                    />
                    <span
                      className={
                        isChecked ? "font-medium text-gray-900" : "text-gray-700"
                      }
                    >
                      {opt}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-3 py-2">
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* tiny search icon */
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}
