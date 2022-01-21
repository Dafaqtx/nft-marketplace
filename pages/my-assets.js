import { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import Web3Modal from "web3modal";

import { nftAddress, nftMarketAddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [isLoaded, setLoaded] = useState(false);

  const loadNFTs = async () => {
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

    const data = await marketContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (item) => {
        const tokenUri = await tokenContract.tokenURI(item.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(item.price.toString(), "ether");

        return {
          price,
          tokenId: item.tokenId.toNumber(),
          seller: item.seller,
          owner: item.owner,
          image: meta.data.image,
        };
      })
    );

    setNfts(items);
    setLoaded(true);
  };

  useEffect(() => {
    loadNFTs();
  }, []);

  if (isLoaded && !nfts.length) {
    return <h1 className="px-20 py-10 text-3xl">No assets owned</h1>;
  }

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} className="rounded" alt={nft.name} />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price {nft.price} Matic
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
