

export class IngredientParser {

    /**
     * a list of ingredients is parsed by ingredient and an 
     * array of formally structured and formatted ingredients is returned
     * 
     * @param ingredientList a list of ingredients as raw strings
     * 
     * @returns a list of Ingredients if parsing is successful, or the original string
     * array if any parsing fails
     */
    public parseIngredientList(ingredientList: string[]): Ingredient[] | string[] {

        let systemOfMeasure: USCustomaryUnits.SystemName | MetricUnits.SystemName;

        const parsedResults: Parsed<Ingredient, string>[] = ingredientList.map((ingredientString: string) => {
            let rawIngredient: RawIngredient;

            if (MeasurementRegex.testFractionMeasurement.test(ingredientString)) {
                rawIngredient = this.parseRawIngredientFromFraction(ingredientString);
            } else if (MeasurementRegex.testDecimalMeasurement.test(ingredientString)) {
                rawIngredient = this.parseRawIngredientFromDecimal(ingredientString);
            } else if (MeasurementRegex.testCountMeasurement.test(ingredientString)) {
                rawIngredient = this.parseRawIngredientFromCount(ingredientString);
            } else {
                return {
                    message: 'the ingredient string was an invalid format',
                    raw: ingredientString,
                    wasParsed: false
                }
                // TODO: return an empty parsed result
            }

            const ingredient: Parsed<Ingredient, RawIngredient> = this.parseIngredientFromRawIngredient(rawIngredient);

            const successfullyParsed = this.validateParsedSuccessfully([ingredient]);

            if (successfullyParsed) {
                return {
                    item: ingredient.item,
                    raw: ingredientString,
                    wasParsed: true
                }
            } else {
                return {
                    message: 'there was an error parsing the ingredients',
                    raw: ingredientString,
                    wasParsed: false
                }
            }
        });

        // make sure all ingredients parsed successfully
        const parsedSuccesfully: boolean = this.validateParsedSuccessfully(parsedResults);

        if (parsedSuccesfully) {
            return parsedResults.map(x => {
                return x.item;
            });
        } else {
            return ingredientList;
        }

    }

    public parseRawIngredientFromFraction(ingredient: string): RawIngredient {
        return this.parseRawIngredient(ingredient, MeasurementRegex.fractionMeasurementMatcher, 'fraction');
    }

    public parseRawIngredientFromDecimal(ingredient: string): RawIngredient {
        return this.parseRawIngredient(ingredient, MeasurementRegex.decimalMeasurementMatcher, 'decimal');
    }

    public parseRawIngredientFromCount(ingredient: string): RawIngredient {
        return this.parseRawIngredient(ingredient, MeasurementRegex.countMeasurementMatcher, 'count');
    }

    public parseRawIngredient(ingredient: string, regex: RegExp, notation: NotationType): RawIngredient {
        const measurement: string = ingredient.match(regex)[0].trim();
        const item: string = ingredient.slice(measurement.length + 1).trim();

        return {
            item,
            measurement,
            notation
        };
    }

    public parseIngredientFromRawIngredient(rawIngredient: RawIngredient): Parsed<Ingredient, RawIngredient> {
        let regex: RegExp;
        let partRegex: RegExp;

        // TODO: add count
        switch (rawIngredient.notation) {
            case 'fraction':
                regex = MeasurementRegex.singleFractionMeasurementMatcher;
                partRegex = MeasurementRegex.fractionPartMatcher;
                break;
            case 'decimal':
                regex = MeasurementRegex.singleDecimalMeasurementMatcher;
                partRegex = MeasurementRegex.decimalPartMatcher;
                break;
            default:
                return {
                    message: 'the notation could not be determined',
                    raw: rawIngredient,
                    wasParsed: false
                }
        }

        const rawMeasurements: string[] = rawIngredient.measurement.match(regex);
        // TODO: account for match failing
        const parsedMeasures: Parsed<Measure, string>[] = rawMeasurements.map(x => {
            const amount: string = x.match(partRegex)[0].trim();
            const unit = x.slice(amount.length + 1).trim();

            const parsedUnit = this.getStandardizedUnit(unit);

            if (parsedUnit) {
                return {
                    item: {
                        amount,
                        unit: parsedUnit
                    },
                    raw: x,
                    wasParsed: true
                }
            } else {
                return {
                    message: "The unit was not found in the formatting map",
                    raw: x,
                    wasParsed: false
                }
            }
        });

        const successfullyParsed: boolean = this.validateParsedSuccessfully(parsedMeasures);

        // if any of the parses failed, we consider this a failure
        if (successfullyParsed) {
            const measure: Measure[] = parsedMeasures.map((parsed: Parsed<Measure, string>) => {
                return parsed.item;
            });

            return {
                item: {
                    item: rawIngredient.item,
                    measurement: {
                        measure,
                        // TODO: update me later plz
                        standard: 'us-customary'
                    },
                    notation: rawIngredient.notation
                },
                raw: rawIngredient,
                wasParsed: true
            }
        } else {
            return {
                raw: rawIngredient,
                message: "There was an error parsing the ingredient",
                wasParsed: false
            }
        }
    }

    private validateParsedSuccessfully(parsedList: ParsedBase[]): boolean {
        return parsedList.filter(x => {
            return !x.wasParsed;
        }).length === 0
    }

