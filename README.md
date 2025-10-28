# 🚗 AutoCertify – Blockchain-Based Vehicle Supply Chain Tracker

![AutoCertify Cover](https://i.ibb.co/j9SM9x5c/Auto-Certify-1.png)

AutoCertify is a blockchain-powered, decentralized vehicle lifecycle tracker that utilizes Ethereum smart contracts and NFTs to ensure transparency, trust, and tamper-proof vehicle history records. Designed as part of a capstone project, this platform reimagines how vehicle ownership, crash history, and service data can be recorded and verified.


## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [MetaMask Setup](#metamask-setup)
- [Frontend Setup](#frontend-setup)
- [Testing](#testing)
- [Challenges Faced](#challenges-faced)
- [Contributors](#contributors)

---

## Overview

**AutoCertify** leverages blockchain’s immutability to securely track and verify a car’s history — including ownership transfers, accident reports, mileage records, and service data. Users can search any vehicle using its VIN and get an end-to-end transparent lifecycle report.

---

## Features

- 🎫 **Vehicle NFTs** – Each car is uniquely minted as an ERC-721 NFT.
- 🧑‍⚖️ **Role-Based Access Control** – Admin, Manufacturer, Premium & Regular Users.
- 🕰️ **Ownership History** – Trace all past owners with timestamps.
- 🛠️ **Service Logs** – Add and view verified service history.
- 🚧 **Crash Records** – Record accidents with damage descriptions and repair status.
- 🔐 **MetaMask Wallet Integration** – Secure login and transactions.
- 🧪 **Comprehensive Unit Tests** – Written in Mocha + Chai.

---

## Tech Stack

| Layer          | Technology                  |
| -------------- | --------------------------- |
| Frontend       | Next.js                     |
| Smart Contract | Solidity, Hardhat           |
| Wallet         | MetaMask                    |
| Testing        | Mocha, Chai                 |
| Blockchain     | Hardhat Local Ethereum Node |

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AutoCertifyOrg/AutoCertify.git
cd AutoCertify
```

### 2. Smart Contract Setup

Clean previous builds:

```bash
npx hardhat clean
```

Compile smart contracts:

```bash
npx hardhat compile
```

Start the local Hardhat network:

```bash
npx hardhat node
```

> This creates a local Ethereum network with 20 test accounts.  
> The **first account** is considered the **admin** and is used for deploying contracts.

Deploy the contracts:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

> This will generate ABI files and deploy the contracts locally.

---

##  MetaMask Setup

- Add a custom network in MetaMask:
  - **Network Name**: Hardhat Local
  - **RPC URL**: http://127.0.0.1:8545
  - **Chain ID**: 1337
- Import one of the test account private keys shown in your terminal after running `npx hardhat node`.

---

## Frontend Setup

If this is your first time:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

Test cases are located in the `test/` directory and cover:

- NFT Minting and Ownership

- Role Access Restrictions

- Crash and Service Logging

- Ownership Transfers

To run tests:

```bash
npx hardhat test
```

---

## Challenges Faced

- ❌ Initially planned integration with **Hyperledger FireFly** was paused due to wallet accounts and ether hurdles.

- ⚙️ Transitioned to **Hardhat** for a more developer-friendly, local testing and simulation environment.

- 🔗 Future-ready architecture built to scale for **Ethereum Mainnet** deployment.

- Clone. Learn. Build. by SLM
-
-
-
   MIT LICENSE.

