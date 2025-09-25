import papa from "papaparse"

export class CsvUtil {
  static parse<T = any>(file: File): Promise<T[]> {
    return new Promise((resolve, reject) => {
      papa.parse<T>(file, {
        skipEmptyLines: true,
        header: true,
        complete: (results) => resolve(results.data),
        error: (err) => reject(err),
      })
    })
  }
}
