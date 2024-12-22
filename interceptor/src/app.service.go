// app.service.go

package src

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"dokkimi.com/interceptor/src/controlTower"
	"dokkimi.com/interceptor/src/proxyService"
	"dokkimi.com/interceptor/src/types"
	"dokkimi.com/interceptor/src/utils"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func HandleIngressRequest(ingressRequest *http.Request) types.APIResponse {
	urlParts := strings.Split(ingressRequest.URL.Path, "/")
	itemID := urlParts[2]
	path := urlParts[3:]

	var domain string
	var scheme string
	for key, serviceInfo := range proxyService.GetUrlMap() {
		if serviceInfo.Name == itemID {
			domain = key
			scheme = serviceInfo.Scheme
			break
		}
	}

	if domain == "" {
		return HandleRequest(ingressRequest)
	}

	url := scheme + "://" + domain + "/" + strings.Join(path, "/")
	request, err := http.NewRequest(ingressRequest.Method, url, ingressRequest.Body)
	if err != nil {
		return HandleRequest(ingressRequest)
	}
	
	request.Header = make(http.Header)
	for key, values := range ingressRequest.Header {
		request.Header[key] = values
	}

	return HandleRequest(request)
}

func HandleRequest(r *http.Request) types.APIResponse {
	actionId := uuid.New().String()
	requestBody := utils.ParseBody(r.Body)

	controlTower.LogRequest(r, requestBody, actionId)
	apiResponse := forwardRequest(r, requestBody);
	controlTower.LogResponse(r, actionId, apiResponse)

	return apiResponse
}

func forwardRequest(r *http.Request, requestBody interface{}) types.APIResponse {
	mock := findMatchingMockEndpoint(r)

	if mock != nil {
		log.Println("found a mock")
		if mock.DelayMS != nil {
			time.Sleep(time.Duration(*mock.DelayMS) * time.Millisecond)
		}

		mockedResponse := extractHttpResponseFromMock(mock)

		if mockedResponse != nil {
			return types.APIResponse{
				IsMocked: true,
				Response: mockedResponse,
				Body: utils.ParseBody(mockedResponse.Body),
			}
		}
	}

	response := ForwardRequest(r, requestBody);

	if mock != nil && mock.ResponseStatus != nil {
		response.StatusCode = *mock.ResponseStatus
	}

	return types.APIResponse{
		IsMocked: false,
		Response: response,
		Body: utils.ParseBody(response.Body),
	}
}

func findMatchingMockEndpoint(r *http.Request) *types.MockEndpoint {
	origin := os.Getenv("ORIGIN")
	urlMap := proxyService.GetUrlMap()
	mockEndpoints := proxyService.GetMockEndpoints()

	for _, mock := range mockEndpoints {
		isMatch := (mock.Origin == "*" || urlMap[mock.Origin].Name == origin) && 
			(mock.Target == "*" || mock.Target == r.Host) &&
			(strings.EqualFold(mock.Method, r.Method))

		if isMatch && isPathMatch(mock.Path, r.URL.Path) {
			return &mock
		}
	}

	return nil
}

func isPathMatch(pattern string, path string) bool {
	router := mux.NewRouter()
	router.HandleFunc(pattern, nil)

	// We create a fake request to pass to Match
	req, err := http.NewRequest("GET", path, nil)
	if err != nil {
		return false
	}

	var match mux.RouteMatch
	matchResult := router.Match(req, &match)
	return matchResult
}

func extractHttpResponseFromMock(mock *types.MockEndpoint) *http.Response {
	if mock.ResponseHeaders != nil || mock.ResponseBody != nil {
		mockedResponse := &http.Response{
			Body: nil,
			Header: make(http.Header),
			StatusCode: 200,
		}

		if mock.ResponseStatus != nil {
			mockedResponse.StatusCode = *mock.ResponseStatus
		}

		if mock.ResponseBody != nil {
			jsonBytes, err := json.Marshal(*mock.ResponseBody)
			if err == nil {
				mockedResponse.Body = io.NopCloser(bytes.NewReader(jsonBytes))
			}
		}

		if mock.ResponseHeaders != nil {
			var headers map[string]interface{}
			err := json.Unmarshal([]byte(*mock.ResponseHeaders), &headers)

			if err == nil {
				for key, value := range headers {
					switch v := value.(type) {
					case string:
						mockedResponse.Header.Set(key, v)
					case []interface{}:
						for _, val := range v {
							if valStr, ok := val.(string); ok {
								mockedResponse.Header.Add(key, valStr)
							}
						}
					case float64:
						mockedResponse.Header.Set(key, fmt.Sprintf("%v", v))
					default:
						// Handle the case where the value is neither a string nor a slice, nor a float
					}
				}
			}
		}

		return mockedResponse
	}

	return nil
}