function randomNumber(start: number, end: number): number {
    return Math.floor(Math.random() * (end - start)) + start
}

export { randomNumber }