define(function() {

  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        if(!this.initDone){
          const popupAlert = this.view.popupAlert;
          eventManager.subscribe(globals.EVT_SCAN_ERROR, (message) => {
            popupAlert.show(message);
          });
          this.view.scanHeader.onClickLeft = () => {
            this.goBack();
          };
          
          this.view.barcodeqrscanner.afterScan = (text) => {
            const article = Object.values(richterData.articles).find((item) => item.barcode === text);
            if(article){
              globals.currentBarcode = '';
              popupAlert.show(`Barcode ${text} is already in use.`);
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