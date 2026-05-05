const hre = require("hardhat");

async function main() {
  const TransactionContract = await hre.ethers.getContractFactory("TransactionContract");
  const transaction = await TransactionContract.deploy();

  await transaction.waitForDeployment();

  const contractAddress = await transaction.getAddress();
  console.log(`TransactionContract deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
