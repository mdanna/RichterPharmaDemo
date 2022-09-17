const promiseUtils = {

  promisify(context, method, ...args){
    const promise = new Promise((resolve, reject) => {
      args.length ? 
        context[method](...args, (response) => resolve(response), (error) => reject(error)) : 
      context[method]((response) => resolve(response), (error) => reject(error));
    });
    return promise;
  },
  
  promisifyOperation(service, operationName, headers, params){
    const promise = new Promise((resolve, reject) => {
      service.invokeOperation(operationName, headers, params, (res) => resolve(res), (err) => reject(err));
    });
    return promise;
  }

};