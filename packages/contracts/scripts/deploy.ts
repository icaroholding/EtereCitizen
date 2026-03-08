import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH');

  const CitizenReputation = await ethers.getContractFactory('CitizenReputation');
  const reputation = await CitizenReputation.deploy();
  await reputation.waitForDeployment();

  const address = await reputation.getAddress();
  console.log('CitizenReputation deployed to:', address);
  console.log('Transaction hash:', reputation.deploymentTransaction()?.hash);

  console.log('\nVerify with:');
  console.log(`npx hardhat verify --network <network> ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
