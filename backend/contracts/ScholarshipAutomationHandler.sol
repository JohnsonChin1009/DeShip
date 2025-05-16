// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

interface IScholarship {
    function checkUpkeep(bytes calldata) external view returns (bool, bytes memory);
    function performUpkeep(bytes calldata) external;
}

interface IScholarshipFactory {
    function getAllScholarships() external view returns (address[] memory);
}

contract ScholarshipAutomationHandler is AutomationCompatibleInterface {
    address public owner;
    address public scholarshipFactoryAddress;
    
    // Default gas limits for Chainlink Automation
    uint256 public checkGasLimit = 2_000_000; 
    uint256 public performGasLimit = 2_300_000; 
    
    event UpkeepPerformed(address indexed scholarshipAddress);
    event UpkeepFailed(address indexed scholarshipAddress, string reason);
    event CheckCompleted(uint256 checkedCount, uint256 needsUpkeepCount);
    event GasLimitUpdated(uint256 newCheckLimit, uint256 newPerformLimit);
    event FactoryAddressUpdated(address newFactoryAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized access");
        _;
    }

    constructor(address _scholarshipFactoryAddress) {
        require(_scholarshipFactoryAddress != address(0), "Invalid factory address");
        owner = msg.sender;
        scholarshipFactoryAddress = _scholarshipFactoryAddress;
    }

    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        address[] memory scholarships = IScholarshipFactory(scholarshipFactoryAddress).getAllScholarships();
        address[] memory targets = new address[](scholarships.length);
        bytes[] memory datas = new bytes[](scholarships.length);
        uint256 validCount;
        uint256 checkedCount;

        for (uint256 i = 0; i < scholarships.length; i++) {
            if (gasleft() < checkGasLimit) break;
            checkedCount++;
            
            try IScholarship(scholarships[i]).checkUpkeep("") returns (
                bool needsUpkeep,
                bytes memory data
            ) {
                if (needsUpkeep) {
                    targets[validCount] = scholarships[i];
                    datas[validCount] = data;
                    validCount++;
                }
            } catch {
                continue;
            }
        }
        
        upkeepNeeded = validCount > 0;
        performData = abi.encode(targets, datas, validCount);
        
    }

    function performUpkeep(bytes calldata performData) external override {
        (address[] memory targets, bytes[] memory datas, uint256 count) = 
            abi.decode(performData, (address[], bytes[], uint256));

        uint256 successCount;
        uint256 failCount;
        
        for (uint256 i = 0; i < count; i++) {
            try IScholarship(targets[i]).performUpkeep(datas[i]) {
                emit UpkeepPerformed(targets[i]);
                successCount++;
            } catch Error(string memory reason) {
                emit UpkeepFailed(targets[i], reason);
                failCount++;
            } catch {
                emit UpkeepFailed(targets[i], "Unknown error");
                failCount++;
            }
            
            if (gasleft() < performGasLimit) break;
        }
        
        emit CheckCompleted(count, successCount + failCount);
    }

    function updateGasLimits(uint256 _checkGasLimit, uint256 _performGasLimit) external onlyOwner {
        require(_checkGasLimit > 100_000 && _performGasLimit > 100_000, "Gas limits too low");
        checkGasLimit = _checkGasLimit;
        performGasLimit = _performGasLimit;
        emit GasLimitUpdated(_checkGasLimit, _performGasLimit);
    }

    function updateScholarshipFactoryAddress(address _newFactoryAddress) external onlyOwner {
        require(_newFactoryAddress != address(0), "Invalid factory address");
        scholarshipFactoryAddress = _newFactoryAddress;
        emit FactoryAddressUpdated(_newFactoryAddress);
    }

    function manualTriggerUpkeep(address scholarshipAddress) external onlyOwner {
        require(scholarshipAddress != address(0), "Invalid address");
        
        try IScholarship(scholarshipAddress).performUpkeep("") {
            emit UpkeepPerformed(scholarshipAddress);
        } catch Error(string memory reason) {
            emit UpkeepFailed(scholarshipAddress, reason);
        } catch {
            emit UpkeepFailed(scholarshipAddress, "Unknown error");
        }
    }

    function batchTriggerUpkeep(address[] calldata scholarshipAddresses) external onlyOwner {
        for (uint256 i = 0; i < scholarshipAddresses.length; i++) {
            if (gasleft() < performGasLimit) break;
            
            try IScholarship(scholarshipAddresses[i]).performUpkeep("") {
                emit UpkeepPerformed(scholarshipAddresses[i]);
            } catch {
                emit UpkeepFailed(scholarshipAddresses[i], "Execution failed");
            }
        }
    }

    // Emergency recovery just in case
    function withdrawETH() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {}
}