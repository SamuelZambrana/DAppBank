"use strict";

var METAMASK = null;
var BANK = null;
var NETWORK = null;

if (typeof window.ethereum == 'undefined') {

    console.error('MetaMask is not installed!');
    document.body.innerText = "MetaMask is not installed!"

} else {

    METAMASK = window.ethereum;

    const web3 = new window.Web3(METAMASK);

    // Add your data HERE!

    const BANK_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
    const BANK_ABI = [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "getMyBalance",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "getMyInterest",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "user",
                "type": "address"
              }
            ],
            "name": "getUserBalance",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "newRate",
                "type": "uint256"
              }
            ],
            "name": "setInterestRate",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "name": "withdraw",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
    ];

    BANK = new web3.eth.Contract(BANK_ABI, BANK_ADDRESS);

    NETWORK = {
        chainName: 'Hardhat',
        chainId: web3.utils.toHex(31337),
        nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
        rpcUrls: ['http://127.0.0.1:8545']
    }

    function MyApp() {
        return <div><Main /></div>;
    }

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);

    root.render(<MyApp />);
}