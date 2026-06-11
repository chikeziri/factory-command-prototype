const generateCode = (prefix, number) => {
  return `${prefix}-${new Date().getFullYear()}-${String(number).padStart(4, '0')}`;
};

const formatCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const calculateOEE = (availability, performance, quality) => {
  return (availability * performance * quality).toFixed(2);
};

module.exports = { generateCode, formatCurrency, calculateOEE };
