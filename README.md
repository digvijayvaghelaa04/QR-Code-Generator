# QR Code Generator

A modern React application for generating QR codes for URLs, plain text, and contact information. The application is built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **URL QR Codes**: Generate QR codes for website URLs with automatic protocol handling
- **Text QR Codes**: Create QR codes from any text content
- **Contact QR Codes**: Generate vCard QR codes with contact information
- **Multi-language Support**: English (en-US) and Spanish (es-ES)
- **Download & Copy**: Download QR codes as PNG or copy the encoded data
- **Responsive Design**: Beautiful UI that works on all devices

## Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will open automatically in your default browser at `http://localhost:5173`

## Development

### Available Scripts

- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build

### Tech Stack

- **React**: UI framework
- **TypeScript**: Type safety
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### QR Code Generation

The application uses multiple methods to generate QR codes:

1. **QRious Library** (primary): Loaded from CDN for client-side generation
2. **Google Charts API** (fallback 1): Web-based QR code generation
3. **QR Server API** (fallback 2): If other methods fail

This ensures QR codes are generated even if one service is unavailable.

## Project Structure

```
qr-code-generator/
├── src/
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.tsx         # Entry point
│   ├── index.css        # Global styles with Tailwind
│   └── QRCodeGenerator.tsx  # Main QR generator component
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── package.json         # Project dependencies
```

## Usage

1. **Generate URL QR Code**:
   - Enter a URL (with or without protocol)
   - QR code generates automatically
   - Download or copy the data

2. **Generate Text QR Code**:
   - Enter any text content
   - QR code generates in real-time
   - Share or download as needed

3. **Generate Contact QR Code**:
   - Fill in contact details (name, phone, email, etc.)
   - Generates vCard QR code
   - Scanners can import contact automatically

## Browser Support

Works on all modern browsers:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## License

Open source and free to use.
