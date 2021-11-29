import { Whitespace } from "./base";

/**
 * Parsed node types.
 * Currently only `*` and all other fields.
 */
export type ParsedNode =
  | { star: true }
  | { name: string; original: string; hint?: string; children?: ParsedNode[] };

/**
 * Parser errors.
 */
export type ParserError<Message extends string> = { error: true } & Message;
export type GenericStringError = ParserError<"Received a generic string">;

/**
 * Trims whitespace from the left of the input.
 */
export type EatWhitespace<Input extends string> = string extends Input
  ? GenericStringError
  : Input extends `${Whitespace}${infer Remainder}`
  ? EatWhitespace<Remainder>
  : Input;

/**
 * Permits a single value of a given type, or multiple values of the type.
 * Marked with a property to uniquely identify types matching this utility.
 *
 * @param T The type for which a single value, or multiple values in an array is permitted.
 */
export type OneOrMore<T> = (T | T[]) & {
  /**
   * Unique brand to identify this type.
   * Should not be used externally.
   */
  __postgrestQueryBrand: boolean; // TODO: look into use of `unique symbol`
};
