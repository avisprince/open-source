// controlTower.client.go

package controlTower

import (
	"bytes"
	"encoding/json"
	"net/http"
	"os"

	"dokkimi.com/interceptor/src/types"
)

func LogAction(action types.LoggedAction) {
	controlTowerUri := os.Getenv("CONTROL_TOWER_URI")
	apiKey := os.Getenv("API_KEY")

	// Serialize the request body to JSON
	body, err := json.Marshal(action)
	if err != nil {
		return
	}

	url := controlTowerUri + "/actions/logAction"
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return
	}

	// Set the API key header
	req.Header.Set("ApiKey", apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := http.DefaultClient
	resp, err := client.Do(req)
	if err != nil {
		return
	}
	
	defer resp.Body.Close()
}

