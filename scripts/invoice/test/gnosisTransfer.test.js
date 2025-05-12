/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { executeTransferProposal } from '../gnosisTransactionBuildercopy.js';

async function testTokenTransfer() {
    // Test wallet configuration
    const payerWallet = {
        rpc: "https://base.llamarpc.com", // Your RPC URL
        chainName: "Base",
        chainId: "8453",
        address: "0x1FB6bEF04230d67aF0e3455B997a28AFcCe1F45e" // Your Safe address
    }

    // Test payment details
    const paymentDetails = {
        payeeWallet: {
            address: "0xEAcb81056705114bEeD7dF822363661ccf1Eb617" // Recipient address
        },
        token: {
            symbol: "USDC",
            evmAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC contract address
            decimals: 6
        },
        amount: "1" // Amount in USDC
    }

    try {
        const result = await executeTransferProposal(payerWallet, paymentDetails)
        console.log("Transaction submitted successfully:", result)
    } catch (error) {
        console.error("Transaction failed:", error)
    }
}

// Run the test
testTokenTransfer()