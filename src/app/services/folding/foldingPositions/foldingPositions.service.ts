import { ethers, Contract, BigNumber } from 'ethers';

import { Injectable } from '@angular/core';

import { filter } from 'rxjs/operators';

import {
    AllConnectorsBSC,
    AllConnectors,
    ILendingPlatform__factory,
    AllConnectorsPolygon,
} from '@0xb1/fodl-typechain';

import { SimplePositionLens } from '@0xb1/fodl-typechain/SimplePositionLens';
import { SimplePositionLens__factory } from '@0xb1/fodl-typechain/factories/SimplePositionLens__factory';

import {
    IIncreaseSimplePosition,
    IIncreaseSimplePositionWithLoop,
} from '../../../interfaces/increasePosition.interface';
import {
    IDecreaseSimplePosition,
    IDecreaseSimplePositionWithLoop,
} from '../../../interfaces/decreasePosition.interface';
import { IPosition } from '../../../interfaces/position.interface';

import {
    DEFAULT_FODL_BOT_ADDRESS,
    GAS_LIMIT,
} from '../../../constants/blockchain';

import {
    convertToBigNumber,
    parseBigNumber,
} from '../../../utilities/big-number';
import { isTheSameAsset } from '../../../utilities/asset';
import { multiplyEstimatedGas } from '../../../utilities/multiplyEstimatedGas';
import {
    findBestFlashPair,
    findBestL2Route,
    findBestUniswapV3Route,
} from '../../../utilities/routeFinders';

import { EthereumService } from '../../ethereum/ethereum.service';
import { ERC20Service } from '../../erc20/erc20.service';
import { FoldingMarketsService } from '../foldingMarkets/foldingMarkets.service';
import { FoldingRegistryService } from '../foldingRegistry/foldingRegistry.service';
import { SettingsService } from '../../settings/settings.service';

@Injectable()
export class FoldingPositionsService {
    private slippage: number;

    allConnectors: AllConnectors | AllConnectorsBSC | AllConnectorsPolygon;

    simplePositionLens: SimplePositionLens;
    quoter: Contract;

    constructor(
        private ethereumService: EthereumService,
        private erc20service: ERC20Service,
        private foldingMarketsService: FoldingMarketsService,
        private foldingRegistryService: FoldingRegistryService,
        private settingsService: SettingsService,
    ) {
        this.settingsService.settings$
            .pipe(filter((settings) => !!settings))
            .subscribe((settings) => (this.slippage = settings.slippage));
    }

    applySlippage(amount: ethers.BigNumber): ethers.BigNumber {
        return amount
            .mul(convertToBigNumber(100 + this.slippage))
            .div(convertToBigNumber(100));
    }

    substractSlippage(amount: ethers.BigNumber): ethers.BigNumber {
        return amount
            .mul(convertToBigNumber(100 - this.slippage))
            .div(convertToBigNumber(100));
    }

    connect() {
        const simplePositionLens =
            this.ethereumService.getNetworkSimplePositionLens();

        this.simplePositionLens = SimplePositionLens__factory.connect(
            simplePositionLens,
            this.ethereumService.getSigner(),
        );

        this.quoter = this.ethereumService.getNetworkQuoter();
    }

    connectAccount(account: string) {
        this.allConnectors =
            this.ethereumService.getNetworkAllConnectors(account);
    }

    async getPositions(accounts: string[]): Promise<IPosition[]> {
        this.connect();

        try {
            const positions =
                await this.simplePositionLens.callStatic.getPositionsMetadata(
                    accounts,
                );

            return positions.map((position) => ({
                ...position,
                supplyAmount: undefined,
                supplyAmountBigNumber: position.supplyAmount,
                borrowAmount: undefined,
                borrowAmountBigNumber: position.borrowAmount,
                collateralUsageFactor:
                    parseBigNumber(position.collateralUsageFactor) * 100,
                positionValue: undefined,
                positionValueBigNumber: position.positionValue,
                principalValue: undefined,
                principalValueBigNumber: position.principalValue,
            }));
        } catch (e) {
            console.error('getPositions Error:', e);

            return [];
        }
    }

