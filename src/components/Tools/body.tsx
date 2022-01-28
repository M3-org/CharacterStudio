import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useGlobalState } from "../GlobalProvider";
import "./style.scss";
import { TemplateEditorTools } from "./tools";


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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <React.Fragment>
          <Typography>{children}</Typography>
        </React.Fragment>
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

export function TemplateBodyTools() {
  const {
    modelNodes,
    scene,
    characterName,
    setCharacterName,
    randomize,
    setRandomize,
  }: any = useGlobalState();

  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <React.Fragment>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs"
        className="tabs"
      >
        <Tab label="Full Body" {...a11yProps(0)} className="options-tab" />
        <Tab label="Head" {...a11yProps(1)} className="options-tab" />
        <Tab label="Torso" {...a11yProps(2)} className="options-tab" />
        <Tab label="Arms" {...a11yProps(3)} className="options-tab" />
        <Tab label="Legs" {...a11yProps(4)} className="options-tab" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <TemplateEditorTools category="body" />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TemplateEditorTools category="head" />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <TemplateEditorTools category="torso" />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <TemplateEditorTools category="arms" />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <TemplateEditorTools category="legs" />
      </TabPanel>
    </React.Fragment>
  );
}
