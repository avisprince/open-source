package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"dokkimi.com/proxy-service/src/dbProxy"
	"dokkimi.com/proxy-service/src/interceptorProxy"
	"dokkimi.com/proxy-service/src/namespaceHealth"
	"dokkimi.com/proxy-service/src/types"
	"github.com/bugsnag/bugsnag-go"
	"github.com/gorilla/mux"
)

type interceptorProxyService struct {
	service *interceptorProxy.Service
}

type dbProxyService struct {
	service *dbProxy.DatabaseService
}

func newInterceptorProxyService() *interceptorProxyService {
	return &interceptorProxyService{
		service: interceptorProxy.NewService(),
	}
}

func newDbProxyService() *dbProxyService {
	return &dbProxyService{
		service: dbProxy.NewService(),
	}
}

func authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("ApiKey")
		envApiKey := os.Getenv("API_KEY")

		if apiKey != envApiKey {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		namespaceParam := mux.Vars(r)["namespace"]
		envNamespace := os.Getenv("NAMESPACE")

		if namespaceParam != envNamespace {
			http.NotFound(w, r)
		}

		// If it matches, pass control to the next handler
		next.ServeHTTP(w, r)
	})
}

func main() {
	bugSnagApiKey := os.Getenv("BUGSNAG_API_KEY")
	if bugSnagApiKey != "" {
		bugsnag.Configure(bugsnag.Configuration{
			APIKey: bugSnagApiKey,
		})
	}

	// Run the healthcheck cron
	namespaceHealth.Run()

	ips := newInterceptorProxyService()
	dbProxyService := newDbProxyService()

	// Create a new router
	r := mux.NewRouter()
	subRouter := r.PathPrefix("/proxy-service").Subrouter()

	// Health Check
	r.HandleFunc("/health", healthHandler).Methods("GET")

	// InterceptorProxy
	interceptorProxyRouter := subRouter.PathPrefix("/interceptor-proxy").Subrouter()
	interceptorProxyRouter.HandleFunc("/{namespace}/mockEndpoints", ips.getMockEndpointsHandler).Methods("GET")
	interceptorProxyRouter.HandleFunc("/{namespace}/mockEndpoints", ips.setMockEndpointsHandler).Methods("POST")
	interceptorProxyRouter.HandleFunc("/{namespace}/urlMap", ips.getUrlMapHandler).Methods("GET")
	interceptorProxyRouter.HandleFunc("/{namespace}/urlMap", ips.setUrlMapHandler).Methods("POST")

	// DbProxy
	dbProxyRouter := subRouter.PathPrefix("/database-proxy").Subrouter()
	dbProxyRouter.HandleFunc("/{namespace}/query", dbProxyService.queryDatabaseHandler).Methods("POST")

	// Add Auth Middleware
	subRouter.Use(authMiddleware)

	// Start the server
	log.Println("Starting server on port 5001...")
	log.Fatal(http.ListenAndServe(":5001", r))
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello, World!"))
}

func (ips *interceptorProxyService) getMockEndpointsHandler(w http.ResponseWriter, r *http.Request) {
	mockEndpoints := ips.service.GetMockEndpoints()
	json.NewEncoder(w).Encode(mockEndpoints)
}

func (ips *interceptorProxyService) setMockEndpointsHandler(w http.ResponseWriter, r *http.Request) {
	var endpoints []types.MockEndpoint
	err := json.NewDecoder(r.Body).Decode(&endpoints)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ips.service.SetMockEndpoints(endpoints)
}

func (ips *interceptorProxyService) getUrlMapHandler(w http.ResponseWriter, r *http.Request) {
	urlMap := ips.service.GetUrlMap()
	json.NewEncoder(w).Encode(urlMap)
}

func (ips *interceptorProxyService) setUrlMapHandler(w http.ResponseWriter, r *http.Request) {
	var urlMap types.UrlMap
	err := json.NewDecoder(r.Body).Decode(&urlMap)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ips.service.SetUrlMap(urlMap)
}

func (dbProxyService *dbProxyService) queryDatabaseHandler(w http.ResponseWriter, r *http.Request) {
	var dbQuery types.DatabaseQuery
	err := json.NewDecoder(r.Body).Decode((&dbQuery))
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	results, err := dbProxyService.service.QueryDB(dbQuery)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(results)
}