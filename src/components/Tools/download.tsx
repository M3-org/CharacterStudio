import { Button } from "@mui/material";
import * as React from "react";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { threeService } from "../../services";
import { useGlobalState } from "../GlobalProvider";
import "./style.scss";
import Moralis from "moralis";
import { contractABI, contractAddress } from "../../contract";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { Buffer } from "buffer";

export function DownloadTools() {
  const { scene, model, templateInfo, gl, camera }: any = useGlobalState();
  const [file, setFile] = React.useState(null);
  const [name, setName] = React.useState("test");
  const [description, setDescription] = React.useState("test");
  const [preview, setPreview] = React.useState(null);
  const [previewImage, setPreviewImage]  = React.useState(null);
  const downloadModel = (format: any) => {
    threeService.download(
      model,
      `CC_Model_${templateInfo.name.replace(" ", "_")}`,
      format,
      false
    );
  };

  React.useEffect(() => {
    if (file && preview) {
      mint();
    }
  }, [file, preview]);

  const mint = async () => {
    try {
      const file1: any = new Moralis.File(file.name, file);
      await file1.saveIPFS();
      const file1url = file1.ipfs();
      const previewImage: any = new Moralis.File(preview.name, file);
      await previewImage.saveIPFS();
      const previewImageurl = previewImage.ipfs();
      const metadata = {
        name,
        description,
        image: previewImageurl,
        animation_url: file1url,
      };
      const file2: any = new Moralis.File(`${name}metadata.json`, {
        base64: Buffer.from(JSON.stringify(metadata)).toString("base64"),
      });
      await file2.saveIPFS();
      const metadataurl = file2.ipfs();
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const transaction = await tokenContract.mint(metadataurl);
      const tx = await transaction.wait();
      const event = tx.events[0];
      const value = event.args.tokenId;
      const tokenId = value.toNumber();
      alert(
        `NFT successfully minted. Contract address - ${contractAddress} and Token ID - ${tokenId}`
      );
    } catch (err) {
      console.error(err);
      alert("An error occured!");
    }
  };

  const generateMintFile = async () => {
    function save(blob, filename) {
      const fileOfBlob = new File([blob], filename);
      setFile(fileOfBlob);
    }

    function saveString(text, filename) {
      save(new Blob([text], { type: "text/plain" }), filename);
    }

    function saveArrayBuffer(buffer, filename) {
      save(new Blob([buffer], { type: "application/octet-stream" }), filename);
    }

    const downloadFileName = `CC_Model_${templateInfo.name.replace(" ", "_")}`;
    setName(downloadFileName)
    setDescription(`${downloadFileName} Description.`)
    const exporter = new GLTFExporter();
    const options = {
      trs: false,
      onlyVisible: false,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity,
    };
    exporter.parse(
      model.scene,
      function (result) {
        if (result instanceof ArrayBuffer) {
          saveArrayBuffer(result, `${downloadFileName}.glb`);
        } else {
          const output = JSON.stringify(result, null, 2);
          saveString(output, `${downloadFileName}.gltf`);
        }
      },
      options
    );


    renderToPNG();
  };


  const  renderToPNG = () => {
    const downloadFileName = `CC_Model_${templateInfo.name.replace(" ", "_")}`;
    gl.domElement.getContext('webgl', { preserveDrawingBuffer: true });
    scene.scale.set(3, 3, 3);
    scene.position.set(0, -2, 0);
    gl.render(scene, camera);
    gl.domElement.toBlob(
        function (blob) {
          const fileOfBlob = new File([blob], `${downloadFileName}.png`);
          setPreview(fileOfBlob);
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            setPreviewImage(reader.result);
            scene.scale.set(1, 1, 1);
            scene.position.set(0, 0.02, 0);
          });
          reader.readAsDataURL(fileOfBlob);
        },
        'image/png',
        1.0
    )

    gl.domElement.getContext('webgl', { preserveDrawingBuffer: false });
}

  return (
    <div>
      <Button
        onClick={() => downloadModel("gltf/glb")}
        variant="outlined"
        className="download-button"
      >
        Download GLTF/GLB
      </Button>
      <Button
        onClick={() => generateMintFile()}
        variant="outlined"
        className="download-button"
      >
        Mint GLTF/GLB
      </Button>
      <Button
        onClick={() => downloadModel("obj")}
        variant="outlined"
        className="download-button"
      >
        Download OBJ
      </Button>
      <Button
        onClick={() => downloadModel("vrm")}
        variant="outlined"
        className="download-button"
      >
        Download VRM
      </Button>
    </div>
  );
}
