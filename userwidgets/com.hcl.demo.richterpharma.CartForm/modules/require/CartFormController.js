define(function() {

  return {
    articles: [],
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        const currentBasket = richterData.baskets.find((b) => b.basketId === globals.currentBasketId);
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

          this.view.buttonDelete.onClickButton = () => {
            this.view.popup.title = `Delete Cart #${globals.currentBasketId}?`;
            this.view.popup.isVisible = true;
          };

          this.view.popup.onClickDelete = () => this.deleteCart();

          this.view.fieldSearch.onTextChange = () => {
            const searchText = this.view.fieldSearch.text.trim();
            if(searchText){
              this.articles = currentBasket.articles.filter((article) => {
                return(richterData.basketArticles[article.basketItemID].basketItemBarcode.includes(searchText) || article.basketItemID.includes(searchText) ||
                       richterData.basketArticles[article.basketItemID].basketItemText.includes(searchText));                
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
        const product = richterData.basketArticles[article.basketItemID];
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
      const currentBasket = richterData.baskets.find((b) => b.basketId === globals.currentBasketId);
      voltmx.application.showLoadingScreen(null, 'Saving cart...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
      const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
      promiseUtils.promisifyOperation(dominoBasketService, 'UpdateBasketByUNID', null, {
        basketId: globals.currentBasketId,
        unid: currentBasket.unid,
        basketText: this.view.fieldName.text.trim(),
        basketDescription: this.view.fieldDescription.text.trim()
      }).then(() => {
        const promisesForUpdate = [];
        const articles = [];
        const promisesForDelete = [];
        const cartItems = this.view.flxProducts.widgets();
        cartItems.forEach((cartItem) => {
          const article = currentBasket.articles.find((a) => a.basketItemID === cartItem.articleId);
          if(article.basketItemCount !== cartItem.numItems){
            const p = promiseUtils.promisifyOperation(dominoBasketService, 'GetArticleToBasketAssignmentUNID', null, {
              basketId: globals.currentBasketId,
              basketItemId: cartItem.articleId
            });
            if(cartItem.numItems > 0){
              promisesForUpdate.push(p);
              articles.push({
                articleId: cartItem.articleId,
                numItems: cartItem.numItems
              });
            } else {
              promisesForDelete.push(p);
            }
          }
        });
        if(promisesForUpdate.length > 0 || promisesForDelete.length > 0){
          const promises = promisesForUpdate.concat(promisesForDelete);
          const update_delete_promises = [];

          Promise.all(promises).then((res) => {
            const unids = [];
            res.forEach((r) => unids.push(r.responseList[0].unid));
            unids.forEach((unid, index) => {
              if(index < promisesForUpdate.length){
                update_delete_promises.push(promiseUtils.promisifyOperation(dominoBasketService, 'UpdateArticleInBasketByUNID', null, {
                  unid,
                  basketItemCount: articles[index].numItems,
                  basketItemId: articles[index].articleId
                }));
              } else {
                update_delete_promises.push(promiseUtils.promisifyOperation(dominoBasketService, 'RemoveArticleFromBasketByUNID', null, {
                  unid
                })); 
              }
            });

            Promise.all(update_delete_promises).then(() => {
              this.goBack(currentBasket);
            }).catch((error) => {
              voltmx.application.dismissLoadingScreen();
              alert('Unable to update articles count');
            });
          }).catch((err) => {
            voltmx.application.dismissLoadingScreen();
            alert('Unable to retrieve articles to update');
          });

        } else {
          this.goBack(currentBasket);
        }

      }).catch((err) => {
        alert(JSON.stringify(err));
        voltmx.application.dismissLoadingScreen();
      });
    },

    goBack(currentBasket){
      currentBasket.basketText = this.view.fieldName.text.trim();
      currentBasket.basketDescription = this.view.fieldDescription.text.trim();
      voltmx.application.dismissLoadingScreen();
      new voltmx.mvc.Navigation('frmCartList').navigate();
    },

    deleteCart(){
      const currentBasket = richterData.baskets.find((b) => b.basketId === globals.currentBasketId);
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
            richterData.baskets = richterData.baskets.filter((basket) => basket.unid !== currentBasket.unid);
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