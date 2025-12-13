package reservation

type ServiceRepo interface {
	GetServices() ([]Service, error)
}