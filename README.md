# Digishare Documentation

> Official documentation for the Digishare Platform

This repository contains the documentation for the Digishare ecosystem, built with Docus.

> [!TIP]
> If you're looking for the main platform code, check the other repositories in the workspace.

## ✨ Features

- 🎨 **Beautiful Design** - Clean, modern documentation theme
- 📱 **Responsive** - Mobile-first responsive design
- 🌙 **Dark Mode** - Built-in dark/light mode support
- 🔍 **Search** - Full-text search functionality
- 🚀 **Performance** - Fast static generation

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Your documentation site will be running at `http://localhost:3000`

## 📁 Project Structure

```
digishare_docs/
├── content/              # Documentation content
│   ├── index.md          # Homepage
│   ├── 1.getting-started/# Getting started guides
│   ├── 2.essentials/     # Essential concepts
│   └── 3.how-to-use/     # Usage guides and API docs
├── public/               # Static assets
└── package.json          # Dependencies
```

## ⚡ Built with

- [Nuxt 4](https://nuxt.com)
- [Nuxt Content](https://content.nuxt.com/)
- [Nuxt UI](https://ui.nuxt.com)
- [Docus](https://docus.dev)

## 📖 Writing Documentation

Write your content in Markdown in the `content/` directory. Docus will automatically generate routes based on the file structure.
For more details on Docus features, visit [Docus Documentation](https://docus.dev).

## 🚀 Deployment

Build for production:

```bash
npm run build
```

The built files will be in the `.output` directory, ready for deployment to any hosting provider that supports Node.js.

## 📄 License

[MIT License](https://opensource.org/licenses/MIT)
