// Escapes regex metacharacters so a raw user-typed query is always matched as a literal
// substring, never interpreted as a regex — prevents both surprising false matches from
// stray regex syntax in the input and unbounded-backtracking ReDoS from adversarial input.
// The existing restaurant name search (controllers/restaurant.controller.js's pre-Prompt-7
// `q` handling) doesn't do this; new regex-matching endpoints in this codebase should.
export const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
