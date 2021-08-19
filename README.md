# ATRewardsCharts-NRG
Parses the NRG reward data csv file and creates a few charts for easy viewing.

![EnergiRewardsCharts-screenshot](https://github.com/amostodman/ATRewardsCharts-NRG/blob/main/EnergiRewardsCharts-screenshot.png)

## Requirements / Instructions to add to your node
- [Node Monitor](https://docs.energi.software/en/advanced/nodemon) should already be installed
- Updates to some of the node monitor scripts which can be seen on [my fork of the energi3-provisioning repo](https://github.com/amostodman/energi3-provisioning) (_[this commit](https://github.com/amostodman/energi3-provisioning/commit/427b63dbe4dce20d8deea84e773c68b2e34877e6?branch=427b63dbe4dce20d8deea84e773c68b2e34877e6) shows my code changes_)
  - Add [this nodemon-balance.sh](https://github.com/amostodman/energi3-provisioning/blob/427b63dbe4dce20d8deea84e773c68b2e34877e6/scripts/linux/nodemon-balance.sh) to the same directory on your node
  - Backup your existing nodemon-report.sh and add [this nodemon-report.sh](https://github.com/amostodman/energi3-provisioning/blob/427b63dbe4dce20d8deea84e773c68b2e34877e6/scripts/linux/nodemon-report.sh) to the same directory on your node.
  - Backup your existing nodemon.sh and add [this nodemon.sh](https://github.com/amostodman/energi3-provisioning/blob/427b63dbe4dce20d8deea84e773c68b2e34877e6/scripts/linux/nodemon.sh) to the same directory on your node.

## How to use
- Run the usual command to generate your csv report: `nodemon-report.sh`
- Download your csv report from your node
- open [ATRewardsCharts-NRG.html](https://github.com/amostodman/ATRewardsCharts-NRG/blob/main/ATRewardsCharts-NRG.html) in your browser and follow the instructions.
- An example csv report is here: [reward_data_example.csv](https://github.com/amostodman/ATRewardsCharts-NRG/blob/main/reward_data_example.csv)
