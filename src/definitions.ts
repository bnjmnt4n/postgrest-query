import { OneOrMore, ParsedNode } from "./utilities";

/**
 * Constructs a type definition for an object based on a given PostgREST query.
 *
 * @param Definitions Record of definitions, possibly generated from PostgREST's OpenAPI spec.
 * @param Name Name of the table being queried.
 * @param Fields Fields parsed by `ParseQuery`.
 */
export type GetDefinition<
  Definitions extends Record<string, Record<string, any>>,
  Name extends string,
  Fields extends unknown[] = [],
  Acc = unknown
> = Fields extends [infer R]
  ? GetDefinition<Definitions, Name, [], ConstructFieldDefinition<Definitions, Name, R> & Acc>
  : Fields extends [infer R, ...infer Rest]
  ? GetDefinition<Definitions, Name, Rest, ConstructFieldDefinition<Definitions, Name, R> & Acc>
  : Acc;

/**
 * Constructs a type definition for a single field of an object.
 *
 * @param Definitions Record of definitions, possibly generated from PostgREST's OpenAPI spec.
 * @param Name Name of the table being queried.
 * @param Field Single field parsed by `ParseQuery`.
 */
type ConstructFieldDefinition<
  Definitions extends Record<string, Record<string, any>>,
  Name extends string,
  Field
> = Field extends { star: true }
  ? Definitions[Name]
  : Field extends { name: string; original: string; children: ParsedNode[] }
  ? {
      [k in Field["name"]]: OneOrMore<
        GetDefinition<Definitions, Field["original"], Field["children"]>
      >;
    }
  : Field extends { name: string; original: string }
  ? { [k in Field["name"]]: Definitions[Name][Field["original"]] }
  : Record<string, unknown>;
