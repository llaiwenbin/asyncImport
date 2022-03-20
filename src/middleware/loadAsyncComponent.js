import urlMap from '../urlMap.js';
const baseUrl = '';
const installedComponents = {};
window.xiaoeComponents = window.xiaoeComponents || {};

const loadAsyncComponent = ({ component , version, name }, promises) => {
  // compData [resolve,reject,promise]
  let compnentName = component + '-' + version;
  let compData = installedComponents[compnentName];
  let libraryName = name || compnentName;

  // 这个模块已经加载过，不再重新加载
  if (compData == 0) {
    promises.push(Promise.resolve(window[`xe-${compnentName}`]));
    return
  };

  if (compData) {
    promises.push(compData[2]);
    return;
  }
  
  const url = baseUrl + urlMap[component] + '/' + version+ '/index.js ';
  const promise = new Promise(
    (resolve, reject) => 
      (compData = installedComponents[compnentName] = [resolve, reject])
  );
  promises.push((compData[2] = promise));
  const loadingEnded = (event) => {
    compData = installedComponents[compnentName];
    if (compData) {
      const error = new Error();
      // 需要重新加载
      if (compData !== 0) { 
          installedComponents[compnentName] = undefined;
      } 
      // compData 不为 0 说明加载失败了
      if (compData) {
        var errorType =
          event && (event.type === "load" ? "missing" : event.type);
        var realSrc = event && event.target && event.target.src;
        error.message = `Loading chunk ${compnentName} failed.\n(${errorType}: ${realSrc})`;
        error.name = "ChunkLoadError";
        error.type = errorType;
        error.request = realSrc;
        compData[1](error);
      }
    }
  };
  handleLoadScript(url, loadingEnded, { compnentName , libraryName });
};

let inProgress = {};
const handleLoadScript = (url, done, { compnentName, libraryName }) => {
    if (inProgress[url]) {
        inProgress[url].push(done);
        return
    }

    let timer, needAttach;
    let script = [...document.getElementsByTagName('script')].find(
          res => res.getAttribute("src") == url
    )

    if (!script) { 
        script = document.createElement('script');
        script.charset = 'utf-8';
        script.timeout = 120;
        script.src = url;
        needAttach = true
    }

    inProgress[url] = [done];
    // 模块加载完成的统一操作
    const onScriptCompleted = (callback, event) => { 
        clearTimeout(timer);

        script.onload = script.onerror = null;

        script.parentNode && script.parentNode.removeChild(script);
        callback && callback()
        const doneFus = inProgress[url] || []
    
        doneFus.forEach(item => item(event))
        delete inProgress[url];
    }
    // 模块加载成功
  const scriptOnLoad = () => {
      window.xiaoeComponents[libraryName] = window[`xe-${compnentName}`];
      installedComponents[compnentName] && installedComponents[compnentName][0](window.xiaoeComponents[libraryName]);
      installedComponents[compnentName] = 0
    }
    // 模块加载超时
    timer = setTimeout(() => { 
        onScriptCompleted.bind(null, undefined, { type: 'timeout', target: script })
    }, 120000)
    script.onload = onScriptCompleted.bind(null, scriptOnLoad)
    script.onerror = onScriptCompleted.bind(null,script.onerror)
    needAttach && document.body.appendChild(script);
};
export { loadAsyncComponent };
