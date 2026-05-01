import { useCallback, useState } from "react"

function normalizeTag(input: string): string {
  return input.trim().replace(/^#/, "").replace(/\s+/g, "")
}

export function extractInlineHashtags(text: string): string[] {
  return (text.match(/#([\w]+)/g) || []).map((t) => t.slice(1))
}

export function useHashtagComposer(options?: {
  initialHashtags?: string[]
  maxHashtags?: number
}) {
  const maxHashtags = options?.maxHashtags ?? 10
  const [hashtagInput, setHashtagInput] = useState("")
  const [hashtags, setHashtags] = useState<string[]>(
    options?.initialHashtags ?? [],
  )

  const addHashtag = useCallback(() => {
    const tag = normalizeTag(hashtagInput)
    if (!tag) return
    if (hashtags.includes(tag)) return
    if (hashtags.length >= maxHashtags) return
    setHashtags((prev) => [...prev, tag])
    setHashtagInput("")
  }, [hashtagInput, hashtags, maxHashtags])

  const removeHashtag = useCallback((tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const resetHashtags = useCallback((next: string[] = []) => {
    setHashtags(next)
    setHashtagInput("")
  }, [])

  const mergeWithInlineHashtags = useCallback(
    (content: string): string[] => {
      const inline = extractInlineHashtags(content)
      return [...new Set([...hashtags, ...inline])]
    },
    [hashtags],
  )

  return {
    hashtagInput,
    setHashtagInput,
    hashtags,
    setHashtags,
    addHashtag,
    removeHashtag,
    resetHashtags,
    mergeWithInlineHashtags,
  }
}