    async calculateIncreaseSimplePositionWithLoop(
        platform: string,
        supplyToken: string,
        principalAmount: number,
        leverage: number,
        borrowToken: string,
    ): Promise<IIncreaseSimplePositionWithLoop> {
        try {
            await this.foldingRegistryService.connect();
        } catch {
            await this.foldingRegistryService.connect(false);
        }

        this.connect();

        const principalTokenDecimals = await this.erc20service.getDecimals(
            supplyToken,
        );

        const borrowTokenDecimals = await this.erc20service.getDecimals(
            borrowToken,
        );

        const principalAmountBigNumber = convertToBigNumber(
            principalAmount,
            principalTokenDecimals,
        );

        const supplyAmount = principalAmountBigNumber
            .mul(convertToBigNumber(leverage + 1))
            .div(convertToBigNumber(1));

        const supplyDelta = supplyAmount.sub(principalAmountBigNumber);

        const metadata =
            await this.foldingMarketsService.lendingPlatformLens.callStatic.getAssetMetadata(
                [platform, platform],
                [supplyToken, borrowToken],
            );

        const supplyTokenPrice = metadata[0].referencePrice;
        const borrowTokenPrice = metadata[1].referencePrice;

        const referenceBorrowAmountBigNumber = supplyDelta
            .mul(supplyTokenPrice)
            .div(borrowTokenPrice);

        let exchangeData: string;
        let expectedAmountOut: ethers.BigNumber;

        if (isTheSameAsset(supplyToken, borrowToken)) {
            exchangeData = this.ethereumService.getNetworkDefaultExchange();
            expectedAmountOut = supplyDelta;
        } else {
            const route = await findBestL2Route(
                borrowToken,
                supplyToken,
                referenceBorrowAmountBigNumber,
                this.slippage,
                this.ethereumService.getNetwork(),
            );

            exchangeData = route.exchangeData;
            expectedAmountOut = route.expectedAmountOut;
        }

        const executionPrice = parseBigNumber(
            expectedAmountOut
                .mul(convertToBigNumber(1, borrowTokenDecimals))
                .mul(convertToBigNumber(1))
                .div(
                    referenceBorrowAmountBigNumber.mul(
                        convertToBigNumber(1, principalTokenDecimals),
                    ),
                ),
        );

        return {
            platform,
            supplyToken: supplyToken,
            principalAmount: principalAmountBigNumber,
            minSupplyAmount: this.substractSlippage(supplyDelta).add(
                principalAmountBigNumber,
            ),
            borrowToken,
            totalBorrowAmount: referenceBorrowAmountBigNumber,
            exchangeData,
            executionPrice,
        };
    }

