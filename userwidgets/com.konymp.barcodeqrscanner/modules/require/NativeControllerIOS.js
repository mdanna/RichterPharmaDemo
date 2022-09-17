define(['./Inherits', './NativeController', './KonyLogger'], function(Inherits, NativeController, konyLoggerModule) {
  var konymp = konymp || {};
  konymp.logger = (new konyLoggerModule("barcodeqrscanner NativeControllerIOS Component")) || function() {};
  konymp.logger.setLogLevel("DEBUG");
  konymp.logger.enableServerLogging = true; 
  var NativeControllerIOS = function(componentInstance) {
    konymp.logger.trace("---- Start constructor NativeControllerIOS ----", konymp.logger.FUNCTION_ENTRY);
    this.componentInstance = componentInstance;
    this.ContinuousBarcodeClass =objc.import("ContinuousBarcodeScanController");
    this.continuousBarcodeObject= null;
    this.isScan={"Yes":1,"No": 0};
    this.isCameraFace={"Front":true,"Back": false};
    this.cameraFace=false;
    this.shouldScan = 0 ;
    this.format = this.componentInstance.format;
    NativeController(this.componentInstance);
    konymp.logger.trace("-- Exit constructor NativeControllerIOS -- ", konymp.logger.FUNCTION_EXIT);
  };
  Inherits(NativeControllerIOS, NativeController);
  /**
     * @function scan
     * @private
     * @description: scan the code
     */
  NativeControllerIOS.prototype.scan = function(eventobject,cameraFacing) {
    konymp.logger.trace("-- Entering scan in NativeControllerIOS -- ", konymp.logger.FUNCTION_ENTRY);
    
		try {
      kony.timer.schedule("timer1", this.timerCallback, 10, false);
		} catch(e){
			kony.timer.cancel("timer1");
			kony.timer.schedule("timer1", this.timerCallback, 10, false);
		}
		
		try {
      this.cameraFace = this.isCameraFace[cameraFacing];
      if(this.continuousBarcodeObject === null){
        this.shouldScan = this.isScan.Yes;
        this.continuousBarcodeObject = this.ContinuousBarcodeClass.alloc();
        this.continuousBarcodeObject.initWithViewWithcallback(eventobject,this.myNativeCallback.bind(this));
        this.continuousBarcodeObject.startCaptureBarcode(cameraFacing); 
      }
    }
    catch (e) {
      alert(e);
      throw new Error("Exception in Scanning the code:" + e);
    }
    konymp.logger.trace("-- Exiting scan in NativeControllerIOS-- ", konymp.logger.FUNCTION_EXIT);
  };

  /**
     * @function timerCallback
     * @description: API called after timer finishes
     */
  NativeControllerIOS.prototype.timerCallback = function(){
    alert("Invalid Barcode!!!");
  };
  /**
   * @function
   *
   * @param result 
   */
  NativeControllerIOS.prototype.myNativeCallback = function(barcode){
    kony.timer.cancel("timer1");
    if(this.shouldScan === this.isScan.Yes){
      var format = "";
      if(this.format.hasOwnProperty(""+barcode.format))
        format = this.format[""+barcode.format];
      this.shouldScan = this.isScan.No;
      this.componentInstance.afterScan(barcode.result,format);           
      if(!this.componentInstance._enableContinuousScanning){        
        this.componentInstance.stopScan();
      }
    }
  };
  /**
     * @function resumeScan
     * @private
     * @description: API to resume the scan after 1 successful scan
     */
  NativeControllerIOS.prototype.resumeScan = function() {
    try{
      kony.timer.schedule("timer1",this.timerCallback, 10, false);
      if(this.continuousBarcodeObject !== null){
        this.shouldScan = this.isScan.Yes;
      }
    }catch(e){
      throw new Error("Exception in resuming the scan :" + e);
    }
  };
  /**
     * @function flashControl
     * @private
     * @description: API to 
     */
  NativeControllerIOS.prototype.flashControl = function() {
    try{
      if(this.continuousBarcodeObject !== null){
        this.continuousBarcodeObject.toggleFlashLight();
      }
    }catch(e){
      throw new Error("Exception in flash Control  :" + e);
    }
  };
  /**
   * @function
   *
   * @param eventobject 
   */
  NativeControllerIOS.prototype.release = function(eventobject) {
    try{
      this.continuousBarcodeObject.deleteView();
      this.continuousBarcodeObject = null;
    }catch(e){
      throw new Error("Exception in releasing the view object :" + e);
    }
  };

  return NativeControllerIOS;
});