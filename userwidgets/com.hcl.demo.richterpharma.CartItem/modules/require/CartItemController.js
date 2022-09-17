define(function() {

  return {
    constructor: function(baseConfig, layoutConfig, pspConfig) {

      eventManager.subscribe(globals.EVT_CLICK_CART_LIST_ITEM, (id) => {
        this.view.flxCartListItem.skin = id === this.view.lblId.text ? 'sknFlxCartListItemSelected' : 'sknFlxCartListItem';
      });

      this.view.preShow = () => {
        this.view.onClick = () => {
          eventManager.publish(globals.EVT_CLICK_CART_LIST_ITEM, this.view.lblId.text);
        };
      };

    },
    //Logic for getters/setters of custom properties
    initGettersSetters: function() {
      defineGetter(this, 'selected', () => {
        return this._selected;
      });
      defineSetter(this, 'selected', value => {
        this._selected = value;
        if(value){
          this.view.flxCartListItem.skin = 'sknFlxCartListItemSelected';
        }
      });
    }
  };
});