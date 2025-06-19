import React, { useState } from "react";

function App() {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [mintStatus, setMintStatus] = useState(null);
  const [mintedNfts, setMintedNfts] = useState([]);

  // Replace with your fixed test wallet address or later MetaMask integration
  const testWalletAddress = "0x1234567890abcdef1234567890abcdef12345678";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleMint = async () => {
    if (!imageFile || !nftName || !nftDescription) {
      alert("Please provide name, description and upload an image first");
      return;
    }

    setMintStatus("Minting...");

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("name", nftName);
    formData.append("description", nftDescription);
    formData.append("walletAddress", testWalletAddress);

    try {
      const response = await fetch("http://localhost:4000/mint-nft", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Minting failed: ${response.statusText}`);
      }

      const data = await response.json();

       setMintStatus(
        `✅ Minted! Tx: ${data.transactionHash.slice(0, 8)}…`
      );

      setMintedNfts((prev) => [
        ...prev,
        {
          id: data.tokenId,
          name: nftName,
          description: nftDescription,
          imageUrl: data.imageUrl || preview,
          transactionHash: data.transactionHash,
          blockExplorer: data.blockExplorer,
        },
      ]);

      // Clear form
      setNftName("");
      setNftDescription("");
      setImageFile(null);
      setPreview(null);
    } catch (error) {
      setMintStatus(`❌ Error: ${error.message}`);
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-8 text-purple-700">
        Mint your NFT
      </h1>

      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 mb-10">
        <label className="block mb-2 font-semibold text-gray-700">
          NFT Name:
        </label>
        <input
          type="text"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          placeholder="Enter NFT name"
        />

        <label className="block mb-2 font-semibold text-gray-700">
          NFT Description:
        </label>
        <textarea
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          placeholder="Enter description"
          rows={3}
        />

        <label className="block mb-2 font-semibold text-gray-700">
          Upload your art:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-4"
        />

        {preview && (
          <div className="mb-4">
            <p className="text-gray-700 mb-2">Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-lg"
            />
          </div>
        )}

        <button
          onClick={handleMint}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Mint NFT (Testnet)
        </button>

        {mintStatus && (
          <p className="mt-4 text-center text-gray-800 font-semibold">
            {mintStatus}
          </p>
        )}
      </div>

      {/* NFT Gallery */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Your Minted NFTs:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mintedNfts.map((nft) => (
            <div
              key={nft.id}
              className="bg-white shadow-md rounded-lg p-4"
            >
              <img
                src={nft.imageUrl}
                alt={`NFT ${nft.id}`}
                className="rounded-md w-full mb-2"
              />
              <h3 className="mt-2 font-semibold">{nft.name}</h3>
              <p className="text-gray-600">{nft.description}</p>
              <p className="mt-1 text-gray-500 text-sm">
                Token ID: {nft.id}
              </p>
              {nft.blockExplorer && (
                <a
                  href={nft.blockExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-purple-600 underline text-sm"
                >
                  View on Explorer
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
