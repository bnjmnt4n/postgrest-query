import { Letter } from "./base";
import { ParserError, GenericStringError, EatWhitespace } from "./utilities";

/**
 * Notes: all `Parse*` types assume that their input strings have their whitespace
 * removed. They return tuples of ["Return Value", "Remainder of text"] or
 * a `ParserError`.
 */

/**
 * Reads a consecutive sequence of more than 1 letter,
 * where letters are `[0-9a-zA-Z_]`.
 */
type ReadLetters<Input extends string> = string extends Input
  ? GenericStringError
  : Input extends `${infer L}${infer Remainder}`
  ? L extends Letter
    ? ReadLetters<Remainder> extends [`${infer Left}`, infer Remainder]
      ? [`${L}${Left}`, Remainder]
      : [L, Remainder]
    : ParserError<`Expected letter at \`${L}${Remainder}\``>
  : ParserError<`Unable to perform type inference with input \`${Input}\``>;

/**
 * Parses an identifier.
 * For now, identifiers are just sequences of more than 1 letter.
 *
 * TODO: allow for double quoted strings.
 */
type ParseIdentifier<Input extends string> = ReadLetters<Input>;

/**
 * Parses a node.
 * A node is one of the following:
 * - `*`
 * - `field`
 * - `field(nodes)`
 * - `renamed_field:field`
 * - `renamed_field:field(nodes)`
 * - `renamed_field:field!hint(nodes)`
 *
 * TODO: casting operators `::text`, JSON operators `->`, `->>`.
 */
type ParseNode<Input extends string> = Input extends ""
  ? ParserError<"Empty string">
  : // `*`
  Input extends `*${infer Remainder}`
  ? [{ star: true }, EatWhitespace<Remainder>]
  : ParseIdentifier<Input> extends [infer Name, `${infer Remainder}`]
  ? EatWhitespace<Remainder> extends `:${infer Remainder}`
    ? ParseIdentifier<EatWhitespace<Remainder>> extends [infer OriginalName, `${infer Remainder}`]
      ? EatWhitespace<Remainder> extends `!${infer Remainder}`
        ? ParseIdentifier<EatWhitespace<Remainder>> extends [infer Hint, `${infer Remainder}`]
          ? ParseEmbeddedResource<EatWhitespace<Remainder>> extends [
              infer Fields,
              `${infer Remainder}`
            ]
            ? // `renamed_field:field!hint(nodes)`
              [
                {
                  name: Name;
                  original: OriginalName;
                  hint: Hint;
                  children: Fields;
                },
                EatWhitespace<Remainder>
              ]
            : ParseEmbeddedResource<EatWhitespace<Remainder>> extends ParserError<string>
            ? ParseEmbeddedResource<EatWhitespace<Remainder>>
            : ParserError<"Expected embedded resource after `!hint`">
          : ParserError<"Expected identifier after `!`">
        : ParseEmbeddedResource<EatWhitespace<Remainder>> extends [
            infer Fields,
            `${infer Remainder}`
          ]
        ? // `renamed_field:field(nodes)`
          [{ name: Name; original: OriginalName; children: Fields }, EatWhitespace<Remainder>]
        : ParseEmbeddedResource<EatWhitespace<Remainder>> extends ParserError<string>
        ? ParseEmbeddedResource<EatWhitespace<Remainder>>
        : // `renamed_field:field`
          [{ name: Name; original: OriginalName }, EatWhitespace<Remainder>]
      : ParseIdentifier<EatWhitespace<Remainder>>
    : ParseEmbeddedResource<EatWhitespace<Remainder>> extends [infer Fields, `${infer Remainder}`]
    ? // `field(nodes)`
      [{ name: Name; original: Name; children: Fields }, EatWhitespace<Remainder>]
    : ParseEmbeddedResource<EatWhitespace<Remainder>> extends ParserError<string>
    ? ParseEmbeddedResource<EatWhitespace<Remainder>>
    : // `field`
      [{ name: Name; original: Name }, EatWhitespace<Remainder>]
  : ParserError<`Expected identifier at \`${Input}\``>;

/**
 * Parses an embedded resource, which is an opening `(`, followed by a sequence of
 * nodes, separated by `,`, then a closing `)`.
 *
 * Returns a tuple of ["Parsed fields", "Remainder of text"], an error,
 * or the original string input indicating that no opening `(` was found.
 */
type ParseEmbeddedResource<Input extends string> = Input extends `(${infer Remainder}`
  ? ParseNodes<EatWhitespace<Remainder>> extends [infer Fields, `${infer Remainder}`]
    ? EatWhitespace<Remainder> extends `)${infer Remainder}`
      ? Fields extends []
        ? ParserError<"Expected fields after `(`">
        : [Fields, EatWhitespace<Remainder>]
      : ParserError<`Expected ")"`>
    : ParseNodes<EatWhitespace<Remainder>>
  : Input;

/**
 * Parses a sequence of nodes, separated by `,`.
 *
 * Returns a tuple of ["Parsed fields", "Remainder of text"] or an error.
 */
type ParseNodes<Input extends string> = string extends Input
  ? GenericStringError
  : ParseNode<Input> extends [infer Field, `${infer Remainder}`]
  ? EatWhitespace<Remainder> extends `,${infer Remainder}`
    ? ParseNodes<EatWhitespace<Remainder>> extends [[...infer Fields], `${infer Remainder}`]
      ? [[Field, ...Fields], EatWhitespace<Remainder>]
      : ParseNodes<EatWhitespace<Remainder>>
    : [[Field], EatWhitespace<Remainder>]
  : ParseNode<Input>;

/**
 * Parses a query.
 * A query is a sequence of nodes, separated by `,`, ensuring that there is
 * no remaining input after all nodes have been parsed.
 *
 * Returns an array of parsed nodes, or an error.
 */
export type ParseQuery<Input extends string> = string extends Input
  ? GenericStringError
  : ParseNodes<EatWhitespace<Input>> extends [infer Fields, `${infer Remainder}`]
  ? EatWhitespace<Remainder> extends ""
    ? Fields
    : ParserError<`Unexpected input: ${Remainder}`>
  : ParseNodes<EatWhitespace<Input>>;
