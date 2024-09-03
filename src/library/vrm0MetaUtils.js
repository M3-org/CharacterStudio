
import { getAsArray } from "./utils"

export function GetMetadataFromAvatar(avatar, customMeta){
    let title = customMeta.title;
    let author = [];
    let contactInformation = [];
    let reference = [];
    let otherPermissionUrl = [];
    let otherLicenseUrl = [];
    let allowedUsername = "Everyone";
    let violentUssageName = "Allow";
    let sexualUssageName = "Allow";
    let commercialUssageName = "Allow";
    let licenseName = "CC0";

    const metaValues = [];
    if (customMeta != null){
        metaValues.push(customMeta);
    }
    for (const prop in avatar){
        if (avatar[prop]?.vrm?.meta != null){
            metaValues.push(avatar[prop].vrm.meta)
        } 
    }

    metaValues.forEach(meta => {
        if (title == null)
            title = meta.title;
        author = author.concat(getAsArray(meta.author));
        contactInformation = contactInformation.concat(getAsArray(meta.contactInformation));
        reference = reference.concat(getAsArray(meta.reference));
        otherPermissionUrl = otherPermissionUrl.concat(getAsArray(meta.otherPermissionUrl));
        otherLicenseUrl = otherLicenseUrl.concat(getAsArray(meta.otherLicenseUrl));
        allowedUsername = getMostRestrictiveValue(UsernameType, allowedUsername, meta.allowedUsername);
        violentUssageName = getMostRestrictiveValue(AllowType, violentUssageName, meta.violentUssageName);
        sexualUssageName = getMostRestrictiveValue(AllowType, sexualUssageName,meta.sexualUssageName);
        commercialUssageName = getMostRestrictiveValue(AllowType, commercialUssageName, meta.commercialUssageName);
        licenseName = getMostRestrictiveValue(LicenseType, licenseName, meta.licenseName);
    });
    const authorFilter = [...new Set(author)].filter((a) => a!="" && a!=null && a!= 'undefined');
    const contactInformationFilter = [...new Set(contactInformation)].filter((a) => a!="" && a!=null && a!= 'undefined');
    const referenceFilter = [...new Set(reference)].filter((a) => a!="" && a!=null && a!= 'undefined');
    const otherPermissionUrlFilter = [...new Set(otherPermissionUrl)].filter((a) => a!="" && a!=null && a!= 'undefined');
    const otherLicenseUrlFilter = [...new Set(otherLicenseUrl)].filter((a) => a!="" && a!=null && a!= 'undefined');

    return {
        title:title,
        author:authorFilter.length == 0 ? "" : authorFilter.join(", "),
        contactInformation:contactInformationFilter.length == 0 ? "": contactInformationFilter.join(", "),
        reference:referenceFilter.length == 0 ? "": referenceFilter.join(", "),
        otherPermissionUrl:otherPermissionUrlFilter.length == 0 ? "": otherPermissionUrlFilter.join(", "),
        otherLicenseUrl:otherLicenseUrlFilter.length == 0 ? "": otherLicenseUrlFilter.join(", "),
        allowedUsername:allowedUsername,
        violentUssageName:violentUssageName,
        sexualUssageName:sexualUssageName,
        commercialUssageName:commercialUssageName,
        licenseName:licenseName
    }
}

const UsernameType = {
    OnlyAuthor: 0,
    ExplicitlyLicensedPerson: 1,
    Everyone: 2
};
const AllowType = {
    Disallow: 0,
    Allow: 1,
};
const LicenseType = {
    Redistribution_Prohibited: 0,
    Other: 1,
    CC_BY_NC_ND: 2,
    CC_BY_ND: 3,
    CC_BY_NC_SA: 4,
    CC_BY_SA: 5,
    CC_BY_NC: 6,
    CC_BY: 7,
    CC0: 8,
};

function getMostRestrictiveValue(enumType, currentValue, newValue) {
    // Ensure that both values exist in the provided enum
    if (newValue == null || !(newValue in enumType)){
        return currentValue;
    }

    // Compare the enum values and return the more restrictive one
    return enumType[currentValue] < enumType[newValue] ? currentValue : newValue;
}
