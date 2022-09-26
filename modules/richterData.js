const richterData = {
  baskets: [],
  articles: [],
  basketArticles: {},
  loadBaskets(){
    const promise = new Promise((resolve, reject) => {
      const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
      promiseUtils.promisifyOperation(dominoBasketService, 'GetAllBasketsByCustomerId', {}, {}).then((response) => {
        richterData.baskets = response.responseList;
        richterData.baskets.sort((a, b) => parseInt(a.basketId) > parseInt(b.basketId) ? 1 : -1);

        promiseUtils.promisifyOperation(dominoBasketService, 'GetAllArticles', {}, {}).then((r) => {
          r.responseList.forEach((article) => {
            richterData.basketArticles[article.basketItemID] = article;
          });

          const promises = [];
          richterData.baskets.forEach((basket, index) => {
            promises.push(promiseUtils.promisifyOperation(dominoBasketService, 'GetAllArticleIdsByBasketId', {}, {
              basketId: basket.basketId
            }));
          });
          Promise.all(promises).then((responses) => {
            responses.forEach((res, index) => {
              richterData.baskets[index].articles = res && res.responseList ? res.responseList : [];
            });
            resolve();
          }).catch((err) => {
            reject(err);
          });
        }).catch((e) => {
          reject(e);
        });
      }).catch((error) => {
        reject(error);
      });
    });
    return promise;
  },
  loadArticles(){
    richterData.articles = [];
    const promise = new Promise((resolve, reject) => {
      const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
      promiseUtils.promisifyOperation(dominoBasketService, 'GetAllArticles', {}, {}).then((response) => {
        response.responseList.forEach((article) => {
          richterData.articles.push({
            id: article.basketItemID,
            text: article.basketItemText,
            barcode: article.basketItemBarcode,
          });
        });
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
    return promise;
  }
};