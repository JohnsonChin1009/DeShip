# 📚 DeShip
a decentralized web platform that ensures fairness, accountable and on-time scholarships to students while also eliminating demographic biasness using zkProofs.

## ⚠️ Problem

Traditional scholarships system faces several **critical challenges** that hinder fairness, speed, and trust:

### ⏳ Delayed Distribution
- Multiple manual screening rounds lead to **slow confirmation** and **late fund releases**.
- Students face uncertainty and financial stress due to **long wait times**.

### 🚫 Lack of Transparency
- **Opaque selection criteria** make it hard to understand why certain students are selected or rejected.
- **No audit trail** for decisions or fund disbursement.

### ⚖️ Unfair Selection & Bias
- **Demographic/geographic bias** can restrict opportunities for underrepresented students.
- **Unconscious bias** during manual reviews affects fair access.

### 🔒 Trust Issues
- Difficulty in **verifying student credentials** leads to skepticism from funders.
- Concerns over **misuse of funds** without milestone-based accountability.

---

✅ **DeShip addresses these issues** by integrating:
- 🧾 **Blockchain** for transparency and traceability  
- 🕵️‍♂️ **Zero-Knowledge Proofs** for privacy-preserving verification  
- ⚙️ **Smart Contracts** for core scholarship operations with trustless execution  
- ⏱️ **Chainlink Automation** automatically release funds upon milestone completion  
- 📊 **The Graph** for decentralized querying and data analysis

## Main Features

### 👨‍🎓 Student Features
- **Profile Management**:
  - Student able to create and update personal profile
  - Student able to add academic details and achievements

- **Scholarship Discovery**:
  - Student able to browse available scholarships
  - Student able to view detailed scholarship information
  - Student able to apply scholarship

- **Application System**:
  - Student able to submit scholarship applications
  - Student able to upload required informations

- **Scholarship Dashboard**:
  - Student able to view active scholarships
  - Student able to track milestone progress

### 🏢 Company Features
- **Profile Management**:
  - Company able to create and update company profile
  - Company able to add company details and industry

- **Scholarship Management**:
  - Company able to create new scholarships
  - Company able to set eligibility criteria
  - Company able to define milestone requirements
  - Company able to set funding parameters
  - Company able to edit existing scholarships

- **Application Management**:
  - Company able to review student applications
  - Company able to process applications
  - Company able to track application status
  - Company able to manage applications

- **Analytics Dashboard**:
  - Company able to view total scholarships created
  - Company able to monitor active scholars
  - Company able to track funding distribution
  - Company able to analyze application trends

### ⚡ Additional Features
- **Privy Authentication**:
  - Privy wallet-based authentication system
  - Secure role-based access control
  - Encrypted data storage and transmission

- **Zero-Knowledge Proofs**:
  - Student able to prove eligibility without revealing sensitive data
  - Privacy-preserving demographic verification
  - Secure identity verification

- **Chainlink Automation**:
  - Automated milestone verification
  - Automatic fund distribution
  - Automated scholarship status updates
  - Real-time payment processing

- **The Graph Integration**:
  - Real-time indexing of scholarship data
  - Efficient querying of scholarship statistics
  - Historical data tracking and analysis
  - Performance metrics visualization

## 🔄 User Flow

### 🏢 Company Flow
1. **Account Registration**
   - Connect MetaMask wallet
   - Select "Company" role
   - Fill in company details:
     - Company name
     - Industry
     - Description
     - Company Website
   - Submit profile creation
   - Redirected to company dashboard

2. **Scholarship Creation**
   - Navigate to "Create Scholarship"
   - Fill in scholarship details:
     - Title and description
     - Funding amount
     - Duration
     - Eligibility criteria
     - Milestone requirements
   - Sign transaction with smart contract
   - Scholarship appears in listing page

3. **Scholarship Management**
   - View all created scholarships
   - Edit scholarship details
   - Delete inactive scholarships
   - Monitor application status

4. **Application Review**
   - Access applicant listing page
   - View applicant information:
     - Student profile
     - Academic details
     - Other informations
   - Process applications
   - Track application status

5. **Profile Management**
   - Access profile section
   - View current company information
   - Edit company details
   - Update contact information
   - Save changes

### 👨‍🎓 Student Flow
1. **Account Registration**
   - Connect MetaMask wallet
   - Select "Student" role
   - Fill in student details:
     - Personal information
     - Academic background
     - Portfolio
   - Submit profile creation
   - Redirected to student dashboard

2. **Scholarship Discovery**
   - Browse available scholarships
   - Filter by:
     - Amount
     - Duration
     - Requirements
   - View detailed information
   - Save preferred scholarships

3. **Application Process**
   - Select scholarship to apply
   - Review requirements
   - Fill in required information
   - Submit application

4. **Scholarship Management**
   - View active scholarships
   - Track milestone progress
   - Submit milestone completions
   - Monitor fund distribution

5. **Profile Management**
   - Access profile section
   - View current information
   - Update personal details and other information
   - Save changes

## To run the application locally

