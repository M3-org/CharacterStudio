import { Principal } from "@dfinity/principal"
import DIP721_V1_IDL from "../util/dip_721_v1"

const nftCanisterId = "5movr-diaaa-aaaak-aaftq-cai"

export const getMyDIP721Tokens = () => {
  return new Promise(async (resolve, reject) => {
    const hasAllowed = await (window as any).ic?.plug?.requestConnect({
      whitelist: [nftCanisterId], // whitelisting canister ID's for plug
    })
    if (!hasAllowed) {
      console.error("allow the canisters")
    }

    const wallet = await (window as any).ic?.plug
    const walletAddress = wallet.accountId
    const nftActor = await (window as any).ic?.plug?.createActor({
      canisterId: nftCanisterId,
      interfaceFactory: DIP721_V1_IDL,
    })

    const { ok: myTokens } = await nftActor?.tokens(walletAddress)
    let myNFTs = []
    for (let i = 0; i < myTokens.length; i++) {
      const NFT = await nftActor?.getMergedSVG(myTokens[i])
      myNFTs[i] = {
        slot: i,
        data: NFT,
        name: "ICPuppies",
      }
    }

    resolve(myNFTs)
  })
}
