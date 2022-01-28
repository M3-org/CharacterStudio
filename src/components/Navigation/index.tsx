import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import logo from "../../assets/media/logo.svg";
import "./style.scss";


export default function Navigation(props) {
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const [ routeSelected , setRouteSelected ] = React.useState();


  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" className="navigation-wrap">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            className="logo"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            <a href="/">
              <img src={logo} height="42px" />
            </a>
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