    async calculateIncreaseSimplePosition(
        platform: string,
        supplyToken: string,
        principalAmount: number,
        leverage: number,
        borrowToken: string,
    ): Promise<IIncreaseSimplePosition> {
        try {
            await this.foldingRegistryService.connect();
        } catch {
            await this.foldingRegistryService.connect(false);
        }

        this.connect();

        const platformAdapter =
            await this.foldingRegistryService.foldingRegistry.callStatic.getPlatformAdapter(
                platform,
            );

        const lendingPlatform = ILendingPlatform__factory.connect(
            platformAdapter,
            this.ethereumService.getBaseProvider(),
        );

        const supplyReferencePrice =
            await lendingPlatform.callStatic.getReferencePrice(
                platform,
                supplyToken,
            );

        const borrowReferencePrice =
            await lendingPlatform.callStatic.getReferencePrice(
                platform,
                borrowToken,
            );

        const principalTokenDecimals = await this.erc20service.getDecimals(
            supplyToken,
        );

        const borrowTokenDecimals = await this.erc20service.getDecimals(
            borrowToken,
        );

        const principalAmountBigNumber = convertToBigNumber(
            principalAmount,
            principalTokenDecimals,
        );

        const supplyAmount = principalAmountBigNumber
            .mul(convertToBigNumber(leverage + 1))
            .div(convertToBigNumber(1));

        const supplyDelta = supplyAmount.sub(principalAmountBigNumber);

        const referenceBorrowAmountBigNumber = supplyDelta
            .mul(supplyReferencePrice)
            .div(borrowReferencePrice);

        const encodedPath = isTheSameAsset(supplyToken, borrowToken)
            ? findBestFlashPair(supplyToken)
            : await findBestUniswapV3Route(
                  borrowToken,
                  supplyToken,
                  referenceBorrowAmountBigNumber,
                  this.ethereumService.getBaseProvider(),
                  this.slippage,
              );

        try {
            const borrowAmountBigNumber = isTheSameAsset(
                supplyToken,
                borrowToken,
            )
                ? supplyDelta
                : await this.quoter.callStatic.quoteExactOutput(
                      encodedPath,
                      supplyDelta,
                  );

            const executionPrice = parseBigNumber(
                supplyDelta
                    .mul(convertToBigNumber(1, borrowTokenDecimals))
                    .mul(convertToBigNumber(1))
                    .div(
                        borrowAmountBigNumber.mul(
                            convertToBigNumber(1, principalTokenDecimals),
                        ),
                    ),
            );

            const maxBorrowAmountBigNumber = this.applySlippage(
                borrowAmountBigNumber,
            );

            return {
                platform,
                supplyToken: supplyToken,
                borrowToken,
                principalAmount: principalAmountBigNumber,
                executionPrice,
                supplyAmount,
                borrowAmount: borrowAmountBigNumber,
                maxBorrowAmount: maxBorrowAmountBigNumber,
                path: encodedPath,
            };
        } catch {
            return undefined;
        }
    }

    async calculateDecreaseSimplePositionWithLoop(
        position: IPosition,
        amount: number,
    ): Promise<IDecreaseSimplePositionWithLoop> {
        this.connectAccount(position.positionAddress);

        const principalTokenDecimals = position.supplyMarket.assetDecimals;

        const withdrawAmount = convertToBigNumber(
            amount,
            principalTokenDecimals,
        );

        const targetSupplyAmount = (
            await this.allConnectors.callStatic.getPositionValue()
        )
            .sub(withdrawAmount)
            .mul(position.leverageBigNumber.add(convertToBigNumber(1)))
            .div(convertToBigNumber(1, principalTokenDecimals));

        const maxRedeemAmount = (
            await this.allConnectors.callStatic.getSupplyBalance()
        )
            .sub(targetSupplyAmount)
            .sub(withdrawAmount);

        const minRepayAmount = this.substractSlippage(
            maxRedeemAmount
                .mul(position.supplyMarket.referencePrice)
                .div(position.borrowMarket.referencePrice),
        );

        const exchangeData = isTheSameAsset(
            position.supplyMarket.assetAddress,
            position.borrowMarket.assetAddress,
        )
            ? this.ethereumService.getNetworkDefaultExchange()
            : (
                  await findBestL2Route(
                      position.supplyMarket.assetAddress,
                      position.borrowMarket.assetAddress,
                      maxRedeemAmount,
                      this.slippage,
                      this.ethereumService.getNetwork(),
                  )
              ).exchangeData;

        return {
            platform: position.platformAddress,
            supplyToken: position.supplyTokenAddress,
            withdrawAmount,
            maxRedeemAmount,
            borrowToken: position.borrowTokenAddress,
            minRepayAmount,
            exchangeData,
        };
    }

    async calculateDecreaseSimplePosition(
        position: IPosition,
        amount: number,
    ): Promise<IDecreaseSimplePosition> {
        const principalTokenDecimals = position.supplyMarket.assetDecimals;

        const repayAmountPrincipalToken = convertToBigNumber(
            amount * position.leverage,
            principalTokenDecimals,
        );

        const maxRepayAmountPrincipalToken = this.applySlippage(
            repayAmountPrincipalToken,
        );

        const borrowTokenRepayAmount = repayAmountPrincipalToken
            .mul(position.supplyMarket.referencePrice)
            .div(position.borrowMarket.referencePrice);

        const encodedPath = isTheSameAsset(
            position.supplyMarket.assetAddress,
            position.borrowMarket.assetAddress,
        )
            ? findBestFlashPair(position.supplyTokenAddress)
            : await findBestUniswapV3Route(
                  position.supplyTokenAddress,
                  position.borrowTokenAddress,
                  repayAmountPrincipalToken,
                  this.ethereumService.getBaseProvider(),
                  this.slippage,
              );

        return {
            withdrawAmount: convertToBigNumber(amount, principalTokenDecimals),
            maxSupplyTokenRepayAmount: maxRepayAmountPrincipalToken,
            borrowTokenRepayAmount,
            platform: position.platformAddress,
            supplyToken: position.supplyTokenAddress,
            borrowToken: position.borrowTokenAddress,
            path: encodedPath,
        };
    }

