const { Client } = require('pg');

const connectionString = 'postgresql://foodclub:HJSDBA@54545@foodclub-db.postgres.database.azure.com:5432/foodclub_hml?sslmode=require';

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('--- Tabelas no Banco de Dados ---');
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(tables.rows.map(r => r.table_name));

    console.log('\n--- Primeiros 10 Usuários ---');
    const users = await client.query('SELECT id, name, email, role, "is_active" FROM "user" LIMIT 10');
    console.table(users.rows);

  } catch (err) {
    console.error('Erro ao conectar ou consultar:', err);
  } finally {
    await client.end();
  }
}

main();
