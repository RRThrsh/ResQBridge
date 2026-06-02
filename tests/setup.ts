import '@testing-library/jest-dom'

const storage = new Map<string, string>()

beforeEach(() => {
  storage.clear()
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(function (this: Storage, key) {
    return storage.get(key) ?? null
  })
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
    storage.set(key, value)
  })
  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(function (this: Storage, key) {
    storage.delete(key)
  })
  jest.spyOn(Storage.prototype, 'clear').mockImplementation(function (this: Storage) {
    storage.clear()
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})
