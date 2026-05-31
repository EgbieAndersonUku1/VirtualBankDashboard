const freezeRules = (rules) =>
    Object.freeze(
        Object.fromEntries(
            Object.entries(rules).map(([key, value]) => [
                key,
                Object.freeze(value),
            ])
        )
    );


export default freezeRules;