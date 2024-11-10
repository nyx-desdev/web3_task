import React, { useContext, useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import AuthContext from "../context/AuthContext";

interface Title {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  uuid: string;
  title: string;
}

interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: { method: string }) => Promise<string[]>;
  };
}

declare const window: EthereumWindow;

const Dashboard: React.FC = () => {
  const { token, logout } = useContext(AuthContext)!;
  const [titles, setTitles] = useState<Title[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // Helper function to connect to MetaMask with controlled retries
  const connectToMetamask = async () => {
    if (window.ethereum && !isConnecting) {
      setIsConnecting(true);

      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setIsConnected(true);
        setWalletAddress(accounts[0]);
        localStorage.setItem("isMetamaskConnected", "true");
        localStorage.setItem("walletAddress", accounts[0]);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.log("Connection error:", (error as AxiosError).message);
          alert("Connection error: " + (error as AxiosError).message);
        } else {
          console.log("Connection error:", error);
          alert("Connection error: " + String(error));
        }
      } finally {
        setIsConnecting(false);
      }
    } else if (!window.ethereum) {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    const connectionStatus = localStorage.getItem("isMetamaskConnected");
    const storedWalletAddress = localStorage.getItem("walletAddress");

    if (connectionStatus === "true" && storedWalletAddress) {
      setIsConnected(true);
      setWalletAddress(storedWalletAddress);
    }

    const fetchData = async () => {
      try {
        const response = await axios.get<Title[]>(
          "http://localhost:8000/api/v1/title/",
          {
            headers: { Authorization: `${token}` },
          }
        );
        setTitles(response.data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.log("Fetch error:", error.message);
          // Logout if the token is expired (401 error)
          if (error.response?.status === 401) logout();
        } else {
          console.log("Fetch error:", error);
        }
      }
    };
    fetchData();
  }, [token, logout]);

  const handleAddTitle = async () => {
    // Check if the wallet is connected before adding a title
    if (!isConnected) {
      alert("Please connect your wallet to add a title.");
      return;
    }
    if (newTitle.trim() === "") return;
    try {
      const response = await axios.post<Title>(
        "http://localhost:8000/api/v1/title/",
        { title: newTitle },
        {
          headers: { Authorization: `${token}` },
        }
      );
      setTitles([...titles, response.data]);
      setNewTitle("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Add title error:", error.message);
        // Logout if the token is expired (401 error)
        if (error.response?.status === 401) logout();
      } else {
        console.log("Add title error:", error);
      }
    }
  };

  // Function to delete a title
  const handleDeleteTitle = async (uuid: string) => {
    // Check if the wallet is connected before deleting a title
    if (!isConnected) {
      alert("Please connect your wallet to delete a title.");
      return;
    }
    try {
      await axios.delete(`http://localhost:8000/api/v1/title/${uuid}/`, {
        headers: { Authorization: `${token}` },
      });
      // Update the titles state to remove the deleted title
      setTitles(titles.filter((title) => title.uuid !== uuid));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Delete title error:", error.message);
        // Logout if the token is expired (401 error)
        if (error.response?.status === 401) logout();
      } else {
        console.log("Delete title error:", error);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <nav className="flex justify-between items-center p-4 bg-gray-200">
        <h2 className="text-2xl font-bold">Welcome to the Dashboard</h2>
        <div className="flex space-x-4">
          {isConnected ? (
            <>
              <p className="mt-2 text-gray-700">
                Connected Wallet: {walletAddress}
              </p>
            </>
          ) : (
            <button
              onClick={connectToMetamask}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect to MetaMask"}
            </button>
          )}
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="mt-4 flex flex-col md:flex-row items-center justify-center">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter new title"
          className="border border-gray-300 rounded p-2 mb-2 md:mr-2 w-full md:w-1/2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddTitle}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition shadow-md w-full md:w-auto"
        >
          Add Title
        </button>
      </div>
      <ul className="mt-4 flex flex-col items-center">
        {titles
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .map((title) => (
            <li key={title.uuid} className="flex justify-between items-center w-full md:w-1/2 mb-2 bg-white shadow-md rounded p-2">
              {title.title}
              <button
                onClick={() => handleDeleteTitle(title.uuid)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Dashboard;
