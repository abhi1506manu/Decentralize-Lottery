
const { network } = require("hardhat");

const {developmentChains} = require("../helper-hardhat-config");
const BASE_FEE =  "250000000000000000";//cost to get random no
const GAS_PRICE_LINK = 1e9//calculated cvalue

module.exports = async({getNamedAccounts,deployments})=>{
    const {deploy,log} = deployments;
    const {deployer} = await getNamedAccounts()
    const chainId = network.config.chainId;
    const args = [BASE_FEE,GAS_PRICE_LINK];

    if(developmentChains.includes(network.name)){
        log("Local network detected! Deploying mocks..");
        //deploy vrf coordinator
          
        await deploy("VRFCoordinatorV2Mock",{
            from:deployer,
            log:true,
            args:args,
        })
        log("Mocks Deployed")
        log("***************************************")
    }
}

module.exports.tags = ["all","mocks"];