import { VRMExpressionPresetName } from "@pixiv/three-vrm";

export default class Blinker {
  constructor(vrm) {
    this.vrm = vrm;
    this.mode = 'ready';
    this.waitTime = 0;
    this.lastTimestamp = 0;
  }

  update(now) {
    let val = 0;
    if(!this.vrm) return
    const setBlink = (blinkVal) => {
        this.vrm.expressionManager.setValue(VRMExpressionPresetName.Blink, blinkVal)
        this.vrm.expressionManager.update(0)
    }

    const _setOpen = () => {
      this.mode = 'open';
      this.waitTime = (0.5 + 0.5 * Math.random()) * 6000;
      this.lastTimestamp = now;
    };

    switch (this.mode) {
      case 'ready': {
        _setOpen();
        val = 0;
        break;
      }
      case 'open': {
        const timeDiff = now - this.lastTimestamp;
        if (timeDiff > this.waitTime) {
          this.mode = 'closing';
          this.waitTime = 100;
          this.lastTimestamp = now;
        }
        val = 0;
        break;
      }
      case 'closing': {
        const f = Math.min(Math.max((now - this.lastTimestamp) / this.waitTime, 0), 1);
        if (f < 1) {
            console.log('f', f)
            val = f;
        } else {
          this.mode = 'opening';
          this.waitTime = 100;
          this.lastTimestamp = now;
          val = 1;
        }
        break;
      }
      case 'opening': {
        const f = Math.min(Math.max((now - this.lastTimestamp) / this.waitTime, 0), 1);
        if (f < 1) {
            val = 1 - f;
        } else {
          _setOpen();
          val = 0;
        }
        break;
      }
    }

    setBlink(val);
  }
}