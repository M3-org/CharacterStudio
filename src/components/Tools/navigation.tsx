import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Avatar from "@mui/material/Avatar";
import { Scrollbars } from "react-custom-scrollbars";
import DownloadIcon from '@mui/icons-material/Download';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';

// Importing icons from MUI
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsAccessibilityIcon from "@mui/icons-material/SettingsAccessibility";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

import "./style.scss";

import { useGlobalState } from "../GlobalProvider";
import { apiService } from "../../actions/services";

export default function ToolsNavigation() {
  const { categories, category, setCategory, navigation, setNavigation }: any = useGlobalState();

  //console.log(categories);

  const changeCategory = (category: any) => {
    setCategory({
      name: category.name,
      sideIndicator: category.sideIndicator,
    });
  };

  return (
    <List className="tools-navigation-wrap">
      <ListItem key={"body"} onClick={() => {setNavigation("body")}}>
        <Tooltip title="Body" arrow placement="right">
          <Avatar className={navigation && navigation === "body" ? "avatar active" : "avatar"}>
            <SettingsAccessibilityIcon />
          </Avatar>
        </Tooltip>
      </ListItem>
      <ListItem key={"randomize"} onClick={() => {setNavigation("randomize")}}>
        <Tooltip title="Randomize" arrow placement="right">
          <Avatar className={navigation && navigation === "randomize" ? "avatar active" : "avatar"}>
            <AutorenewIcon />
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
      <ListItem key={"scene"} onClick={() => {setNavigation("scene")}}>
        <Tooltip title="Scene" arrow placement="right">
          <Avatar className={navigation && navigation === "scene" ? "avatar active" : "avatar"}>
            <VideoCameraFrontIcon />
          </Avatar>
        </Tooltip>
      </ListItem>
      <ListItem key={"Settings"} onClick={() => {setNavigation("settings")}}>
        <Tooltip title="Settings" arrow placement="right">
          <Avatar className={navigation && navigation === "settings" ? "avatar active" : "avatar"}>
            <SettingsIcon />
          </Avatar>
        </Tooltip>
      </ListItem>
    </List>
  );
}
