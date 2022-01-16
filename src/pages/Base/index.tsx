import * as React from "react";
import { apiService } from "../../actions/services";
import { useGlobalState } from "../../components/GlobalProvider";
import Scene from "../../components/Scene";
import Tools from "../../components/Tools";

export default function Base() {
  const { setCategories, setCategoriesLoaded }: any = useGlobalState();
  // Loading Categories
  React.useEffect(() => {
    apiService.fetchCaterories('base').then((res) => {
      setCategories(res);
      setCategoriesLoaded(true);
    });
  },[]);
  return (
    <React.Fragment>
      <Tools />
      <Scene editor="base" wrapClass="base" />
    </React.Fragment>
  );
}
