// mockEndpoint.types.go

package types

type MockEndpoint struct {
	Method          string  `json:"method"`
	Origin          string  `json:"origin"`
	Target          string  `json:"target"`
	Path            string  `json:"path"`
	DelayMS         *int    `json:"delayMS,omitempty"`
	ResponseStatus  *int    `json:"responseStatus,omitempty"`
	ResponseHeaders *string `json:"responseHeaders,omitempty"`
	ResponseBody    *string `json:"responseBody,omitempty"`
}