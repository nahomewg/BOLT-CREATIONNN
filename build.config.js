module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Only run in production
    if (!dev) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      
      // Enable module concatenation
      config.optimization.concatenateModules = true;
      
      // Minimize CSS
      config.optimization.minimizer.push(
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: ['default', { discardComments: { removeAll: true } }],
          },
        })
      );
    }
    
    return config;
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  cache: true
}; 