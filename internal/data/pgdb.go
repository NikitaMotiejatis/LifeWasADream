package data

import (
	"fmt"

	"github.com/jmoiron/sqlx"

	"dreampos/internal/auth"
	"dreampos/internal/config"
)

type PostgresDb struct {
	Db *sqlx.DB
}

func MustCreatePostgresDb(config config.Config) PostgresDb {
	dbDataSource := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s sslmode=disable",
		config.DbHostname,
		config.DbPort,
		config.DbName,
		config.DbUser,
		config.DbPass)

	return PostgresDb{
		Db: sqlx.MustConnect("postgres", dbDataSource),
	}
}

// -------------------------------------------------------------------------------------------------
// auth.UserRepo implimentation --------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetUserDetails(username string) (auth.UserDetails, error) {
	var userDetails auth.UserDetails
	var userId int32
	
	{
		const query = `
		SELECT id, password_hash
		FROM employee
		WHERE username = $1
		LIMIT 1
		`

		var users []struct {
			Id				int32	`db:"id"`
			PasswordHash 	string 	`db:"password_hash"`
		}

		err := pdb.Db.Select(&users, query, username)
		if err != nil || len(users) != 1 {
			return auth.UserDetails{}, err
		}
		
		userId = users[0].Id
		userDetails.PasswordHash = users[0].PasswordHash
	}

	{
		const query = `
		SELECT role.name
		FROM employee_role
		JOIN role
			ON role_id = role.id
			AND employee_id = $1
		`

		var rolesNames []struct {
			RoleName string `db:"name"`
		}

		err := pdb.Db.Select(&rolesNames, query, userId)
		if err != nil {
			return auth.UserDetails{}, err
		}

		userDetails.Roles = []string{}
		for _, rn := range rolesNames {
			userDetails.Roles = append(userDetails.Roles, rn.RoleName)
		}
	}

	return userDetails, nil
}
