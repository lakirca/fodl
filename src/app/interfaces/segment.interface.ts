import { IPlatform } from './platform.interface';
export interface ISegment {
    id: string;
    name: string;
    title: string;
    assetAddress: string;
    platform: IPlatform;
}
