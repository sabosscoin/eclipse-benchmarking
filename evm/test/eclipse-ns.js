const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("eclipse_ns", function () {
  let EclipseNS, eclipseNS, owner, addr1;

  beforeEach(async function () {
    EclipseNS = await ethers.getContractFactory("eclipse_ns");
    [owner, addr1] = await ethers.getSigners();

    eclipseNS = await EclipseNS.deploy('ecl', owner.address);
    await eclipseNS.deployed();
  });

  describe("Domain registration", function () {
    it("Mints 1 domain with .ecl", async function () {
      const domainName = "test.ecl";
      const registrationPrice = await eclipseNS.price(domainName);

      // Perform a transaction to register a domain
      await eclipseNS.connect(addr1).register(domainName, addr1.address, {
        value: registrationPrice,
      });

      // Check if the domain was registered to addr1
      expect(await eclipseNS.domains(domainName)).to.equal(addr1.address);

      // Log the domain registration
      console.log(`Domain ${domainName} registered to ${addr1.address}`);
    });

    it("Fails to mint a domain that doesn't end with .ecl", async function () {
      const invalidDomainName = "invalidDomain";
      const registrationPrice = await eclipseNS.price(invalidDomainName);

      // Attempt to register an invalid domain name and expect a failure
      await expect(
        eclipseNS.connect(addr1).register(invalidDomainName, addr1.address, {
          value: registrationPrice,
        })
      ).to.be.revertedWith("Invalid name");
    });
  });
});
