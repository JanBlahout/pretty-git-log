"use client";

interface Props {
  activeYear: number | "all";
  availableYears: number[];
  loadingYears: Set<number>;
  onYearChange: (year: number | "all") => void;
}

export function YearTabs({ activeYear, availableYears, loadingYears, onYearChange }: Props) {
  const isLoadingAll = loadingYears.size > 1;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onYearChange("all")}
        disabled={isLoadingAll}
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 ${
          activeYear === "all"
            ? "bg-brand text-white"
            : "bg-surface text-text-secondary border border-border"
        }`}
      >
        {isLoadingAll ? "Loading…" : "All time"}
      </button>

      {availableYears.map((year) => {
        const isActive = activeYear === year;
        const isLoading = loadingYears.has(year);
        return (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            disabled={isLoading}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 ${
              isActive
                ? "bg-brand text-white"
                : "bg-surface text-text-secondary border border-border"
            }`}
          >
            {isLoading ? "…" : year}
          </button>
        );
      })}
    </div>
  );
}
