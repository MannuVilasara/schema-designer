# MongoDB Schema Designer

A modern, visual schema designer for MongoDB, built with Next.js and TypeScript. Easily create, edit, and export schemas for Mongoose and Prisma ORM frameworks.

## Features

- **Visual Schema Design:** Drag-and-drop interface to create collections and fields.
- **Field Types & Relations:** Supports all MongoDB field types, including references and arrays.
- **Code Generation:** Instantly generate code for Mongoose and Prisma based on your schema.
- **Export/Import:** Save your schema as JSON or import existing schemas.
- **Theming:** Light and dark mode support.
- **Context Menus & Modals:** Intuitive UI for editing collections, fields, and connections.
- **State Persistence:** Uses Zustand for fast, persistent state management.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)

### Installation

```sh
pnpm install
```

### Development

```sh
pnpm dev
```

### Build

```sh
pnpm build
```

### Testing

Tests use Mocha and Chai:

```sh
pnpm test
```

## Project Structure

```
├── src/
│   ├── app/                # Next.js app entry and pages
│   ├── components/         # UI components (Dock, Sidebar, Modals, Menus, etc.)
│   ├── generators/         # Code generators for Mongoose and Prisma
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript types
│   ├── styles/             # Global and component styles
│   └── lib/                # Utility functions
├── public/                 # Static assets
├── package.json            # Project metadata and scripts
├── README.md               # Project documentation
```

## Usage

1. Start the development server.
2. Open the designer in your browser.
3. Add collections and fields visually.
4. Use the dock and context menus to generate code, export/import schemas, and manage your design.

## Code Generation

- **Mongoose:** Generates ready-to-use Mongoose models with indexes and references.
- **Prisma:** Generates Prisma models with relations and attributes for MongoDB.

## Contributing

Pull requests and issues are welcome! Please open an issue for bugs or feature requests.

## License

This project is licensed under the GNU General Public License v3. See the [LICENSE](./LICENSE) file for details.
