const { Client } = require('pg');

const connectionString = 'postgresql://foodclub:HJSDBA@54545@foodclub-db.postgres.database.azure.com:5432/foodclub_hml?sslmode=require';

async function main() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    // Lista as colunas da tabela restaurant para ter certeza
    const columns = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'restaurant'");
    console.log('Colunas em restaurant:', columns.rows.map(r => r.column_name));
    
    const res = await client.query('SELECT * FROM restaurant');
    console.table(res.rows);
  } catch (err) {
    console.error('Erro:', err);
  } finally {
    await client.end();
  }
}

main();
