import axios from "axios";
import fs from "fs";
import FormData from "form-data";

const key = import.meta.env.VITE_PINATA_API_KEY;
const secret = import.meta.env.VITE_PINATA_API_SECRET;

export const pinJSONToIPFS = async(JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    console.log(key, secret, JSONBody)
    return axios
        .post(url, JSONBody, {
            headers: {
                'pinata_api_key': key,
                'pinata_secret_api_key': secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               pinataUrl: response.data.IpfsHash
            //    pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }
           
        });
};

export const pinFileToIPFS = async(filename) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    filename.lastModifiedDate = new Date();
    filename.name = "RRR";

    //we gather a local file for this example, but any valid readStream source will work here.
    let data = new FormData();
    console.log(filename)
    // let file = new File([filename], "RRR.extension" );
    // console.log(file);
    data.append('file', filename);
console.log(data);
    //You'll need to make sure that the metadata is in the form of a JSON object that's been convered to a string
    //metadata is optional
    const metadata = JSON.stringify({
        name: 'pic',
        keyvalues: {
            Key: 'Value'
        }
    });
    data.append('pinataMetadata', metadata);

    //pinataOptions are optional
    const pinataOptions = JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
    data.append('pinataOptions', pinataOptions);

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'pinata_api_key': key,
                'pinata_secret_api_key': secret,
            }
        })
        .then(function (response) {
            //handle response here
            console.log(response.data.IpfsHash)
            return {
                success: true,
                pinataUrl: response.data.IpfsHash
             //    pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
            };
        })
        .catch(function (error) {
            //handle error here
            console.log(error)
            return {
                success: false,
                message: error.message,
            }
           
        });
};

export const removePinFromIPFS = (hashToUnpin) => {
    if (hashToUnpin.includes('/')) {
        hashToUnpin = hashToUnpin.substring( hashToUnpin.lastIndexOf('/')+1 )
    }
    const url = `https://api.pinata.cloud/pinning/unpin/${hashToUnpin}`;
    return axios
        .delete(url, {
            headers: {
                'pinata_api_key': key,
                'pinata_secret_api_key': secret,
            }
        })
        .then(function (response) {
            //handle response here
            // console.log(response)
        })
        .catch(function (error) {
            //handle error here
            // console.log(error)
        });
};