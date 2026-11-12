function iterate(obj: any, propertyToFind: string, result: any) {
    for (const property in obj) {
        if (obj.hasOwnProperty(property)) {
            if(property == propertyToFind){
                result.found = true;
                return true
            }
            
            if (typeof obj[property] == "object") {
                iterate(obj[property], propertyToFind, result);
            }
        }
    }
}

export function checkIfPropertyExists(object: any, propertyToFind: string) {
    const result = { found: false }
    
    iterate(object, propertyToFind, result)

    return result.found
}
