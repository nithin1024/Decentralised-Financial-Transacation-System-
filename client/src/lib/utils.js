export const shortenAddress = (address = '') => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatEth = (weiBigInt) => {
  if (weiBigInt === null || weiBigInt === undefined) return '0.0000'
  const value = Number(weiBigInt) / 1e18
  return value.toFixed(4)
}

export const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(Number(timestamp) * 1000).toLocaleString()
}