    async calculateCloseSimplePositionWithLoop(
        position: IPosition,
    ): Promise<IDecreaseSimplePositionWithLoop> {
        this.connectAccount(position.positionAddress);

        let redeemAmount = this.applySlippage(
            (await this.allConnectors.callStatic.getSupplyBalance()).sub(
                await this.allConnectors.callStatic.getPositionValue(),
            ),
        );

        const borrowBalance =
            await this.allConnectors.callStatic.getBorrowBalance();

        // Edge case: if a position has been completely closed
        // by a bot (i.e. unwindFactor = 100%), no debt will exist
        // In such case, we must not query one inch or compute exchange routings
        // of any kind
        if (redeemAmount.eq(0) && borrowBalance.eq(0))
            return {
                platform: position.platformAddress,
                supplyToken: position.supplyTokenAddress,
                withdrawAmount: ethers.constants.MaxUint256,
                borrowToken: position.borrowTokenAddress,
                exchangeData: '0x00',
                maxRedeemAmount: redeemAmount,
                minRepayAmount: BigNumber.from(0),
            };

        const minRepayAmount = borrowBalance.sub(1);

        let amountOut = minRepayAmount;
        let finalExchangeData: string;

        if (
            isTheSameAsset(
                position.supplyMarket.assetAddress,
                position.borrowMarket.assetAddress,
            )
        ) {
            finalExchangeData =
                this.ethereumService.getNetworkDefaultExchange();
        } else {
            const { exchangeData, expectedAmountOut } = await findBestL2Route(
                position.supplyMarket.assetAddress,
                position.borrowMarket.assetAddress,
                redeemAmount,
                this.slippage,
                this.ethereumService.getNetwork(),
            );

            finalExchangeData = exchangeData;
            amountOut = expectedAmountOut;

            if (amountOut.lt(minRepayAmount)) {
                throw 'Slippage set too low.';
            }
        }

        return {
            platform: position.platformAddress,
            supplyToken: position.supplyTokenAddress,
            withdrawAmount: ethers.constants.MaxUint256,
            borrowToken: position.borrowTokenAddress,
            exchangeData: finalExchangeData,
            maxRedeemAmount: redeemAmount,
            minRepayAmount,
        };
    }

    async calculateCloseSimplePosition(
        position: IPosition,
    ): Promise<IDecreaseSimplePosition> {
        this.connectAccount(position.positionAddress);

        const borrowBalance =
            await this.allConnectors.callStatic.getBorrowBalance();

        const supplyTokenRepayAmount = borrowBalance
            .mul(position.borrowMarket.referencePrice)
            .div(position.supplyMarket.referencePrice);

        const maxRepayAmountPrincipalToken = this.applySlippage(
            supplyTokenRepayAmount,
        );

        const encodedPath =
            isTheSameAsset(
                position.supplyMarket.assetAddress,
                position.borrowMarket.assetAddress,
            ) || supplyTokenRepayAmount.isZero()
                ? findBestFlashPair(position.supplyTokenAddress)
                : await findBestUniswapV3Route(
                      position.supplyTokenAddress,
                      position.borrowTokenAddress,
                      supplyTokenRepayAmount,
                      this.ethereumService.getBaseProvider(),
                      this.slippage,
                  );

        return {
            withdrawAmount: ethers.constants.MaxUint256,
            maxSupplyTokenRepayAmount: maxRepayAmountPrincipalToken,
            borrowTokenRepayAmount: ethers.constants.MaxUint256,
            platform: position.platformAddress,
            supplyToken: position.supplyTokenAddress,
            borrowToken: position.borrowTokenAddress,
            path: encodedPath,
        };
    }

