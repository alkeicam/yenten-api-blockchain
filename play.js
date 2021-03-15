const yenten = require('./dist/yenten-api-blockchain.umd')
console.log(yenten);

const r = yenten.apiClient.getBalance('YbCSnTgPUn82YogMFCz9hPVZuS6XBbDr55');
console.log(r);