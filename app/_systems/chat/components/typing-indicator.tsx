"use client"

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-1">
      <div className="bg-muted flex h-8 w-14 items-center justify-center gap-1 rounded-2xl rounded-bl-sm px-3">
        <span
          className="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ animationDelay: "0ms", animationDuration: "1.2s" }}
        />
        <span
          className="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ animationDelay: "200ms", animationDuration: "1.2s" }}
        />
        <span
          className="bg-muted-foreground/60 h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ animationDelay: "400ms", animationDuration: "1.2s" }}
        />
      </div>
    </div>
  )
}
