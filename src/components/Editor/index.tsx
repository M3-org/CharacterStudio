import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import React from "react";
import { useGlobalState } from "../AuthContextWrap";
import Selector from "./selector";
import "./style.scss";

export default function MeshSelector() {
  const {
    categories,
    category
  }: any = useGlobalState();


  return (
    <div className="mesh-selector-wrap">
      <nav aria-label="main category selector">
        <List className="categories-wrap">
          {categories &&
            categories.map((cat: any, index: any) => {
              return (
                <ListItem
                  key={index}
                  className={
                    category && category.name === cat.name
                      ? "mesh-nav-item active"
                      : "mesh-nav-item"
                  }
                >
                  <Avatar
                    alt={`${cat.name}`}
                    className="icon"
                    src={`/img/graphics_creation/${cat.imgfile}`}
                  />
                </ListItem>
              );
            })}
        </List>
      </nav>
      <Selector />
    </div>
  );
}
