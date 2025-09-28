
import { VRM0Meta, VRM1Meta, VRMMeta } from "@pixiv/three-vrm";
import { getAsArray } from "./utils"
import { avatarData } from "./characterManager";



export function GetMetadataFromAvatar(avatar:Record<string, avatarData>, customMeta:Partial<VRMMeta>|null, vrmName:string){

    const meta0Values:(Partial<VRM0Meta>&{metaVersion:"0"})[] = [];
    const meta1Values:(Partial<VRM1Meta>&{metaVersion:"1"})[] = [];

    for (const prop in avatar){
        if (avatar[prop]?.vrm?.meta != null){
            if ('authors' in avatar[prop].vrm.meta && avatar[prop].vrm.meta.authors !=null){
                meta1Values.push(avatar[prop].vrm.meta)
            }
            else{
                meta0Values.push(avatar[prop].vrm.meta as VRM0Meta)
            }
        } 
    }

    // if only 1 model is provided save the name of the model instead
    if (meta0Values.length + meta1Values.length == 1){
        if (meta0Values.length == 1){
            if ('title' in meta0Values[0] && meta0Values[0].title != null){
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
        if ('authors' in customMeta && customMeta.authors != null){
            meta1Values.push(customMeta as VRM1Meta);
        }
        else{
            meta0Values.push(customMeta as VRM0Meta);
        }
    }

    const vrm1MetaFromMeta0 =  GetMeta0DataAsMeta1(meta0Values);
    const fullMergedMetadata = GetFullMeta1Data(vrm1MetaFromMeta0, meta1Values);

    fullMergedMetadata.otherLicenseUrl = "https://vrm.dev/licenses/1.0/";
    (fullMergedMetadata as any as VRM1Meta).licenseUrl = "https://vrm.dev/licenses/1.0/";
    (fullMergedMetadata as any as VRM1Meta).name = vrmName;

    return fullMergedMetadata;
}

function GetFullMeta1Data(vrm1MetaFromMeta0:VRM1Meta &{otherPermissionUrl:string[]}, meta1Values:Partial<VRM1Meta>[]){

    let {
        authors = [],
        otherLicenseUrl = '',
        contactInformation = '',
        references = [],
        allowExcessivelyViolentUsage = undefined,
        allowExcessivelySexualUsage = undefined,
        commercialUsage = undefined,
        avatarPermission = undefined,
        otherPermissionUrl = [],
    } = vrm1MetaFromMeta0;
    let copyrightInformation:(keyof typeof LicenseType) | undefined = vrm1MetaFromMeta0.copyrightInformation || '' as any
    let allowAntisocialOrHateUsage = undefined;
    let allowPoliticalOrReligiousUsage = undefined;
    let allowRedistribution = undefined;
    let creditNotation = "unnecessary";
    
    let modification:keyof typeof ModificationType | undefined = undefined;
    let thirdPartyLicenses:string[] = [];

    meta1Values.forEach(meta => {
        // vrm 0
        authors = authors.concat(getAsArray(meta.authors||''));
        otherLicenseUrl = otherLicenseUrl.concat(meta.otherLicenseUrl||'');
        contactInformation = contactInformation.concat(meta.contactInformation||'');
        references = references.concat(getAsArray(meta.references||''));
        otherPermissionUrl = otherPermissionUrl.concat(getAsArray((meta as {otherPermissionUrl:string[]}).otherPermissionUrl||[]));
        if (meta.allowExcessivelyViolentUsage === false)
            allowExcessivelyViolentUsage = false;
        if (meta.allowExcessivelySexualUsage === false)
            allowExcessivelySexualUsage = false;      
        commercialUsage  = getMostRestrictiveValue(CommercialUsageType,commercialUsage,meta.commercialUsage);
        copyrightInformation = getMostRestrictiveValue(LicenseType,copyrightInformation,meta.copyrightInformation as keyof typeof LicenseType);
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
        thirdPartyLicenses = thirdPartyLicenses.concat(getAsArray(meta.thirdPartyLicenses||''))
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

function GetMeta0DataAsMeta1(meta0Values:VRM0Meta[]):VRM1Meta & {otherPermissionUrl:string[]}{
    let author:string[] = [];
    let contactInformation:string[] = [];
    let reference:string[] = [];
    let otherPermissionUrl:string[] = [];
    let otherLicenseUrl:string[] = [];
    let allowedUsername:keyof typeof UsernameType|undefined = undefined;
    let violentUssageName:keyof typeof AllowType|undefined = undefined;
    let sexualUssageName:keyof typeof AllowType|undefined = undefined;
    let commercialUssageName:keyof typeof AllowType|undefined = undefined;
    let licenseName:keyof typeof LicenseType|undefined = undefined;

    meta0Values.forEach(meta => {
        author = author.concat(getAsArray(meta.author || ''));
        contactInformation = contactInformation.concat(getAsArray(meta.contactInformation || ''));
        reference = reference.concat(getAsArray(meta.reference || ''));
        otherPermissionUrl = otherPermissionUrl.concat(getAsArray(meta.otherPermissionUrl || ''));
        otherLicenseUrl = otherLicenseUrl.concat(getAsArray(meta.otherLicenseUrl || ''));
        allowedUsername = getMostRestrictiveValue(UsernameType, allowedUsername, meta.allowedUserName);
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
        otherLicenseUrl:otherLicenseUrlFilter.flat().join(", "),
        contactInformation:contactInformationFilter.flat().join(", "),
        references:referenceFilter,
        allowExcessivelyViolentUsage:violentUssageName === "Allow",
        allowExcessivelySexualUsage:sexualUssageName  === "Allow",
        commercialUsage:commercialUssageName === "Allow" ? "personalProfit" : "personalNonProfit",
        copyrightInformation: licenseName,
        avatarPermission:getAvatarPermissionFromMeta0(allowedUsername),
        //@ts-ignore ignore me
        otherPermissionUrl:otherPermissionUrlFilter.flat().join(", "), 
    }

}

function getAvatarPermissionFromMeta0(allowedUserName:keyof typeof UsernameType|undefined):keyof typeof AvatarPermissionType|undefined{
    if (allowedUserName == "OnlyAuthor"){
        return "onlyAuthor";
    }
    if (allowedUserName == "ExplicitlyLicensedPerson"){
        return "onlySeparatelyLicensedPerson";
    }
    if (allowedUserName == "Everyone"){
        return "everyone";
    }
}

/**
 * ENUM ModificationType
 */
export const ModificationType = {
    prohibited: 'prohibited',
    allowModification: 'allowModification',
    allowModificationRedistribution: 'allowModificationRedistribution'
} as const;
/**
 * ENUM CommercialUsageType
 */
export const CommercialUsageType = {
    personalNonProfit: 'personalNonProfit',
    personalProfit: 'personalProfit',
    corporation: 'corporation'
} as const;
/**
 * ENUM AvatarPermissionType
 */
export const AvatarPermissionType = {
    onlyAuthor: 'onlyAuthor',
    onlySeparatelyLicensedPerson: 'onlySeparatelyLicensedPerson',
    everyone: 'everyone',
} as const;
/**
 * ENUM UsernameType
 */
export const UsernameType = {
    OnlyAuthor: 'OnlyAuthor',
    ExplicitlyLicensedPerson: 'ExplicitlyLicensedPerson',
    Everyone: 'Everyone',
} as const;
/**
 * ENUM AllowType
 */
export const AllowType = {
    Disallow: 'Disallow',
    Allow: 'Allow',
} as const;
/**
 * ENUM LicenseType
 */
export const LicenseType = {
    Redistribution_Prohibited: 'Redistribution_Prohibited',
    Other: 'Other',
    CC_BY_NC_ND: 'CC_BY_NC_ND',
    CC_BY_ND: 'CC_BY_ND',
    CC_BY_NC_SA: 'CC_BY_NC_SA',
    CC_BY_SA: 'CC_BY_SA',
    CC_BY_NC: 'CC_BY_NC',
    CC_BY: 'CC_BY',
    CC0: 'CC0',
} as const;
export type LicenseValueTypeEnums = typeof LicenseType|typeof AllowType|typeof UsernameType| typeof AvatarPermissionType|typeof CommercialUsageType|typeof ModificationType

function getMostRestrictiveValue<T extends LicenseValueTypeEnums>(enumType:T, currentValue?:keyof T, newValue?:keyof T) {
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