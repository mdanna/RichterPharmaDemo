define(function() {

  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        if(!this.initDone){
          this.view.scanHeader.onClickLeft = () => this.goBack();

          this.view.barcodeqrscanner.afterScan = (text) => {
            const article = Object.values(richterData.basketArticles).find((item) => item.basketItemBarcode === text);
            const currentBasket = richterData.baskets.find((b) => b.basketId === globals.currentBasketId);
            if(article){
              const articleId = article.basketItemID;
              globals.currentArticleId = articleId;

              let found = false;
              let basketItemCount = 1;
              currentBasket.articles.forEach((basketArticle) => {
                if(basketArticle.basketItemID === articleId){
                  found = true;
                  basketItemCount = ++basketArticle.basketItemCount;
                } 
              });

              const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
              if(found){
                promiseUtils.promisifyOperation(dominoBasketService, 'GetArticleToBasketAssignmentUNID', null, {
                  basketId: currentBasket.basketId,
                  basketItemId: articleId
                }).then((response) => {
                  const unid = response.responseList[0].unid;
                  promiseUtils.promisifyOperation(dominoBasketService, 'UpdateArticleInBasketByUNID', null, {
                    basketItemCount,
                    unid,
                    basketItemId: articleId
                  }).then(() => {
                    this.goBack();
                  }).catch((err) => {
                    alert('Unable to save the changes.');
                    currentBasket.articles.forEach((basketArticle) => {
                      if(basketArticle.basketItemID === articleId){
                        basketArticle.basketItemCount--;
                      } 
                    });
                    this.goBack();
                  });

                }).catch((err) => {
                  alert('Unable to save the changes.');
                  currentBasket.articles.forEach((basketArticle) => {
                    if(basketArticle.basketItemID === articleId){
                      basketArticle.basketItemCount--;
                    } 
                  });
                  this.goBack();
                });
              } else {  
                promiseUtils.promisifyOperation(dominoBasketService, 'AddArticleToBasket', null, {
                  basketId: currentBasket.basketId,
                  basketItemId: articleId
                }).then(() => {
                  currentBasket.articles.push({
                    basketItemID: articleId,
                    basketItemCount: 1
                  });
                  this.goBack();
                }).catch((err) => {
                  alert('Unable to save the changes.');
                  this.goBack();
                });
              }
            } else {
              alert(`article ${text} not found`);
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
      new kony.mvc.Navigation('frmCart').navigate();
      //#ifdef iphone
      kony.application.destroyForm('frmScan');
      //#endif
      //#ifdef ipad
      kony.application.destroyForm('frmScan');
      //#endif
    }
  };
});