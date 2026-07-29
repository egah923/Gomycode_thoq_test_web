import { Router, useRouter } from "next/router";
import React, { useEffect } from "react";

export const getCookie = (cname: string) => {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
    // State and setters for debounced value
    React.useEffect(
        () => {
            // Update debounced value after delay
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            // Cancel the timeout if value changes (also on delay change or unmount)
            // This is how we prevent debounced value from updating if value is changed ...
            // .. within the delay period. Timeout gets cleared and restarted.
            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay] // Only re-call effect if value or delay changes
    );
    return debouncedValue;
}


// export function loadGoogleMapScript(callback: any) {
//     if (
//         typeof (window as any).google === "object" &&
//         typeof (window as any).google.maps === "object"
//     ) {
//         callback();
//     } else {
//         const googleMapScript = document.createElement("script");
//         googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY}&libraries=places`;
//         window.document.body.appendChild(googleMapScript);
//         googleMapScript.addEventListener("load", callback);
//         // googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD4MHXWLSqsVoZ7kIF3Bq1pVKMlUTO4HOU&libraries=places`;
//     }
// }






// export const useBeforeUnSaved = (unsavedChanges: boolean, matchUrl: string) => {
//     useEffect(() => {
//         // For reloading.
//         window.onbeforeunload = () => {
//             if (unsavedChanges) {
//                 return ' If You have unsaved changes it will be remove. Do you really want to reload this page?';
//             }
//         };

//         // For changing in-app route.
//         // if (unsavedChanges) {
//         //     const routeChangeStart = (e: any) => {
//         //         // if(router.asPath!==e)
//         //         console.log('routeChangeStart', e, matchUrl, e.startsWith(matchUrl));

//         //         if (!e.startsWith(matchUrl)) {
//         //             console.log('if routeChangeStart', e, matchUrl, e.startsWith(matchUrl));

//         //             const ok = confirm("Are you sure that you want to leave the current page? The changes that you made won't be saved");
//         //             if (!ok) {
//         //                 Router.events.emit('routeChangeError');
//         //                 throw 'Abort route change. Please ignore this error.';
//         //             }
//         //         }
//         //     };

//         //     Router.events.on('routeChangeStart', routeChangeStart);
//         //     return () => {
//         //         Router.events.off('routeChangeStart', routeChangeStart);
//         //     };
//         // }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [unsavedChanges]);
// }




export const loadGoogleMapScript = (callback: any) => {
    if (
        typeof (window as any).google === "object" &&
        typeof (window as any).google.maps === "object"
    ) {
        callback();
    } else {
        const googleMapScript = document.createElement("script");
        googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD4MHXWLSqsVoZ7kIF3Bq1pVKMlUTO4HOU&libraries=places`;
        window.document.body.appendChild(googleMapScript);
        googleMapScript.addEventListener("load", callback);
    }
}
export const addressFind = (address: any, formatAddress: string) => {
    let items = {} as any
    if (Array.isArray(address) && address.length > 0) {
        let lat = address
        let zipIndex = address.findIndex(res => res.types.includes("postal_code"))
        let administrativeAreaIndex = address.findIndex(res => res.types.includes("administrative_area_level_1", "political"))
        let localityIndex = address.findIndex(res => res.types.includes("locality", "political"))
        let countryIndex = address.findIndex(res => res.types.includes("country", "political"))
        let premiseIndex = address.findIndex(res => res.types.includes("premise", "street_number"))
        let sublocality1 = address.findIndex(res => res.types.includes('sublocality_level_1', 'sublocality', 'political'))
        let sublocality2 = address.findIndex(res => res.types.includes('sublocality_level_2', 'sublocality', 'political'))
        let route = address.findIndex(res => res.types.includes('route'))
        let subpremise = address.findIndex(res => res.types.includes('subpremise'))
        let street_number = address.findIndex(res => res.types.includes('street_number'))
        if (zipIndex > -1) {
            items.pin_code = address[zipIndex]?.long_name
        }
        if (administrativeAreaIndex > -1) {
            items.state = address[administrativeAreaIndex]?.long_name
        }
        if (localityIndex > -1) {
            items.city = address[localityIndex]?.long_name
        }
        if (countryIndex > -1) {
            items.country = address[countryIndex]?.long_name
        }
        if (premiseIndex > -1) {
            items.apartment_number = address[premiseIndex]?.long_name
        }
        items.full_address = formatAddress
        items.sublocality1 = address[sublocality1]?.long_name
        items.sublocality2 = address[sublocality2]?.long_name
        items.subpremise = address[subpremise]?.long_name
        items.route = address[route]?.long_name
        items.street_number = address[street_number]?.long_name
    }
    return items
}

export const rankingText = {
    1: "1st Runner Up",
    2: "2nd Runner Up",
    3: "3rd Runner Up",

}