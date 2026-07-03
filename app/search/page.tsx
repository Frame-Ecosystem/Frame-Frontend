"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { ErrorBoundary } from "@/app/_components/common/errorBoundary"
import { useAuth } from "@/app/_auth"
import { useTranslation } from "@/app/_i18n"
import { useSearch } from "@/app/_systems/search/hooks/useSearch"
import { SearchBar } from "@/app/_components/search/search-bar"
import { FilterChips } from "@/app/_components/search/filter-chips"
import { RecentSearches } from "@/app/_components/search/recent-searches"
import { SearchResults } from "@/app/_components/search/search-results"
import { SearchSkeleton } from "@/app/_components/search/search-skeleton"
import type { SearchCategory } from "@/app/_systems/search/types"

export default function SearchPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { t, dir } = useTranslation()
  const {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    searchType,
    setSearchType,
    data,
    isLoading: isSearching,
    isError,
    isSearchStale,
  } = useSearch()

  const handleSearch = useCallback(
    (query: string) => {
      setSearchTerm(query)
    },
    [setSearchTerm],
  )

  const handleCancel = useCallback(() => {
    setSearchTerm("")
    router.back()
  }, [setSearchTerm, router])

  const handleChipChange = useCallback(
    (cat: SearchCategory) => {
      setSearchType(cat)
    },
    [setSearchType],
  )

  const handleRecentSelect = useCallback(
    (query: string) => {
      setSearchTerm(query)
    },
    [setSearchTerm],
  )

  if (!isLoading && !user) {
    router.push("/")
    return null
  }

  const hasQuery = debouncedTerm.trim().length >= 2
  const hasResults =
    hasQuery &&
    data?.data &&
    Object.values(data.data).some(
      (section) =>
        section &&
        typeof section === "object" &&
        "total" in section &&
        (section as { total: number }).total > 0,
    )

  if (isLoading) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl">
          <div className="p-5 lg:px-8 lg:py-8">
            <SearchSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="from-background via-background to-muted/20 min-h-screen bg-linear-to-br">
        <div className="mx-auto max-w-7xl">
          <div className="p-5 lg:px-8 lg:py-8">
            <div dir={dir}>
              <div className="mb-2 flex items-center gap-3">
                <div className="bg-primary/10 rounded-xl p-2">
                  <Search className="h-6 w-6 lg:h-7 lg:w-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  {t("search.title")}
                </h1>
              </div>
            </div>

            <div className="mt-4">
              <SearchBar
                value={searchTerm}
                onChange={handleSearch}
                onCancel={handleCancel}
                autoFocus
              />
            </div>

            {(hasQuery || isSearching) && (
              <FilterChips active={searchType} onChange={handleChipChange} />
            )}

            {(isSearching || isSearchStale) && !hasResults && (
              <SearchSkeleton />
            )}

            {isError && !isSearching && (
              <div className="mt-12 text-center">
                <p className="text-muted-foreground">{t("search.error")}</p>
              </div>
            )}

            {hasQuery &&
              !isSearching &&
              !isSearchStale &&
              !isError &&
              !hasResults && (
                <div className="mt-12 text-center">
                  <p className="text-foreground font-medium">
                    {t("search.noResults", { query: debouncedTerm })}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t("search.noResultsHint")}
                  </p>
                </div>
              )}

            {hasResults && data && (
              <SearchResults data={data.data} query={debouncedTerm} />
            )}

            {!hasQuery && !isSearching && (
              <>
                <RecentSearches onSelect={handleRecentSelect} />
                <div className="mt-16 text-center">
                  <Search className="text-muted-foreground/30 mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground text-sm">
                    {t("search.emptyQuery")}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
