import React from "react"
import LoadingOverlayCircularStatic from "./components/LoadingOverlay"
import { useLoading, useLoadedTraits } from "./store"

function LoadingScreen() {
  const loading = useLoading((state) => state.loading)
  const loadedTraits = useLoadedTraits((state) => state.loadedTraits)

  return loading &&
    <LoadingOverlayCircularStatic
        style={{
            position: "fixed",
            zIndex: 100,
            margin: 0,
        }}
        loadingModelProgress={loadedTraits}
        title={"Loading"}
        background={"#000000"}
    />
}

export default LoadingScreen;