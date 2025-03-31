import React, { useCallback, useEffect } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  // SystemProgram,
  // LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  WalletAdapterNetwork,
} from "@solana/wallet-adapter-base";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  useWallet,
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { getAssociatedTokenAddress, createTransferInstruction } from "@solana/spl-token";

import "@solana/wallet-adapter-react-ui/styles.css";
import { Button, TextField, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';

const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

const Gateway: React.FC = () => {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[new PhantomWalletAdapter()]} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />
          <SendTransaction />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const SendTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { publicKey, sendTransaction } = useWallet();
  const connection = new Connection(endpoint, "confirmed");
  const TOKEN_MINT = new PublicKey("4PC2uKh2Qcrz4yVYyw4X1LrLGULVruhUVR4Ce8wDkc3d"); // SPL Token Mint
  // const RECIPIENT = new PublicKey("G8AxHUeCVZZpRc2t3WXHXvBDqsJkZUyDbWBBMsaRziop"); // Recipient's wallet
  const [payId, setPayId] = React.useState<string>("");
  const [methods, setMethods] = React.useState<string[]>([]); // List of methods
  const [method, setMethod] = React.useState<string>(""); // Selected method


  const [receiver, setReceiver] = React.useState<string>(""); // Recipient's wallet
  const [payAmount, setPayAmount] = React.useState<number>(0);

  const sendSOLWithMemo = useCallback(async () => {
    if (!publicKey) {
      alert("Connect your wallet first!");
      return;
    }
    if (!receiver) {
      alert("Please enter a recipient address.");
      return;
    }
    if (payAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (payId.length === 0) {
      alert("Please enter a PAYID.");
      return;
    }

    try {
      const RECIPIENT = new PublicKey(receiver);
      const senderATA = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
      const recipientATA = await getAssociatedTokenAddress(TOKEN_MINT, RECIPIENT);

      const amountToSend = payAmount * 10**9; 

      // Create a transfer instruction
      const transferInstruction = createTransferInstruction(
        senderATA, // From
        recipientATA, // To
        publicKey, // Owner
        amountToSend // Amount (adjust based on token decimals)
      );

      // Create a memo instruction
      const memoInstruction = new TransactionInstruction({
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
        data: Buffer.from(payId, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      });

      // Create a transaction and add both instructions
      const transaction = new Transaction().add(transferInstruction, memoInstruction);

      // Send transaction and confirm
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      console.log(`Transaction sent! Signature: ${signature}`);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  }, [publicKey, sendTransaction, connection]);

  const [payMessage, setPayMessage] = React.useState<string>("");

  const checkPayId = async () => {
    if (payId.length === 0) {
      alert("Please enter a PAYID.");
      return;
    }

    try {
      const response = await fetch(`https://gateway.jken.me/api/v1/gateway/payment/${payId}`);
      const data = await response.json();
      if (data) {
        setMethods(data.data.methods);
        setPayAmount(data.data.amount);
        setPayMessage(data.data.message);
      } else {
        // alert(`PayId ${payId} is not valid.`);
      }
    } catch (error) {
      console.error("Error checking PayId:", error);
    }
  }

  useEffect(() => {
    if (method) {
      setReceiver(method.split(":")[2]);
    }
  }, [method]);

  

  return (
   <div className="h-full w-screen p-5 flex flex-col gap-3"> 
    <Button
        variant="outlined" 
        onClick={() => navigate('/')} 
        size="small"
        sx={{ m: 1, minWidth: 100 }}
    >
        User page
    </Button>
    <TextField
              id="standard-basic" label="PayId" variant="standard" 
              sx={{ m: 1, minWidth: 500 }}
              value={payId}
              onChange={(e) => setPayId(e.target.value)}

      />
      <Button 
        variant="contained"
        onClick={checkPayId} 
        size="small"
        sx={{ m: 1, minWidth: 100 }}
    >
        Check PayId
    </Button>
    {
      methods.length > 0 && 
      <>
      <Typography variant="overline" gutterBottom sx={{ display: 'block' }}>
          Select method
      </Typography>
      <div className="max-w-200">
        { 
          methods.map((method, index) => (
            <Button 
              key={index}
              variant="contained"
              onClick={() => setMethod(method)} 
              size="small"
              sx={{ m: 1, minWidth: 100 }}
            >
              {method.split(":")[0]}
            </Button>
          ))
        }
      </div>
      </>
    }

    {
      method &&
        <>
          <Typography variant="overline" gutterBottom sx={{ display: 'block' }}>
            ------------------------------------------<br/>
            Your payments
          </Typography>
          <div className="flex flex-row justify-between">
            <TextField
                      id="standard-basic" label="Amount" variant="standard" 
                      sx={{ m: 1, minWidth: 500 }}
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
            />
              <TextField
                      id="standard-basic" label="Message" variant="standard" 
                      sx={{ m: 1, minWidth: 1000 }}
                      slotProps={{
                        input: {
                          readOnly: true,
                        },
                      }}
                      value={payMessage}
            />
          </div>
          <TextField
                    id="standard-basic" label="Recipient" variant="standard" 
                    sx={{ m: 1, minWidth: 500 }}
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
          />

          <Button 
              variant="contained"
              onClick={sendSOLWithMemo}
              size="small"
              sx={{ m: 1, minWidth: 100 }}
              disabled={!publicKey || !receiver || payAmount <= 0 || payId.length === 0}
              color="primary"
          >
              Send SOL with Memo
          </Button>
        </>
      }
    </div>
  );
};

export default Gateway;
