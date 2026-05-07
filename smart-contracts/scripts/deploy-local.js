const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Token = await hre.ethers.getContractFactory("DeFiSecureToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();

  const Escrow = await hre.ethers.getContractFactory("EscrowRefund");
  const escrow = await Escrow.deploy(deployer.address);
  await escrow.waitForDeployment();

  const Staking = await hre.ethers.getContractFactory("StakingVault");
  const staking = await Staking.deploy(deployer.address, await token.getAddress());
  await staking.waitForDeployment();

  const Gov = await hre.ethers.getContractFactory("DAOGovernance");
  const gov = await Gov.deploy(deployer.address, await token.getAddress());
  await gov.waitForDeployment();

  const Rewards = await hre.ethers.getContractFactory("MiningRewards");
  const rewards = await Rewards.deploy(deployer.address, await token.getAddress(), deployer.address);
  await rewards.waitForDeployment();

  const addresses = {
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    DeFiSecureToken: await token.getAddress(),
    EscrowRefund: await escrow.getAddress(),
    StakingVault: await staking.getAddress(),
    DAOGovernance: await gov.getAddress(),
    MiningRewards: await rewards.getAddress()
  };

  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

