INSERT INTO workspace (id, name, max_users, endpoint)
VALUES ('1b9d6bcd-bbfd-4b1d-9b05-ab8dfbbd4bed', 'My Workspace', 50, 'https://myworkspace.com'),
('2c8e5cde-ccfe-5c2e-8c06-bc9eccd5cced', 'My Second Workspace', 75, 'https://mysecondworkspace.com'),
('3d7f4dfd-ddff-6d3f-7d07-cdafdde6dfdd', 'My Third Workspace', 100, 'https://mythirdworkspace.com');

INSERT INTO users_workspaces (user_role, user_id, workspace_id)
VALUES ('owner', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', '1b9d6bcd-bbfd-4b1d-9b05-ab8dfbbd4bed'),
('owner', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', '2c8e5cde-ccfe-5c2e-8c06-bc9eccd5cced'),
('member', '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', '3d7f4dfd-ddff-6d3f-7d07-cdafdde6dfdd');