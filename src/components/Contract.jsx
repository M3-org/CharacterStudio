// TODO, move to config file

export const API_URL = "http://localhost:8081";
export const OTCollectionAddress = "0x543D43F390b7d681513045e8a85707438c463d80"

export const CHAINS = {
  Mainnet: {
    chainName: 'Ethereum Mainnet',
    name: 'Ethereum',
    blockExplorerUrls: ['https://etherscan.io'],
    chainId: '1',
    symbol: 'ETH',
    rpcUrls: ['https://mainnet.infura.io/v3/d9606cb27e59432190a37d607726eb09'],
    contract_name: 'mainnet',
    previewLink: 'https://etherscan.io/address/',
    brandColor: 'rgb(63,123,228)',
  },
  Polygon: {
    chainName: 'Polygon Mainnet',
    name: 'Polygon',
    blockExplorerUrls: ['https://polygonscan.com/'],
    chainId: '137',
    symbol: 'MATIC',
    rpcUrls: ['https://polygon-rpc.com'],
    decimals: 18,
    contract_name: 'polygon',
    previewLink: 'https://polygonscan.com/address/',
    brandColor: 'rgb(123,63,228)',
  },
  Goerli: {
    chainName: 'Goerli Testnet',
    name: 'Goerli',
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
    chainId: '5',
    symbol: 'GOERLI',
    rpcUrls: [
      'https://rpc.ankr.com/eth_goerli'],
    decimals: 18,
    contract_name: 'goerlitestnet',
    previewLink: 'https://goerli.etherscan.io//address/',
    brandColor: 'rgb(123,63,228)',
  },
};

export const CharacterContract = {
  owner: "0x634B0510C5062CFf8009eAAc2435eB93bc4764ad",
  // address: "0x69341F01C2113E2d09Cd4837bbF1786dfbBc41d7", // Polygon mainet
  address: "0x1bCb97c2242A66CD3FC6875d979fD11CF9Feedd0",
  abi: [
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4",
        },
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "tokenByIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "tokenOfOwnerByIndex",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    {
      inputs: [],
      name: "tokenPrice",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },

    {
      inputs: [
        {
          internalType: "uint256",
          name: "numberOfTokens",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "_tokenURI",
          type: "string",
        },
      ],
      name: "mintToken",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
  ],
};

