export const arrayIntersection = (array: any[]): any => {
    let result = [];
    let lists;

    if (array.length === 1) {
        lists = array[0];
    } else {
        lists = array;
    }

    for (var i = 0; i < lists.length; i++) {
        let currentList = lists[i];

        for (let y = 0; y < currentList.length; y++) {
            let currentValue = currentList[y];

            if (result.indexOf(currentValue) === -1) {
                if (
                    lists.filter((obj) => obj.indexOf(currentValue) == -1)
                        .length == 0
                ) {
                    result.push(currentValue);
                }
            }
        }
    }

    return result;
};
