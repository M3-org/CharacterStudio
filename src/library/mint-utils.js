import { BigNumber, ethers } from "ethers"
import { getGLBBlobData } from "../library/download-utils"
import axios from "axios"

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY
const pinataSecretApiKey = import.meta.env.VITE_PINATA_API_SECRET

const mintCost = 0.01
const chainId = "0x89";

// ready to test
async function connectWallet(){
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

// ready to test
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

export async function mintAsset(data, screenshot, model, needCheckOT){
    if (!data)
        throw new Error("No data was provided")
    if (!screenshot)
        throw new Error("No screenshot was provided")
    if (!model)
        throw new Error("No model was provided")

    const walletAddress = connectWallet();

    const pass = !needCheckOT || await checkOT(walletAddress);

    if (pass){
        console.log("minting")
        // set image
        let imageName = "AvatarImage_" + Date.now() + ".png";
        let imageHash = await (async() => {
          for (let i = 0; i < 10; i++) { // hack: give it a few tries, sometimes uploading to pinata fail for some reason
            try {
              const img_hash = await saveFileToPinata(
                screenshot,
                imageName
              ).catch((reason) => {
                console.error(i, "---", reason)
              })
              return img_hash
            } catch(err) {
              console.warn(err);
            }
          }
          throw new Error('failed to upload screenshot');
        })

        const glb = await getGLBBlobData(model)
        if (glb) {
            let glbName = "AvatarGlb_" + Date.now() + ".glb";
            let glbHash = await (async() => {
            for (let i = 0; i < 10; i++) { // hack: give it a few tries, sometimes uploading to pinata fail for some reason
                try {
                const glb_hash = await saveFileToPinata(
                    glb,
                    glbName
                ).catch((reason) => {
                    console.error(i, "---", reason)
                    console.log(("Couldn't save glb to pinata"))
                    //setMintStatus("Couldn't save glb to pinata")
                })
                return glb_hash
                } catch(err) {
                console.warn(err);
                }
            }
            console.log(("Couldn't save glb to pinata"))
            //setMintStatus("Couldn't save glb to pinata")
            throw new Error('failed to upload glb');
            })();
        } else {
            throw new Error("Unable to get glb")
        }


        const attributes = getAvatarTraits()
        const metadata = {
            name: "Avatars",
            description: "Character Studio Avatars.",
            image: `ipfs://${imageHash.IpfsHash}`,
            animation_url: `ipfs://${glbHash.IpfsHash}`,
            attributes: attributes
        }
        const str = JSON.stringify(metadata)
        const metaDataHash = await saveFileToPinata(
            new Blob([str]),
            "AvatarMetadata_" + Date.now() + ".json",
        )
        const metadataIpfs = `ipfs://${metaDataHash.IpfsHash}`


    }
}

const mintAssetPrev = async (avatar) => {
    // let walletAddress = await connectWallet()

    // const pass = await checkOT(walletAddress);
    const pass = true;

    if(pass) {
    //   animationManager.enableScreenshot();
    //   blinkManager.enableScreenshot();
    //   setMintStatus("Uploading...")
    //   let imageHash, glbHash;

    //   avatar.traverse(o => {
    //     if (o.isSkinnedMesh) {
    //       const headBone = o.skeleton.bones.filter(bone => bone.name === 'head')[0];
    //       headBone.getWorldPosition(localVector);
    //     }
    //   });
    //   const headPosition = localVector;
    //   const female = templateInfo.name === "Drophunter";
    //   const cameraFov = female ? 0.78 : 0.85;
    //   screenshotManager.setCamera(headPosition, cameraFov);
    //   let imageName = "AvatarImage_" + Date.now() + ".png";
      
    //   const screenshot = screenshotManager.saveAsImage(imageName);
    //   blinkManager.disableScreenshot();
    //   animationManager.disableScreenshot();

      // const screenshot = await getCroppedScreenshot("editor-scene",screenshotPosition.x, screenshotPosition.y, screenshotPosition.width, screenshotPosition.height, true)
      if (screenshot) {
        let imageName = "AvatarImage_" + Date.now() + ".png";
        imageHash = await (async() => {
          for (let i = 0; i < 10; i++) { // hack: give it a few tries, sometimes uploading to pinata fail for some reason
            try {
              const img_hash = await saveFileToPinata(
                screenshot,
                imageName
              ).catch((reason) => {
                console.error(i, "---", reason)
              })
              return img_hash
            } catch(err) {
              console.warn(err);
            }
          }
          throw new Error('failed to upload screenshot');
          setMintStatus("Couldn't save screenshot to pinata")
        })();
      } else {
        throw new Error("Unable to get screenshot")
      }

      const glb = await getGLBBlobData(model)
      if (glb) {
        let glbName = "AvatarGlb_" + Date.now() + ".glb";
        glbHash = await (async() => {
          for (let i = 0; i < 10; i++) { // hack: give it a few tries, sometimes uploading to pinata fail for some reason
            try {
              const glb_hash = await saveFileToPinata(
                glb,
                glbName
              ).catch((reason) => {
                console.error(i, "---", reason)
                setMintStatus("Couldn't save glb to pinata")
              })
              return glb_hash
            } catch(err) {
              console.warn(err);
            }
          }
          throw new Error('failed to upload glb');
          setMintStatus("Couldn't save glb to pinata")
        })();
      } else {
        throw new Error("Unable to get glb")
      }

      const attributes = getAvatarTraits()
      const metadata = {
        name: "Avatars",
        description: "Character Studio Avatars.",
        image: `ipfs://${imageHash.IpfsHash}`,
        animation_url: `ipfs://${glbHash.IpfsHash}`,
        attributes: attributes
      }
      const str = JSON.stringify(metadata)
      const metaDataHash = await saveFileToPinata(
        new Blob([str]),
        "AvatarMetadata_" + Date.now() + ".json",
      )
      const metadataIpfs = `ipfs://${metaDataHash.IpfsHash}`

      setMintStatus("Minting...")
      const signer = new ethers.providers.Web3Provider(
        window.ethereum,
      ).getSigner()
      const contract = new ethers.Contract(CharacterContract.address, CharacterContract.abi, signer)
      try {
        const options = {
          value: tokenPrice,
          from: walletAddress
        }
        const tx = await contract.mintToken(1, metadataIpfs, options)
        let res = await tx.wait()
        if (res.transactionHash) {
          setMintStatus("Mint success!")
        }
      } catch (err) {
        setMintStatus("Public Mint failed! Please check your wallet.")
      }
    } else {
      return;
    }
}

const checkOT = async (address) => {
    if(address) {
      const address = '0x6e58309CD851A5B124E3A56768a42d12f3B6D104'
      const ethersigner = ethers.getDefaultProvider("mainnet", {
        alchemy: import.meta.env.VITE_ALCHEMY_API_KEY,
      })
      const contract = new ethers.Contract(EternalProxyContract.address, EternalProxyContract.abi, ethersigner);
      const webaBalance = await contract.beneficiaryBalanceOf(address, webaverseGenesisAddress, 1);
      if(parseInt(webaBalance) > 0) return true;
      else {
        setMintStatus("Currently in alpha. You need a genesis pass to mint. \n Will be public soon!")
        return false;
      }
    } else {
      setMintStatus("Please connect your wallet")
      return false;
    }
}

const showTrait = (trait) => {
    if (trait.name in avatar) {
        if ("traitInfo" in avatar[trait.name]) {
        return avatar[trait.name].name
        } else return "Default " + trait.name
    } else return "No set"
}