import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import "./style.scss";
import { useGlobalState } from "../GlobalProvider";
import { Button } from "@mui/material";
import dice from '../../assets/media/dice.svg';
export default function RandomizeButton(props) {
    const { randomize, setRandomize } = useGlobalState();
    return (_jsx(React.Fragment, { children: _jsx(Button, { onClick: () => !randomize && setRandomize(true), className: "randomize-button", children: _jsx("img", { src: dice, alt: "randomize", className: randomize && "spin" }) }) }));
}
