export const arrayPositionUp = <T>(dataSet: T[], index: number) => {
  const newData = [...dataSet];
  const temp = newData[index - 1];
  newData[index - 1] = newData[index];
  newData[index] = temp;
  return newData;
};

export const arrayInsertAfter = <T>(dataSet: T[], index: number, data: T) => {
  const newData = [...(dataSet ?? [])];
  newData.splice(index + 1, 0, data);
  return newData;
};

export const arrayRemoveAt = <T>(dataSet: T[], index: number) => {
  const newData = [...dataSet];
  newData.splice(index, 1);
  return newData;
};
