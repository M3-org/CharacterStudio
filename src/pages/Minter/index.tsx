/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMoralis } from "react-moralis";
import Moralis from "moralis";
import { contractABI, contractAddress } from "../../contract";
import "./style.scss";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { Buffer } from "buffer";

const Minter: React.FC = () => {
  const { authenticate, isAuthenticated, logout } = useMoralis();
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [file, setFile] = React.useState(null);
  const [previewFile, setPreviewFile] = React.useState(null);
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const file1: any = new Moralis.File(file.name, file);
      await file1.saveIPFS();
      const file1url = file1.ipfs();
      const previewImage: any = new Moralis.File(previewFile.name, file);
      await previewImage.saveIPFS();
      const previewImageurl = previewImage.ipfs();
      const metadata = {
        name,
        description,
        image: previewImageurl,
        animation_url: file1url,
      };
      const file2: any = new Moralis.File(`${name}metadata.json`, {
        base64: Buffer.from(JSON.stringify(metadata)).toString("base64"),
      });
      await file2.saveIPFS();
      const metadataurl = file2.ipfs();
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const transaction = await tokenContract.mint(metadataurl);
      const tx = await transaction.wait();
      const event = tx.events[0];
      const value = event.args.tokenId;
      const tokenId = value.toNumber();
      alert(
        `NFT successfully minted. Contract address - ${contractAddress} and Token ID - ${tokenId}`
      );
    } catch (err) {
      console.error(err);
      alert("An error occured!");
    }
  };
  if (isAuthenticated) {
    return (
      <React.Fragment>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={name}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            value={description}
            placeholder="Description"
            onChange={(e) => setDescription(e.target.value)}
          />
          <div>
            <label>Model file</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <div>
            <label>Preview Image</label>
            <input
              type="file"
              onChange={(e) => setPreviewFile(e.target.files[0])}
            />
          </div>
          <button type="submit">Mint now!</button>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </form>
      </React.Fragment>
    );
  }
  return (
    <div className="container">
      <button onClick={authenticate as any}>Login using MetaMask</button>
    </div>
  );
};

export default Minter;
