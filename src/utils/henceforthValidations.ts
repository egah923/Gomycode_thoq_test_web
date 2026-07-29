
var EmailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var UserNameRegEx = /^[a-zA-Z_]{0,60}$/;
var NumericNumberRegEx = /^[0-9]{0,20}$/;
var NumericResultRegEx = /^(\d{0,2}(\.\d{1,2})?|100(\.00?)?)$/;
var NameRegEx = /^[a-zA-Z \s()-]{0,60}$/;
var NumberRegEx = /^[0]?[789]\d{9}$/;
var IndNumberRegEx = /^((\+91)?|91)?[789][0-9]{9}/;
var PincodeRegEx = /^\d{6}$/;
var LatLngRegEx = /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}/;
var GstRegEx = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
var CountryRegEx = "India";
var UUIDRegEx = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;
var strongPasswordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.* )(?=.*[^a-zA-Z0-9]).{8,16}$/

const email = (email: string) => {
    return EmailRegEx.test(String(email).toLowerCase());
}
const numberDataTypeValidation = (str: string) => {
    return typeof (str) === "number";
}
const nameValidation = (str: string) => {
    return NameRegEx.test(String(str).trim());
}
const UserNameValidation = (str: string) => {
    return UserNameRegEx.test(String(str).trim());
}
const MobileNumberValidation = (str: string) => {
    return NumberRegEx.test(str);
}
const NumberValidation = (str: string) => {
    return NumericNumberRegEx.test(str);
}
const ResultValidation = (str: string) => {
    return NumericResultRegEx.test(str);
}
const MobileNumberWithInValidation = (str: string) => {
    return IndNumberRegEx.test(str);
}
const FoodLicenseValidation = (str: string) => {
    // return FoodLicenseRegEx.test(str);
    return str
}
const DrugLicenseValidation = (str: string) => {
    // return DrugLicenseRegEx.test(str);
    return str
}
const GstValidation = (str: string) => {
    return GstRegEx.test(str);
}
const AddressValidation = (str: string) => {
    // return (String(str).length > 10) ? AddressRegEx.test(str) : false
    return (String(str).trim().length > 10) ? str : false
}
const PincodeValidation = (str: string) => {
    return PincodeRegEx.test(str);
}
const LatLngValidation = (str: string) => {
    return LatLngRegEx.test(str);
}
const CountryValidation = (str: string) => {
    return str === CountryRegEx;
}
const UuidValidation = (str: string) => {
    return UUIDRegEx.test(str);
}

const StringValidation = (str: string) => {
    return (typeof (str) === 'undefined') ? false : (String(str).trim().length >= 3) ? nameValidation(str) : false
}
const ObjectValidation = (str: string) => {
    return (typeof (str) === 'object')
}
const LengthValidation = (str: string, length: number) => {
    return (String(str).trim().length > length)
}
const capitalizeFirstLetter = (string: string) => {
    if (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
        return `_`
    }
}
const uppercaseWords = (str: string) => str?.split("-")?.join(" ")?.toLowerCase()?.replace(/^(.)|\s+(.)/g, c => c?.toUpperCase())
const strongPassword = (str: string) => {
    return strongPasswordRegEx.test(str);
}
const stringReplace = (str: string) => {
    let newStr = str?.toLocaleLowerCase()
    newStr = newStr?.split("&")?.join("-")
    return newStr?.replace(/ /g, "-")
}

const replaceHyphen = (str: string) => {
    let newStr = str?.toLocaleLowerCase()
    if (newStr?.includes("_")) {
        return newStr?.split("_")?.join("-")
    }
    else if (newStr?.includes("-")) {
        let toUpC = newStr?.toUpperCase()
        return toUpC?.split("-")?.join("_")
    }
    else {
        return str?.toUpperCase()
    }
}
const remUndrscore = (str: string) => {
    let newStr = str?.toLocaleLowerCase()
    if (newStr) {
        return newStr?.split("_")?.join("")
    }
}

const roundOffCeil = (count: number, limit: number) => {
    const RoundLimit = (count / limit)
    const totalPage = Math.ceil(RoundLimit)
    return totalPage
}
const showPrice = (price: number) => {
    var parts = price?.toFixed(2)?.toString()
    parts = parts?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return parts
}

const subscribeFormatter = (number:number) => {
    let num = Number(number)
    // if (num > 999 && num < 1000000) {
    //     return parseFloat((num / 1000).toFixed(2)) + 'K'; // convert to K for number from > 1000 < 1 million
    // }
    if (num >= 100000000000000) {
        return parseFloat((num / 1000000000000).toFixed(2)) + 'T++'; // convert to M for number from > 1 million
    }
    else if (num >= 1000000000000) {
        return parseFloat((num / 1000000000000).toFixed(2)) + 'T'; // convert to M for number from > 1 million
    }
    else if (num >= 1000000000) {
        return parseFloat((num / 1000000000).toFixed(2)) + 'B'; // convert to M for number from > 1 million
    }
    else if (num >= 1000000) {
        return parseFloat((num / 1000000).toFixed(2)) + 'M'; // convert to M for number from > 1 million
    }
    else if (num > 999 && num < 1000000) {
        return parseFloat((num / 1000).toFixed(2)) + 'K'; // convert to K for number from > 1000 < 1 million
    }
    // else if (num >= 1000000000) {
    //     return parseFloat((num / 1000000000).toFixed(2)) + 'B'; // convert to M for number from > 1 million
    // }
    // else if (num >= 1000000000000) {
    //     return parseFloat((num / 1000000000000).toFixed(2)) + 'T'; // convert to M for number from > 1 million
    // }
    // else if (num >= 100000000000000) {
    //     return parseFloat((num / 1000000000000).toFixed(2)) + 'T++'; // convert to M for number from > 1 million
    // }
    else if (num < 900 && num > 0) {
        return num; // if value < 1000, nothing to do
    }
    else {
        return num ? num : "0"
    }
}

const toUppCase = (val:string) => {
    if(val){
        const newVal = val?.toUpperCase()
        return newVal
    }
}
const toLowCase = (val:string) => {
    if(val){
        const newVal = val?.toLowerCase()
        return newVal
    }
}

const henceforthValidations = {
    remUndrscore,
    toUppCase,
    toLowCase,
    replaceHyphen,
    roundOffCeil,
    stringReplace,
    subscribeFormatter,
    email,
    numberDataTypeValidation,
    nameValidation,
    UserNameValidation,
    MobileNumberValidation,
    NumberValidation,
    ResultValidation,
    MobileNumberWithInValidation,
    FoodLicenseValidation,
    DrugLicenseValidation,
    GstValidation,
    AddressValidation,
    PincodeValidation,
    LatLngValidation,
    CountryValidation,
    UuidValidation,
    StringValidation,
    ObjectValidation,
    LengthValidation,
    capitalizeFirstLetter,
    strongPassword,
    showPrice,
    uppercaseWords
}
export default henceforthValidations