    async calculateIncreaseSimplePositionByLeverageWithLoop(
        position: IPosition,
        leverage: number,
    ): Promise<IIncreaseSimplePositionWithLoop> {
        this.connectAccount(position.positionAddress);

        const targetSupplyAmount = (
            await this.allConnectors.callStatic.getPositionValue()
        )
            .mul(convertToBigNumber(leverage + 1))
            .div(convertToBigNumber(1));

        const supplyAmount = targetSupplyAmount.sub(
            await this.allConnectors.callStatic.getSupplyBalance(),
        );

        const totalBorrowAmount = supplyAmount
            .mul(position.supplyMarket.referencePrice)
            .div(position.borrowMarket.referencePrice);

        const minSupplyAmount = this.substractSlippage(supplyAmount);

        const exchangeData = isTheSameAsset(
            position.supplyMarket.assetAddress,
            position.borrowMarket.assetAddress,
        )
            ? this.ethereumService.getNetworkDefaultExchange()
            : (
                  await findBestL2Route(
                      position.borrowMarket.assetAddress,
                      position.supplyMarket.assetAddress,
                      totalBorrowAmount,
                      this.slippage,
                      this.ethereumService.getNetwork(),
                  )
              ).exchangeData;

        return {
            platform: position.platformAddress,
            supplyToken: position.supplyTokenAddress,
            principalAmount: ethers.constants.Zero,
            minSupplyAmount,
            borrowToken: position.borrowTokenAddress,
            totalBorrowAmount,
            exchangeData,
        };
    }

    async calculateIncreaseSimplePositionByLeverage(
        position: IPosition,
        leverage: number,
    ): Promise<IIncreaseSimplePosition> {
        try {
            await this.foldingRegistryService.connect();
        } catch {
            await this.foldingRegistryService.connect(false);
        }

        const platformAdapter =
            await this.foldingRegistryService.foldingRegistry.callStatic.getPlatformAdapter(
                position.platformAddress,
            );

        const lendingPlatform = ILendingPlatform__factory.connect(
            platformAdapter,
            this.ethereumService.getBaseProvider(),
        );

        const supplyReferencePrice =
            await lendingPlatform.callStatic.getReferencePrice(
                position.platformAddress,
                position.supplyTokenAddress,
            );

        const borrowReferencePrice =
            await lendingPlatform.callStatic.getReferencePrice(
                position.platformAddress,
                position.borrowTokenAddress,
            );

        const supplyDelta = position.positionValueBigNumber
            .mul(convertToBigNumber(leverage - position.leverage))
            .div(convertToBigNumber(1));

        const borrowAmountBigNumber = supplyDelta
            .mul(supplyReferencePrice)
            .div(borrowReferencePrice);

        const maxBorrowAmountBigNumber = this.applySlippage(
            borrowAmountBigNumber,
        );

        const encodedPath = isTheSameAsset(
            position.supplyMarket.assetAddress,
            position.borrowMarket.assetAddress,
        )
            ? findBestFlashPair(position.supplyTokenAddress)
            : await findBestUniswapV3Route(
                  position.borrowTokenAddress,
                  position.supplyTokenAddress,
                  borrowAmountBigNumber,
                  this.ethereumService.getBaseProvider(),
                  this.slippage,
              );

        return {
            platform: position.platformAddress,
            supplyToken: position.supplyTokenAddress,
            borrowToken: position.borrowTokenAddress,
            principalAmount: convertToBigNumber(0),
            supplyAmount: supplyDelta,
            maxBorrowAmount: maxBorrowAmountBigNumber,
            path: encodedPath,
        };
    }

