INSERT INTO workspace (id, name, max_users, endpoint)
VALUES ('ce6e889c-2e4d-41fe-8b2f-19438d046bcf', 'My Workspace', 50, 'f902e147f1c3e665cd8c4b4e1d4c01d4.api.weberlo.net');

INSERT INTO users_workspaces (user_role, user_id, workspace_id)
VALUES ('owner', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'ce6e889c-2e4d-41fe-8b2f-19438d046bcf');