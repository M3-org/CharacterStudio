import {SceneContext} from '../../context/SceneContext'
import { useContext, useEffect, useState } from "react";


export const useUndoHistory = () => {
    const {characterManager} = useContext(SceneContext);

    const [canUndo, setCanUndo] = useState(false);

    const handler = () => {
        setCanUndo(characterManager.history.canUndo);
    }

    useEffect(() => {
        if(characterManager) {
            characterManager.history.on('change', handler);
        }

        return () => {
            if(characterManager) {
                characterManager.history.off('change',handler);
            }
        }
    }, [characterManager]);


    return canUndo
}