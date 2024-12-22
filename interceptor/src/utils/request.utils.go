// request.uils.go

package utils

import (
	"encoding/json"
	"io"
	"net/http"

	"dokkimi.com/interceptor/src/types"
)

func ExtractTargetBaseUrl(request *http.Request, urlMap types.UrlMap) (string, string) {
	service, exists := urlMap[request.Host]

	if exists {
		return service.Scheme, service.URL
	}

	return "https", request.Host
}

func ExtractTargetName(request *http.Request, urlMap types.UrlMap) string {
	service, exists := urlMap[request.Host]

	if exists {
		return service.Name
	}

	return request.Host
}

func ParseBody(initialBody io.ReadCloser) interface{} {
	body, err := io.ReadAll(initialBody)
	if err != nil {
		// need to properly handle error
		body = make([]byte, 0)
	}

	var parsedBody interface{}
	error := json.Unmarshal(body, &parsedBody)
	if error != nil {
		parsedBody = string(body)
	}

	return parsedBody
}