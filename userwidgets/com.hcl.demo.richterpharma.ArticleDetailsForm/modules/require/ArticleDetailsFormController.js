define(function() {

  return {
    constructor(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        if(!this.initDone){

          this.view.articleDetailsHeader.onClickLeft = () => new voltmx.mvc.Navigation('frmArticles').navigate();
          this.view.fieldBarcode.onScan = () => new voltmx.mvc.Navigation('frmScanNew').navigate();
          this.view.buttonDelete.onClickButton = () => {
            this.view.popup.title = `Delete Article #${globals.currentArticleId}?`;
            this.view.popup.isVisible = true;
          };
          this.view.popup.onClickDelete = () => this.deleteArticle();
          this.view.buttonSave.onClickButton = () => this.saveArticle();
          this.view.buttonCreate.onClickButton = () => this.createArticle();

          this.initDone = true;
        }

        this.view.flxButtons.isVisible = !!globals.currentArticleId;
        this.view.flxDisableId.isVisible = !!globals.currentArticleId;
        this.view.flxDisableBarcode.isVisible = !!globals.currentArticleId;
        this.view.flxCreate.isVisible = !globals.currentArticleId;
        if(globals.currentArticleId){
          const article = richterData.articles.find((a) => a.id === globals.currentArticleId);
          this.view.fieldId.text = article.id;
          this.view.fieldDescription.text = article.text;
          this.view.fieldBarcode.text = article.barcode;
        } else {
          this.view.fieldId.text = '';
          this.view.fieldDescription.text = '';
          this.view.fieldBarcode.text = globals.currentBarcode || '';
        }
      };
    },

    initGettersSetters() {},

    deleteArticle(){
      const articleId = this.view.fieldId.text.trim();
      const basketIds = [];
      richterData.baskets.forEach((basket) => {
        if(basket.articles.find((article) => article.basketItemID === articleId)){
          basketIds.push(basket.basketId);
        }
      });

      const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');

      const doDeleteArticle = () => {
        promiseUtils.promisifyOperation(dominoBasketService, 'GetArticleById', null, {
          basketItemId: articleId
        }).then((response) => {
          const unid = response.responseList[0].unid;
          promiseUtils.promisifyOperation(dominoBasketService, 'DeleteArticleByUNID', null, {
            unid
          }).then(() => {
            voltmx.application.dismissLoadingScreen();
            new voltmx.mvc.Navigation('frmArticles').navigate();
          }).catch((error) => {
            voltmx.application.dismissLoadingScreen();
            alert('Unable to delete the article.');
          });
        }).catch((error) => {
          voltmx.application.dismissLoadingScreen();
          alert('Unable to locate the article to delete.');
        });
      };

      voltmx.application.showLoadingScreen(null, 'Deleting Product...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
      if(basketIds.length > 0){
        const promises = [];
        basketIds.forEach((basketId) => {
          promises.push(promiseUtils.promisifyOperation(dominoBasketService, 'GetArticleToBasketAssignmentUNID', null, {
            basketId,
            basketItemId: articleId
          }));
        });
        Promise.all(promises).then((res) => {
          const removeAssignmentPromises = [];
          res.forEach((r) => {
            const unid = r.responseList[0].unid;
            removeAssignmentPromises.push(promiseUtils.promisifyOperation(dominoBasketService, 'RemoveArticleFromBasketByUNID', null, {
              unid
            }));
          });
          Promise.all(removeAssignmentPromises).then(() => {
            doDeleteArticle();
          }).catch((error) => {
            voltmx.application.dismissLoadingScreen();
            alert('Error deleting article associations.');
          });
        }).catch((error) => {
          voltmx.application.dismissLoadingScreen();
          alert('Error retrieving article associations.');
        });
      } else {
        doDeleteArticle();
      }
    },

    saveArticle(){
      const articleId = this.view.fieldId.text.trim();
      const articleText = this.view.fieldDescription.text.trim();
      const barcode = this.view.fieldBarcode.text.trim();
      if(articleText){
        voltmx.application.showLoadingScreen(null, 'Updating Product...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
        const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
        promiseUtils.promisifyOperation(dominoBasketService, 'GetArticleById', null, {
          basketItemId: articleId
        }).then((response) => {
          const unid = response.responseList[0].unid;
          promiseUtils.promisifyOperation(dominoBasketService, 'UpdateArticleByUNID', null, {
            basketItemId: articleId,
            basketItemText: articleText,
            basketItemBarcode: barcode,
            unid
          }).then(() => {
            voltmx.application.dismissLoadingScreen();
            new voltmx.mvc.Navigation('frmArticles').navigate();
          }).catch((err) => {
            voltmx.application.dismissLoadingScreen();
            alert('Unable to update the article.');
          });
        }).catch((error) => {
          voltmx.application.dismissLoadingScreen();
          alert('Unable to locate the article to update.');
        });
      } else {
        alert('Field Description is required!');
      }
    },

    createArticle(){
      const articleId = this.view.fieldId.text.trim();
      const articleText = this.view.fieldDescription.text.trim();
      const barcode = this.view.fieldBarcode.text.trim();
      if(articleId && articleText && barcode){
        const articleFromBarcode = Object.values(richterData.basketArticles).find((item) => item.basketItemBarcode === barcode);
        const articleFromId = Object.values(richterData.basketArticles).find((item) => item.basketId === articleId);
        if(articleFromId){
          alert(`Article ID ${articleId} is already in use.`);
        } else if(articleFromBarcode){
          alert(`Barcode ${barcode} is already in use.`);
        } else {
          const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
          voltmx.application.showLoadingScreen(null, 'Creating Article...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
          promiseUtils.promisifyOperation(dominoBasketService, 'CreateArticle', null, {
            basketItemId: articleId,
            basketItemText: articleText,
            basketItemBarcode: barcode
          }).then(() => {
            voltmx.application.dismissLoadingScreen();
            new voltmx.mvc.Navigation('frmArticles').navigate();
          }).catch((error) => {
            voltmx.application.dismissLoadingScreen();
            alert('Unable to create the article.');
          });
        }
      } else {
        alert('All fields are required!');
      }
    }
  };
});