package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync/atomic"

	"dokkimi.com/interceptor/src"
	"dokkimi.com/interceptor/src/types"
	"github.com/bugsnag/bugsnag-go"
	"github.com/gorilla/mux"
)

var requestCounter int32
var maxRequests int32 = 10

func main() {
	bugSnagApiKey := os.Getenv("BUGSNAG_API_KEY")
	if bugSnagApiKey != "" {
		bugsnag.Configure(bugsnag.Configuration{
			APIKey: bugSnagApiKey,
		})
	}
	
	// Create a new router
	router := mux.NewRouter()

	// Add catch-all route
	router.HandleFunc("/{path:.*}", catchAllHandler)

	// Start the server
	log.Println("Server started on port 80")
	log.Fatal(http.ListenAndServe(":80", router))
}

func catchAllHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Intercepted request to " + r.Host + r.URL.String())

	// Check if the maximum number of requests is already reached
	if atomic.LoadInt32(&requestCounter) >= maxRequests {
		http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
		return
	}

	// Increment the request counter
	atomic.AddInt32(&requestCounter, 1)
	defer atomic.AddInt32(&requestCounter, -1)
	
	origin := os.Getenv("ORIGIN")
	var result types.APIResponse

	if origin == "dokkimi" {
		result = src.HandleIngressRequest(r)
	} else {
		result = src.HandleRequest(r)
	}
	
	defer result.Response.Body.Close()

	// Set the headers of the API response to match the external API response.
	// This must be first
	for header, values := range result.Response.Header {
		for _, value := range values {
			if header != "Content-Length" {
				w.Header().Set(header, value)
			}
		}
	}

	// Set the status code
	w.WriteHeader(result.Response.StatusCode)
	
	// Set the body
	responseJSON, err := json.Marshal(result.Body)
	if err != nil {
		w.Write(make([]byte, 0))
		return
	}
	
	w.Write(responseJSON)
}