    private getStandardizedUnit(rawUnit: string): Unit {
        return measurementUnitMap[rawUnit];
    }


}

const measurementUnitMap: { [key: string]: Unit } = {
    "t": "tsp",
    "t.": "tsp",
    "tsp": "tsp",
    "tsp.": "tsp",
    "teaspoon": "tsp",

    "T": "Tbsp",
    "T.": "Tbsp",
    "Tbsp": "Tbsp",
    "Tbsp.": "Tbsp",
    "tbsp": "Tbsp",
    "tbsp.": "Tbsp",
    "Tablespoon": "Tbsp",

    "fl oz": "fl oz",
    "fl. oz.": "fl oz",
    "fl oz.": "fl oz",
    "floz": "fl oz",
    "floz.": "fl oz",

    "c": "c",
    "c.": "c",
    "cup": "c",
    "Cup": "c",
    "cups": "c",
    "Cups": "c",

    "p": "pt",
    "p.": "pt",
    "pt": "pt",
    "pts": "pt",
    "pt.": "pt",
    "pint": "pt",
    "pints": "pt",
    "Pint": "pt",

    "q": "qt",
    "q.": "qt",
    "qt": "qt",
    "qts": "qt",
    "qt.": "qt",
    "qts.": "qt",
    "quart": "qt",
    "Quart": "qt",
    "quarts": "qt",

    "g": "gal",
    "g.": "gal",
    "gal": "gal",
    "gals": "gal",
    "gal.": "gal",
    "gallon": "gal",
    "Gallon": "gal",
    "gallons": "gal",

    // US Customary Units - Weight

    "oz": "oz",
    "oz.": "oz",
    "ozs": "oz",
    "ozs.": "oz",
    "ounce": "oz",
    "Ounce": "oz",
    "ounces": "oz",

    "lb": "lb",
    "lb.": "lb",
    "lbs": "lb",
    "lbs.": "lb",
    "pound": "lb",
    "pounds": "lb",
    "Pound": "lb",
    "Pounds": "lb"

}

export interface ParsedBase {
    message?: string,
    wasParsed: boolean
}

export interface Parsed<T, K> extends ParsedBase {
    item?: T,
    raw: K
}

export type NotationType = 'fraction' | 'decimal' | 'count';
/**
 * this will hold the loosely parsed ingredient information
 */
export interface RawIngredient {
    item: string,
    measurement: string,
    // notation has to go here instead of in Measurement because the whole ingredient needs to match this format
    notation: NotationType
}

export type Unit = USCustomaryUnits.Volume | USCustomaryUnits.Weight | MetricUnits.Volume | MetricUnits.Weight;

export interface Measure {
    amount: string,
    unit: Unit
}

/** measures can be multi-part but should always contain at least one */
export interface Measurement {
    measure: Measure[],
    standard: USCustomaryUnits.SystemName | MetricUnits.SystemName
}

export interface Ingredient {
    item: string,
    measurement: Measurement,
    notation: NotationType
}

export interface IngredientList {
    ingredient: Ingredient[]
}

/**
 * please note that we are only using the 'wet' 
 * volumes, as they are used mostly interchangebly in the U.S.
 */
export namespace USCustomaryUnits {
    export type SystemName = 'us-customary';
    export type Volume = 'tsp' | 'Tbsp' | 'fl oz' | 'c' | 'pt' | 'qt' | 'gal';
    export type Weight = 'oz' | 'lb';
}

export namespace MetricUnits {
    export type SystemName = 'metric';
    export type Volume = 'ml' | 'cl' | 'l';
    export type Weight = 'mg' | 'g' | 'kg';
}

export namespace MeasurementRegex {
    export const decimalMeasurementMatcher = /(((\.\d{1,4})|(\d+(\.\d{1,4})?)) ?[a-zA-z]+\.* ?){1,2}/;
    export const decimalPartMatcher = /((\.\d{1,4})|(\d+(\.\d{1,4})?))/;
    export const fractionMeasurementMatcher = /(((\d+\/\d+)|(\d+( \d+\/\d+)?)) ?[a-zA-z]+\.* ?){1,2}/;
    export const fractionPartMatcher = /((\d+\/\d+)|(\d+( \d+\/\d+)?))/;
    export const singleDecimalMeasurementMatcher = /(((\.\d{1,4})|(\d+(\.\d{1,4})?)) ?[a-zA-z]+\.*( )?)/g;
    export const singleFractionMeasurementMatcher = /(((\d+\/\d+)|(\d+( \d+\/\d+)?)) ?[a-zA-z]+\.*( )?)/g;
    export const testDecimalMeasurement = /^(((\.\d{1,4})|(\d+(\.\d{1,4})?)) ?[a-zA-z]+\.* ){1,2}(\w| )+$/;
    export const testFractionMeasurement = /^(((\d+\/\d+)|(\d+( \d+\/\d+)?)) ?[a-zA-z]+\.* ){1,2}(\w| )+$/;

    // TODO: research this
    export const testCountMeasurement = /((\d+\/\d+)|(\d+( \d+\/\d+)?)) (\w| |\d|\.)+/;
    export const countMeasurementMatcher = /((\d+\/\d+)|(\d+( \d+\/\d+)?)) /;
}