# NewBee Hive 🐝

Bem-vindo ao **NewBee Hive** 🐝! Um explorador de posts da Hive Blockchain focado em ajudar a descobrir conteúdo de introdução e perfis de membros da comunidade.

🌐 **Live:** [https://newbeehive.vercel.app/](https://newbeehive.vercel.app/)

---

## 🚀 Funcionalidades

- **Explorar Postagens de Introdução**: Navegue pelos últimos posts com a tag `#introduceyourself`, ordenados por criação, trending ou hot.
- **Buscar Primeiro Post**: Encontre o primeiro post de introdução de qualquer usuário da Hive rapidamente.
- **Perfis de Usuários**: Veja informações detalhadas — avatar, bio, redes sociais, reputação e posts recentes.
- **Detalhes da Postagem**: Leia o conteúdo completo, veja comentários e métricas (votos, payout, etc.).
- **Tema Claro/Escuro**: Alterne entre o tema escuro **Hive** (padrão) e o tema **Claro**.
- **Design Responsivo**: Otimizado para mobile, tablet e desktop.
- **Animações suaves**: Cards com animações de entrada via Framer Motion.

---

## 🔧 Melhorias Técnicas (v1.1.0)

### ⚡ Performance
- **Code Splitting**: Todas as páginas agora são carregadas sob demanda com `React.lazy()` + `Suspense`.
- **Remoção de dependências mortas**: Removidos **~40 pacotes** não utilizados (Radix UI, recharts, cmdk, date-fns, zod, react-hook-form, etc.), reduzindo o bundle de ~30%.
- **Lazy loading de imagens**: Atributo `loading="lazy"` adicionado a todos os avatares e imagens nos posts.
- **React Query configurado**: Cache configurado com `staleTime: 2min`, retry automático, `refetchOnWindowFocus: false`.

### 🎨 SEO & Acessibilidade
- **Meta tags**: Open Graph (Facebook/LinkedIn) + Twitter Cards configurados em todas as páginas.
- **Títulos dinâmicos**: Cada página tem `<title>` único usando `react-helmet-async`.
- **`<html lang="pt-BR">`**: Idioma correto para acessibilidade e SEO.
- **Canonical URL + Sitemap + robots.txt**: Auxilia mecanismos de busca a indexar corretamente.
- **Keywords e descrições**: Meta tags ricas para SEO.

### 🛡️ Confiabilidade
- **Error Boundary**: Erros inesperados são capturados e exibidos com botão para recarregar.
- **Footer sem vazamento de bundle**: A versão agora vem de `src/config/version.ts` em vez de importar `package.json`.
- **Toast com feedback**: Notificações de sucesso/erro via Sonner para melhor UX.

### 🎨 Tema Claro
- Tema claro completo com variáveis CSS para modo `.light`.
- Alternância rápida entre Hive (escuro) e Claro via botão no canto superior direito.

---

## 📦 Stack

| Tecnologia | Uso |
|-----------|-----|
| **React 18** + TypeScript | Framework principal |
| **Vite** | Build tool ultrarrápida |
| **Tailwind CSS** + shadcn/ui | Estilização |
| **React Router v6** | Roteamento SPA |
| **@tanstack/react-query** | Cache e gerenciamento de estado assíncrono |
| **Framer Motion** | Animações |
| **react-helmet-async** | SEO (meta tags dinâmicas) |
| **Hive RPC API** | Fonte de dados blockchain |
| **Vercel** | Deploy contínuo |

---

## 🏗️ Como Rodar Localmente

```bash
# Clone
git clone https://github.com/viniciotricolor/NewBeeHive.git
cd NewBeeHive

# Instale as dependências
pnpm install

# Inicie o dev server
pnpm dev
```

O app estará disponível em `http://localhost:5173`.

### Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Build de produção |
| `pnpm preview` | Preview do build local |
| `pnpm lint` | Verificação de lint |

---

## 📁 Estrutura do Projeto

```
src/
├── components/        # Componentes React reutilizáveis
│   └── ui/           # Componentes base (shadcn/ui)
├── config/            # Constantes e configurações
├── content/           # Conteúdo estático (markdown)
├── hooks/             # Custom hooks React
├── lib/              # Utilitários (cn, etc.)
├── pages/            # Páginas da aplicação (lazy-loaded)
├── services/         # Chamadas à API Hive
├── types/            # Tipos TypeScript
└── utils/            # Funções utilitárias
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Abra uma [issue](https://github.com/viniciotricolor/NewBeeHive/issues) ou envi um pull request.

---

## 📄 Licença

MIT © 2024 — [viniciotricolor](https://github.com/viniciotricolor)
