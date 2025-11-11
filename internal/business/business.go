package business

import "fmt"

type Business struct {
	Id			uint32 	`db:"id"            json:"id"`
	Name		string	`db:"name"          json:"name"`
	Description	string	`db:"description"   json:"description"`
	Type		string	`db:"type"          json:"type"`
	Email		string	`db:"email"         json:"email"`
	Phone		string	`db:"phone"         json:"phone"`
	CreatedAt	string	`db:"created_at"    json:"created_at"`
}

func (b Business) PrettyString() string {
	return fmt.Sprintf(
`ID:          %d
Name:        %s
Description: %s
Type:        %s
Email:       %s
Phone:       %s
CreatedAt:   %s`,
	b.Id,
	b.Name,
	b.Description,
	b.Type,
	b.Email,
	b.Phone,
	b.CreatedAt)
}
