
import { getAsArray } from "./utils"

export function GetMetadataFromAvatar(avatar, customMeta, vrmName){

    const meta0Values = [];
    const meta1Values = [];

    for (const prop in avatar){
        if (avatar[prop]?.vrm?.meta != null){
            if (avatar[prop].vrm.meta.authors != null){
                meta1Values.push(avatar[prop].vrm.meta)
            }
            else{
                meta0Values.push(avatar[prop].vrm.meta)
            }
        } 
    }

    // if only 1 model is provided save the name of the model instead
    if (meta0Values.length + meta1Values.length == 1){
        if (meta0Values.length == 1){
            if (meta0Values[0].title != null){
                vrmName = meta0Values[0].title;
            }
        }else{
            if (meta1Values[0].name != null){
                vrmName = meta1Values[0].name;
            }
        }
    }
    if (customMeta != null){
        // vrm 1 uses "authors instead of author"
        if (customMeta.authors != null){
            meta1Values.push(customMeta);
        }
        else{
            meta0Values.push(customMeta);
        }
    }

    const vrm1MetaFromMeta0 =  GetMeta0DataAsMeta1(meta0Values);
    const fullMergedMetadata = GetFullMeta1Data(vrm1MetaFromMeta0, meta1Values);

    fullMergedMetadata.licenseUrl = "https://vrm.dev/licenses/1.0/";
    fullMergedMetadata.name = vrmName;

    return fullMergedMetadata;
}

function GetFullMeta1Data(meta0ValuesMerged, meta1Values){

    let {
        authors = [],
        otherLicenseUrl = [],
        contactInformation = [],
        references = [],
        allowExcessivelyViolentUsage = undefined,
        allowExcessivelySexualUsage = undefined,
        commercialUsage = undefined,
        copyrightInformation = "",
        avatarPermission = undefined,
        otherPermissionUrl = [],
    } = meta0ValuesMerged;
    let allowAntisocialOrHateUsage = undefined;
    let allowPoliticalOrReligiousUsage = undefined;
    let allowRedistribution = undefined;
    let creditNotation = "unnecessary";
    
    let modification = undefined;
    let thirdPartyLicenses = [];

    meta1Values.forEach(meta => {
        // vrm 0
        authors = authors.concat(getAsArray(meta.authors));
        otherLicenseUrl = otherLicenseUrl.concat(getAsArray(meta.otherLicenseUrl));
        contactInformation = contactInformation.concat(getAsArray(meta.contactInformation));
        references = references.concat(getAsArray(meta.references));
        otherPermissionUrl = otherPermissionUrl.concat(getAsArray(meta.otherPermissionUrl));
        if (meta.allowExcessivelyViolentUsage === false)
            allowExcessivelyViolentUsage = false;
        if (meta.allowExcessivelySexualUsage === false)
            allowExcessivelySexualUsage = false;      
        commercialUsage  = getMostRestrictiveValue(CommercialUsageType,commercialUsage,meta.commercialUsage);
        copyrightInformation = getMostRestrictiveValue(LicenseType,copyrightInformation,meta.copyrightInformation);
        avatarPermission = getMostRestrictiveValue(AvatarPermissionType, avatarPermission, meta.avatarPermission)
        

        // vrm1
        if (meta.allowAntisocialOrHateUsage === false)
            allowAntisocialOrHateUsage = allowAntisocialOrHateUsage = false;
        if (meta.allowPoliticalOrReligiousUsage === false)
            allowPoliticalOrReligiousUsage = allowPoliticalOrReligiousUsage = false;
        if (meta.allowRedistribution === false)
            allowRedistribution = allowRedistribution = false;
        if (meta.creditNotation === "required")
            creditNotation = "required";
        thirdPartyLicenses = thirdPartyLicenses.concat(getAsArray(meta.thirdPartyLicenses))
        modification = getMostRestrictiveValue(ModificationType, modification, meta.modification)
    });

    const authorsFilter = [...new Set(authors)].filter((a) => a!="" && a!=null && a!= 'undefined');
    const otherLicenseUrlFilter = [...new Set(otherLicenseUrl)].filter((a) => a!="" && a!=null && a!= 'undefined');
    const contactInformationFilter = [...new Set(contactInformation)].filter((a) => a!="" && a!=null && a!= 'undefined');
    const referencesFilter = [...new Set(references)].filter((a) => a!="" && a!=null && a!= 'undefined');
    const otherPermissionUrlFilter = [...new Set(otherPermissionUrl)].filter((a) => a!="" && a!=null && a!= 'undefined');
    const thirdPartyLicensesFilter = [...new Set(thirdPartyLicenses)].filter((a) => a!="" && a!=null && a!= 'undefined');
    

    return{
        authors:authorsFilter,
        otherLicenseUrl:otherLicenseUrlFilter.length == 0 ? "": otherLicenseUrlFilter.join(", "),
        contactInformation:contactInformationFilter.length == 0 ? "": contactInformationFilter.join(", "),
        references:referencesFilter,
        otherPermissionUrl:otherPermissionUrlFilter.length == 0 ? "": otherPermissionUrlFilter.join(", "),    
        thirdPartyLicenses:thirdPartyLicensesFilter.length == 0 ? "": thirdPartyLicensesFilter.join(", "),    
        
        allowExcessivelyViolentUsage:allowExcessivelyViolentUsage,
        allowExcessivelySexualUsage:allowExcessivelySexualUsage,
        commercialUsage:commercialUsage,
        copyrightInformation: copyrightInformation,
        avatarPermission:avatarPermission,

        allowAntisocialOrHateUsage:allowAntisocialOrHateUsage,
        allowPoliticalOrReligiousUsage:allowPoliticalOrReligiousUsage,
        allowRedistribution:allowRedistribution,
        creditNotation:creditNotation,
        modification:modification
    }


}

