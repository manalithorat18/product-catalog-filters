// Runs before the test framework is installed in each worker. Points the
// app at a throwaway SQLite file so tests never touch the dev database.
process.env.NODE_ENV = 'test';
process.env.DB_PATH = './src/db/catalog.test.sqlite';
process.env.DEFAULT_PAGE_SIZE = '12';
process.env.MAX_PAGE_SIZE = '48';
