package interceptorProxy

import (
	"encoding/json"
	"os"
	"sync"

	"dokkimi.com/proxy-service/src/types"
)

type Cache struct {
	sync.RWMutex
	mockEndpoints []types.MockEndpoint
	urlMap types.UrlMap
}

func NewCache() *Cache {
	cache := &Cache{
		mockEndpoints: make([]types.MockEndpoint, 0),
		urlMap: make(types.UrlMap),
	}

	// Read initial data from environment variables
	mockEndpointsJson := os.Getenv("INITIAL_MOCK_ENDPOINTS")
	urlMapJson := os.Getenv("INITIAL_URL_MAP")

	// Deserialize JSON into Go structures
	json.Unmarshal([]byte(mockEndpointsJson), &cache.mockEndpoints)
	json.Unmarshal([]byte(urlMapJson), &cache.urlMap)

	return cache
}

func (cache *Cache) SetMockEndpoints(endpoints []types.MockEndpoint) {
	cache.Lock()
	defer cache.Unlock()
	cache.mockEndpoints = endpoints
}

func (cache *Cache) GetMockEndpoints() []types.MockEndpoint {
	cache.RLock()
	defer cache.RUnlock()
	return cache.mockEndpoints
}

func (cache *Cache) SetUrlMap(urlMap types.UrlMap) {
	cache.Lock()
	defer cache.Unlock()
	cache.urlMap = urlMap
}

func (cache *Cache) GetUrlMap() types.UrlMap {
	cache.RLock()
	defer cache.RUnlock()
	return cache.urlMap
}
