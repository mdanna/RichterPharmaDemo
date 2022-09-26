define(function() {

  return {
    baskets: [],
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        this.view.txtSearch.text = '';

        voltmx.application.showLoadingScreen(null, 'Loading data...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
        richterData.loadBaskets().then(() => {
          this.baskets = [...richterData.baskets];
          this.loadCartList();
          voltmx.application.dismissLoadingScreen();
        }).catch((error) => {
          voltmx.application.dismissLoadingScreen();
          alert(JSON.stringify(error));
        });

        if(!this.initDone){
          this.view.txtSearch.onTextChange = () => {
            const searchText = this.view.txtSearch.text.trim();
            if(searchText){
              this.baskets = richterData.baskets.filter((basket) => {
                return(basket.basketId.includes(searchText) || basket.basketText.includes(searchText) ||
                       basket.basketDescription.includes(searchText));
              });
            } else {
              this.baskets = [...richterData.baskets];
            }
            this.loadCartList();
          };
          
          this.view.cartListHeader.onClickLeft = () => this.view.cmpHamburgerMenu.toggle(true);
          
          this.view.cartListHeader.onClickRight = () => new voltmx.mvc.Navigation('frmNewCart').navigate();
          
          this.view.cmpHamburgerMenu.onItemSelected = (key) => {
            switch(key){
              case 'articles':
                new voltmx.mvc.Navigation('frmArticles').navigate();
                break;
              case 'carts':
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

    loadCartList(){
      eventManager.subscriptions[globals.EVT_CLICK_CART_LIST_ITEM] = {};
      this.view.flxCartItems.removeAll();
      this.baskets.forEach((basket) => {
        const cartItem = new com.hcl.demo.richterpharma.CartListItem({
          id: `basket${new Date().getTime()}`
        }, {}, {});
        cartItem.itemId = `#${basket.basketId}`;
        cartItem.numItems = basket.articles ? basket.articles.length + '' : '0';
        cartItem.title = basket.basketText;
        cartItem.description = basket.basketDescription;
        if(basket.basketId === globals.currentBasketId){
          cartItem.selected = true;
        }
        cartItem.onSelect = () => {
          globals.currentBasketId = basket.basketId;
          new voltmx.mvc.Navigation('frmCart').navigate();
        };
        this.view.flxCartItems.add(cartItem);
      });
    }
  };
});