export default class Easer {
  _begT: number = 0.0
  _curT: number = 0.0
  _endT: number = 1.0
  _begTime: number | undefined = undefined
  _frameRequestId = 0

  _callback: undefined | ((t: number) => void)

  constructor(callback: undefined | ((t: number) => void)) {
    this._callback = callback
  }

  get curT() {
    return this._curT
  }

  ease(tBeg: number = 0.0, tEnd: number = 1.0) {
    if (this._frameRequestId) {
      window.cancelAnimationFrame(this._frameRequestId)
    }
    this._begT = tBeg
    this._endT = tEnd
    this._begTime = undefined
    this._frameRequestId = window.requestAnimationFrame(this.step)
  }

  step = (time: number) => {
    if (this._begTime === undefined) {
      this._begTime = time
    }
    const elapsed = time - this._begTime
    const x = elapsed / 1000
    const r = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
    this._curT = this._begT + r * (this._endT - this._begT)

    if (this._callback) {
      this._callback(this._curT)
    }

    if (elapsed < 1000) {
      this._frameRequestId = window.requestAnimationFrame(this.step)
    }
  }
}
