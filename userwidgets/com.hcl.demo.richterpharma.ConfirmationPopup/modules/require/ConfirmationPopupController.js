define(function() {

  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        this.view.isVisible = false;
        if(!this.initDone){
          this.view.flxBackground.onClick = () => this.view.isVisible = false;
          this.view.lblCancel.onTouchEnd = () => this.view.isVisible = false;
          this.view.lblDelete.onTouchEnd = () => this.onClickDelete();
          this.initDone = true;
        }
      };
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {

    },

    onClickDelete(){}
  };
});