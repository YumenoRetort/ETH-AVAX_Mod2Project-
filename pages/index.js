import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amount, setAmount] = useState("");
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(0);
  const [newOwner, setNewOwner] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balance = await atm.getBalance();
      setBalance(balance);
    }
  };

  const deposit = async () => {
    if (atm && amount !== "") {
      try {
        let tx = await atm.deposit(ethers.utils.parseEther(amount));
        await tx.wait();
        setAmount("");
        getBalance();
        updateTransactionHistory(`Deposited ${amount} ETH`);
      } catch (error) {
        console.error("Deposit error:", error.message);
        alert(error.message);
      }
    }
  };

  const withdraw = async () => {
    if (atm && amount !== "") {
      try {
        let tx = await atm.withdraw(ethers.utils.parseEther(amount));
        await tx.wait();
        setAmount("");
        getBalance();
        updateTransactionHistory(`Withdrawn ${amount} ETH`);
      } catch (error) {
        console.error("Withdraw error:", error.message);
        alert(error.message);
      }
    }
  };

  const addItem = async () => {
    if (atm) {
      let tx = await atm.addItem(itemName, itemQuantity);
      await tx.wait();
      alert(`Added ${itemQuantity} of ${itemName}`);
    }
  };

  const redeemItem = async () => {
    if (atm) {
      let tx = await atm.redeemItem(itemName, itemQuantity);
      await tx.wait();
      alert(`Redeemed ${itemQuantity} of ${itemName}`);
    }
  };

  const transferOwnership = async () => {
    if (atm) {
      try {
        let tx = await atm.transferOwnership(newOwner);
        await tx.wait();
        alert(`Transferred ownership to ${newOwner}`);
        setAccount(newOwner);
        setNewOwner("");
      } catch (error) {
        console.error("Transfer ownership error:", error.message);
        alert(error.message);
      }
    }
  };

  const updateTransactionHistory = (transaction) => {
    setTransactionHistory([...transactionHistory, transaction]);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {newOwner ? newOwner : account}</p>
        <p>Your Balance: {balance ? ethers.utils.formatEther(balance) : "Loading..."} ETH</p>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
        <div>
          <h2>Add Item</h2>
          <input
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Item Quantity"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(parseInt(e.target.value))}
          />
          <button onClick={addItem}>Add Item</button>
        </div>
        <div>
          <h2>Redeem Item</h2>
          <input
            type="text"
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Item Quantity"
            value={itemQuantity}
            onChange={(e) => setItemQuantity(parseInt(e.target.value))}
          />
          <button onClick={redeemItem}>Redeem Item</button>
        </div>
        <div>
          <h2>Transfer Ownership</h2>
          <input
            type="text"
            placeholder="New Owner Address"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
          />
          <button onClick={transferOwnership}>Transfer Ownership</button>
        </div>
        <div>
          <h2>Transaction History</h2>
          <ul>
            {transactionHistory.map((transaction, index) => (
              <li key={index}>{transaction}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters Wallet/Warehouse!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          background-color: #e0f2f1;
          color: #37474f;
          font-family: Arial, sans-serif;
        }
        header {
          margin-bottom: 2rem;
        }
        input {
          margin: 0.5rem;
          padding: 0.5rem;
          font-size: 1rem;
        }
        button {
          margin: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          background-color: #80cbc4;
          border: none;
          color: white;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #4db6ac;
        }
      `}</style>
    </main>
  );
}
