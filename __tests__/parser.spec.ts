import { IngredientParser, RawIngredient, Parsed, Ingredient } from '../src/parser'

describe('parseRawIngredientFromFraction', () => {
    it('should parse single fraction, no space between unit', () => {
        // arrange
        const singleFractionNoSpace = '1/2c something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1/2c',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });

    it('should parse single fraction, space between unit', () => {
        // arrange
        const singleFractionNoSpace = '1/2 c something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1/2 c',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });

    it('should parse single fraction, multi-character unit', () => {
        // arrange
        const singleFractionNoSpace = '1/2 cup something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1/2 cup',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });

    it('should parse combo fraction + fraction, no space between units', () => {
        // arrange
        const singleFractionNoSpace = '1/2c 1/2t something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1/2c 1/2t',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });

    it('should parse combo fraction + fraction, space between units', () => {
        // arrange
        const singleFractionNoSpace = '1/2 c 1/2 t something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1/2 c 1/2 t',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });

    it('should parse combo fraction + fraction, multi-character units', () => {
        // arrange
        const singleFractionNoSpace = '1/2cup 1/2 teaspoon something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1/2cup 1/2 teaspoon',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });

    it('should parse combo integer + fraction', () => {
        // arrange
        const singleFractionNoSpace = '1 c 1/2 t something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1 c 1/2 t',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });

    it('should parse combo fraction + integer', () => {
        // arrange
        const singleFractionNoSpace = '1/2 c 1 t something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1/2 c 1 t',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });

    it('should parse combo integer + fraction', () => {
        // arrange
        const singleFractionNoSpace = '1 c 1/2 t something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1 c 1/2 t',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });

    it('should parse multi-part item', () => {
        // arrange
        const singleFractionNoSpace = '1 c 1/2 t some item';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'some item',
            measurement: '1 c 1/2 t',
            notation: 'fraction'
        }

        // act
        const actual = parser.parseRawIngredientFromFraction(singleFractionNoSpace);

        expect(actual).toEqual(expected);
    });
});

describe('parseRawIngredientFromDecimal', () => {
    it('should parse single decimal, no space between unit', () => {
        // arrange
        const singleFractionNoSpace = '1.3c something';
        const parser = new IngredientParser();
        const expected: RawIngredient = {
            item: 'something',
            measurement: '1.3c',
            notation: 'decimal'
        }

        // act
        const actual = parser.parseRawIngredientFromDecimal(singleFractionNoSpace);

        // assert
        expect(actual).toEqual(expected);
    });
})

describe('parseIngredientFromRawIngredient', () => {
    it('should return a parsed ingredient', () => {
        // arrange
        const rawIngredient: RawIngredient = {
            item: 'something',
            measurement: '1 1/2 cup 1 t',
            notation: 'fraction'
        }

        const expected: Parsed<Ingredient, RawIngredient> = {
            item: {
                item: 'something',
                measurement: {
                    measure: [{
                        amount: '1 1/2',
                        unit: 'c'    
                    }, {
                        amount: '1',
                        unit: 'tsp'
                    }],
                    standard: 'us-customary'
                },
                notation: 'fraction'
            },
            raw: rawIngredient,
            wasParsed: true
        }

        const parser = new IngredientParser();

        // act
        const actual = parser.parseIngredientFromRawIngredient(rawIngredient);

        // assert
        expect(actual).toEqual(expected);
    });

    it('should just return an array', () => {
        // arrange
        const ingredientList = [
            '1 cup apples',
            '1/2 t. peaches',
            '1 qt 1.5 c crushed pineapple',
            '1.5 Tbsp ginger ale'
        ];

        const expected: Ingredient = {
            item: 'apples',
            measurement: {
                measure: [{
                    amount: '1',
                    unit: 'c'
                }],
                standard: 'us-customary'
            },
            notation: 'fraction'
        }

        const parser = new IngredientParser();

        // act
        const actual = parser.parseIngredientList(ingredientList);

        // assert
        expect(actual[0]).toEqual(expected);
    });
})