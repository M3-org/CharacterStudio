
const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY
const pinataSecretApiKey = import.meta.env.VITE_PINATA_API_SECRET

const mintCost = 0.01

const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const chain = await window.ethereum.request({ method: 'eth_chainId' })
        if (parseInt(chain, 16) == parseInt(chainId, 16)) {
          const addressArray = await window.ethereum.request({
            method: 'eth_requestAccounts',
          })
          return addressArray.length > 0 ? addressArray[0] : ""
        } else {
            window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: chainId }],
            })
            const addressArray = await window.ethereum.request({
              method: 'eth_requestAccounts',
            })
            return addressArray.length > 0 ? addressArray[0] : ""
        }
      } catch (err) {
        return "";
      }
    } else {
      return "";
    }
  }

  async function saveFileToPinata(fileData, fileName) {
    if (!fileData) return console.warn("Error saving to pinata: No file data")
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`
    let data = new FormData()

    data.append("file", fileData, fileName)
    let resultOfUpload = await axios.post(url, data, {
      maxContentLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      maxBodyLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
    return resultOfUpload.data
  }