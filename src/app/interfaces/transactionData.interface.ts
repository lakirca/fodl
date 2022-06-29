import { Observable } from 'rxjs';

export interface ITransactionData {
    action: Observable<any>;
    actionDescription?: string;
    approveAccount?: string;
    approveAmount?: number;
    approveToken?: string;
    callback?: Function;
    title: string;
}
