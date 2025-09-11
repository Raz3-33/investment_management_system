// scripts/rebuild-migrations-from-db.cjs
require('dotenv').config();
const { Client } = require('pg');
const { mkdirSync, writeFileSync, existsSync } = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set'); process.exit(1);
}

(async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    `select migration_name, script
     from _prisma_migrations
     order by finished_at asc, migration_name asc`
  );

  const baseDir = path.join(process.cwd(), 'prisma', 'migrations');
  rows.forEach(({ migration_name, script }) => {
    const dir = path.join(baseDir, migration_name);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'migration.sql'), script ?? '-- empty\n');
    writeFileSync(path.join(dir, 'README.md'), `# ${migration_name}\nRebuilt from _prisma_migrations\n`);
    console.log('Rebuilt', migration_name);
  });

  await client.end();
  console.log('Done.');
})().catch((e) => { console.error(e); process.exit(1); });
