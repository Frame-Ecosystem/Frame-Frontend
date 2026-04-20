# Feed System

Social content module — posts (image carousels), reels (short video), comments, likes, saves, hashtags, reporting, and feed algorithms.

## Architecture

```
types → services (6) → hooks (9, React Query + infinite scroll) → components (content/ rich UI)
```

## Types

| Type       | Description                                                 |
| ---------- | ----------------------------------------------------------- |
| `Post`     | Image carousel post with media, caption, hashtags, location |
| `Reel`     | Short video with overlay text and audio                     |
| `Comment`  | Threaded comment with replies and likes                     |
| `FeedItem` | Discriminated union of Post and Reel                        |
| `Hashtag`  | Trending hashtag with counts                                |
| `Report`   | Content report for moderation                               |

## Services

| Service              | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `feed.service.ts`    | Following/explore/saved/hashtag feeds, trending hashtags |
| `post.service.ts`    | Post CRUD + like/save toggle                             |
| `reel.service.ts`    | Reel CRUD + like/save toggle                             |
| `comment.service.ts` | Comment CRUD + like toggle                               |
| `like.service.ts`    | Lounge likes (toggle, list)                              |
| `report.service.ts`  | Content reporting + admin review                         |

## Hooks

| Hook              | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `useFeeds`        | Infinite scroll feeds — following, explore, saved, hashtag |
| `usePosts`        | Post CRUD mutations with optimistic updates                |
| `useReels`        | Reel CRUD mutations                                        |
| `useComments`     | Comment fetching + mutations                               |
| `useLikes`        | Lounge like queries + mutations                            |
| `useHashtags`     | Trending + search                                          |
| `useReports`      | Report mutations                                           |
| `useContent`      | Shared content utilities                                   |
| `content-keys.ts` | React Query key factories + optimistic update helpers      |

## Components (`components/content/`)

32 components covering the full content experience:

- **Creation:** create-post-dialog, create-reel-dialog, create-content-button/fab
- **Display:** post-card, reel-card, reel-player, image-carousel, feed-list, content-grid
- **Interaction:** action-bar, comment-input, comment-item, comment-replies, comment-sheet, report-modal
- **Navigation:** author-header, hashtag-chip, hashtag-text, content-menu
- **Edit:** edit-post-dialog, edit-reel-dialog
- **Reels:** reel-actions, reel-overlay, reel-swiper, lounge-swiper

## Dependencies

- `@/app/_core/api/api` — HTTP client
- `@/app/_systems/user` — ProfileImage, User types
