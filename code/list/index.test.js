const handler = require('./index').handler
const notice = require('aws-sdk/lib/maintenance_mode_message')
notice.suppress = true

describe('Test LIST method', () => {

  // Input data
  const request = {
    arguments: {
      input: {
        userId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      },
    },
  }

  // Test success (200)
  test('Return workspaces list', async () => {

    // Call lambda
    await handler(request, {}, (err, res) => {

      // Assert
      expect(res.code).toEqual(200)
      expect(res.message).toEqual('workspace found')
      expect(res.data).toEqual([
        {
          id: '1b9d6bcd-bbfd-4b1d-9b05-ab8dfbbd4bed',
          name: 'My Workspace',
          user_role: 'owner',
          endpoint: '93ae508a08ea91f169b6bdc968c4a295.api.weberlo.net',
          current_users: '1',
          users_max: 50,
          max_page_views: 50000,
          current_page_views: 0,
          workspace_status: 'active',
        },
        {
          id: '2c8e5cde-ccfe-5c2e-8c06-bc9eccd5cced',
          name: 'My Second Workspace',
          user_role: 'owner',
          endpoint: '51b4901c0aea3d32c2c1a896335f09bc.api.weberlo.net',
          current_users: '1',
          users_max: 75,
          max_page_views: 50000,
          current_page_views: 10000,
          workspace_status: 'active',
        },
        {
          id: '3d7f4dfd-ddff-6d3f-7d07-cdafdde6dfdd',
          name: 'My Third Workspace',
          user_role: 'member',
          endpoint: 'd2849809a266b95016393d2e81febd05.api.weberlo.net',
          current_users: '1',
          users_max: 100,
          max_page_views: 50000,
          current_page_views: 20000,
          workspace_status: 'active',
        },
      ])
      return
    })
  })

  // Test not found (204)
  test('Workspaces not found', async () => {

    //userId that is not present in the db
    request.arguments.input.userId = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb4d'

    // Call lambda
    await handler(request, {}, (err, res) => {
      
      // Assert
      expect(res.code).toEqual(204)
      expect(res.message).toEqual('workspace not found')
      return
    })
  })
})
