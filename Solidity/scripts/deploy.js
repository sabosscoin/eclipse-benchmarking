const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract
  const EclipseNS = await hre.ethers.getContractFactory("EclipseNS");
  const eclipseNS = await EclipseNS.deploy("test", deployer.address);

  await eclipseNS.deployed();

  console.log("EclipseNS deployed to:", eclipseNS.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
