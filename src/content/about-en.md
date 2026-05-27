# 🐝 NewBee Hive

Welcome to **NewBee Hive** — a modern Hive Blockchain explorer focused on discovering new talents, introduction stories, and community member profiles.

---

## 🎯 Mission

To make it easy to find and connect with new members of the Hive community. Through the [#introduceyourself](https://hive.blog/created/introduceyourself) tag, we help onboard and highlight blockchain newcomers.

---

## 🧰 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| ⚛️ **React** | 18.x | UI Framework |
| 🏗️ **Vite** | 6.x | Bundler & Dev Server |
| 🎨 **Tailwind CSS** | 3.x | Styling |
| 🧩 **Framer Motion** | 11.x | Animations |
| 🐻 **Zustand** | — | State Management |
| 🗄️ **TanStack Query** | 5.x | Data Fetching & Cache |
| 🧭 **React Router** | 7.x | Routing & Navigation |
| 🛡️ **React Helmet Async** | — | SEO (Meta Tags) |
| 📝 **React Markdown** | — | Markdown Rendering |
| 🌙 **next-themes** | — | Dark/Light Theme |
| 🔌 **@hiveio/dhive** | — | Hive Blockchain API |

---

## 📡 Links

| Link | URL |
|---|---|
| 🌐 **Live Site** | [newbeehive.vercel.app](https://newbeehive.vercel.app) |
| 📦 **Repository** | [github.com/viniciotricolor/NewBeeHive](https://github.com/viniciotricolor/NewBeeHive) |
| 🐝 **Hive Blog** | [peakd.com/@viniciotricolor](https://peakd.com/@viniciotricolor) |

---

## 🏷️ Version

> 🚀 **NewBee Hive v1.2.0**

---

## 📋 Changelog

### v1.2.0 — May 2026

#### 🌍 Internationalization

- **🇧🇷🇺🇸 Full bilingual support** — Portuguese (PT-BR) and English (EN)
- **🔤 Language toggle** — button in the header to switch between languages
- **💾 Persistence** — language preference saved to localStorage
- **🌐 Automatic detection** — detects browser language on first visit
- **📄 About page in English** — fully translated version

#### 🔗 Other improvements

- **🔗 Footer link** — now points to [peakd.com/@viniciotricolor](https://peakd.com/@viniciotricolor)

---

### v1.1.0 — May 2026

#### 🚀 Performance
- **Code Splitting** — each page loads on demand (`React.lazy` + `Suspense` + loading spinner)
- **~40 packages removed** — Radix UI, recharts, cmdk, date-fns, zod, react-hook-form and other unused dependencies eliminated
- **Lazy image loading** — `loading="lazy"` on all avatars and post images
- **Infinite scroll** — posts load automatically as you scroll

#### 🎨 Interface
- **Light theme** — toggle between Hive Dark and Light modes
- **Responsive header** — sticky navbar with navigation and language toggle
- **Translated About page** — professional Markdown with tables and emojis
- **Refined stats cards** — three cards with useful metrics

#### 🌍 Internationalization
- **Full i18n** — Portuguese (PT-BR) and English (EN) support
- **Persistence** — language preference saved to localStorage
- **Automatic detection** — browser language detected on first visit

#### 🐛 Bug Fixes
- **Post crash** — payout calculation no longer crashes on posts without payout data
- **User search** — now searches by `#introduceyourself` tag instead of just chronological first post
- **Vote count** — only shows upvotes (positive votes), ignoring downvotes
- **Total payout** — sums `pending_payout_value` + `total_payout_value` + `curator_payout_value`

#### 🛡️ Reliability
- **Error Boundary** — component that catches rendering errors with a friendly reload screen
- **SEO** — meta tags, Open Graph, Twitter Cards, sitemap, `robots.txt`, `lang="pt-BR"`, canonical URLs
- **React Query** — configured with `staleTime: 2min`, retries, and optimized refetch behavior

---

> Built with 💛 by [@viniciotricolor](https://peakd.com/@viniciotricolor) on the Hive Blockchain 🐝
