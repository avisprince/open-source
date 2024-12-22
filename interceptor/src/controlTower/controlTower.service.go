// controlTower.service.go

package controlTower

import (
	"net/http"
	"os"
	"time"

	"dokkimi.com/interceptor/src/proxyService"
	"dokkimi.com/interceptor/src/types"
	"dokkimi.com/interceptor/src/utils"
)

func LogRequest(request *http.Request, requestBody interface{}, actionId string) {
	if os.Getenv("LOG_ACTIONS") != "false" {
		urlMap := proxyService.GetUrlMap()
		action := extractRequest(request, requestBody, actionId, urlMap)

		LogAction(action)
	}
}

func LogResponse(request *http.Request, actionId string, apiResponse types.APIResponse) {
	if os.Getenv("LOG_ACTIONS") != "false" {
		urlMap := proxyService.GetUrlMap()
		action := extractResponse(request, actionId, apiResponse, urlMap)

		LogAction(action)
	}
}

func extractRequest(request *http.Request, requestBody interface{}, actionId string, urlMap types.UrlMap) types.LoggedAction {
	namespace := os.Getenv("NAMESPACE")
	origin := os.Getenv("ORIGIN")
	originDomain := os.Getenv("ORIGIN_DOMAIN")

	return types.LoggedAction{
		Namespace: namespace,
		ActionID: actionId,
		Timestamp: time.Now().Format(time.RFC3339),
		Type: types.LoggedActionRequest,
		Origin: origin,
		OriginDomain: originDomain,
		Target: utils.ExtractTargetName(request, urlMap),
		TargetDomain: request.Host,
		Method: request.Method,
		Protocol: request.URL.Scheme,
		URL: request.URL.Path,
		Query: request.URL.Query(),
		Headers: request.Header,
		Body: requestBody,
	}
}

func extractResponse(request *http.Request, actionId string, apiResponse types.APIResponse, urlMap types.UrlMap) types.LoggedAction {
	namespace := os.Getenv("NAMESPACE")
	origin := os.Getenv("ORIGIN")
	originDomain := os.Getenv("ORIGIN_DOMAIN")

	return types.LoggedAction{
		Namespace: namespace,
		ActionID: actionId,
		Timestamp: time.Now().Format(time.RFC3339),
		Type: types.LoggedActionResponse,
		Origin: utils.ExtractTargetName(request, urlMap),
		OriginDomain: request.Host,
		Target: origin,
		TargetDomain: originDomain,
		Method: request.Method,
		Protocol: request.URL.Scheme,
		URL: request.URL.Path,
		Query: request.URL.Query(),
		Status: apiResponse.Response.StatusCode,
		Headers: apiResponse.Response.Header,
		Body: apiResponse.Body,
		IsMocked: apiResponse.IsMocked,
	}
}