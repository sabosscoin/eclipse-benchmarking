const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EclipseNS", function () {
  let EclipseNS, eclipseNS, owner, addr1;

  beforeEach(async function () {
    EclipseNS = await ethers.getContractFactory("EclipseNS");
    [owner, addr1] = await ethers.getSigners();

    eclipseNS = await EclipseNS.deploy("eclipse", owner.address);
    await eclipseNS.deployed();
  });

  describe("Domain registration", function () {
    it("Minting 100 domains with .eclipse", async function () {
      const domainBase = "test";
      const suffix = ".eclipse";

      for (let i = 0; i < 100; i++) {
        const domainName = domainBase + i.toString() + suffix;
        const registrationPrice = await eclipseNS.price(domainName);

        // Perform a transaction to register a domain
        await eclipseNS.connect(addr1).register(domainName, addr1.address, {
          value: registrationPrice,
        });

        // Check if the domain was registered to addr1
        expect(await eclipseNS.domains(domainName)).to.equal(addr1.address);

        // Log the domain registration
        console.log(`Domain ${domainName} registered to ${addr1.address}`);
      }
    });

    it("Should fail to mint a domain that doesn't end with .eclipse", async function () {
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
