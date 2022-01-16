import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";

import "./style.scss";

import { useGlobalState } from "../AuthContextWrap";
import { apiService } from "../../actions/services";
import LeftRightSwitch from "./switch";
import SearchElements from "./search";
import { Scrollbars } from "react-custom-scrollbars";
import PoseEditor from "./editor";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`poses-tabpanel-${index}`}
      aria-labelledby={`poses-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Selector() {
  const {
    category,
    collection,
    setCollection,
    loadedMeshes,
    isLeft,
    meshType,
    updateMesh,
    search,
  }: any = useGlobalState();

  useEffect(() => {
      apiService
        .filterElements(search, collection, category.name)
        .then((res: any) => {
          setCollection(res.data);
        });
  }, [isLeft, search]);

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="selector-wrap">
      <Grid container spacing={2} className="title-wrap">
        <Grid item xs={8} p="0">
          <h2>
            {category.sideIndicator && (isLeft ? "Left " : "Right ")}
            {category.name}
          </h2>
        </Grid>
        <Grid item xs={4} p="0">
          {category && category.sideIndicator && <LeftRightSwitch />}
        </Grid>
        <Grid item xs={12} pt={0} className="search-wrap">
          <SearchElements />
        </Grid>
      </Grid>
      {category && category.name === "pose" ? (
        <React.Fragment>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Pose Editor Switch"
              className="tabs"
            >
              <Tab label="Poses" {...a11yProps(0)} />
              <Tab label="Editor" {...a11yProps(1)} />
            </Tabs>
          </Box>
          <Scrollbars className="scroll poses">
            <TabPanel value={value} index={0}>
              <Grid container spacing={2}>
                {collection &&
                  collection.map((item: any, index: any) => {
                    return (
                      <Grid
                        item
                        xs={6}
                        className={
                          (!category.sideIndicator &&
                            loadedMeshes[meshType] === item.file) ||
                          (category.sideIndicator &&
                            loadedMeshes[meshType] ===
                              item.file[isLeft ? 0 : 1])
                            ? "selection-preview active"
                            : "selection-preview"
                        }
                        onClick={() => updateMesh(category, item)}
                        key={index}
                      >
                        <Avatar
                          alt={`${item.name}`}
                          className="avatar"
                          src={
                            item.img &&
                            "/img/library/" + category.name + "/" + item.img
                          }
                        />
                        <p>{item.name}</p>
                      </Grid>
                    );
                  })}
              </Grid>
            </TabPanel>
            <TabPanel value={value} index={1}>
              {category && category.name === "pose" && <PoseEditor />}
            </TabPanel>
          </Scrollbars>
        </React.Fragment>
      ) : (
        <Scrollbars className="scroll">
          <Grid container spacing={2} className="selection-list">
            {collection &&
              collection.map((item: any, index: any) => {
                return (
                  <Grid
                    item
                    xs={6}
                    className={
                      (!category.sideIndicator &&
                        loadedMeshes[meshType] === item.file) ||
                      (category.sideIndicator &&
                        loadedMeshes[meshType] === item.file[isLeft ? 0 : 1])
                        ? "selection-preview active"
                        : "selection-preview"
                    }
                    onClick={() => updateMesh(category, item)}
                    key={index}
                  >
                    <Avatar
                      alt={`${item.name}`}
                      className="avatar"
                      src={
                        item.img &&
                        "/img/library/" + category.name + "/" + item.img
                      }
                    />
                    <p>{item.name}</p>
                  </Grid>
                );
              })}
          </Grid>
        </Scrollbars>
      )}
    </div>
  );
}
