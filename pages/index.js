import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import { nftAddress, nftMarketAddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [isLoaded, setLoaded] = useState(false);

  const loadNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      Market.abi,
      provider
    );
    const marketItems = await marketContract.fetchMarketItems();

    const items = await Promise.all(
      marketItems.map(
        async ({
          price: bigIntPrice,
          tokenId: bigIntTokenId,
          seller,
          owner,
        }) => {
          const tokenUri = await tokenContract.tokenURI(bigIntTokenId);
          const price = bigIntPrice.toString();
          const tokenId = bigIntTokenId.toNumber();
          const formattedPrice = ethers.utils.formatUnits(price, "ether");

          const { data } = await axios.get(tokenUri);
          return {
            price: formattedPrice,
            tokenId,
            seller,
            owner,
            image: data.name,
            description: data.description,
          };
        }
      )
    );

    setNfts(items);
    setLoaded(true);
  };

  useEffect(() => {
    loadNFTs();
  }, []);

  const buyNft = async (nft) => {
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftMarketAddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await contract.createMarketSale(
      nftAddress,
      nft.tokenId,
      {
        value: price,
      }
    );

    await transaction.wait();

    loadNFTs();
  };

  if (isLoaded && !nfts.length) {
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;
  }

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: 1600 }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft) => (
            <div
              key={nft.tokenId}
              className="border shadow rounded-xl overflow-hidden"
            >
              <img src={nft.image} alt={nft.name} />
              <p className="text-2xl font-semibold" style={{ height: 64 }}>
                {nft.name}
              </p>
              <div style={{ height: 70, overflow: "hidden" }}>
                <p className="text-gray-400">{nft.description}</p>
              </div>
              <div className="p-4 bg-black">
                <p className="text-2xl mb-4 font-bold text-white">
                  {nft.price} Matic
                </p>
                <button
                  className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
