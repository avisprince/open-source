package dbClients

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"strings"

	"dokkimi.com/proxy-service/src/types"
	_ "github.com/lib/pq"
)

type PostgresClient struct {}

func extractPostgresDSN(query types.DatabaseQuery) string {
	database := query.UseDatabase
	if database == "" {
		database = "postgres"
	}

	return fmt.Sprintf(
		"user=%s host=%s-db-service port=%s dbname=%s sslmode=disable",
		os.Getenv("POSTGRES_USER"), query.DbName, os.Getenv("POSTGRES_PORT"), database,
	)
}

func (c *PostgresClient) QueryDB(query types.DatabaseQuery) ([]types.DatabaseQueryResult, error) {
	db, err := sql.Open("postgres", extractPostgresDSN(query))
	if err != nil {
		return nil, err
	}

	defer db.Close()

	// Split query into individual statements
	statements := strings.Split(query.Command, ";")

	var queryResults []types.DatabaseQueryResult
	// Execute each statement individually
	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt) // Trim leading and trailing whitespace
		if stmt == "" {
			continue
		}

		queryResult := types.DatabaseQueryResult{
			Query: stmt, 
			Result: "",
		}

		rows, err := db.Query(stmt)
		if err != nil {
			queryResult.Result = err.Error()
			queryResults = append(queryResults, queryResult)
			continue
		}

		defer rows.Close()

		columnNames, err := rows.Columns()
		if err != nil {
			queryResult.Result = err.Error()
			queryResults = append(queryResults, queryResult)
			continue
		}

		columnPointers := make([]interface{}, len(columnNames))
		for i := range columnPointers {
			columnPointers[i] = new(interface{})
		}

		var results []interface{}
		for rows.Next() {
			if err := rows.Scan(columnPointers...); err != nil {
				results = append(results, err.Error())
				continue
			}

			m := make(map[string]interface{})
			for i, colName := range columnNames {
				val := columnPointers[i].(*interface{})
				b, ok := (*val).([]byte)
				if !ok {
					m[colName] = *val
				} else {
					str := string(b)
					if i, err := strconv.ParseInt(str, 10, 64); err == nil {
						m[colName] = i
					} else if f, err := strconv.ParseFloat(str, 64); err == nil {
						m[colName] = f
					} else if b, err := strconv.ParseBool(str); err == nil {
						m[colName] = b
					} else {
						m[colName] = str
					}
				}
			}

			results = append(results, m)
		}

		if err := rows.Err(); err != nil {
			queryResult.Result = err.Error()
		} else {
			queryResult.Result = results
		}

		queryResults = append(queryResults, queryResult)
	}

	return queryResults, nil
}

