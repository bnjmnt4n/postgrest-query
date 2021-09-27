import { ParseQuery, GetDefinition } from "../src";

type definitions = {
  workspaces: {
    id: string;
    name: string;
  };
  members: {
    workspace_id: string;
    user_id: string;
  };
  users: {
    id: string;
    email: string;
  };
};

const WorkspacesQuery = `*,team:members(user:users(id,email))`;

type ParsedWorkspacesQuery = ParseQuery<typeof WorkspacesQuery>;

type ParsedWorkspacesDefinition = GetDefinition<definitions, "workspaces", ParsedWorkspacesQuery>;
