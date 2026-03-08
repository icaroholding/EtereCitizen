import { run } from 'hardhat';

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error('CONTRACT_ADDRESS env var required');
  }

  console.log('Verifying contract at:', contractAddress);

  await run('verify:verify', {
    address: contractAddress,
    constructorArguments: [],
  });

  console.log('Contract verified successfully');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
