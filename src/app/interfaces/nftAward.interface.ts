export interface INFTAwardBase {
    date: string;
    id: number;
}

export interface INFTAward extends INFTAwardBase {
    url: string;
    pool: string;
}
