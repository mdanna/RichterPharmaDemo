define(function() {

  return {
    articles: [],
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        const currentBasket = data.baskets.find((b) => b.basketId === globals.currentBasketId);
        this.view.cartHeader.text = `Cart #${globals.currentBasketId}`;
        this.view.fieldName.text = currentBasket.basketText;
        this.view.fieldDescription.text = currentBasket.basketDescription;
        this.view.fieldSearch.text = '';
        this.articles = [...currentBasket.articles];

        if(!this.initDone){
          this.view.cartHeader.onClickLeft = () => {
            new voltmx.mvc.Navigation('frmCartList').navigate();
          };

          this.view.buttonScan.onClickButton = () => new voltmx.mvc.Navigation('frmScan').navigate();

          this.view.buttonSave.onClickButton = () => this.saveCart();
          
          this.view.buttonDelete.onClickButton = () => this.view.popup.isVisible = true;
          
          this.view.popup.onClickDelete = () => this.deleteCart();

          this.view.fieldSearch.onTextChange = () => {
            const searchText = this.view.fieldSearch.text.trim();
            if(searchText){
              this.articles = currentBasket.articles.filter((article) => {
                return(data.articles[article.basketItemID].basketItemBarcode.includes(searchText) || article.basketItemID.includes(searchText) ||
                       data.articles[article.basketItemID].basketItemText.includes(searchText));                
              });
            } else {
              this.articles = [...currentBasket.articles];
            }
            this.loadArticles();
          };
          this.initDone = true;
        }

        this.loadArticles();
      };
    },

    initGettersSetters() {},

    loadArticles(){
      this.view.flxProducts.removeAll();
      this.articles.forEach((article) => {
        const cartItem = new com.hcl.demo.richterpharma.CartItem({
          id: `cartItem${new Date().getTime()}`
        }, {}, {});
        cartItem.numItems = article.basketItemCount;
        cartItem.articleId = article.basketItemID;
        const product = data.articles[article.basketItemID];
        cartItem.description = product ? product.basketItemText : 'No description';
        cartItem.barcode = product ? product.basketItemBarcode : 'Unknown';
        if(cartItem.articleId === globals.currentArticleId){
          globals.currentArticleId = null;
          cartItem.selected = true;
        }
        this.view.flxProducts.add(cartItem);
      });

    },

    saveCart(){
      const currentBasket = data.baskets.find((b) => b.basketId === globals.currentBasketId);
      voltmx.application.showLoadingScreen(null, 'Saving cart...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
      const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
      promiseUtils.promisifyOperation(dominoBasketService, 'UpdateBasketByUNID', null, {
        basketId: globals.currentBasketId,
        unid: currentBasket.unid,
        basketText: this.view.fieldName.text.trim(),
        basketDescription: this.view.fieldDescription.text.trim()
      }).then(() => {
        currentBasket.basketText = this.view.fieldName.text.trim();
        currentBasket.basketDescription = this.view.fieldDescription.text.trim();
        voltmx.application.dismissLoadingScreen();
        new voltmx.mvc.Navigation('frmCartList').navigate();
      }).catch((err) => {
        alert(JSON.stringify(err));
        voltmx.application.dismissLoadingScreen();
      });
    },

    deleteCart(){
      const currentBasket = data.baskets.find((b) => b.basketId === globals.currentBasketId);
      voltmx.application.showLoadingScreen(null, 'Deleting cart...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
      const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
      const promises = [];
      currentBasket.articles.forEach((article) => {
        const promise = promiseUtils.promisifyOperation(dominoBasketService, 'GetArticleToBasketAssignmentUNID', null, {
          basketId: currentBasket.basketId,
          basketItemId: article.basketItemID
        });
        promises.push(promise);
      });
      Promise.all(promises).then((responses) => {
        const removeArticlePromises = [];
        responses.forEach((res) => {
          const unid = res.responseList[0].unid;
          const promise = promiseUtils.promisifyOperation(dominoBasketService, 'RemoveArticleFromBasketByUNID', null, {
            unid
          });
          removeArticlePromises.push(promise);
        });
        Promise.all(removeArticlePromises).then(() => {
          promiseUtils.promisifyOperation(dominoBasketService, 'DeleteBasketByUNID', null, {
            unid: currentBasket.unid
          }).then(() => {
            data.baskets = data.baskets.filter((basket) => basket.unid !== currentBasket.unid);
            globals.currentBasketId = null;
            voltmx.application.dismissLoadingScreen();
            new voltmx.mvc.Navigation('frmCartList').navigate();
          }).catch((err) => {
            voltmx.application.dismissLoadingScreen();
            alert(JSON.stringify(err));
          });
        }).catch((err) => {
          voltmx.application.dismissLoadingScreen();
          alert('Unable to delete cart.');
        });
      }).catch((err) => {
        voltmx.application.dismissLoadingScreen();
        alert('Unable to delete cart.');
      });
    }
  };
});