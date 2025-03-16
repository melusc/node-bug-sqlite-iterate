import {DatabaseSync} from 'node:sqlite';

const database = new DatabaseSync(':memory:');

database.exec(`
	CREATE TABLE users (
		user_id  INTEGER PRIMARY KEY AUTOINCREMENT,
		name     TEXT NOT NULL UNIQUE
	);
`)

for (let index = 0; index < 1e3; ++index) {
	database.prepare(
		`INSERT INTO users (name) VALUES (:name)`,
	).run({
		name: Math.random().toString(36).slice(2),
	});
}

// Double check all 1000 rows are inserted
console.log(database.prepare('SELECT count(*) as row_count FROM users;').get());


// const iters = [[...database.prepare('SELECT * from users;').iterate()][Symbol.iterator]()];
const iters = [database.prepare('SELECT * from users;').iterate()];

outerLoop:
while (true) {
	for (const iter of iters) {
		const next = iter.next();
		if (next.done) {
			break outerLoop;
		}

		console.log(next.value.user_id, next.value.name);
	}
}
