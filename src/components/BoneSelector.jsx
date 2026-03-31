import React, { useState } from 'react';
import './BoneSelector.css'; // Import CSS for styling
import boneDot from "../images/humanoid_option.png"
import humanoidUI from "../images/humanoid_ui.png"

// Example CharacterBase component
const CharacterBase = ({}) => {
  return (
    <div className="character-base">
      <img src={humanoidUI}/>
    </div>
  );
};

// Example BoneDot component
const BoneDot = ({ position, onSelect }) => {
  return (
    <div
        className="bone-dot"
      style={{ left: `${position.x}px`, top: `${-position.y}px` }}
      onClick={() => onSelect(position)}>
       <img 
            src={boneDot}
        /> 
    </div>
  );
};

// Example BoneSelector component
export const BoneSelector = ({onSelect}) => {
  const [bonePositions, setBonePositions] = useState([
    { x: 0, y: 10, name:"hips" },

    { x: 0, y: 60, name:"spine" },
    { x: 0, y: 120, name:"chest" },
    { x: 0, y: 180, name:"upperChest" },
    { x: 0, y: 220, name:"neck" },
    { x: 0, y: 260, name:"head" },

    { x: -40, y: 180, name:"leftShoulder" },
    { x: 40, y: 180, name:"rightShoulder" },

    { x: -70, y: 160, name:"leftUpperArm" },
    { x: 70, y: 160, name:"rightUpperArm" },

    { x: -80, y: 80, name:"leftLowerArm" },
    { x: 80, y: 80, name:"rightLowerArm" },

    { x: -80, y: -20, name:"leftHand" },
    { x: 80, y: -20, name:"rightHand" },

    { x: -30, y: -20, name:"leftUpperLeg" },
    { x: 30, y: -20, name:"rightUpperLeg" },

    { x: -22, y: -120, name:"leftLowerLeg" },
    { x: 20, y: -120, name:"rightLowerLeg" },

    { x: -17, y: -260, name:"leftFoot" },
    { x: 17, y: -260, name:"rightFoot" },
    // Add more positions as needed
  ]);

  const handleSelect = (position) => {
    console.log('Bone selected at:', position);
    onSelect(position.name);
    // Additional logic for selecting a bone can be added here
  };

  return (
    <div className="bone-selector">
      <CharacterBase />
      <div className="bone-dot-position">
        {bonePositions.map((pos, index) => (
            <BoneDot
            key={index}
            position={pos}
            onSelect={handleSelect}
            />
        ))}
      </div>
    </div>
  );
};
