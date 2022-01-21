import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function CreateDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);

  const loadNfts = async () => {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftMarketAddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        };
        return item;
      })
    );

    const soldItems = items.filter((item) => item.sold);

    setNfts(items);
    setSold(soldItems);
    setLoaded(true);
  };

  useEffect(() => {
    loadNfts();
  }, []);

  return (
    <>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2:lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div
              className="border shadow rounded-xl overflow-hidden"
              key={nft.tokenId}
            >
              <img src={nft.image} className="rounded" alt="" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text white">
                  Price - {nft.price} Matic
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!!sold.length && (
        <div className="px-4">
          <h2 className="text-2xl py-2">Items Sold</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2:lg:grid-cols-4 gap-4 pt-4">
            {sold.map((nft) => (
              <div
                className="border shadow rounded-xl overflow-hidden"
                key={nft.tokenId}
              >
                <img src={nft.image} className="rounded" alt="" />
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text white">
                    Price - {nft.price} Matic
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
