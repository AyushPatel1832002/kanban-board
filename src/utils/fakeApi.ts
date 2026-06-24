export default function fakeSaveMove() {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.2) reject(new Error('Network error saving move'))
      else resolve()
    }, 600)
  })
}
