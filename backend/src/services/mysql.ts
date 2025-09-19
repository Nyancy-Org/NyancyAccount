import mariadb from "mariadb"
import config from "./config"

const mdb = config.database

export const db = mariadb.createPool({
  host: mdb.host,
  user: mdb.user,
  password: mdb.password,
  database: mdb.database
})