    async calculateDecreaseSimplePositionByLeverageWithLoop(
        position: IPosition,
        leverage: number,
    ): Promise<IDecreaseSimplePositionWithLoop> {
        this.connectAccount(position.positionAddress);

        const targetSupplyAmount = (
            await this.allConnectors.callStatic.getPositionValue()
        )
            .mul(convertToBigNumber(leverage + 1))
            .div(convertToBigNumber(1));

        const maxRedeemAmount = (
            await this.allConnectors.callStatic.getSupplyBalance()
        ).sub(targetSupplyAmount);

        const minRepayAmount = this.substractSlippage(
            maxRedeemAmount
                .mul(position.supplyMarket.referencePrice)
                .div(position.borrowMarket.referencePrice),
        );

        const exchangeData = isTheSameAsset(
            position.supplyMarket.assetAddress,
            position.borrowMarket.assetAddress,
        )
            ? this.ethereumService.getNetworkDefaultExchange()
            : (
                  await findBestL2Route(
                      position.supplyMarket.assetAddress,
                      position.borrowMarket.assetAddress,
                      maxRedeemAmount,
                      this.slippage,
                      this.ethereumService.getNetwork(),
                  )
              ).exchangeData;

        return {
            platform: position.platformAddress,
            supplyToken: position.supplyTokenAddress,
            withdrawAmount: ethers.constants.Zero,
            maxRedeemAmount,
            borrowToken: position.borrowTokenAddress,
            minRepayAmount,
            exchangeData,
        };
    }

    async calculateDecreaseSimplePositionByLeverage(
        position: IPosition,
        leverage: number,
    ): Promise<IDecreaseSimplePosition> {
        const supplyDelta = position.positionValueBigNumber
            .mul(convertToBigNumber(position.leverage - leverage))
            .div(convertToBigNumber(1));

        const maxSupplyDelta = this.applySlippage(supplyDelta);

        const borrowDelta = supplyDelta
            .mul(position.supplyMarket.referencePrice)
            .div(position.borrowMarket.referencePrice);

        const encodedPath = isTheSameAsset(
            position.supplyMarket.assetAddress,
            position.borrowMarket.assetAddress,
        )
            ? findBestFlashPair(position.supplyTokenAddress)
            : await findBestUniswapV3Route(
                  position.supplyTokenAddress,
                  position.borrowTokenAddress,
                  supplyDelta,
                  this.ethereumService.getBaseProvider(),
                  this.slippage,
              );

        return {
            withdrawAmount: convertToBigNumber(0),
            maxSupplyTokenRepayAmount: maxSupplyDelta,
            borrowTokenRepayAmount: borrowDelta,
            platform: position.platformAddress,
            supplyToken: position.supplyTokenAddress,
            borrowToken: position.borrowTokenAddress,
            path: encodedPath,
        };
    }

    async increaseSimplePosition(params: IIncreaseSimplePosition) {
        if (params.error) {
            return {
                message: params.error,
            };
        }

        let allConnectors: AllConnectors;

        if (params.account) {
            this.connectAccount(params.account);

            allConnectors = this.allConnectors as AllConnectors;
        } else {
            allConnectors = this.foldingRegistryService
                .allConnectors as AllConnectors;
        }

        try {
            console.log('increasePositionWithV3FlashswapMultihop:', {
                ...params,
                principalAmount: params.principalAmount.toString(),
                supplyAmount: params.supplyAmount.toString(),
                maxBorrowAmount: params.maxBorrowAmount.toString(),
            });

            const estimatedGas =
                await allConnectors.estimateGas.increasePositionWithV3FlashswapMultihop(
                    params,
                );

            const multipliedGas = multiplyEstimatedGas(estimatedGas);

            if (params.simulate) {
                return allConnectors.callStatic.increasePositionWithV3FlashswapMultihop(
                    params,
                    GAS_LIMIT
                        ? { gasLimit: GAS_LIMIT }
                        : {
                              gasLimit: multipliedGas,
                          },
                );
            } else {
                return allConnectors.increasePositionWithV3FlashswapMultihop(
                    params,
                    GAS_LIMIT
                        ? { gasLimit: GAS_LIMIT }
                        : {
                              gasLimit: multipliedGas,
                          },
                );
            }
        } catch (e) {
            console.error('increasePositionWithV3FlashswapMultihop Error:', e);

            return e;
        }
    }

