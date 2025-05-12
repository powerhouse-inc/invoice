import SafeApiKit from '@safe-global/api-kit'
import Safe from '@safe-global/protocol-kit'
import { OperationType } from '@safe-global/types-kit'
import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Execute token transfer via Gnosis Safe
 * @param {Object} payerWallet - {rpc, chainName, chainId, address}
 * @param {Array} paymentDetails - Array of payment details, each containing payeeWallet, token, and amount
 */

async function executeTransferProposal(payerWallet, paymentDetails) {
    if (!Array.isArray(paymentDetails)) {
        paymentDetails = [paymentDetails];
    }

    const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY

    console.log('\n=== Safe Transfer Initialization ===')
    console.log(`Chain: ${payerWallet.chainName} (${payerWallet.chainId})`)
    console.log(`Safe Address: ${payerWallet.address}`)

    try {
        const provider = new ethers.JsonRpcProvider(payerWallet.rpc)
        const signer = new ethers.Wallet(SIGNER_PRIVATE_KEY, provider)

        // Initialize API Kit
        const safeApiKit = new SafeApiKit({
            chainId: payerWallet.chainId
        })

        // Initialize Protocol Kit
        const protocolKitOwner1 = await Safe.init({
            provider: payerWallet.rpc,
            signer: SIGNER_PRIVATE_KEY,
            safeAddress: payerWallet.address
        })

        // Create transactions array
        const transactions = []
        
        for (const payment of paymentDetails) {
            const { payeeWallet, token, amount } = payment;

            console.log(`\n=== Token Transfer Setup ===`);
            console.log(`Token: ${token.symbol} (${token.evmAddress})`);
            
            // Calculate amount in smallest unit using the token's decimals
            const amountInSmallestUnit = ethers.parseUnits(
                amount.toString(), 
                token.decimals
            );

            console.log('=== Transfer Details ===');
            console.log(`Amount: ${amount} ${token.symbol}`);
            console.log(`Amount in smallest unit: ${amountInSmallestUnit}`);
            console.log(`Recipient: ${payeeWallet.address}\n`);

            // Create ERC20 transfer data
            const transferData = {
                to: token.evmAddress,  // USDC contract address
                data: ethers.AbiCoder.defaultAbiCoder().encode(
                    ['address', 'uint256'],
                    [payeeWallet.address, amountInSmallestUnit]
                ).replace('0x', '0xa9059cbb'),  // 'transfer' function selector + encoded params
                value: '0',  // No ETH value for token transfers
                operation: OperationType.Call
            };

            transactions.push(transferData);
        }

        console.log('\n=== Processing Transfer ===');

        // Create Safe transaction with the token transfer data
        const safeTransaction = await protocolKitOwner1.createTransaction({
            transactions
        })
        
        console.log('\n=== Created Transaction ===');
        console.log('Safe Transaction:', JSON.stringify(safeTransaction.data, null, 2));
          
        const safeTxHash = await protocolKitOwner1.getTransactionHash(safeTransaction)
        console.log('\n=== Transaction Hash ===');
        console.log('Generated Safe Tx Hash:', safeTxHash);

        const signature = await protocolKitOwner1.signHash(safeTxHash)
        console.log('\n=== Signature Details ===');
        console.log('Signature Data:', signature.data);
        console.log('Signer Address:', await signer.getAddress());

        // Propose transaction to the service
        console.log('\n=== Proposing Transaction ===');
        console.log('Proposal Data:', JSON.stringify({
            safeAddress: payerWallet.address,
            safeTxHash,
            senderAddress: await signer.getAddress()
        }, null, 2));

        await safeApiKit.proposeTransaction({
            safeAddress: payerWallet.address,
            safeTransactionData: safeTransaction.data,
            safeTxHash,
            senderAddress: await signer.getAddress(),
            senderSignature: signature.data
        })

        return {
            success: true,
            txHash: safeTxHash,
            safeAddress: payerWallet.address,
            paymentDetails: paymentDetails.map((payment, index) => ({
                ...payment
            }))
        }

    } catch (error) {
        console.error('\n=== Transfer Error ===')
        console.error(error.message)
        if (error?.response?.data) {
            console.error('Response details:', error.response.data)
        }
        throw error
    }
}

export { executeTransferProposal }