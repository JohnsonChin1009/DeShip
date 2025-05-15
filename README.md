# deship
a decentralized web platform that ensures fairness, accountable and on-time scholarships to students while also eliminating demographic biasness using zkProofs.

## Problem
Traditional scholarships undergo multiple screening processes, resulting in late confirmation of scholarship towards multiple students. Students should be able to 

## Main Features
- User roles are depicted by the NFTs that they choose when they first sign in using their wallet.
- Users are able to prove their demographic profile without revealing them on-chain using zkProofs.
- [can add as you see fit]

## To run the application locally

1. First clone the repository to your local machine, open up a terminal and run:
```bash
git clone https://github.com/JohnsonChin1009/DeShip.git
```

2. Then, navigate to the cloned repository on your machine
```bash
cd DeShip
```

3. Install the dependencies (This project uses npm)
```bash
npm install
```

4. Create the .env file from .env.example, and add in environment variables accordingly
```bash
mv .env.example .env
```

5. Run the project
```
npm run dev
```

### Solution Architecutre
[Insert Solution Architecture image here]


### Contracts Deployed
1. NFT Contract for User Role [Click Here!](https://sepolia.scrollscan.com/address/0x3E16F77f78939AC48bE10112383d376D425F768D)
2. ScholarshipFactory Contract for Scholarships [Click Here!](https://sepolia.scrollscan.com/address/0x39F88Dc30438379135c6411AD65374F16Da37866)
3. ScholarshipAutomationHandler for Automatic Fund Distribution [Click Here!](https://sepolia.scrollscan.com/address/0x8864Ef59B160E10dF7465dD78179E2419e174a59)

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
| **Upkeep ID**     | `78658125821863182812978357463115396864169683263279217807875432969863982491630`          |
| **Contract**      | `ScholarshipAutomationHandler`               |
| **Contract Address** | `0x8864Ef59B160E10dF7465dD78179E2419e174a59` |
