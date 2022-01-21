import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

import { nftAddress, nftMarketAddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
const getInfuraUrl = (path) => `https://ipfs.infura.io/ipfs/${path}`;

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`recieved: ${prog}`),
      });

      const url = getInfuraUrl(added.path);
      setFileUrl(url);
    } catch (error) {
      console.log("Error on change form", error);
    }
  };

  const onChange = (e) => {
    const { value, name } = e.target;
    updateFormInput((prev) => ({ ...prev, [name]: value }));
  };

  const createSale = async (url) => {
    const web3Model = new Web3Modal();
    const connection = await web3Model.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(nftAddress, NFT.abi, signer);
    const nftTransaction = await nftContract.createToken(url);
    const tx = await nftTransaction.wait();

    const event = tx.events[0];
    const value = event.args[2];
    const tokenId = value.toNumber();

    const price = ethers.utils.parseUnits(formInput.price, "ether");

    const marketContract = new ethers.Contract(
      nftMarketAddress,
      Market.abi,
      signer
    );
    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();

    const marketTransaction = await contract.createMarketItem(
      nftAddress,
      tokenId,
      price,
      {
        value: listingPrice,
      }
    );

    await marketTransaction.wait();
    router.push("/");
  };

  const createItem = async () => {
    const { name, description, price } = formInput;

    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, price, image: fileUrl });

    try {
      const added = await client.add(data);
      const url = getInfuraUrl(added.path);

      await createSale(url);
    } catch (error) {
      console.log("Error on uploading file:", error);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-1/3 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          name="name"
          onChange={onChange}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4 resize-none"
          name="description"
          onChange={onChange}
        />
        <input
          placeholder="Asset Price in Matic"
          className="mt-2 border rounded p-4"
          name="price"
          onChange={onChange}
        />
        <input
          type="file"
          name="asset"
          className="my-4"
          onChange={onFileChange}
        />
        {fileUrl && (
          <img className="rounded mt-4" src={fileUrl} alt="NFT Preview" />
        )}
        <button
          type="button"
          onClick={createItem}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  );
}