function GetMeta0DataAsMeta1(meta0Values){
    let author = [];
    let contactInformation = [];
    let reference = [];
    let otherPermissionUrl = [];
    let otherLicenseUrl = [];
    let allowedUsername = undefined;
    let violentUssageName = undefined;
    let sexualUssageName = undefined;
    let commercialUssageName = undefined;
    let licenseName = undefined;

    meta0Values.forEach(meta => {
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
        //name:title,
        authors:authorFilter,
        otherLicenseUrl:otherLicenseUrlFilter,
        contactInformation:contactInformationFilter,
        references:referenceFilter,
        allowExcessivelyViolentUsage:violentUssageName === "Allow",
        allowExcessivelySexualUsage:sexualUssageName  === "Allow",
        commercialUsage:commercialUssageName === "Allow" ? "personalProfit" : "personalNonProfit",
        copyrightInformation: licenseName,
        avatarPermission:getAvatarPermissionFromMeta0(allowedUsername),
        otherPermissionUrl:otherPermissionUrlFilter,     
    }

}

function getAvatarPermissionFromMeta0(allowedUsername){
    if (allowedUsername == "OnlyAuthor"){
        return "onlyAuthor";
    }
    if (allowedUsername == "ExplicitlyLicensedPerson"){
        return "onlySeparatelyLicensedPerson";
    }
    if (allowedUsername == "Everyone"){
        return "everyone";
    }
}

const ModificationType = {
    prohibited:0,
    allowModification:1,
    allowModificationRedistribution:2
}
const CommercialUsageType = {
    personalNonProfit:0,
    personalProfit:1,
    corporation:2
}
const AvatarPermissionType = {
    onlyAuthor: 0,
    onlySeparatelyLicensedPerson: 1,
    everyone: 2,
};
const UsernameType = {
    OnlyAuthor: 0,
    ExplicitlyLicensedPerson: 1,
    Everyone: 2,
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
    if (currentValue === undefined){
        return newValue;
    }
    if (newValue == null || !(newValue in enumType)){
        return currentValue;
    }

    // Compare the enum values and return the more restrictive one
    return enumType[currentValue] < enumType[newValue] ? currentValue : newValue;
}
