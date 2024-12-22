// urlMap.types.go

package types

type ServiceInfo struct {
	Scheme string `json:"scheme"`
	URL    string `json:"url"`
	Name   string `json:"name"`
}

type UrlMap map[string]ServiceInfo