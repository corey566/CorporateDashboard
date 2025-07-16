import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createTestPlan() {
  try {
    // Check if basic plan exists
    const existingBasic = await pool.query(
      'SELECT * FROM subscription_plans WHERE name = $1',
      ['Basic Plan']
    );
    
    if (existingBasic.rows.length === 0) {
      // Create basic plan
      await pool.query(
        `INSERT INTO subscription_plans (name, description, max_users, max_agents, max_admins, price, currency, billing_interval, features, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'Basic Plan',
          'Perfect for small teams getting started',
          10,
          20,
          5,
          29.99,
          'USD',
          'monthly',
          JSON.stringify(['Real-time Dashboard', 'Team Management', 'Basic Analytics']),
          true
        ]
      );
      console.log('Basic plan created');
    } else {
      console.log('Basic plan already exists');
    }
    
    // Check if premium plan exists
    const existingPremium = await pool.query(
      'SELECT * FROM subscription_plans WHERE name = $1',
      ['Premium Plan']
    );
    
    if (existingPremium.rows.length === 0) {
      // Create premium plan
      await pool.query(
        `INSERT INTO subscription_plans (name, description, max_users, max_agents, max_admins, price, currency, billing_interval, features, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'Premium Plan',
          'Advanced features for growing businesses',
          50,
          100,
          15,
          99.99,
          'USD',
          'monthly',
          JSON.stringify(['Everything in Basic', 'Advanced Analytics', 'Custom Reports', 'Priority Support']),
          true
        ]
      );
      console.log('Premium plan created');
    } else {
      console.log('Premium plan already exists');
    }
    
    console.log('Test subscription plans setup completed');
    
  } catch (error) {
    console.error('Error creating test plans:', error);
  } finally {
    await pool.end();
  }
}

createTestPlan();