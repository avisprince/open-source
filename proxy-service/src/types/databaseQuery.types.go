package types

type SupportedDatabases string

const (
	MySQL SupportedDatabases = "mysql"
	Postgres SupportedDatabases = "postgres"
	Mongo SupportedDatabases = "mongodb"
)

type DatabaseQuery struct {
	Database SupportedDatabases `json:"database"` // type of database (MySQL, PostgreSQL, MongoDB)
	DbName string `json:"dbName"` // name of the database
	Command string `json:"command"` // command to execute
	UseDatabase string `json:"useDatabase,omitempty"` // database to use when connecting
}

type DatabaseQueryResult struct {
	Query string `json:"query"` // query that was executed
	Result interface{} `json:"result"` // result of the query
}
