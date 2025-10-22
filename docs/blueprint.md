# **App Name**: SI-PAKAT Digital

## Core Features:

- Landing Page: Informational landing page with login functionality and role-based access control.
- User Role Management: Administrator manages users and their roles (Administrator, Manajer Aset, Auditor/Pimpinan) with full CRUD operations for users and roles.
- Asset Inventory Management: Manajer Aset manages assets with CRUD operations. Assets are categorized (Perangkat Keras, Perangkat Lunak, Sarana Pendukung, Data & Informasi) with detailed specifications, locations, owners, and status tracking.  Implements searching/filtering assets based on type.
- Security Assessment: Manajer Aset assesses security based on 5 criteria (Kerahasiaan, Integritas, Ketersediaan, Keaslian, Non-repudiation). Automatic score calculation and asset value classification (Tinggi/Sedang/Rendah). History tracking for assessments.
- Dashboard and Reporting: Summary dashboard with charts (pie chart for asset classification, bar chart for asset value distribution), lists of recent/expiring assets, and custom report generation for the Auditor/Pimpinan role. Auditors will be able to export excel/pdf reports.
- Configuration Management: Settings for asset classifications and value thresholds. These thresholds define Tinggi/Sedang/Rendah asset ratings. This tool enables admin to make any required changes.
- Reporting Automation: Auditor can print/export reports that maintain professional format, include header/logo, date, statistics, complete asset tables without checkmarks or sorting visualization and fits data to page.

## Style Guidelines:

- Primary color: Deep Blue (#1A237E) to convey security, trust, and authority, aligning with the SI-PAKAT's core function.
- Background color: Very light desaturated blue (#E8EAF6), offering a calm and professional backdrop without distracting from the main content.
- Accent color: A vibrant purple (#9C27B0), contrasting to the primary blue, highlighting critical actions and elements for the user.
- Font pairing: 'Space Grotesk' (sans-serif) for headings, and 'Inter' (sans-serif) for body text. The combination creates a modern, readable, and trustworthy design.
- Code font: 'Source Code Pro' for any displayed code snippets or technical details.
- Consistent use of flat, modern icons related to assets and security to improve UI clarity.
- Responsive design for all pages, a collapsible sidebar, and printable layouts that ensure content fits the page and are visually appealing for reports. Implement Bootstrap's grid system and utility classes with the option of integrating Tailwind CSS for enhanced styling and responsiveness.
- Subtle transitions and animations on page loads and interactive elements, such as collapsible sidebars.