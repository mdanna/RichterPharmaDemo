define(function() {

  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        if(!this.initDone){
          this.view.onClick = () => {
            this.view.lblChecked.isVisible = !this.view.lblChecked.isVisible;
            this.view.lblUnchecked.isVisible = !this.view.lblUnchecked.isVisible;
          };
          this.initDone = true;
        }
      };	
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {

    }
  };
});