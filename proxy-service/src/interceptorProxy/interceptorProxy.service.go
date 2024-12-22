package interceptorProxy

import (
	"dokkimi.com/proxy-service/src/types"
)

type Service struct {
	cache *Cache
}

func NewService() *Service {
	return &Service{
		cache: NewCache(),
	}
}

func (service *Service) GetMockEndpoints() []types.MockEndpoint {
	return service.cache.GetMockEndpoints()
}

func (service *Service) SetMockEndpoints(mockEndpoints []types.MockEndpoint) {
	service.cache.SetMockEndpoints(mockEndpoints)
}

func (service *Service) GetUrlMap() types.UrlMap {
	return service.cache.GetUrlMap()
}

func (service *Service) SetUrlMap(urlMap types.UrlMap) {
	service.cache.SetUrlMap(urlMap)
}