export const EternalProxyContract = {
  address: "0x0000000000000aF8FE6E4DE40F4804C90fA8Ea8F",
  abi: [
  {
  "inputs": [],
  "stateMutability": "nonpayable",
  "type": "constructor"
  }, {
    "inputs": [],
    "name": "AddressMismatch",
    "type": "error"
  }, {
    "inputs": [],
    "name": "AlreadyProxied",
    "type": "error"
  }, {
    "inputs": [],
    "name": "ColdAddressCannotBeTheSameAsHot",
    "type": "error"
  }, {
    "inputs": [],
    "name": "ColdIsAddressZero",
    "type": "error"
  }, {
    "inputs": [],
    "name": "ColdWalletCannotInteractUseHot",
    "type": "error"
  }, {
    "inputs": [],
    "name": "DeliveryCannotBeTheZeroAddress",
    "type": "error"
  }, {
    "inputs": [],
    "name": "DeliveryIsAddressZero",
    "type": "error"
  }, {
    "inputs": [],
    "name": "EthWithdrawFailed",
    "type": "error"
  }, {
    "inputs": [],
    "name": "IncorrectProxyRegisterFee",
    "type": "error"
  }, {
    "inputs": [],
    "name": "MigrationIsAllowedOnceOnly",
    "type": "error"
  }, {
    "inputs": [],
    "name": "NoPaymentPendingForAddress",
    "type": "error"
  }, {
    "inputs": [],
    "name": "NoRecordFoundForAddress",
    "type": "error"
  }, {
    "inputs": [],
    "name": "OnlyHotAddressCanChangeAddress",
    "type": "error"
  }, {
    "inputs": [],
    "name": "ProxyRegisterFeeRequired",
    "type": "error"
  }, {
    "inputs": [],
    "name": "RegisterAddressLocked",
    "type": "error"
  }, {
    "inputs": [],
    "name": "RewardRateIsLocked",
    "type": "error"
  }, {
    "inputs": [],
    "name": "UnknownAmount",
    "type": "error"
  }, {
    "inputs": [],
    "name": "UnrecognisedEPSAPIAmount",
    "type": "error"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "hot",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "delivery",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "address",
      "name": "oldDelivery",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "uint256",
      "name": "provider",
      "type": "uint256"
    }],
    "name": "DeliveryUpdated",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "address",
      "name": "ensReverseRegistrarAddress",
      "type": "address"
    }],
    "name": "ENSReverseRegistrarSet",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "address",
      "name": "erc20",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "uint256",
      "name": "erc20Fee_",
      "type": "uint256"
    }],
    "name": "ERC20FeeUpdated",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [],
    "name": "MigrationComplete",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "hot",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "address",
      "name": "delivery",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "uint64",
      "name": "provider",
      "type": "uint64"
    }],
    "name": "NominationAccepted",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "hot",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "address",
      "name": "delivery",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "uint256",
      "name": "provider",
      "type": "uint256"
    }],
    "name": "NominationMade",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "previousOwner",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }],
    "name": "OwnershipTransferred",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "hot",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "address",
      "name": "delivery",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "uint64",
      "name": "provider",
      "type": "uint64"
    }],
    "name": "ProxyRecordLive",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "enum IEPSProxyRegister.Participant",
      "name": "initiator",
      "type": "uint8"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "hot",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "uint256",
      "name": "provider",
      "type": "uint256"
    }],
    "name": "RecordDeleted",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [],
    "name": "RewardRateLocked",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "uint96",
      "name": "rewardRate",
      "type": "uint96"
    }],
    "name": "RewardRateUpdated",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "address",
      "name": "newToken",
      "type": "address"
    }],
    "name": "RewardTokenUpdated",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "from",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "uint256",
      "name": "value",
      "type": "uint256"
    }],
    "name": "Transfer",
    "type": "event"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "hot_",
      "type": "address"
    }, {
      "internalType": "uint64",
      "name": "provider_",
      "type": "uint64"
    }],
    "name": "acceptNomination",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "activeEthAddresses",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "queryAddress_",
      "type": "address"
    }, {
      "internalType": "bool",
      "name": "checkingHot_",
      "type": "bool"
    }],
    "name": "addressIsAvailable",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "name": "balanceOf",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "queryAddress_",
      "type": "address"
    }],
    "name": "beneficiaryBalance",
    "outputs": [{
      "internalType": "uint256",
      "name": "balance_",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "queryAddress_",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "tokenContract_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "rightsIndex_",
      "type": "uint256"
    }],
    "name": "beneficiaryBalanceOf",
    "outputs": [{
      "internalType": "uint256",
      "name": "balance_",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "queryAddress_",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "tokenContract_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "id_",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "rightsIndex_",
      "type": "uint256"
    }],
    "name": "beneficiaryBalanceOf1155",
    "outputs": [{
      "internalType": "uint256",
      "name": "balance_",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "queryAddress_",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "tokenContract_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "rightsIndex_",
      "type": "uint256"
    }],
    "name": "beneficiaryBalanceOf20",
    "outputs": [{
      "internalType": "uint256",
      "name": "balance_",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "tokenContract_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "tokenId_",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "rightsIndex_",
      "type": "uint256"
    }],
    "name": "beneficiaryOf",
    "outputs": [{
      "internalType": "address",
      "name": "beneficiary_",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "cold_",
      "type": "address"
    }],
    "name": "coldIsActiveOnRegister",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "cold_",
      "type": "address"
    }],
    "name": "coldIsLive",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "name": "coldToHot",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "decimals",
    "outputs": [{
      "internalType": "uint8",
      "name": "",
      "type": "uint8"
    }],
    "stateMutability": "pure",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "provider_",
      "type": "uint256"
    }],
    "name": "deleteRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "deletionNominalEth",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "ensReverseRegistrar",
    "outputs": [{
      "internalType": "contract ENSReverseRegistrar",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "epsAPIBalance",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "erc1155DelegationRegister",
    "outputs": [{
      "internalType": "contract IERC1155DelegateRegister",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "erc1155DelegationRegisterAddressLocked",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "erc20DelegationRegister",
    "outputs": [{
      "internalType": "contract IERC20DelegateRegister",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "erc20DelegationRegisterAddressLocked",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "name": "erc20PerTransactionFee",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "erc721DelegationRegister",
    "outputs": [{
      "internalType": "contract IERC721DelegateRegister",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "erc721DelegationRegisterAddressLocked",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "receivedAddress_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "rightsIndex_",
      "type": "uint256"
    }],
    "name": "getAddresses1155",
    "outputs": [{
      "internalType": "address[]",
      "name": "proxyAddresses_",
      "type": "address[]"
    }, {
      "internalType": "address",
      "name": "delivery_",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "receivedAddress_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "rightsIndex_",
      "type": "uint256"
    }],
    "name": "getAddresses20",
    "outputs": [{
      "internalType": "address[]",
      "name": "proxyAddresses_",
      "type": "address[]"
    }, {
      "internalType": "address",
      "name": "delivery_",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "receivedAddress_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "rightsIndex_",
      "type": "uint256"
    }],
    "name": "getAddresses721",
    "outputs": [{
      "internalType": "address[]",
      "name": "proxyAddresses_",
      "type": "address[]"
    }, {
      "internalType": "address",
      "name": "delivery_",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "receivedAddress_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "rightsIndex_",
      "type": "uint256"
    }],
    "name": "getAllAddresses",
    "outputs": [{
      "internalType": "address[]",
      "name": "erc721Addresses_",
      "type": "address[]"
    }, {
      "internalType": "address[]",
      "name": "erc1155Addresses_",
      "type": "address[]"
    }, {
      "internalType": "address[]",
      "name": "erc20Addresses_",
      "type": "address[]"
    }, {
      "internalType": "address",
      "name": "delivery_",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "_receivedAddress",
      "type": "address"
    }],
    "name": "getColdAndDeliveryAddresses",
    "outputs": [{
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "delivery",
      "type": "address"
    }, {
      "internalType": "bool",
      "name": "isProxied",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "queryAddress_",
      "type": "address"
    }],
    "name": "getProxyRecordForAddress",
    "outputs": [{
      "internalType": "enum IEPSProxyRegister.ProxyStatus",
      "name": "status",
      "type": "uint8"
    }, {
      "internalType": "address",
      "name": "hot",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "delivery",
      "type": "address"
    }, {
      "internalType": "uint64",
      "name": "provider_",
      "type": "uint64"
    }, {
      "internalType": "bool",
      "name": "feePaid",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "cold_",
      "type": "address"
    }],
    "name": "getProxyRecordForCold",
    "outputs": [{
      "internalType": "enum IEPSProxyRegister.ProxyStatus",
      "name": "status",
      "type": "uint8"
    }, {
      "internalType": "address",
      "name": "hot",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "delivery",
      "type": "address"
    }, {
      "internalType": "uint64",
      "name": "provider_",
      "type": "uint64"
    }, {
      "internalType": "bool",
      "name": "feePaid",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "hot_",
      "type": "address"
    }],
    "name": "getProxyRecordForHot",
    "outputs": [{
      "internalType": "enum IEPSProxyRegister.ProxyStatus",
      "name": "status",
      "type": "uint8"
    }, {
      "internalType": "address",
      "name": "hot",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "delivery",
      "type": "address"
    }, {
      "internalType": "uint64",
      "name": "provider_",
      "type": "uint64"
    }, {
      "internalType": "bool",
      "name": "feePaid",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "hot_",
      "type": "address"
    }],
    "name": "hotIsActiveOnRegister",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "hot_",
      "type": "address"
    }],
    "name": "hotIsLive",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "name": "hotToRecord",
    "outputs": [{
      "internalType": "uint64",
      "name": "provider",
      "type": "uint64"
    }, {
      "internalType": "enum IEPSProxyRegister.ProxyStatus",
      "name": "status",
      "type": "uint8"
    }, {
      "internalType": "bool",
      "name": "feePaid",
      "type": "bool"
    }, {
      "internalType": "address",
      "name": "cold",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "delivery",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "hot_",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "cold_",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "delivery_",
      "type": "address"
    }],
    "name": "isValidAddresses",
    "outputs": [],
    "stateMutability": "pure",
    "type": "function"
  }, {
    "inputs": [],
    "name": "lockERC1155DelegationRegisterAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "lockERC20DelegationRegisterAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "lockERC721DelegationRegisterAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "lockRewardRate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "components": [{
        "internalType": "address",
        "name": "hot",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "cold",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "delivery",
        "type": "address"
      }],
      "internalType": "struct EPSRegister.MigratedRecord[]",
      "name": "migratedRecords_",
      "type": "tuple[]"
    }],
    "name": "migration",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "migrationComplete",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "name",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "pure",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "cold_",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "delivery_",
      "type": "address"
    }, {
      "internalType": "uint64",
      "name": "provider_",
      "type": "uint64"
    }],
    "name": "nominate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "sender_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "erc20Value_",
      "type": "uint256"
    }, {
      "internalType": "bytes",
      "name": "data_",
      "type": "bytes"
    }],
    "name": "onTokenTransfer",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "owner",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "proxyRegisterFee",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "contract IERC1155",
      "name": "token_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "tokenId_",
      "type": "uint256"
    }],
    "name": "rescueERC1155",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "contract IERC20",
      "name": "token_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "amount_",
      "type": "uint256"
    }],
    "name": "rescueERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "contract IERC721",
      "name": "token_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "tokenId_",
      "type": "uint256"
    }],
    "name": "rescueERC721",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "rewardRate",
    "outputs": [{
      "internalType": "uint88",
      "name": "",
      "type": "uint88"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "rewardRateLocked",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "rewardToken",
    "outputs": [{
      "internalType": "contract IOAT",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "deleteNominalEth_",
      "type": "uint256"
    }],
    "name": "setDeletionNominalEth",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "string",
      "name": "ensName_",
      "type": "string"
    }],
    "name": "setENSName",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "ensReverseRegistrar_",
      "type": "address"
    }],
    "name": "setENSReverseRegistrar",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "erc1155DelegationRegister_",
      "type": "address"
    }],
    "name": "setERC1155DelegationRegister",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "erc20DelegationRegister_",
      "type": "address"
    }],
    "name": "setERC20DelegationRegister",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "erc20_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "erc20Fee_",
      "type": "uint256"
    }],
    "name": "setERC20Fee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "erc721DelegationRegister_",
      "type": "address"
    }],
    "name": "setERC721DelegationRegister",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "count_",
      "type": "uint256"
    }, {
      "internalType": "uint256",
      "name": "air_",
      "type": "uint256"
    }],
    "name": "setNNumberOfEthAddressesAndAirdropAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "registerFee_",
      "type": "uint256"
    }],
    "name": "setRegisterFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint88",
      "name": "rewardRate_",
      "type": "uint88"
    }],
    "name": "setRewardRate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "rewardToken_",
      "type": "address"
    }],
    "name": "setRewardToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "treasuryAddress_",
      "type": "address"
    }],
    "name": "setTreasuryAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "symbol",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "pure",
    "type": "function"
  }, {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }],
    "name": "transfer",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "treasury",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "delivery_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "provider_",
      "type": "uint256"
    }],
    "name": "updateDeliveryAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "contract IERC20",
      "name": "token_",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "amount_",
      "type": "uint256"
    }],
    "name": "withdrawERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "amount_",
      "type": "uint256"
    }],
    "name": "withdrawETH",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "stateMutability": "payable",
    "type": "receive"
  }
  ]
}

