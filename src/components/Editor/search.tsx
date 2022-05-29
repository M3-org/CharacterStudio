import * as React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useGlobalState } from "../AuthContextWrap";

export default function SearchElements() {

  const {
    search,
    setSearch
  }: any = useGlobalState();
  
  return (
    <div>
      <SearchIcon className="search-icon" />
      <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
  );
}
