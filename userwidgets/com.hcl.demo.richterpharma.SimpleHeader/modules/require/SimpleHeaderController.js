define(function() {

  return {
    constructor(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        if(!this.initDone){
          this.view.lblLeft.onTouchEnd = () => this.onClickLeft();
          this.view.lblRight.onTouchEnd = () => this.onClickRight();

          this.initDone = true;
        }
      };
    },
    initGettersSetters() {},
    onClickLeft(){},
    onClickRight(){}
  };
});