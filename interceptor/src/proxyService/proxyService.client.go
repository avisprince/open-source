// proxyService.client.go

package proxyService

import (
	"encoding/json"
	"net/http"
	"os"

	"dokkimi.com/interceptor/src/types"
)

const (
	PROXY_SERVICE_NAME = "proxy-service"
	INTERCEPTOR_PROXY_ENDPOINT = "interceptor-proxy"
)

func GetMockEndpoints() []types.MockEndpoint {
	req := proxyServiceRequest("GET", "mockEndpoints")

	response, err := http.DefaultClient.Do(req)
	if err != nil {
		return []types.MockEndpoint{}
	}

	defer response.Body.Close()

	if err != nil {
		return []types.MockEndpoint{}
	}

	var mockEndpoints []types.MockEndpoint
	err = json.NewDecoder(response.Body).Decode(&mockEndpoints)
	if err != nil {
		return []types.MockEndpoint{}
	}

	return mockEndpoints
}

func GetUrlMap() types.UrlMap {
	req := proxyServiceRequest("GET", "urlMap")

	response, err := http.DefaultClient.Do(req)
	if err != nil {
		return make(types.UrlMap)
	}

	defer response.Body.Close()

	var urlMap types.UrlMap
	err = json.NewDecoder(response.Body).Decode(&urlMap)
	if err != nil {
		return make(types.UrlMap)
	}

	return urlMap
}

func proxyServiceUrl(path string) string {
	proxyServiceUri := os.Getenv("PROXY_SERVICE_URI")
	namespace := os.Getenv("NAMESPACE")
	return proxyServiceUri + "/" + PROXY_SERVICE_NAME + "/" + INTERCEPTOR_PROXY_ENDPOINT + "/" + namespace + "/" + path
}

func proxyServiceRequest(method string, path string) *http.Request {
	req, _ := http.NewRequest(method, proxyServiceUrl(path), nil)
	req.Header.Add("ApiKey", os.Getenv("API_KEY"))

	return req
}

