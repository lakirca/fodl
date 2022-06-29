import { arrayIntersection } from './arrayIntersection';

describe('Array Intersection Utility', () => {
    it('should intersect 4 arrays', async () => {
        let array1 = ['Lorem', 'ipsum', 'dolor'];
        let array2 = ['Lorem', 'ipsum', 'quick', 'brown', 'foo'];
        let array3 = ['Jumps', 'Over', 'Lazy', 'Lorem'];
        let array4 = [1337, 420, 666, 'Lorem'];

        expect(arrayIntersection([array1, array2, array3, array4])).toEqual([
            'Lorem',
        ]);
    });
});
