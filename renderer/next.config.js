module.exports = {
  externals: {
    FileReader: "FileReader",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = "electron-renderer";
    }

    return config;
  },
};
