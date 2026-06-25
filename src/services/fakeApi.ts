const FAKE_DELAY = 600
const FAILURE_RATE = 0.2

export default function fakeSaveMove() {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      
      if (Math.random() < FAILURE_RATE) {
        reject(new Error('Failed to save move. Please retry.'))
        return
      }
      resolve()
    }, FAKE_DELAY)
  })
}

export function fakeSave<T>(payload: T) {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error('Failed to save. Please try again.'))
        return
      }
      resolve(payload)
    }, FAKE_DELAY)
  })
}
