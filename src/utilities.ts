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
