// loggedAction.types.go

package types

type LoggedAction struct {
	ID           string            `json:"_id,omitempty"`
	Namespace    string            `json:"namespace"`
	ActionID     string            `json:"actionId"`
	Timestamp    string            `json:"timestamp"`
	Type         LoggedActionTypes `json:"type"`
	Origin       string     			 `json:"origin"`
	OriginDomain string     			 `json:"originDomain"`
	Target       string     			 `json:"target"`
	TargetDomain string     			 `json:"targetDomain"`
	Method       string     			 `json:"method"`
	Protocol     string     			 `json:"protocol"`
	URL          string     			 `json:"url"`
	Query        interface{}     	 `json:"query"`
	Headers      interface{}			 `json:"headers"`
	Body         interface{}			 `json:"body"`
	Status       int         			 `json:"status,omitempty"`
	IsMocked     bool       			 `json:"isMocked,omitempty"`
}

type LoggedActionTypes string

const (
	LoggedActionRequest  LoggedActionTypes = "request"
	LoggedActionResponse LoggedActionTypes = "response"
)
