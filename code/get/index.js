const crypto = require('crypto')
const { Pool } = require('pg')
const AWS = require('aws-sdk')

// Get ENV vars
const { DDB_HOST, DDB_PORT, ROOT_DOMAIN } = process.env

// Configure DDB 
AWS.config.update({
    region: process.env.REGION,
    endpoint: DDB_HOST ? `http://${DDB_HOST}:${DDB_PORT}` : null
})

// Init DDB
const DynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-10-08' })

// Init PG
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

exports.handler = async (request, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = true
    console.log('request:', request)

    const client = await pool.connect()
    console.log('event: pool.connected')

    try {
        const { input } = request.arguments
        const { id, userId } = input
        console.log(`id: ${id}`)
        console.log(`userId: ${userId}`)

        const res = await client.query(`
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
            WHERE U.user_id = $1
            AND A.deleted_at IS NULL
            AND U.workspace_id = $2
        `, [userId, id])

        const workspaceList = res.rows
        console.log(`workspaceList: ${workspaceList}`)

        // Workspace not found
        if (workspaceList.length === 0) {
            callback(null, {
                code: 204,
                message: 'workspace not found',
            })
        }

        // Workspace found, enrich DynamoDB
        else {
            const result = []
            for (const ws of workspaceList) {
                const endpoint = `${crypto.createHash('md5').update(ws.id).digest('hex')}.api.${ROOT_DOMAIN}`
                console.log('endpoint:', endpoint)

                const { Items } = await DynamoDB.query({
                    TableName: 'workspace',
                    KeyConditionExpression: 'workspace_id = :workspace_id',
                    ExpressionAttributeValues: {
                        ':workspace_id': endpoint,
                    },
                }).promise()
                console.log('Items:', Items)

                if (Items && Items[0]) {
                    result.push({
                        ...ws,
                        endpoint,
                        max_page_views: Items[0].page_view_max,
                        current_page_views: Items[0].page_view_count,
                        workspace_status: Items[0].workspace_status,
                    })
                }
            }
            console.log('result:', result)

            callback(null, {
                code: 200,
                message: 'workspace found',
                data: result[0],
            })
        }
        // Return result
    } catch (e) {
        console.error(e)
        callback(e, {
            code: 500,
            message: 'internal server error',
        })
    } finally {
        console.log('event: client.release')
        client.release()
    }
}
