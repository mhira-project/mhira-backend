interface RestCountry {
    name: string;
    alpha2Code: string;
    alpha3Code: string;
}

export class CountryService {
    loadAllCountries(): Promise<RestCountry[]> {
        const countries = fetch('https://restcountries.eu/rest/v2/all')
            .then(res => res.json())
            .then(res => {
                return res as RestCountry[];
            });

        return countries;
    }
}
