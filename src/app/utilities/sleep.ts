export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitFor = async (condition: boolean, ms: number = 100) =>
    !condition && (await sleep(ms));
