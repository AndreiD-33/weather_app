/**
 * jest.config.js — Configurare Jest pentru testare unitara
 */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["backend/**/*.js", "!backend/server.js"],
  coverageDirectory: "coverage",
  verbose: true,
};