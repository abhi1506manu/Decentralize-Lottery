const { network, ethers } = require("hardhat")
const {networkConfig } = require("../helper-hardhat-config")
const  {verify} = require("../utils/verify")
/*
module.exports = async(hre)=>{
    const {getNamedAccounts, deployments } = hre;
    //hre.getNamedAccounts
    //hre.deployments
}

*/
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")
    let vrfCoordinatorV2Address, subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
        const transactionReceipt = await transactionResponse.wait(1)
        subscriptionId = transactionReceipt.events[0].args.subId

        //fund the subscription
        //need link token on real network
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }

    //calling from helper-hardhat config
    const entranceFee = networkConfig[chainId]["entranceFee"]
    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackgasLimit = networkConfig[chainId]["callbackGasLimit"]
    const interval = networkConfig[chainId]["interval"]
    const args = [
        vrfCoordinatorV2Address,
        entranceFee,
        gasLane,
        subscriptionId,
        callbackgasLimit,
        interval,
    ]
    await deploy("Raffle", {
        from: deployer,
        log: true,
        args: args,
        waitConformations: network.config.blockConfirmations || 1,
    })

    if(!developmentChains.includes(network.name)&& process.env.ETHERSCAN_API_KEY){
        log("Verifying.......")
        await verify(raffle.address,args);
    }
    log("***********************************")
}

module.exports.tag = ["all", "raffle"]
