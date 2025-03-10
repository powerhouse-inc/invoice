import { createSafeClient } from '@safe-global/sdk-starter-kit'
import dotenv from 'dotenv'
import { ethers } from 'ethers'

dotenv.config()

/**
 * Execute token transfer via Gnosis Safe
 * @param {Object} payerWallet - {rpc, chainName, chainId, address}
 * @param {Array} paymentDetails - Array of payment details, each containing payeeWallet, token, and amount
 */

// Define the expected type for the transaction result
interface Transaction {
    safeTxHash?: string;
    ethereumTxHash?: string;
}

let safeClient: any;

async function executeTokenTransfer(payerWallet: any, paymentDetails: any) {
    // Check if paymentDetails is a single object and convert it to an array
    if (!Array.isArray(paymentDetails)) {
        paymentDetails = [paymentDetails];
    }

    const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY

    console.log('\n=== Safe Transfer Initialization ===')
    console.log(`Chain: ${payerWallet.chainName} (${payerWallet.chainId})`)
    console.log(`Safe Address: ${payerWallet.address}`)

    try {
        safeClient = await createSafeClient({
            provider: payerWallet.rpc,
            signer: SIGNER_PRIVATE_KEY,
            safeAddress: payerWallet.address
        });

        const provider = new ethers.JsonRpcProvider(payerWallet.rpc);

        // Get the next nonce
        const nextNonce = await safeClient.getNonce();
        console.log('Next nonce:', nextNonce + 1);

        const transactions: any[] = [];
        const amountsInSmallestUnit: any[] = []; // Store amounts for each payment
        const decimalsList: any[] = []; // Store decimals for each token

        for (const payment of paymentDetails) {
            const { payeeWallet, token, amount } = payment

            console.log(`\nToken: ${token.symbol} (${token.evmAddress})`)

            // Get token decimals using ERC20 decimals() method
            const tokenContract = new ethers.Contract(
                token.evmAddress,
                ['function decimals() view returns (uint8)'],
                provider
            )
            const decimals = await tokenContract.decimals()
            decimalsList.push(decimals)  // Save the decimals for later use
            const amountInSmallestUnit = ethers.parseUnits(amount.toString(), decimals)
            amountsInSmallestUnit.push(amountInSmallestUnit)  // Save the amount for later use

            console.log('=== Transfer Details ===')
            console.log(`Amount: ${amount} ${token.symbol}`)
            console.log(`Recipient: ${payeeWallet.address}\n`)

            // Create transfer data using the ERC20 transfer method
            const transferData = {
                to: token.evmAddress,
                data: `0xa9059cbb${payeeWallet.address
                    .replace('0x', '')
                    .padStart(64, '0')
                    }${amountInSmallestUnit
                        .toString(16)
                        .padStart(64, '0')
                    }`
            }

            console.log('Transfer data created:', transferData)

            transactions.push({
                to: token.evmAddress,
                data: transferData.data,
                value: '0'  // Since we're transferring ERC20 tokens, ETH value is 0
            })
        }

        console.log('\n=== Processing Transfer ===')
        console.log('Submitting transaction to Safe...')
        
        const txResult = await safeClient.send({
            transactions,
            params: {
                nonce: nextNonce + 1
            }
        });

        console.log('Transaction result:', txResult);

        if (!txResult || !txResult.transactions) {
            throw new Error('Transaction submission failed, no transaction details returned.');
        }

        console.log('Transaction submitted successfully!\n')

        return {
            success: true,
            txHash: txResult.transactions,
            safeAddress: payerWallet.address,
            paymentDetails: paymentDetails.map((payment: any, index: any) => ({
                ...payment,
                amount: ethers.formatUnits(amountsInSmallestUnit[index], decimalsList[index])
            }))
        }

    } catch (error: any) {
        console.error('\n=== Transfer Error ===')
        console.error(error.message)
        if (error?.response?.data) {
            console.error('Response details:', error.response.data)
        }
        throw error
    }
}

export { executeTokenTransfer }


// export async function checkTransactionExecuted(generatedsafeTxHash: string, invoiceNo: string): Promise<boolean> {
//     try {
//         // Fetch the transaction details using the safeTxHash
//         const transactionDetails = await safeClient.getPendingTransactions();
//         const foundTransaction = transactionDetails.results.find((tx: any) => tx.safeTxHash === generatedsafeTxHash);

//         if (!foundTransaction) {
//             console.log('Transaction has been executed successfully.');
//             await updateInvoiceStatus(invoiceNo);
//             return true; // Transaction is executed
//         } else {
//             console.log('Transaction has not been executed yet.');
//             const { isExecuted } = foundTransaction;
//             // If the transaction is found and already executed
//             if (isExecuted) {
//                 console.log('Transaction is already executed.');
//                 await updateInvoiceStatus(invoiceNo);
//                 return true;
//             }
//             return false; // Transaction is still pending
//         }
//     } catch (error) {
//         console.error('Error fetching transaction details:', error);
//         throw error;
//     }
// }