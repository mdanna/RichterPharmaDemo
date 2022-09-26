define(function() {

  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        if(!this.initDone){
          this.view.scanHeader.onClickLeft = () => this.goBack();

          this.view.barcodeqrscanner.afterScan = (text) => {
            const article = Object.values(richterData.basketArticles).find((item) => item.basketItemBarcode === text);
            if(article){
              globals.currentBarcode = '';
              alert(`Article ${text} exists already!`);
              this.goBack();
            } else {
              globals.currentBarcode = text;
              this.goBack();
            }

          };

          this.initDone = true;
        }

      };
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {},
    
    goBack(){
      new kony.mvc.Navigation('frmArticleDetails').navigate();
      //#ifdef iphone
      kony.application.destroyForm('frmScanNew');
      //#endif
      //#ifdef ipad
      kony.application.destroyForm('frmScanNew');
      //#endif
    }
  };
});