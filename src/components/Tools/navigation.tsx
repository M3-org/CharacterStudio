import DownloadIcon from '@mui/icons-material/Download';
import SettingsAccessibilityIcon from "@mui/icons-material/SettingsAccessibility";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { useGlobalState } from "../GlobalProvider";
import "./style.scss";

export default function ToolsNavigation() {
  const { navigation, setNavigation }: any = useGlobalState();

  return (
    <List className="tools-navigation-wrap">
      <ListItem key={"body"} onClick={() => {setNavigation("body")}}>
        <Tooltip title="Body" arrow placement="right">
          <Avatar className={navigation && navigation === "body" ? "avatar active" : "avatar"}>
            <SettingsAccessibilityIcon />
          </Avatar>
        </Tooltip>
      </ListItem>
      <ListItem key={"download"} onClick={() => {setNavigation("download")}}>
        <Tooltip title="Download" arrow placement="right">
          <Avatar className={navigation && navigation === "download" ? "avatar active" : "avatar"}>
            <DownloadIcon />
          </Avatar>
        </Tooltip>
      </ListItem>
    </List>
  );
}
