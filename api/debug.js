// Debug endpoint to check environment variables (for troubleshooting only)
module.exports = (req, res) => {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlPrefix = process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'NOT SET';
    
    res.json({
        environment: process.env.NODE_ENV || 'unknown',
        hasDatabase: hasDbUrl,
        databasePrefix: dbUrlPrefix,
        vercel: process.env.VERCEL === '1',
        allEnvVars: Object.keys(process.env).filter(k => 
            k.includes('DATABASE') || 
            k.includes('JWT') || 
            k.includes('ADMIN') ||
            k.includes('EMAIL') ||
            k.includes('WEATHER')
        )
    });
};
