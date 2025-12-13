package data

import (
	"fmt"
	"log/slog"
	"strings"

	"github.com/jmoiron/sqlx"

	"dreampos/internal/auth"
	"dreampos/internal/config"
	"dreampos/internal/order"
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

		var users []struct{
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

		var rolesNames []string

		err := pdb.Db.Select(&rolesNames, query, userId)
		if err != nil {
			return auth.UserDetails{}, err
		}

		userDetails.Roles = rolesNames
	}

	return userDetails, nil
}

// -------------------------------------------------------------------------------------------------
// order.ProductRepo implimentation ----------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

func (pdb PostgresDb) GetProducts(filter order.ProductFilter) ([]order.Product, error) {
	var filteredProducts []order.Product

	// TODO: (potentialy) In the future it may be a good idea
	// to optimize this query by rewriting it, adding materialized table to DB, etc.
	// Right now, it does not cause any performace issues (or is even close to doing that).
	{
		queryFilterConditions := []string{ "item.status = 'ACTIVE'" }

		if filter.Category != nil {
			queryFilterConditions = append(queryFilterConditions, fmt.Sprintf("category.name = '%s'", *filter.Category))
		}

		query := fmt.Sprintf(`
		SELECT item.id, item.name, price_per_unit
		FROM item
		JOIN item_category
			ON item.id = item_id
		JOIN category
			ON category.id = category_id
		WHERE 
			%s
		ORDER BY
			item.name ASC
		`, strings.Join(queryFilterConditions, " AND ") + "\n")


		err := pdb.Db.Select(&filteredProducts, query)
		if err != nil {
			slog.Error(err.Error())
			return []order.Product{}, ErrInternal
		}
	}
	{
		const query = `
		SELECT category.name
		FROM item_category
		JOIN category
				ON item_category.item_id = $1
				AND category.id = category_id
		`

		for i := range filteredProducts {
			err := pdb.Db.Select(&filteredProducts[i].Categories, query, filteredProducts[i].Id)
			if err != nil {
				slog.Error(err.Error())
				return []order.Product{}, ErrInternal
			}
		}
	}
	{
		const query = `
		SELECT name
		FROM item_variation
		WHERE item_id = $1
		`

		for i := range filteredProducts {
			err := pdb.Db.Select(&filteredProducts[i].Variations, query, filteredProducts[i].Id)
			if err != nil {
				slog.Error(err.Error())
				return []order.Product{}, ErrInternal
			}
		}
	}

	return filteredProducts, nil
}
