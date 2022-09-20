import React, { Fragment, useState } from "react"
import './dabStuff.css';
import dip721v2_idl from '@psychedelic/dab-js/dist/idls/dip_721_v2.did';
import { sceneService } from "../services";
import { createActor, idlFactory } from './interfaces/motokoStorage/src/declarations/storage';
import LoadingOverlayCircularStatic from "../components/LoadingOverlay";


let storageActor;

export function Mint({ onSuccess }) {
  const [loadingModelProgress, setMintingProgress] = useState<number>(0)
  const [loadingModel, setMinting] = useState<boolean>(false)

  const cipherCanister = "6hgw2-nyaaa-aaaai-abkqq-cai"
  const cipherAssets = "piwdi-uyaaa-aaaam-qaojq-cai"

  const whitelist = [cipherCanister, cipherAssets];

  const checkIndex = async () => {
    const canisterId = cipherCanister;
    // await (window as any).ic.plug.createAgent({whitelist});
    const plugActor = await (window as any).ic.plug.createActor({ canisterId, interfaceFactory: dip721v2_idl });
    let tokenIndex = await plugActor.totalSupply();
    // let tokenIndex = 1;
    console.log("tokenIndex is", tokenIndex)
    // tokenIndex is a BigInt
    // add 1 to it and return it
    // convert token index to a string and remove the last character
    tokenIndex = tokenIndex.toString();
    console.log("tokenIndex is", tokenIndex);
    const finalNumber = Number(tokenIndex) + 1;
    return finalNumber;
  }


  const uploadChunk = async ({ batch_name, chunk }) => storageActor.create_chunk({
    batch_name,
    content: [...new Uint8Array(await chunk.arrayBuffer())],
  })

  const upload = async (file, name) => {
    const batch_name = name;
    const chunks = [];
    const chunkSize = 1500000

    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize);

      chunks.push(uploadChunk({
        batch_name,
        chunk
      }))
    }

    const chunkIds = await Promise.all(chunks);

    console.log("chunkIds", chunkIds);

    await storageActor.commit_batch({
      batch_name,
      chunk_ids: chunkIds.map(({ chunk_id }) => chunk_id),
      content_type: file.type
    })

    console.log("upload finished");
  }

  const mintNFT = async () => {
    setMinting(true)
    setMintingProgress(5 / 100)

    const canisterId = cipherCanister;
    const assetsCanister = cipherAssets;
    const principal = await (window as any).ic.plug.agent.getPrincipal();

    setMintingProgress(15 / 100)

    const tokenIndex = await checkIndex();
    await (window as any).ic.plug.createAgent({ whitelist });

    setMintingProgress(20 / 100)

    const image = await sceneService.getScreenShotByElementId('editor-scene');
    console.log("image", image);

    setMintingProgress(25 / 100)

    const plugActor = await (window as any).ic.plug.createActor({ canisterId: cipherCanister, interfaceFactory: dip721v2_idl });

    setMintingProgress(30 / 100)

    const model = await sceneService.getModelFromScene();

    setMintingProgress(35 / 100)

    const { neck, head, waist, chest, body, legs, hand, foot }: any = sceneService.getTraits();

    const agent = (window as any).ic.plug.agent;

    storageActor = createActor(assetsCanister, agent);

    console.log("image is", image);
    console.log("mo//del is", model);

    // TODO: Upload glb in chunks
    const previewImgUrl = tokenIndex + "_preview.jpg"; // TODO
    const modelUrl = tokenIndex + "_model.glb";
    const viewerLink = "https://" + cipherAssets + ".raw.ic0.app/assets/?token=" + tokenIndex;

    const actualImgUrl = "https://" + cipherAssets + ".raw.ic0.app/assets/" + previewImgUrl;
    const actualModelUrl = "https://" + cipherAssets + ".raw.ic0.app/assets/" + modelUrl;

    const previewAssetContainer = "https://fsn6e-wqaaa-aaaam-qapqa-cai.ic0.app/?token=" + tokenIndex;

    await upload(image, previewImgUrl);

    setMintingProgress(50 / 100)

    console.log("uploading model")
    await upload(model, modelUrl);

    setMintingProgress(99 / 100)

    // opensea metadata format
    const metadata = {
      name: import.meta.env.VITE_ASSET_NAME ?? "Open Character Creator Avatar",
      description: import.meta.env.VITE_ASSET_DESCRIPTION ?? "Custom 3D NFT Avatars",
      image: actualImgUrl,
      animation_url: actualModelUrl,
      attributes: [
        {
          trait_type: "Neck",
          value: neck?.traitInfo ? neck?.traitInfo?.name : "None"
        },
        {
          trait_type: "Head",
          value: head?.traitInfo ? head?.traitInfo?.name : "None"
        },
        {
          trait_type: "Chest",
          value: chest?.traitInfo ? chest?.traitInfo?.name : "None"
        },
        {
          trait_type: "Body",
          value: body?.traitInfo ? body?.traitInfo?.name : "None"
        },
        {
          trait_type: "Legs",
          value: legs?.traitInfo ? legs?.traitInfo?.name : "None"
        },
        {
          trait_type: "Hand",
          value: hand?.traitInfo ? hand?.traitInfo?.name : "None"
        },
        {
          trait_type: "Waist",
          value: waist?.traitInfo ? waist?.traitInfo?.name : "None"
        },
        {
          trait_type: "Foot",
          value: foot?.traitInfo ? foot?.traitInfo?.name : "None"
        }
      ]
    };

    const stringifiedMetadata = JSON.stringify(metadata);

    const properties = [
      [
        "location",
        {
          "TextContent": previewAssetContainer
        }
      ],
      [
        "json",
        {
          "TextContent": stringifiedMetadata
        }
      ]
    ];
    console.log("principal is", principal);
    console.log("tokenIndex is", tokenIndex);
    console.log("properties", properties)
    setMintingProgress(1)
    setMinting(false)
    const mintResult = await plugActor.mint(principal, tokenIndex, properties);
    console.log(mintResult);
    console.log(onSuccess);
    if (onSuccess) onSuccess(previewAssetContainer);
  }

  return (
    <Fragment>
      <div className='buttonContainer'>
      {loadingModel && (
        <LoadingOverlayCircularStatic
          loadingModelProgress={loadingModelProgress}
        />
      )}
        <button id='mintNFT' onClick={mintNFT} className='mintButton'>Mint</button>
      </div>
    </Fragment>
  )
}