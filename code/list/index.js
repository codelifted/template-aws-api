const crypto = require('crypto')
const { Pool } = require('pg')
const AWS = require('aws-sdk')

// ENV vars
const { DDB_HOST, DDB_PORT, ROOT_DOMAIN } = process.env

// Configure DDB 
AWS.config.update({
  region: process.env.REGION, endpoint: DDB_HOST ? `http://${DDB_HOST}:${DDB_PORT}` : null
})
const DynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-10-08' })

// Configure PG
const pool = new Pool({
  user: process.env.RDS_USER,
  host: process.env.RDS_HOSTNAME,
  database: process.env.RDS_DB,
  password: process.env.RDS_PW,
  port: process.env.RDS_PORT,
  max: 1,
  min: 0,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 1000,
})

// Lambda start
exports.handler = async (request, context, callback) => {

  // To prevent lambda from running endless
  context.callbackWaitsForEmptyEventLoop = false
  console.log('request:', request)

  // Open postgres connection
  const client = await pool.connect()
  console.log('event: pool.connected')

  try {
    // Read args
    const { input } = request.arguments
    const { id, userId } = input
    console.log(`id: ${id}`)
    console.log(`userId: ${userId}`)

    // Retrieve 1st piece from Postgres
    const resultPG = await client.query(`
      SELECT
        A.id,
        A.name,
        U.user_role,
        A.endpoint,
        (select COUNT(*) from users_workspaces F where F.workspace_id = U.workspace_id) as "current_users",
        A.max_users as users_max 
      FROM users_workspaces U
      INNER JOIN workspace A
      ON (A.id = U.workspace_id)
      WHERE
        U.user_id = $1
      AND
        A.deleted_at IS NULL`,
      [ userId ])

    const workspaceList = resultPG.rows

    // Array to store final result
    const result = []

    // Enrich Postgres result with DynamoDB data. To-do: Reduce complexity, 2 DBs on 1 endpoint is not ideal
    if (workspaceList.length) {

      // On each workspace
      for (const ws of workspaceList) {

        // UUID can't be used as sub-domain so we convert using crypto
        const endpoint = `${crypto.createHash('md5').update(ws.id).digest('hex')}.api.${ROOT_DOMAIN}`

        // Query DynamoDB
        const { Items } = await DynamoDB.query({
          TableName: 'workspace',
          KeyConditionExpression: 'workspace_id = :workspace_id',
          ExpressionAttributeValues: {
            ':workspace_id': endpoint,
          },
        }).promise()

        // To-do: add better monitoring, Item[0] must exist!
        if (Items && Items[0]) {

          // Enrich data
          result.push({
            ...ws,
            endpoint,
            max_page_views: Items[0].page_view_max,
            current_page_views: Items[0].page_view_count,
            workspace_status: Items[0].workspace_status,
          })
        }
      }

      // Return success
      callback(null, {
        code: 200,
        message: 'workspace found',
        data: result,
      })
    } else {
      // Return not found
      callback(null, {
        code: 204,
        message: 'workspace not found',
      })
    }
  } catch (e) {

    // Return error
    console.error(e)
    callback(e, {
      code: 500,
      message: 'Internal Server Error',
    })
  } finally {
    client.release()
    console.log('event: client.release')
  }
}
