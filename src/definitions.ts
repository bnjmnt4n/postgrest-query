import { ParsedNode } from "./utilities";

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
  Fields extends unknown[] = []
> = Fields extends [infer R]
  ? ConstructFieldDefinition<Definitions, Name, R>
  : Fields extends [infer R, ...infer Rest]
  ? ConstructFieldDefinition<Definitions, Name, R> & GetDefinition<Definitions, Name, Rest>
  : Record<string, unknown>;

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
  Field extends unknown
> = Field extends { star: true }
  ? Definitions[Name]
  : Field extends { name: string; original: string; children: ParsedNode[] }
  ? { [k in Field["name"]]: GetDefinition<Definitions, Field["original"], Field["children"]> }
  : Field extends { name: string; original: string }
  ? { [k in Field["name"]]: Definitions[Name][Field["original"]] }
  : Record<string, unknown>;