/**
 * Extract a number from a number or percentage
 * TODO: check if there is a more efficient way (RegEX maybe)
 * @param value
 */
const getNumberFromNumberOrPercentage = (value: string | number) => {
  // console.log(value);
  const matches = /^(([0-9]*[.])?[0-9]+)(%?)$/.exec(String(value));

  if (matches) {
    return {
      number: Number(matches[1]),
      isPercentage: matches[3] === "%",
    };
  }

  return null;
};

export default getNumberFromNumberOrPercentage;
