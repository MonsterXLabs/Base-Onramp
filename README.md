<!-- README.md -->

<p align="center">
  <!-- Replace the src with your own project logo if you have one -->
  <img src="https://avatars.githubusercontent.com/u/105401272?s=200&v=4" alt="MonsterXLabs Logo" width="120">
</p>

<h1 align="center">Base‑Onramp</h1>
<!-- top of your README -->
<p align="center">

  <!-- Stars -->
  <img alt="GitHub Repo stars"
       src="https://img.shields.io/github/stars/MonsterXLabs/Base-Onramp?style=social">

  <!-- Forks -->
  <img alt="GitHub forks"
       src="https://img.shields.io/github/forks/MonsterXLabs/Base-Onramp?style=social">

  <!-- Open Pull Requests -->
  <img alt="GitHub pull requests"
       src="https://img.shields.io/github/issues-pr/MonsterXLabs/Base-Onramp?color=blue">

  <!-- Open Issues -->
  <img alt="GitHub issues"
       src="https://img.shields.io/github/issues/MonsterXLabs/Base-Onramp?color=yellow">

</p>

---

## 🚀 Introduction
**Base‑Onramp** is a lightweight set of React / TypeScript utilities and UI components that embed the [Coinbase OnRamp](https://docs.cdp.coinbase.com/onramp/docs/api-onramp-initializing) flow into any Web3‑enabled dApp.  
The code:

- Opens the Coinbase OnRamp modal/iframe without pre‑selecting a currency (avoiding geo‑currency issues for non‑USD/EUR users).  
- Watches the connected wallet for a balance increase after purchase.  
- When funds arrive, it returns the user to your checkout flow so they can complete actions such as buying NFTs, escrowing tokens, or listing items for sale.

> ⚠️ **Heads‑up:** Coinbase OnRamp has **no sandbox** and **no testnet**. Even during “testing,” real cards are charged and crypto is delivered on mainnet.

---

## 📋 Requirements
| Tool | Why Needed |
| ---- | ---------- |
| **Node.js ≥ 18** | to transpile/build the TSX utilities (optional if you copy into an existing project) |
| **npm / yarn / pnpm** | package manager for installing dependencies (if you bundle separately) |
| **React ≥ 18 / Next.js / Vite** | a host framework to render the TSX components |
| **TypeScript** | all files are written in `.ts` / `.tsx` |
| **Coinbase OnRamp API keys** | production‑ready credentials |

If you plan to **drop these files into an existing React codebase**, you can simply copy them under your own `src/` tree and skip the stand‑alone build steps.

---

## 🛠 Quick Start

### 1. Copy or clone
```bash
# clone the repo
git clone https://github.com/MonsterXLabs/Base-Onramp.git
cd Base-Onramp
```
# OR just copy the files you need into your own project

# 2. Install peer deps (inside your project)
```bash
npm install @coinbase/onramp-sdk   # or: yarn add ...
npm install ethers                # example Web3 library
```

# 3. Configure your environment
Add your Coinbase OnRamp publishable key somewhere in your app (e.g., .env, Next.js public runtime config, etc.).

# 4. Use the components
```bash
import BuyModal from "@/components/BuyModal";
import TopupModal from "@/components/TopupModal";
import { initOnrampClient } from "@/utilsOnramp/onrampApi";

const client = initOnrampClient(process.env.NEXT_PUBLIC_ONRAMP_API_KEY!);

// Open modal when user clicks “Buy with card”
<BuyModal client={client} onSuccess={() => /* resume checkout */} />
```

# 📁 Directory Structure
```bash
Base-Onramp/
│
├── utilsOnramp/
│   ├── onrampApi.ts      # helper to initialize Coinbase OnRamp client
│   └── rampUtils.ts      # wallet‑balance polling, helper functions
│
├── BuyModal.tsx          # credit‑card purchase modal component
├── TopupModal.tsx        # top‑up flow, balance checker
├── NFTMain.tsx           # example NFT checkout page
└── README.md             # ← you are here
```

# 💡 Tips & Customisation
Currency‑agnostic: Because no currency param is passed, Coinbase chooses the correct fiat/crypto pair automatically based on the user’s profile.

Balance checking: rampUtils.ts contains a polling helper (waitForBalanceIncrease) you can adapt for your own RPC provider or wallet hooks.

Styling: The modal components use minimal inline styles. Feel free to wrap with your favourite UI library (ShadCN, Chakra, MUI, Tailwind, etc.).

# 🤝 Contributing
Pull requests and issues are welcome! If you add new features—e.g., ERC‑20 balance checks, better error surfaces—feel free to open a PR.

# 👨‍💻 Developed By
Made with ❤️ by MonsterXLabs

