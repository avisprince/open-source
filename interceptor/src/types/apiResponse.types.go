// apiResponse.types.go

package types

import (
	"net/http"
)

type APIResponse struct {
	Response  *http.Response `json:"response"`
	Body      interface{}    `json:"body"`
	IsMocked  bool        	 `json:"isMocked"`
}