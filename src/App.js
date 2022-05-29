import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from "react";
import { BrowserView, MobileView } from "react-device-detect";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import "./assets/styles/main.scss";
import AvatarGenerator from "./components/AvatarGenerator";
import { GPRoute } from "./components/GlobalProvider";
const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#de2a5e",
        },
    },
});
export default function App() {
    return (_jsxs(Suspense, { fallback: "loading...", children: [_jsx(BrowserView, { children: _jsx(ThemeProvider, { theme: theme, children: _jsx("div", { className: "main-wrap", children: _jsx(Router, { children: _jsx(Switch, { children: _jsx(GPRoute, { path: "/", exact: true, component: AvatarGenerator }) }) }) }) }) }), _jsx(MobileView, { children: _jsx("div", { className: "abs top left smartphone", children: _jsx("div", { className: "fullScreenMessage", children: "Sorry, this content is currently unavailable on mobile." }) }) })] }));
}
