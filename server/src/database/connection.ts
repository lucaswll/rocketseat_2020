import knex from 'knex'

const connection = knex({
    client: 'sqlite3',
    connection: { 
        filename: './src/database/database.sqlite'
    },
    migrations: {
        directory: './src/database/migrations'
    },
    useNullAsDefault: true
})

export default connection;