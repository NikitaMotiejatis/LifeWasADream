package auth


type LoginInfo struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserDetails struct {
	PasswordHash 	string
	Roles			[]string
}

type User struct {
	Username	string 		`json:"username"`
	Roles		[]string	`json:"roles"`
}

type LoginResponse struct {
	RedirectPath	string   		`json:"redirectPath"`
	Currency		string   		`json:"currency"`
	BusinessInfo	BusinessInfo	`json:"businessInfo"`
}

type BusinessInfo struct {
	Id			int64 			`json:"id"        db:"id"`
	Locations	[]LocationInfo	`json:"locations"`
}

type LocationInfo struct {
	Id		int64 	`json:"id"   db:"id"`
	Name	string 	`json:"name" db:"name"`
}
