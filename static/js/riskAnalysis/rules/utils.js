const freezeRules = (rules) =>
    Object.freeze(
        Object.fromEntries(
            Object.entries(rules).map(([key, value]) => [
                key,
                Object.freeze(value),
            ])
        )
    );


export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default freezeRules;