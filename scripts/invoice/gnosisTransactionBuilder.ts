import SafeApiKit from '@safe-global/api-kit';
import Safe from '@safe-global/protocol-kit';
import { OperationType } from '@safe-global/types-kit';
import { ethers, AbiCoder } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// --- Type definitions ---
export interface PayerWallet {
  rpc: string;
  chainName: string;
  chainId: string;
  address: string;
}

export interface PayeeWallet {
  address: string;
}

export interface TokenInfo {
  symbol: string;
  evmAddress: string;
  decimals: number;
}

export interface PaymentDetail {
  payeeWallet: PayeeWallet;
  token: TokenInfo;
  amount: string | number;
}

export interface TransferResult {
  success: true;
  txHash: string;
  safeAddress: string;
  paymentDetails: PaymentDetail[];
}

// --- Implementation ---
async function executeTransferProposal(
  payerWallet: PayerWallet,
  paymentDetailsInput: PaymentDetail | PaymentDetail[],
): Promise<TransferResult> {
  const paymentDetails = Array.isArray(paymentDetailsInput)
    ? paymentDetailsInput
    : [paymentDetailsInput];

  const privateKey = process.env.SIGNER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Missing SIGNER_PRIVATE_KEY in .env');
  }

  console.log('\n=== Safe Transfer Initialization ===');
  console.log(`Chain: ${payerWallet.chainName} (${payerWallet.chainId})`);
  console.log(`Safe Address: ${payerWallet.address}`);

  // Set up provider and signer
  const provider = new ethers.JsonRpcProvider(payerWallet.rpc);
  const signer = new ethers.Wallet(privateKey, provider);

  // Safe API and Protocol Kit instances
  // @ts-ignore - Ignoring constructor error as per requirements
  const safeApiKit = new SafeApiKit({
    chainId: Number(payerWallet.chainId),
  });

  // @ts-ignore - Ignoring constructor error as per requirements
  const protocolKit = await Safe.init({
    provider: payerWallet.rpc,
    signer: privateKey,
    safeAddress: payerWallet.address,
  });

  // Build the batch of ERC-20 transfer calls
  const coder = AbiCoder.defaultAbiCoder();
  const transactions = paymentDetails.map((pd) => {
    const { payeeWallet, token, amount } = pd;
    const amountSmall = ethers.parseUnits(
      amount.toString(),
      token.decimals,
    );

    console.log('\n--- Preparing transfer ---');
    console.log(`Token: ${token.symbol} @ ${token.evmAddress}`);
    console.log(`To: ${payeeWallet.address}`);
    console.log(`Amount: ${amount} → ${amountSmall}`);

    // a9059cbb is the ERC-20 transfer method ID
    const data =
      '0xa9059cbb' +
      coder.encode(['address', 'uint256'], [
        payeeWallet.address,
        amountSmall,
      ]).slice(2);

    return {
      to: token.evmAddress,
      value: '0',
      data,
      operation: OperationType.Call,
    };
  });

  console.log('\n=== Creating Safe transaction ===');
  const safeTx = await protocolKit.createTransaction({ transactions });

  console.log('\n=== Signing & proposing ===');
  const safeTxHash = await protocolKit.getTransactionHash(safeTx);
  const signature = await protocolKit.signHash(safeTxHash);

  await safeApiKit.proposeTransaction({
    safeAddress: payerWallet.address,
    safeTransactionData: safeTx.data,
    safeTxHash,
    senderAddress: await signer.getAddress(),
    senderSignature: signature.data,
  });

  return {
    success: true,
    txHash: safeTxHash,
    safeAddress: payerWallet.address,
    paymentDetails,
  };
}

export { executeTransferProposal }
