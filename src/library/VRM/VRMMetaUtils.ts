import { VRMMeta } from "@pixiv/three-vrm";
import { OutputVRMMeta } from "./OutputVRMInterfaces";
import { VRMImageData } from "./vrm-exporter";

type OutputImage = {
  bufferView: number;
  mimeType: string;
  name: string;
};

export function ToOutputVRMMeta(
  vrmMeta: VRMMeta,
  icon: VRMImageData | null,
  outputImage: Array<OutputImage>
): OutputVRMMeta {
  return {
    allowedUserName: vrmMeta.allowedUserName,
    author: vrmMeta.author,
    commercialUssageName: vrmMeta.commercialUssageName,
    contactInformation: vrmMeta.contactInformation,
    licenseName: vrmMeta.licenseName,
    otherLicenseUrl: vrmMeta.otherLicenseUrl,
    otherPermissionUrl: vrmMeta.otherPermissionUrl,
    reference: vrmMeta.reference,
    sexualUssageName: vrmMeta.sexualUssageName,
    texture: icon ? outputImage.length - 1 : undefined,
    title: vrmMeta.title,
    version: vrmMeta.version,
    violentUssageName: vrmMeta.violentUssageName,
  };
}