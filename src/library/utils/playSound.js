
import useSound from 'use-sound';

export const BoopButton = () => {
    const [play] = useSound(boopSfx);
    return <button onClick={play}>Boop!</button>;
  };