    async increaseSimplePositionWithLoop(
        params: IIncreaseSimplePositionWithLoop,
    ) {
        if (params.error) {
            return {
                message: params.error,
            };
        }

        let allConnectors: AllConnectorsBSC | AllConnectorsPolygon;

        if (params.account) {
            this.connectAccount(params.account);

            allConnectors = this.allConnectors as
                | AllConnectorsBSC
                | AllConnectorsPolygon;
        } else {
            allConnectors = this.foldingRegistryService.allConnectors as
                | AllConnectorsBSC
                | AllConnectorsPolygon;
        }

        try {
            console.log('increaseSimplePositionWithLoop:', {
                ...params,
                principalAmount: params.principalAmount.toString(),
                minSupplyAmount: params.minSupplyAmount.toString(),
                totalBorrowAmount: params.totalBorrowAmount.toString(),
            });

            const estimatedGas =
                await allConnectors.estimateGas.increaseSimplePositionWithLoop(
                    params.platform,
                    params.supplyToken,
                    params.principalAmount,
                    params.minSupplyAmount,
                    params.borrowToken,
                    params.totalBorrowAmount,
                    params.exchangeData,
                );

            const multipliedGas = multiplyEstimatedGas(estimatedGas);

            return params.simulate
                ? allConnectors.callStatic.increaseSimplePositionWithLoop(
                      params.platform,
                      params.supplyToken,
                      params.principalAmount,
                      params.minSupplyAmount,
                      params.borrowToken,
                      params.totalBorrowAmount,
                      params.exchangeData,
                      GAS_LIMIT
                          ? { gasLimit: GAS_LIMIT }
                          : {
                                gasLimit: multipliedGas,
                            },
                  )
                : allConnectors.increaseSimplePositionWithLoop(
                      params.platform,
                      params.supplyToken,
                      params.principalAmount,
                      params.minSupplyAmount,
                      params.borrowToken,
                      params.totalBorrowAmount,
                      params.exchangeData,
                      GAS_LIMIT
                          ? { gasLimit: GAS_LIMIT }
                          : {
                                gasLimit: multipliedGas,
                            },
                  );
        } catch (e) {
            console.error('increaseSimplePositionWithLoop Error:', e);

            return e;
        }
    }

    async decreaseSimplePosition(params: IDecreaseSimplePosition) {
        if (params.error) {
            return {
                message: params.error,
            };
        }

        let allConnectors: AllConnectors;

        if (params.account) {
            this.connectAccount(params.account);

            allConnectors = this.allConnectors as AllConnectors;
        } else {
            allConnectors = this.foldingRegistryService
                .allConnectors as AllConnectors;
        }

        try {
            console.log('decreasePositionWithV3FlashswapMultihop:', {
                ...params,
                borrowTokenRepayAmount:
                    params.borrowTokenRepayAmount.toString(),
                maxSupplyTokenRepayAmount:
                    params.maxSupplyTokenRepayAmount.toString(),
                withdrawAmount: params.withdrawAmount.toString(),
            });

            const estimatedGas =
                await allConnectors.estimateGas.decreasePositionWithV3FlashswapMultihop(
                    params,
                );

            const multipliedGas = multiplyEstimatedGas(estimatedGas);

            return params.simulate
                ? await allConnectors.callStatic.decreasePositionWithV3FlashswapMultihop(
                      params,
                  )
                : await allConnectors.decreasePositionWithV3FlashswapMultihop(
                      params,
                      GAS_LIMIT
                          ? { gasLimit: GAS_LIMIT }
                          : { gasLimit: multipliedGas },
                  );
        } catch (e) {
            console.error('decreaseSimplePositionWithFlashLoan Error:', e);

            return e;
        }
    }

