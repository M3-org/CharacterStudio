import React, { useEffect, useState } from 'react';
import styles from './Load.module.css';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from "@web3-react/injected-connector"
import { ViewContext, ViewMode } from '../context/ViewContext';

import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

function Load() {
    const { account, library, activate } = useWeb3React();
    const [characters, setCharacters] = useState([]);
    const { setViewMode } = React.useContext(ViewContext);
    const { playSound } = React.useContext(SoundContext)
    const { isMute } = React.useContext(AudioContext)

    const injectedConnector = new InjectedConnector({
        supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
      })
    
    useEffect(() => {
        if (account && library) {
            const contractAddress = '0x69341F01C2113E2d09Cd4837bbF1786dfbBc41d7';
            const abi = [
                'function balanceOf(address owner) external view returns (uint256)',
                'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
                'function tokenURI(uint256 tokenId) external view returns (string)',
            ];
            const contract = new ethers.Contract(contractAddress, abi, library);
            contract.balanceOf(account).then((balance) => {
                const promises = [];
                for (let i = 0; i < balance; i++) {
                    promises.push(contract.tokenOfOwnerByIndex(account, i));
                }
                Promise.all(promises).then((tokenIds) => {
                    const tokenURIs = tokenIds.map((tokenId) => {
                        return contract.tokenURI(tokenId);
                    });
                    Promise.all(tokenURIs).then((values) => {
                        setCharacters(values);
                    });
                });
            });
        }
    }, [account, library]);

    const connectWallet = () => {
        activate(injectedConnector)
    }

    const loadCharacter = (character) => {
        !isMute && playSound('backNextButton');
        setViewMode(ViewMode.APPEARANCE)
    }

    const back = () => {
        setViewMode(ViewMode.LANDING)
        !isMute && playSound('backNextButton');
    }

    return (
        <div className={styles.container}>
        {/* if the user has not logged in, display a message */}
            {!account && (
                <div className={styles.message}>
                    Please connect your wallet to load your characters
                    {/* show connect button */}
                    <button className={styles.button} onClick={() => connectWallet()}>Connect</button>
                </div>
            )}
            <div className={styles.characterContainer}>
                <div className={styles.title}>Load Character</div>
                {characters.map((character, i) => {
                    return (
                        <div
                            key={i}
                                className={styles.character}
                                    onClick={()=> {loadCharacter(character)}}
                                    >
                            {JSON.stringify(character)}
                        </div>
                    );
                })}
            </div>
                {/* show back button to return to landing page */}
            <button className={styles.button} onClick={() => back()}>Back</button>
        </div>
    );
}

export default Load;