import { loadAsyncComponent } from "./middleware/loadAsyncComponent.js";


const promiseMission = {
    loadAsyncComponent
}

const asyncImport = ({ component , version, name }) => {
    return Promise.all(Object.keys(promiseMission).reduce((promises, key) => {
        promiseMission[key]({ component , version, name }, promises);
        return promises
    }, []))
}


// export default asyncImport;
window.asyncImport = asyncImport