export const DelegateCashContract = {
  address: "0x00000000000076A84feF008CDAbe6409d2FE638B",
  abi: [
    {
      "anonymous": false,
      "inputs": [{
        "indexed": false,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }, {
        "indexed": false,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }, {
        "indexed": false,
        "internalType": "bool",
        "name": "value",
        "type": "bool"
      }],
      "name": "DelegateForAll",
      "type": "event"
    }, {
      "anonymous": false,
      "inputs": [{
        "indexed": false,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }, {
        "indexed": false,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }, {
        "indexed": false,
        "internalType": "address",
        "name": "contract_",
        "type": "address"
      }, {
        "indexed": false,
        "internalType": "bool",
        "name": "value",
        "type": "bool"
      }],
      "name": "DelegateForContract",
      "type": "event"
    }, {
      "anonymous": false,
      "inputs": [{
        "indexed": false,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }, {
        "indexed": false,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }, {
        "indexed": false,
        "internalType": "address",
        "name": "contract_",
        "type": "address"
      }, {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }, {
        "indexed": false,
        "internalType": "bool",
        "name": "value",
        "type": "bool"
      }],
      "name": "DelegateForToken",
      "type": "event"
    }, {
      "anonymous": false,
      "inputs": [{
        "indexed": false,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }],
      "name": "RevokeAllDelegates",
      "type": "event"
    }, {
      "anonymous": false,
      "inputs": [{
        "indexed": false,
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }, {
        "indexed": false,
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }],
      "name": "RevokeDelegate",
      "type": "event"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }],
      "name": "checkDelegateForAll",
      "outputs": [{
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }],
      "stateMutability": "view",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "contract_",
        "type": "address"
      }],
      "name": "checkDelegateForContract",
      "outputs": [{
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }],
      "stateMutability": "view",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "contract_",
        "type": "address"
      }, {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }],
      "name": "checkDelegateForToken",
      "outputs": [{
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }],
      "stateMutability": "view",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }, {
        "internalType": "bool",
        "name": "value",
        "type": "bool"
      }],
      "name": "delegateForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "contract_",
        "type": "address"
      }, {
        "internalType": "bool",
        "name": "value",
        "type": "bool"
      }],
      "name": "delegateForContract",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "contract_",
        "type": "address"
      }, {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }, {
        "internalType": "bool",
        "name": "value",
        "type": "bool"
      }],
      "name": "delegateForToken",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }],
      "name": "getContractLevelDelegations",
      "outputs": [{
        "components": [{
          "internalType": "address",
          "name": "contract_",
          "type": "address"
        }, {
          "internalType": "address",
          "name": "delegate",
          "type": "address"
        }],
        "internalType": "struct IDelegationRegistry.ContractDelegation[]",
        "name": "contractDelegations",
        "type": "tuple[]"
      }],
      "stateMutability": "view",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }],
      "name": "getDelegatesForAll",
      "outputs": [{
        "internalType": "address[]",
        "name": "delegates",
        "type": "address[]"
      }],
      "stateMutability": "view",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "contract_",
        "type": "address"
      }],
      "name": "getDelegatesForContract",
      "outputs": [{
        "internalType": "address[]",
        "name": "delegates",
        "type": "address[]"
      }],
      "stateMutability": "view",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }, {
        "internalType": "address",
        "name": "contract_",
        "type": "address"
      }, {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }],
      "name": "getDelegatesForToken",
      "outputs": [{
        "internalType": "address[]",
        "name": "delegates",
        "type": "address[]"
      }],
      "stateMutability": "view",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }],
      "name": "getDelegationsByDelegate",
      "outputs": [{
        "components": [{
          "internalType": "enum IDelegationRegistry.DelegationType",
          "name": "type_",
          "type": "uint8"
        }, {
          "internalType": "address",
          "name": "vault",
          "type": "address"
        }, {
          "internalType": "address",
          "name": "delegate",
          "type": "address"
        }, {
          "internalType": "address",
          "name": "contract_",
          "type": "address"
        }, {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }],
        "internalType": "struct IDelegationRegistry.DelegationInfo[]",
        "name": "info",
        "type": "tuple[]"
      }],
      "stateMutability": "view",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }],
      "name": "getTokenLevelDelegations",
      "outputs": [{
        "components": [{
          "internalType": "address",
          "name": "contract_",
          "type": "address"
        }, {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }, {
          "internalType": "address",
          "name": "delegate",
          "type": "address"
        }],
        "internalType": "struct IDelegationRegistry.TokenDelegation[]",
        "name": "tokenDelegations",
        "type": "tuple[]"
      }],
      "stateMutability": "view",
      "type": "function"
    }, {
      "inputs": [],
      "name": "revokeAllDelegates",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "delegate",
        "type": "address"
      }],
      "name": "revokeDelegate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "address",
        "name": "vault",
        "type": "address"
      }],
      "name": "revokeSelf",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }, {
      "inputs": [{
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }],
      "name": "supportsInterface",
      "outputs": [{
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }],
      "stateMutability": "view",
      "type": "function"
    }
  ]
}
