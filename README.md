# GitHub Search

A modern GitHub search application that supports searching repositories, code, commits, and users.

🌐 **Live Demo**: [https://git-hub-search-one-vert.vercel.app/](https://git-hub-search-one-vert.vercel.app/)

![GitHub Search](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🔍 Search GitHub repositories, code, commits, and users
- 🎨 Beautiful gradient theme design
- 🌙 Light/Dark mode toggle support
- 📱 Responsive design
- ⚡ Built with Next.js 15
- 🎯 Full TypeScript support


## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd git-hub-search
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure GitHub Token

To avoid GitHub API rate limits, you need to configure a personal access token:

1. Visit [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Select permissions:
   - `public_repo` - Access public repositories
   - `read:user` - Read user information
4. Copy the generated token

Create a `.env.local` file in the project root:

```bash
GITHUB_TOKEN=your_github_token_here
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Theming**: next-themes
- **HTTP Client**: Axios
- **Tables**: TanStack Table

## 📦 Project Structure

```
├── app/                # Next.js App Router
├── components/         # React components
│   ├── ui/            # Base UI components
│   └── ...
├── lib/               # Utility functions and APIs
├── types/             # TypeScript type definitions
└── public/            # Static assets
```

## 🎨 Theme Features

- Blue gradient background design
- Custom icon styling
- Elegant hover effects
- Unified color system
- Support dark mode and light mode
