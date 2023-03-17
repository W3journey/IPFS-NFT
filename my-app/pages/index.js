import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [totalTokenIdsMinted, setTotalTokenIdsMinted] = useState("0");
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const web3ModalRef = useRef();

  /**
   * getTotalTokenIdsMinted: gets the number of tokenIds that have been minted
   */
  const getTotalTokenIdsMinted = async () => {
    try {
      const provider = await getProvider();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _totalTokenIdsMinted = await nftContract.tokenIds();
      setTotalTokenIdsMinted(_totalTokenIdsMinted.toString());
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * publicMint: Mint an NFT
   */
  const publicMint = async () => {
    setLoading(true);
    try {
      const signer = await getSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      const receipt = await tx.wait();
      if (receipt.status === 1 && receipt.gasUsed !== tx.gasLimit) {
        window.alert("You successfully minted a LW3Punk!");
        getTotalTokenIdsMinted();
      } else {
        window.alert("Transaction failed");
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  /**
   * getProvider
   */
  const getProvider = async () => {
    try {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      const provider = await web3ModalRef.current.connect();
      if (!provider) {
        throw new Error(
          "MetaMask not installed or connection request rejected"
        );
      }
      const web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 80001) {
        window.alert("Change network to Mumbai");
        throw new Error("Change network to Mumbai");
      }
      return web3Provider;
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * getSigner:
   */
  const getSigner = async () => {
    const provider = await getProvider();
    const signer = provider.getSigner();
    return signer;
  };

  /**
   * connectWallet: connects the MetaMask wallet
   */
  const connectWallet = async () => {
    try {
      await getProvider();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      connectWallet();
    }
    getTotalTokenIdsMinted();
  }, [walletConnected]);

  /**
   * renderButton: Returns a button based on the state of the dapp
   */
  const renderButton = () => {
    if (!walletConnected) {
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect
        </button>
      );
    }

    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    return (
      <button className={styles.button} onClick={publicMint}>
        Public Mint 🚀
      </button>
    );
  };

  return (
    <div>
      <Head>
        <title>LW3Punks</title>
        <meta name="description" content="LW3Punks-Dapp" />
        <link rel="icon" href="./favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to LW3Punks!</h1>
          <div className={styles.description}>
            it&#36;s an NFT collection for LearnWeb3 students.
          </div>
          <div className={styles.description}>
            {totalTokenIdsMinted}/10 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img
            className={styles.image}
            src="./LW3Punks/1.png"
            alt="LW3Punks NFT example"
          />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by LW3Punks</footer>
    </div>
  );
}