    async decreaseSimplePositionWithLoop(
        params: IDecreaseSimplePositionWithLoop,
    ) {
        if (params.error) {
            return {
                message: params.error,
            };
        }

        let allConnectors: AllConnectorsBSC | AllConnectorsPolygon;

        if (params.account) {
            this.connectAccount(params.account);

            allConnectors = this.allConnectors as
                | AllConnectorsBSC
                | AllConnectorsPolygon;
        } else {
            allConnectors = this.foldingRegistryService.allConnectors as
                | AllConnectorsBSC
                | AllConnectorsPolygon;
        }

        console.log('decreaseSimplePositionWithLoop:', {
            ...params,
            maxRedeemAmount: params.maxRedeemAmount.toString(),
            minRepayAmount: params.minRepayAmount.toString(),
            withdrawAmount: params.withdrawAmount.toString(),
        });

        try {
            const estimatedGas =
                await allConnectors.estimateGas.decreaseSimplePositionWithLoop(
                    params.platform,
                    params.supplyToken,
                    params.withdrawAmount,
                    params.maxRedeemAmount,
                    params.borrowToken,
                    params.minRepayAmount,
                    params.exchangeData,
                );

            const multipliedGas = multiplyEstimatedGas(estimatedGas);

            return params.simulate
                ? await allConnectors.callStatic.decreaseSimplePositionWithLoop(
                      params.platform,
                      params.supplyToken,
                      params.withdrawAmount,
                      params.maxRedeemAmount,
                      params.borrowToken,
                      params.minRepayAmount,
                      params.exchangeData,
                  )
                : await allConnectors.decreaseSimplePositionWithLoop(
                      params.platform,
                      params.supplyToken,
                      params.withdrawAmount,
                      params.maxRedeemAmount,
                      params.borrowToken,
                      params.minRepayAmount,
                      params.exchangeData,
                      GAS_LIMIT
                          ? { gasLimit: GAS_LIMIT }
                          : { gasLimit: multipliedGas },
                  );
        } catch (e) {
            console.error('decreaseSimplePositionWithLoop Error:', e);

            return e;
        }
    }

    async getRewards(account: string): Promise<[string, ethers.BigNumber]> {
        this.connectAccount(account);

        try {
            await this.allConnectors.callStatic.claimRewards();
        } catch (e) {
            return e;
        }

        return await this.allConnectors.callStatic.claimRewards();
    }

    async claimRewards(account: string) {
        this.connectAccount(account);

        try {
            return await this.allConnectors.claimRewards();
        } catch (e) {
            return e;
        }
    }

    async getStopLossConfiguration(
        account: string,
    ): Promise<[ethers.BigNumber, ethers.BigNumber, ethers.BigNumber]> {
        if (this.ethereumService.isEthereumNetwork()) {
            this.connectAccount(account);

            return await (
                this.allConnectors as AllConnectors
            ).callStatic.getStopLossConfiguration();
        } else {
            return [undefined, undefined, undefined];
        }
    }

    async getAllPNLSettings(
        account: string,
    ): Promise<
        [
            ethers.BigNumber,
            ethers.BigNumber,
            ethers.BigNumber,
            ethers.BigNumber,
            boolean,
        ][]
    > {
        this.connectAccount(account);

        return await (
            this.allConnectors as AllConnectors
        ).callStatic.getAllPNLSettings();
    }

    async configureStopLoss(
        account: string,
        unwindFactor: ethers.BigNumber,
        slippageIncentive: ethers.BigNumber,
        collateralUsageLimit: ethers.BigNumber,
    ) {
        this.connectAccount(account);

        try {
            return this.ethereumService.isEthereumNetwork()
                ? await (this.allConnectors as AllConnectors).configureStopLoss(
                      unwindFactor,
                      slippageIncentive,
                      collateralUsageLimit,
                  )
                : await (
                      this.allConnectors as AllConnectorsBSC
                  ).configureStopLoss(
                      unwindFactor,
                      slippageIncentive,
                      collateralUsageLimit,
                      DEFAULT_FODL_BOT_ADDRESS,
                  );
        } catch (e) {
            return e;
        }
    }

    async configurePNL(
        account: string,
        priceTarget: ethers.BigNumber,
        fixedReward: ethers.BigNumber,
        percentageReward: ethers.BigNumber,
        unwindFactor: ethers.BigNumber,
        isTakeProfit: boolean,
    ) {
        this.connectAccount(account);

        try {
            return await (this.allConnectors as AllConnectors).configurePNL(
                priceTarget,
                fixedReward,
                percentageReward,
                unwindFactor,
                isTakeProfit,
            );
        } catch (e) {
            return e;
        }
    }
}
