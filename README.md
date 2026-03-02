## Novara Labs – Research Peptides Catalog

This repository contains the marketing and catalog site for Novara Labs research peptides. It is a React + Vite single-page application deployed on **Vercel**, with product listing, product detail pages, an inquiry workflow, and a contact form — all backed by serverless API functions.

---

### Features

- **Peptides catalog** — Browse all peptides on the `/peptides` page.
- **Product detail pages** — Each peptide has a dedicated page (`/peptides/:slug`) with full description, size, and pricing.
- **Related products** — Detail pages surface related compounds for easier exploration.
- **Inquiry modal** — A "Send Inquiry" modal is available from cards and product pages, collecting name, email, phone, and message, and emailing it to support.
- **Contact page** — Full contact form at `/contact` that sends messages directly to the support inbox.

---

### Project Structure

```
/
├── api/
│   ├── send-inquiry.js   # Vercel serverless function – product inquiries
│   └── send-contact.js   # Vercel serverless function – contact form messages
├── components/           # Shared React components (InquiryModal, etc.)
├── pages/                # Route-level pages (Home, Peptides, Contact, etc.)
├── products.ts           # Product data
├── vercel.json           # Vercel deployment configuration
└── vite.config.ts        # Vite build configuration
```

---

### Environment Variables

The API functions require the following environment variables. For local development, create a `.env` file in the project root (never commit this file — it is in `.gitignore`). For production, add these in the **Vercel Dashboard → Settings → Environment Variables**.

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.office365.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_SECURE` | `true` for port 465, `false` for STARTTLS |
| `SMTP_USER` | SMTP login username / sender address |
| `SMTP_PASS` | SMTP password |
| `FROM_EMAIL` | "From" address shown on outgoing emails |
| `TO_EMAIL` | Destination inbox for inquiry and contact emails |

---

### Run Locally

**Prerequisites:** Node.js (LTS), npm, and a Vercel account linked via `vercel login`.

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env   # then fill in your SMTP credentials

# 3. Start the full dev server (frontend + API functions)
npm run dev            # runs `vercel dev` under the hood
```

> Open the URL printed in the terminal (usually `http://localhost:3000`). Both the React app and the `/api/*` endpoints will be live.
>
> To run the frontend only (no API), use `npm run dev:vite`.

---

### Build & Deploy

Deployments are handled automatically by Vercel on every push to the connected GitHub branch.

To trigger a manual production build locally:

```bash
npm run build
npm run preview   # preview the production build
```

To deploy directly from the CLI:

```bash
vercel --prod
```
