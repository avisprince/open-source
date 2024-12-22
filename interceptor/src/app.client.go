// app.client.go

package src

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/url"

	"dokkimi.com/interceptor/src/proxyService"
	"dokkimi.com/interceptor/src/utils"
)

func ForwardRequest(r *http.Request, requestBody interface{}) *http.Response {
	// Create a new URL with the desired destination domain
	urlMap := proxyService.GetUrlMap()
	scheme, host := utils.ExtractTargetBaseUrl(r, urlMap)

	newURL := url.URL{
		Scheme:   scheme,
		Host:     host,
		Path:     r.URL.Path,
		RawQuery: r.URL.RawQuery,
	}
	
	body, _ := json.Marshal(requestBody)

	// Create a new request for the new domain
	req, err := http.NewRequest(r.Method, newURL.String(), bytes.NewBuffer(body))
	if err != nil {
		return nil
	}

	// Set the headers from the original request to the new request
	req.Header = r.Header.Clone()

	// Send the new request to the new domain
	client := http.DefaultClient
	response, err := client.Do(req)
	if err != nil {
		return nil
	}

	return response
}

