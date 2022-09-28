define(function() {

  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        this.view.fieldId.text = '';
        this.view.fieldName.text = '';
        this.view.fieldDescription.text =  '';

        if(!this.initDone){
          this.view.cartHeader.onClickLeft = () => {
            new voltmx.mvc.Navigation('frmCartList').navigate();
          };
          this.view.buttonSave.onClickButton = () => this.saveCart();
          this.initDone = true;
        }
      };
    },

    initGettersSetters() {},

    saveCart(){
      voltmx.application.showLoadingScreen('sknLoadingScreen', 'Working...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
      const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
      const basketId = this.view.fieldId.text.trim();
      const basketText = this.view.fieldName.text.trim();
      const basketDescription = this.view.fieldDescription.text.trim();
      promiseUtils.promisifyOperation(dominoBasketService, 'CreateBasket', null, {
        basketId,
        basketText,
        basketDescription
      }).then(() => {
        promiseUtils.promisifyOperation(dominoBasketService, 'GetBasketById', null, {
          basketId: this.view.fieldId.text.trim(),
        }).then((response) => {
          const basket = {
            basketId,
            basketText,
            basketDescription,
            unid: response.responseList[0].unid,
            articles: []
          };
          richterData.baskets.push(basket);
          globals.currentBasketId = basketId;
          voltmx.application.dismissLoadingScreen();
          new voltmx.mvc.Navigation('frmCartList').navigate();
        }).catch((err) => {
          this.view.popupAlert.show('Error while creating the cart.');
          voltmx.application.dismissLoadingScreen();
        });
      }).catch((err) => {
        this.view.popupAlert.show('Error during cart creation.');
        voltmx.application.dismissLoadingScreen();
      });
    }

  };
});