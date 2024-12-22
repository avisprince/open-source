package dbClients

import (
	"context"
	"fmt"
	"time"

	"dokkimi.com/proxy-service/src/types"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoDBClient struct {}

func extractMongoUri(query types.DatabaseQuery) string {
	return fmt.Sprintf("mongodb://%s-db-service:27017/%s",
		query.DbName,
		query.UseDatabase,
	)
}

func (c *MongoDBClient) QueryDB(query types.DatabaseQuery) ([]types.DatabaseQueryResult, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(extractMongoUri(query)))
	if err != nil {
			return nil, err
	}
	defer client.Disconnect(ctx)

	// Assuming dbName and useDatabase are the database and collection names, respectively
	collection := client.Database(query.DbName).Collection(query.UseDatabase)

	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
			return nil, err
	}
	defer cursor.Close(ctx)

	var results []types.DatabaseQueryResult
	for cursor.Next(ctx) {
			var result types.DatabaseQueryResult
			if err := cursor.Decode(&result.Result); err != nil {
					return nil, err
			}
			result.Query = query.Command
			results = append(results, result)
	}

	return results, nil
}
