"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { searchService } from "../services/search.service"
import type { SearchCategory } from "../types"
import { SEARCH_DEBOUNCE_MS, MIN_QUERY_LENGTH } from "../constants"
import { addRecentSearch } from "../constants/recent-searches"

function isValidCategory(v: string | null): v is SearchCategory {
  return [
    "all",
    "users",
    "lounges",
    "posts",
    "reels",
    "products",
    "stores",
    "hashtags",
    "services",
  ].includes(v ?? "")
}

export function useSearch() {
  const searchParams = useSearchParams()
  const initialQ = searchParams?.get("q") ?? ""
  const initialType = isValidCategory(searchParams?.get("type"))
    ? (searchParams.get("type") as SearchCategory)
    : "all"

  const [searchTerm, setSearchTerm] = useState(initialQ)
  const [debouncedTerm, setDebouncedTerm] = useState(initialQ)
  const [searchType, setSearchType] = useState<SearchCategory>(initialType)

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedTerm(searchTerm),
      SEARCH_DEBOUNCE_MS,
    )
    return () => clearTimeout(timer)
  }, [searchTerm])

  const query = useQuery({
    queryKey: ["search", debouncedTerm, searchType],
    queryFn: () => searchService.search(debouncedTerm, searchType),
    enabled: debouncedTerm.length >= MIN_QUERY_LENGTH,
    throwOnError: false,
    retry: false,
  })

  const saveRecent = useCallback(() => {
    if (debouncedTerm.trim().length >= MIN_QUERY_LENGTH) {
      addRecentSearch(debouncedTerm.trim())
    }
  }, [debouncedTerm])

  const isSearchStale = debouncedTerm !== searchTerm

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    searchType,
    setSearchType,
    saveRecent,
    isSearchStale,
    ...query,
  }
}
