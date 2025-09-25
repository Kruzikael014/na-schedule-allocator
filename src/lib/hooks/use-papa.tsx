import * as papa from "papaparse"

export function usePapa() {

  async function parse<T = any>(file: File, mapperFunc?: (row: any) => T): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      papa.parse<T>(file, {
        header: true,
        complete: result => !mapperFunc ? resolve(result.data) : resolve(result.data.map(row => mapperFunc(row))),
        error: err => reject(err),
        skipEmptyLines: true
      })
    })
  }

  return { parse }
}