# 🐝 NewBee Hive

Bem-vindo ao **NewBee Hive** — um explorador moderno da Hive Blockchain focado em descobrir novos talentos, histórias de introdução e perfis de membros da comunidade.

---

## 🎯 Missão

Simplificar a descoberta de novos talentos e histórias na Hive, especialmente para aqueles que estão começando sua jornada na blockchain. Aqui você encontra:

- 📝 **Posts de introdução** de novos membros
- 🔍 **Busca por usuário** para encontrar o primeiro post de alguém
- 👤 **Perfis detalhados** com histórico de postagens
- 💬 **Comentários e discussões** em cada post

---

## 🧰 Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| ⚛️ React | 19 | Interface de usuário |
| 🟦 TypeScript | ~5.7 | Tipagem estática |
| ⚡ Vite | 6 | Build e dev server |
| 🎨 Tailwind CSS | 4 | Estilização utilitária |
| 🎭 shadcn/ui | — | Componentes acessíveis |
| 🔄 TanStack Query | 5 | Cache e requisições |
| 🧭 React Router | 7 | Roteamento SPA |
| 🏗️ Hive Blockchain | — | API de dados descentralizados |
| 🌐 Vercel | — | Hospedagem e deploy |

---

## 📡 Links

| | |
|---|---|
| 🌍 **Site** | [newbeehive.vercel.app](https://newbeehive.vercel.app) |
| 💻 **GitHub** | [github.com/viniciotricolor/NewBeeHive](https://github.com/viniciotricolor/NewBeeHive) |
| 🐝 **Hive Blog** | [hive.blog](https://hive.blog) |

---

## 🏷️ Versão Atual

```
🚀 NewBee Hive  v1.1.0  —  maio de 2026
```

---

## 📋 Changelog

### `v1.1.0` — maio de 2026

> 🚀 **Performance & Qualidade**

- **📈 SEO completo** — meta tags, Open Graph, Twitter Cards, sitemap.xml, robots.txt e `<html lang="pt-BR">`
- **⚡ Code splitting** — páginas carregam sob demanda via `React.lazy` + `Suspense`
- **🖼️ Lazy loading de imagens** — avatares e posts carregam conforme o scroll
- **📦 Bundle reduzido em ~30%** — remoção de ~40 dependências mortas e 27 componentes UI não utilizados
- **♾️ Infinite scroll** — posts carregam automaticamente ao rolar a página

> 🎨 **Interface & Experiência**

- **🌗 Tema Claro** — alternância entre tema Hive (escuro) e Claro com seletor no topo
- **🧭 Navbar fixa** — navegação entre Home e Sobre com header responsivo
- **🛡️ Error Boundary** — captura de erros inesperados com botão para recarregar
- **📊 StatsCards corrigidos** — métricas agora mostram autores únicos e votos totais, sem duplicação
- **🔙 Voltar ao feed** — botão para limpar busca de usuário e retornar à lista principal

> 🐛 **Correções**

- **Busca por `#introduceyourself`** — agora filtra corretamente pela tag no lugar de pegar o post mais antigo
- **Likes precisos** — contagem ignora downvotes (só upvotes com percent > 0)
- **Payout total** — agora soma pending + total_payout + curator_payout, não apenas o valor pendente

---

### `v1.0.0` — 19 de setembro de 2025

> 🎉 **Lançamento Inicial**

- 🐝 Lançamento do NewBee Hive
- 📝 Explorador de posts com tag `#introduceyourself`
- 🔍 Busca de primeiro post por nome de usuário na Hive
- 👤 Visualização de perfil com posts do usuário
- 💬 Visualização detalhada de posts com comentários
- 🌙 Sistema de tema escuro (Hive)
- ℹ️ Página "Sobre" e rodapé com informações do projeto

---

> ⌨️ Feito com 💛 por [@viniciotricolor](https://hive.blog/@viniciotricolor) na Hive Blockchain
