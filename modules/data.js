const data = {
  baskets: [],
  articles: {},
  load(){
    const promise = new Promise((resolve, reject) => {
      const dominoBasketService = VMXFoundry.getIntegrationService('DominoBasketService');
      promiseUtils.promisifyOperation(dominoBasketService, 'GetAllBasketsByCustomerId', {}, {}).then((response) => {
        data.baskets = response.responseList;
        data.baskets.sort((a, b) => parseInt(a.basketId) > parseInt(b.basketId) ? 1 : -1);

        promiseUtils.promisifyOperation(dominoBasketService, 'GetAllArticles', {}, {}).then((r) => {
          r.responseList.forEach((article) => {
            data.articles[article.basketItemID] = article;
          });

          const promises = [];
          data.baskets.forEach((basket, index) => {
            promises.push(promiseUtils.promisifyOperation(dominoBasketService, 'GetAllArticleIdsByBasketId', {}, {
              basketId: basket.basketId
            }));
          });
          Promise.all(promises).then((responses) => {
            responses.forEach((res, index) => {
              data.baskets[index].articles = res && res.responseList ? res.responseList : [];
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
  }
};