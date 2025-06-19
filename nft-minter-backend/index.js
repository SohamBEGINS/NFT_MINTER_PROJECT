require("dotenv").config();
const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Set up multer to store uploaded files temporarily in uploads/
const upload = multer({ dest: "uploads/" });

app.use(express.json());

// POST /mint-nft using Verbwire's quickMintFromFile endpoint
app.post("/mint-nft", upload.single("image"), async (req, res) => {
  try {
    const { name, description, walletAddress } = req.body;
    const imageFile = req.file;

    if (!name || !description || !walletAddress || !imageFile) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prepare form-data payload
    const form = new FormData();
    form.append("allowPlatformToOperateToken", "true");
    form.append("chain", "sepolia");
    form.append("filePath", fs.createReadStream(imageFile.path));
    form.append("name", name);
    form.append("description", description);
    

    // Call Verbwire API
    const response = await fetch("https://api.verbwire.com/v1/nft/mint/quickMintFromFile", {
      method: "POST",
      headers: {
        "X-API-Key": process.env.VERBWIRE_API_KEY,
        ...form.getHeaders(),
      },
      body: form,
    });

    const result = await response.json();
    console.log("Verbwire API response:", result);  // Add this debug line

    // Remove temp uploaded file
    fs.unlinkSync(imageFile.path);


    if (!response.ok) {
      throw new Error(result?.message || "Failed to mint NFT");
    }
    

     return res.json({
      success: true,
      tokenId:
        result.nft?.tokenId ||
        result.transaction_details.transactionID,
      imageUrl: result.nft?.imageUrl || null,
      transactionHash: result.transaction_details.transactionHash,
      blockExplorer: result.transaction_details.blockExplorer,
    });
  } catch (error) {
    console.error("Minting failed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ NFT Minting backend running at http://localhost:${port}`);
});
