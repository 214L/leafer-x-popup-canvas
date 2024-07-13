import { IPenInputData, IPenData, IPen, ILeaf } from '@leafer-ui/interface'
import {
  registerUI,
  dataProcessor,
  Pen,
  PenData,
  Text,
  dataType,
} from 'leafer-ui'
import { IPos, IUserConfig } from './interface'
import { handleTextStyle } from './utils'

interface ITooltip extends IPen {
  target?: ILeaf
  isShow: boolean
  showTimerId?: number | NodeJS.Timeout | null
  hideTimerId?: number | NodeJS.Timeout | null
  show(): void
  hide(immediate?: boolean): void
  update(pos: IPos): void
}

export interface ITooltipInputData extends IPenInputData {
  target?: ILeaf
  config?: IUserConfig
  pointerPos?: IPos
}

export interface ITooltipData extends IPenData {
  target?: ILeaf
  pointerPos?: IPos
}

export class TooltipData extends PenData implements ITooltipData {
  target?: ILeaf
  timerId?: number | NodeJS.Timeout | null
  pointerPos?: IPos
}

@registerUI()
export class Tooltip extends Pen implements ITooltip {
  public get __tag() {
    return 'Tooltip'
  }
  public className: 'leafer-x-tooltip'
  @dataProcessor(TooltipData)
  public declare __: ITooltipData

  @dataType({ x: 0, y: 0 })
  public declare pointerPos?: IPos

  @dataType()
  public declare showTimerId?: number | NodeJS.Timeout | null

  @dataType()
  public declare hideTimerId?: number | NodeJS.Timeout | null

  @dataType(false)
  public declare isShow: boolean
  @dataType()
  public declare config: IUserConfig

  @dataType()
  public declare target?: ILeaf

  constructor(data: ITooltipInputData) {
    super(data)
    this.target = data.target
    this.config = data.config
    this.show()
  }

  /**
   * @description tooltip
   * @param pos 位置信息
   */
  private createShapes(pos = this.__.pointerPos): void {
    this.clear() // 清除之前创建的路径
    const { width, height, text } = handleTextStyle(this)
    const { backgroundColor,stroke,color, padding, borderRadius,fontSize ,fontWeight,fontFamily} = this.config.style
    this.setStyle({
      fill: backgroundColor,
      stroke,
    })
    this.add(
      new Text({
        className: 'leafer-x-tooltip',
        fill: color,
        fontSize,
        fontWeight,
        fontFamily,
        x: pos.x,
        y: pos.y,
        text: text,
        padding,
      })
    )
    this.roundRect(pos.x, pos.y, width, height, borderRadius)
    this.isShow = true
  }

  private clearShowHideTimers() {
    if (this.showTimerId) {
      clearTimeout(this.showTimerId)
      this.showTimerId = null
    }

    if (this.hideTimerId) {
      clearTimeout(this.hideTimerId)
      this.hideTimerId = null
    }
  }

  public show(pos = this.__.pointerPos) {
    this.clearShowHideTimers()
    this.showTimerId = setTimeout(() => {
      this.createShapes(pos)
      clearTimeout(this.showTimerId)
      this.showTimerId = null
    }, this.config.showDelay)
  }

  public hide(immediate = false) {
    this.clearShowHideTimers()
    if (immediate) {
      this.destroy()
    } else {
      if (!this.hideTimerId) {
        this.hideTimerId = setTimeout(() => {
          this.destroy()
        }, this.config.hideDelay)
      }
    }
  }

  public update(pos: IPos) {
    this.clearShowHideTimers()
    if (this.isShow) {
      this.createShapes(pos)
    } else {
      this.show(pos)
    }
  }

  public destroyTooltip() {
    this.clearShowHideTimers()
    this.destroy()
    this.isShow = false
    this.target = undefined
  }
}
