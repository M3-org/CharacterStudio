import React from "react";
import CircularProgress, {CircularProgressProps} from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

function CircularProgressWithLabel(props : CircularProgressProps & {
    value : number
}) {
    return (
        <Box sx={
            {
                position: "absolute",
                zIndex: 1000,
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(16,16,16,0.9)"
            }
        }>
            <Box sx={
                    {
                        position: "relative",
                        display: "inline-flex"
                    }
                }
                className="vh-centered">
                <CircularProgress/>
                <Box sx={
                    {
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }
                }>
                    <Typography variant="caption" component="div" color="text.secondary">
                        {
                        `${
                            Math.round(props.value)
                        }%`
                    }</Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default function LoadingOverlayCircularStatic({loadingModelProgress}) {
    return <CircularProgressWithLabel value={loadingModelProgress}/>;
}
