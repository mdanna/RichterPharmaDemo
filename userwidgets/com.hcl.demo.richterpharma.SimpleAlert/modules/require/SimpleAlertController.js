define(function() {

  return {
    constructor(baseConfig, layoutConfig, pspConfig){
      this.view.preShow = () => {
        this.view.isVisible = false;
        if(!this.initDone){
          this.view.flxMessage.doLayout = () => {
            this.view.flxPopup.height = `${80 + this.view.flxMessage.frame.height}dp`;
          };
          this.view.flxBackground.onClick = () => {
            this.view.isVisible = false;
          };
          this.view.flxButtons.onClick = () => {
            this.view.isVisible = false;
          };
          this.initDone = true;
        }
      };
    },
    
    initGettersSetters(){},

    show(message){
      this.view.lblMessage.text = message;
      this.view.isVisible = true;
    }
  };
});