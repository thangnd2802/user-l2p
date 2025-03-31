import * as React from 'react';
import Gateway from './components/gateway';
import User from './components/user';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';

const App: React.FC = () => {

  return (
    <Router>
    <Routes>
      <Route path="/login" element={
        <Login />
      } />
      <Route path="/gateway" element={
        <Gateway />
      } />
      <Route path="/" element={
        // <TabContext value={value}>
        //   <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        //     <TabList onChange={handleChange} aria-label="lab API tabs example">
        //       <Tab label="User" value="1" />
        //       <Tab label="Gateway" value="2" />
        //     </TabList>
        //   </Box>
        //   <TabPanel value="1">
            <User />
        //   </TabPanel>
        //   <TabPanel value="2">
        //     <Gateway />
        //   </TabPanel>
        // </TabContext>
      } />
      </Routes>
    </Router>
  );
};

// const SendTransaction: React.FC = () => {
//   const { publicKey, sendTransaction } = useWallet();
//   const connection = new Connection(endpoint, "confirmed");
//   const TOKEN_MINT = new PublicKey("4PC2uKh2Qcrz4yVYyw4X1LrLGULVruhUVR4Ce8wDkc3d"); // SPL Token Mint
//   const RECIPIENT = new PublicKey("G8AxHUeCVZZpRc2t3WXHXvBDqsJkZUyDbWBBMsaRziop"); // Recipient's wallet

//   const payId = '013b48f-5b1c4b-adddc';
//   const payAmount = 1;

//   const sendSOLWithMemo = useCallback(async () => {
//     if (!publicKey) {
//       alert("Connect your wallet first!");
//       return;
//     }

//     try {
//       const senderATA = await getAssociatedTokenAddress(TOKEN_MINT, publicKey);
//       const recipientATA = await getAssociatedTokenAddress(TOKEN_MINT, RECIPIENT);

//       const amountToSend = payAmount * 10**9; 

//       // Create a transfer instruction
//       const transferInstruction = createTransferInstruction(
//         senderATA, // From
//         recipientATA, // To
//         publicKey, // Owner
//         amountToSend // Amount (adjust based on token decimals)
//       );

//       // Create a memo instruction
//       const memoInstruction = new TransactionInstruction({
//         keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
//         data: Buffer.from(payId, "utf-8"),
//         programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
//       });

//       // Create a transaction and add both instructions
//       const transaction = new Transaction().add(transferInstruction, memoInstruction);

//       // Send transaction and confirm
//       const signature = await sendTransaction(transaction, connection);
//       await connection.confirmTransaction(signature, "confirmed");

//       console.log(`Transaction sent! Signature: ${signature}`);
//     } catch (error) {
//       console.error("Transaction failed:", error);
//     }
//   }, [publicKey, sendTransaction, connection]);

//   return (
//    <> 
//     <button onClick={sendSOLWithMemo} className="p-2 bg-blue-500 text-white rounded">
//       Send SOL with Memo
//     </button>
//     </>
//   );
//};

export default App;
