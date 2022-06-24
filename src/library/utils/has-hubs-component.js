import { findChild } from "../utils";

export default function hasHubsComponent(mesh, componentName) {
	return !!findChild({
		candidates: [mesh],
		predicate: (obj) => {
			const gltfExtensions = obj.userData.gltfExtensions;
			const hubsComponents = gltfExtensions && gltfExtensions.MOZ_hubs_components;
			if (hubsComponents && hubsComponents[componentName]) {
				return true;
			}
		},
	});
}
