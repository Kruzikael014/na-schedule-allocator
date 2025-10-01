
export const getDetailArray = (data: (string | undefined)[]): string[] => {
  const details = [
    ...data
  ].filter(e => e !== undefined) as string[]

  return details
}

export const cleanPayload = (data: any, excludedKeys: string[] = []): any => {
  return Object.fromEntries(
    Object.entries(data).filter(([key, value]) => {
      const isDefined = value !== undefined;
      const isNotExcluded = !excludedKeys.includes(key);
      return isDefined && isNotExcluded;
    })
  );
};