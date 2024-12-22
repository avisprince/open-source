package dbClients

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"strings"

	"dokkimi.com/proxy-service/src/types"
	_ "github.com/go-sql-driver/mysql"
)

type MySQLClient struct {}

func extractMySqlDSN(query types.DatabaseQuery) string{
	return fmt.Sprintf("%s@tcp(%s-db-service:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("MYSQL_USER"),
		query.DbName,
		os.Getenv("MYSQL_PORT"),
		query.UseDatabase,
	)
}

func (c *MySQLClient) QueryDB(query types.DatabaseQuery) ([]types.DatabaseQueryResult, error) {
	db, err := sql.Open("mysql", extractMySqlDSN(query))
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
