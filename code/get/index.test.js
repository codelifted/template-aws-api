const handler = require('./index').handler
const notice = require('aws-sdk/lib/maintenance_mode_message')
notice.suppress = true

// Test data
const request = {
  arguments: {
    input: {
      id: 'ce6e889c-2e4d-41fe-8b2f-19438d046bcf',
      userId: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    },
  },
}

// Test GET method
describe('Test GET method', () => {

  // Expect 200
  test('Get Workspace', async () => {

    // Call lambda
    await handler(request, {}, (err, res) => {
      const { data, code, message } = res

      // Assert
      expect(code).toEqual(200)
      expect(message).toEqual('workspace found')
      expect(data.id).toEqual('ce6e889c-2e4d-41fe-8b2f-19438d046bcf')
      expect(data.name).toEqual('My Workspace')
      expect(data.user_role).toEqual('owner')
      expect(data.endpoint).toEqual('4e2ce920032ed98b9f0ff34cc4375e9e.api.weberlo.net')
      expect(data.current_users).toEqual("1")
      expect(data.users_max).toEqual(50)
      expect(data.max_page_views).toEqual(50000)
      expect(data.current_page_views).toEqual(0)
      expect(data.workspace_status).toEqual('active')
    })
  })

  // Expect 204 - Not found
  test('Workspace not found', async () => {

    // workspaceId that is not present in DB
    request.arguments.input.id = 'ce6e889c-2e4d-41fe-8b2f-19438d046baf'

    // Call lambda
    await handler(request, {}, (err, res) => {

      // Assert
      expect(res.code).toEqual(204)
      expect(res.message).toEqual('workspace not found')
    })
  })
})
