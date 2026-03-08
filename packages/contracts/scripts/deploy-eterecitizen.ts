import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying EtereCitizen with account:', deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'ETH');

  const EtereCitizen = await ethers.getContractFactory('EtereCitizen');
  const contract = await EtereCitizen.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('EtereCitizen deployed to:', address);
  console.log('Transaction hash:', contract.deploymentTransaction()?.hash);

  console.log('\nVerify with:');
  console.log(`npx hardhat verify --network <network> ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
