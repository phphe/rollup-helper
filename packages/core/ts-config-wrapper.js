require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "CommonJS",
    allowJs: false,
  },
});

module.exports = require(process.env.REAL_CONFIG);
