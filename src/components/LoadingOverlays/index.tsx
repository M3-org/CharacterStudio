import * as React from "react";
import CircularProgress, {
  CircularProgressProps,
} from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import "./style.scss";
import { useGlobalState } from "../GlobalProvider";

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box className="loading-overlay-wrap">
      <Box
        sx={{ position: "relative", display: "inline-flex" }}
        className="vh-centered"
      >
        <CircularProgress />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function LoadingOverlayCircularStatic() {
  const { loadingModelProgress }: any = useGlobalState();
  return <CircularProgressWithLabel value={loadingModelProgress} />;
}
