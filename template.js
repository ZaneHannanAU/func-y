/**
 * @function extractTemplate
 * @param {string[]} tx - text strings from template literals
 * @param {*} fn - template connectors
 * @returns {*[]}
 */
const extractTemplate = (tx, ...fn) => {
  const arr = []
  for (let i = 0; i < tx.length; i++) {
    if (tx[i] || tx[i] === 0) arr.push(tx[i].replace(/\r/g, ''))
    if (fn[i] || fn[i] === 0) arr.push(fn[i])
  }
  return arr
}

module.exports = extractTemplate

