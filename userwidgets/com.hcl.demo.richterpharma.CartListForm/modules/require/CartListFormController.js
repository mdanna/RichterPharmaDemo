define(function() {

  return {
    baskets: [],
    constructor: function(baseConfig, layoutConfig, pspConfig) {
      this.view.preShow = () => {
        this.view.txtSearch.text = '';

        voltmx.application.showLoadingScreen(null, 'Loading data...', constants.LOADING_SCREEN_POSITION_FULL_SCREEN, true, false, {});
        data.load().then(() => {
          this.baskets = [...data.baskets];
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
              this.baskets = data.baskets.filter((basket) => {
                return(basket.basketId.includes(searchText) || basket.basketText.includes(searchText) ||
                       basket.basketDescription.includes(searchText));
              });
            } else {
              this.baskets = [...data.baskets];
            }
            this.loadCartList();
          };
          this.view.cartListHeader.onClickRight = () => new voltmx.mvc.Navigation('frmNewCart').navigate();
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