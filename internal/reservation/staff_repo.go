package reservation

type StaffRepo interface {
	GetStaff() ([]Staff, error)
}
