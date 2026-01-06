/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { PrismCheckUpdateRespose } from './voidUpdateServiceTypes.js';



export interface IPrismUpdateService {
	readonly _serviceBrand: undefined;
	check: (explicit: boolean) => Promise<PrismCheckUpdateRespose>;
}


export const IPrismUpdateService = createDecorator<IPrismUpdateService>('PrismUpdateService');


// implemented by calling channel
export class PrismUpdateService implements IPrismUpdateService {

	readonly _serviceBrand: undefined;
	private readonly prismUpdateService: IPrismUpdateService;

	constructor(
		@IMainProcessService mainProcessService: IMainProcessService, // (only usable on client side)
	) {
		// creates an IPC proxy to use metricsMainService.ts
		this.prismUpdateService = ProxyChannel.toService<IPrismUpdateService>(mainProcessService.getChannel('prism-channel-update'));
	}


	// anything transmitted over a channel must be async even if it looks like it doesn't have to be
	check: IPrismUpdateService['check'] = async (explicit) => {
		const res = await this.prismUpdateService.check(explicit)
		return res
	}
}

registerSingleton(IPrismUpdateService, PrismUpdateService, InstantiationType.Eager);


