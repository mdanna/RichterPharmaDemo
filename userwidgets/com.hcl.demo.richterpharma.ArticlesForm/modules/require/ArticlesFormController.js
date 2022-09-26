define(function() {

  return {
    articles: [],
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        this.view.fieldSearch.text = '';

        voltmx.application.showLoadingScreen(null, 'Loading articles...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
        richterData.loadArticles().then(() => {
          this.articles = [...richterData.articles];
          this.articles.sort((a, b) => a.text > b.text ? 1 : -1);
          this.loadArticles();
          voltmx.application.dismissLoadingScreen();
        }).catch((error) => {
          voltmx.application.dismissLoadingScreen();
          alert(JSON.stringify(error));
        });

        if(!this.initDone){
          this.view.fieldSearch.onTextChange = () => {
            const searchText = this.view.fieldSearch.text.trim();
            if(searchText){
              this.articles = richterData.articles.filter((article) => {
                return(article.id.includes(searchText) || article.text.includes(searchText) ||
                       article.barcode.includes(searchText));
              });
            } else {
              this.articles = [...richterData.articles];
              this.articles.sort((a, b) => a.text > b.text ? 1 : -1);
            }
            this.loadArticles();
          };
          
          this.view.articlesHeader.onClickLeft = () => this.view.cmpHamburgerMenu.toggle(true);
          
          this.view.buttonAdd.onClickButton = () => {
            globals.currentArticleId = null;
            globals.currentBarcode = null;
            new voltmx.mvc.Navigation('frmArticleDetails').navigate();
          };
          
          this.view.cmpHamburgerMenu.onItemSelected = (key) => {
            switch(key){
              case 'articles':
                break;
              case 'carts':
                new voltmx.mvc.Navigation('frmCartList').navigate();
                break;
              case 'logout':
                new voltmx.mvc.Navigation('frmLogin').navigate();
                break;
              default:
                break;
            }
          };
        }

      };
    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {},

    loadArticles(){
      eventManager.subscriptions[globals.EVT_CLICK_ARTICLE_ITEM] = {};
      this.view.flxArticles.removeAll();
      this.articles.forEach((article) => {
        const articleItem = new com.hcl.demo.richterpharma.ArticleItem({
          id: `article${new Date().getTime()}`
        }, {}, {});
        articleItem.itemId = `#${article.id}`;
        articleItem.itemText = article.text;
        articleItem.itemBarcode = article.barcode;
        if(article.id === globals.currentArticleId){
          articleItem.selected = true;
        }
        articleItem.onSelect = () => {
          globals.currentArticleId = article.id;
          new voltmx.mvc.Navigation('frmArticleDetails').navigate();
        };
        this.view.flxArticles.add(articleItem);
      });
    }
  };
});