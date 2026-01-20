const { pool } = require('../db');

const subsidies = [
  {
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    description: 'Direct income support of ₹6,000 per year to all farmer families across the country in three equal installments of ₹2,000 each.',
    government_url: 'https://pmkisan.gov.in/',
    category: 'Income Support',
    state: 'All India',
    eligibility: 'All farmer families having cultivable land'
  },
  {
    title: 'Karnataka Raitha Samruddhi Yojana',
    description: 'Financial assistance scheme for farmers in Karnataka to support agricultural activities and improve farm income.',
    government_url: 'https://raitamitra.karnataka.gov.in/',
    category: 'State Scheme',
    state: 'Karnataka',
    eligibility: 'Farmers with land ownership records in Karnataka'
  },
  {
    title: 'Soil Health Card Scheme',
    description: 'Provides soil nutrient status information to farmers to improve soil health and productivity.',
    government_url: 'https://soilhealth.dac.gov.in/',
    category: 'Agricultural Support',
    state: 'All India',
    eligibility: 'All farmers with agricultural land'
  },
  {
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Crop insurance scheme providing financial support to farmers in case of crop loss due to natural calamities.',
    government_url: 'https://pmfby.gov.in/',
    category: 'Insurance',
    state: 'All India',
    eligibility: 'All farmers including sharecroppers and tenant farmers'
  },
  {
    title: 'Karnataka Krishi Bhagya Yojana',
    description: 'Micro-irrigation scheme providing subsidies for drip and sprinkler irrigation systems.',
    government_url: 'https://raitamitra.karnataka.gov.in/',
    category: 'Irrigation',
    state: 'Karnataka',
    eligibility: 'Small and marginal farmers in Karnataka'
  }
];

async function seedSubsidies() {
  try {
    console.log('🌱 Seeding subsidies...');
    
    // Clear existing subsidies
    await pool.query('DELETE FROM subsidies');
    console.log('✅ Cleared existing subsidies');
    
    // Insert new subsidies
    for (const subsidy of subsidies) {
      await pool.query(
        `INSERT INTO subsidies (title, description, government_url, category, state, eligibility, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, true, NOW())`,
        [
          subsidy.title,
          subsidy.description,
          subsidy.government_url,
          subsidy.category,
          subsidy.state,
          subsidy.eligibility
        ]
      );
      console.log(`✅ Added: ${subsidy.title}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${subsidies.length} subsidies!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding subsidies:', error);
    process.exit(1);
  }
}

seedSubsidies();
