"use client"

// Canonical auth module lives in app/_auth.
// Keep this barrel as a compatibility surface while guaranteeing one context/token singleton.
export * from "@/app/_auth"
