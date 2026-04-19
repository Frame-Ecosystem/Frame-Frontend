"use client"

import { useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import type { Reel } from "@/app/_types"
import { contentKeys } from "@/app/_systems/feed/hooks/content-keys"
import { feedService } from "@/app/_services/feed.service"

const REELS_ROUTE = "/reels"

/**
 * Build the deep-link URL for a single reel on the dedicated reels page.
 * Exported for cases where consumers need the raw href (e.g. share menus,
 * server-rendered links, right-click "open in new tab").
 */
export function getReelHref(reelId: string) {
  return `${REELS_ROUTE}?id=${encodeURIComponent(reelId)}`
}

/**
 * Hook used by any surface that lists reels OUTSIDE of the dedicated
 * `/reels` page (profile tabs, saved tab, reel swipers, search results, …)
 * to navigate to a specific reel and have it open instantly with the
 * vertical-feed UX.
 *
 * Smoothness is achieved by combining three lightweight optimisations:
 *
 *  1. **Route prefetch** — on hook mount we ask Next.js to prefetch the
 *     `/reels` route bundle so navigation has zero compile/parse cost.
 *  2. **Data prefetch** — the explore-feed query is warmed in the React
 *     Query cache. If the user already visited `/reels` recently the cache
 *     hit is instant; otherwise the request flies in parallel with the
 *     route transition.
 *  3. **Optimistic seed** — when the caller already holds the full `Reel`
 *     object (e.g. clicked from a grid), we seed the explore-feed cache
 *     with that reel as the first item. The reels page renders the target
 *     reel on the very first paint, then transparently revalidates with
 *     server data in the background.
 *
 * Returns:
 *  - `openReel(idOrReel)` — imperative navigation. Pass the reel object
 *    when available for the optimistic seed.
 *  - `prefetchReel(idOrReel)` — fire prefetch only (use on hover / focus).
 *  - `getReelLinkProps(idOrReel)` — props spread onto an `<a>` so the link
 *    is right-clickable and accessible while still using client navigation
 *    and prefetching on hover.
 */
export function useOpenReel() {
  const router = useRouter()
  const qc = useQueryClient()

  // Warm the route bundle once
  useEffect(() => {
    router.prefetch(REELS_ROUTE)
  }, [router])

  const prefetchFeed = useCallback(() => {
    return qc.prefetchInfiniteQuery({
      queryKey: contentKeys.exploreFeed,
      queryFn: ({ pageParam = 1 }) => feedService.getExploreFeed(pageParam, 10),
      initialPageParam: 1,
    })
  }, [qc])

  const seedCacheWithReel = useCallback(
    (reel: Reel) => {
      // Inject the reel as page 1 so the reels page can find it on first
      // render. The real explore feed will replace this on the next fetch.
      qc.setQueryData(contentKeys.exploreFeed, (old: any) => {
        const seedPage = {
          data: [{ ...reel, contentType: "reel" }],
          pagination: { page: 1, limit: 10, total: 1 },
        }
        if (!old) {
          return { pages: [seedPage], pageParams: [1] }
        }
        // Already have data — only seed if the reel isn't already present
        const present = (old.pages ?? []).some((p: any) =>
          (p?.data ?? []).some((it: any) => it?._id === reel._id),
        )
        if (present) return old
        return {
          ...old,
          pages: [seedPage, ...old.pages],
          pageParams: [1, ...(old.pageParams ?? [])],
        }
      })
    },
    [qc],
  )

  const resolveId = (input: string | Reel) =>
    typeof input === "string" ? input : input._id

  const prefetchReel = useCallback(
    (input: string | Reel) => {
      router.prefetch(REELS_ROUTE)
      if (typeof input !== "string") seedCacheWithReel(input)
      // Fire and forget — failures fall back to the page's own fetch
      void prefetchFeed()
      return resolveId(input)
    },
    [router, prefetchFeed, seedCacheWithReel],
  )

  const openReel = useCallback(
    (input: string | Reel) => {
      const id = prefetchReel(input)
      router.push(getReelHref(id), { scroll: false })
    },
    [router, prefetchReel],
  )

  const getReelLinkProps = useCallback(
    (input: string | Reel) => {
      const id = resolveId(input)
      return {
        href: getReelHref(id),
        onMouseEnter: () => prefetchReel(input),
        onTouchStart: () => prefetchReel(input),
        onFocus: () => prefetchReel(input),
        onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
          // Allow modifier-clicks to open in a new tab natively
          if (
            e.defaultPrevented ||
            e.button !== 0 ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey
          ) {
            return
          }
          e.preventDefault()
          openReel(input)
        },
      }
    },
    [openReel, prefetchReel],
  )

  return { openReel, prefetchReel, getReelLinkProps }
}