### Prerequisites
1. **Node.js and npm**
   - Install Node.js (v18 or higher) from [nodejs.org](https://nodejs.org)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **MetaMask Wallet**
   - Install [MetaMask](https://metamask.io/) browser extension
   - Create or import a wallet
   - Add Hardhat Network:
     - Network Name: Hardhat Local
     - RPC URL: http://127.0.0.1:8545
     - Chain ID: 31337
     - Currency Symbol: ETH

3. **Git**
   - Install Git from [git-scm.com](https://git-scm.com)
   - Verify installation:
     ```bash
     git --version
     ```

### Setup Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/JohnsonChin1009/DeShip.git
   cd DeShip
   ```

2. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file
   cp .env.example .env
   ```
   
   Add the following to your `.env` file:
   ```
   # Pinata IPFS Configuration
   PINATA_GATEWAY=
   PINATA_API_KEY=
   PINATA_API_SECRET=
   PINATA_JWT_SECRET=

   # Privy Secrets
   NEXT_PUBLIC_PRIVY_APP_ID=
   PRIVY_APP_SECRET=
   PRIVY_JWKS_ENDPOINT=

   # IPFS Variables for NFT Minting
   COMPANY_METADATA_CID=
   STUDENT_METADATA_CID=

   # Metamask Private Key
   PRIVATE_KEY=

   # Supabase Variables
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=

   # Scholarship Contract Private Key
   METAMASK_PRIVATE_KEY=

   # Hardhat Configuration (Local Development)
   NEXT_PUBLIC_HARDHAT_RPC_URL=
   NEXT_PUBLIC_NETWORK_ID=
   ```

4. **Start Local Blockchain**
   ```bash
   # Start Hardhat node in a new terminal
   cd backend
   npx hardhat node
   ```

5. **Deploy Smart Contracts**
   ```bash
   # In a new terminal
   cd backend
   npx hardhat run scripts/deploy.js --network localhost
   ```
   
   After deployment, update the contract addresses and its ABI in `lib/contractABI.ts`:
   ```typescript
   export const roleNFT_CA = "deployed_role_nft_address";
   export const scholarshipFactory_CA = "deployed_factory_address";
   export const scholarshipAutomationHandler_CA = "deployed_handler_address";

   export const roleNFT_ABI = "deployed_role_nft_abi";
   export const scholarshipFactory_ABI = "deployed_scholarship_factory_abi";
   export const scholarship_ABI = "deployed_scholarship_abi";
   export const scholarshipAutomationHandler_ABI = "deployed_handler_abi";
   ```

6. **Import Test Accounts**
   - Copy private keys from Hardhat node output
   - Import them into MetaMask using "Import Account"
   - These accounts will have test ETH for development

7. **Start Development Server**
   ```bash
   # In a new terminal
   npm run dev
   ```

8. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Connect your MetaMask wallet
   - Choose your role (Company/Student)
   - Start using the application!

### Troubleshooting

1. **MetaMask Connection Issues**
   - Ensure you're on the Hardhat network
   - Check if you have enough test ETH
   - Try resetting your MetaMask account

2. **Contract Deployment Failures**
   - Verify Hardhat node is running
   - Check if port 8545 is available
   - Ensure you have the correct private key in .env

3. **Frontend Errors**
   - Clear browser cache
   - Check console for specific errors
   - Verify all environment variables are set

### Software Architecture
![Software Architecture](https://res.cloudinary.com/dzumvmtzs/image/upload/v1747393011/latest_architecture_py9zbo.jpg)


### Contracts Deployed
1. NFT Contract for User Role [Click Here!](https://sepolia.scrollscan.com/address/0x3E16F77f78939AC48bE10112383d376D425F768D#code)
2. ScholarshipFactory Contract for Scholarships [Click Here!](https://sepolia.scrollscan.com/address/0xDefBfC26831268F02ecFbf20905B559E7B3373C9#code)
3. ScholarshipAutomationHandler for Automatic Fund Distribution [Click Here!](https://sepolia.scrollscan.com/address/0x14331CcdE4041B1DeFDDC5AE56A1Dbd613Af4772#code)
4. Groth16Verifier Contract [Click Here!](https://sepolia.scrollscan.com/address/0xBE1f6af4111f83128d192389BDB934faDB11A19F#code)

## 📊 **The Graph Integration**  
DeShip uses **The Graph** to index and query scholarship data, such as:  
- **Total scholarships** (active/completed)  
- **Funding distribution** (released vs. locked funds)  
- **Student's performance** (milestone completion rates)  
- **Recent transactions** (fund releases)
- **Success Rate** (fund distribution)  

### **Subgraph Details**  
- **Subgraph URL**:  
  [https://api.studio.thegraph.com/query/105145/de-ship/version/latest](https://api.studio.thegraph.com/query/105145/de-ship/version/latest)  
- **Subgraph Repository**:  
  [https://github.com/johnp2003/deship-thegraph](https://github.com/johnp2003/deship-thegraph)

## ⚙️ **Chainlink Automation**

DeShip leverages **Chainlink Automation** to automate critical actions in scholarship management, removing the need for manual intervention and enhancing transparency.

### ✅ **Automated Functions**
- **Milestone Verification**: Checks if students have completed required milestones.
- **Fund Releases**: Automatically transfers funds to approved students upon milestone completion.
- **Scholarship Status Updates**: Marks scholarships as completed when all milestones are fulfilled.

### 🧠 **How It Works**
1. **Monitoring**: Chainlink nodes continuously run `checkUpkeep()` on the `AutomationHandler` contract.
2. **Triggering Actions**: If upkeep is needed, `performUpkeep()` is executed to:
   - Validate milestone completion.
   - Release corresponding funds.
   - Update scholarship statuses on-chain.
3. **Transparency**: Every action is verifiable and logged on the blockchain for audit purposes.

### 🔍 **Upkeep Details**
| Parameter         | Value                             |
|------------------|-----------------------------------|
| **Upkeep ID**     | `568783538657997219074577329414193953393060544212197530924047084999487229437`          |
| **Contract**      | `ScholarshipAutomationHandler`               |
| **Contract Address** | `0x14331CcdE4041B1DeFDDC5AE56A1Dbd613Af4772` |
