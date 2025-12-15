
function randomNumber(start: number, end: number): number {
  return Math.floor(Math.random() * (end - start)) + start
}

function pushIfNotExists<T = any>(arr: T[], obj: T, specialCon?: (obj: T) => boolean) {
  if (specialCon && arr.findIndex(specialCon) === -1) {
    arr.push(obj)
    return
  }
  if (!arr.includes(obj))
    arr.push(obj)
}

const a = [1, 2, 3, 4]



function shuffleArray<T = any>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]]
  }
  return array;
}

export { randomNumber, pushIfNotExists, shuffleArray }