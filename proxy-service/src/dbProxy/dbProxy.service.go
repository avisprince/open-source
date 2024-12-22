package dbProxy

import (
	"fmt"

	"dokkimi.com/proxy-service/src/dbProxy/dbClients"
	"dokkimi.com/proxy-service/src/types"
)

type databaseClient interface {
	QueryDB(query types.DatabaseQuery) ([]types.DatabaseQueryResult, error)
}

type DatabaseService struct {
	mySQLClient    databaseClient
	postgresClient databaseClient
	mongoDBClient  databaseClient
}

func NewService() *DatabaseService {
	return &DatabaseService{
		mySQLClient: &dbClients.MySQLClient{},
		postgresClient: &dbClients.PostgresClient{},
		mongoDBClient: &dbClients.MongoDBClient{},
	}
}

func (s *DatabaseService) QueryDB(query types.DatabaseQuery) ([]types.DatabaseQueryResult, error) {
	switch query.Database {
		case types.MySQL:
			return s.mySQLClient.QueryDB(query)
		case types.Postgres:
			return s.postgresClient.QueryDB(query)
		// case types.Mongo:
			// // Still needs to be implemented/tested fully
			// return s.MongoDBClient.QueryDB(query)
		default:
			return nil, fmt.Errorf("database %s is not supported", query.Database)
	}
}
