import React  from 'react';
import { useRotateStore } from '../store'
import { AutoRotationButton } from '../styles/AutoRotate.styled';

export default function AutoRotate(props: any) {
    const isRotate = useRotateStore((state) => state.isRotate)
    const setRotate = useRotateStore((state) => state.setRotate)
    return (
        <AutoRotationButton
            isRotate = {isRotate}
            onClick={() => {setRotate(!isRotate)}}
        />
    )
}