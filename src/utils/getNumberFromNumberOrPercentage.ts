/**
 * Extract a number from a number or percentage
 * @param value
 */
const getNumberFromNumberOrPercentage = (value: string | number) => {
  const matches = /^(\d+)(%?)$/.exec(String(value));

  console.log(matches);

  if (matches) {
    return {
      number: Number(matches[1]),
      isPercentage: matches[2] === "%",
    };
  }

  return null;
};

export default getNumberFromNumberOrPercentage;
